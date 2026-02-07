import { Router } from 'express';
import { 
  scanAgents, 
  getAgentById, 
  getAgentContent,
  installAgentFromUrl,
  installAgentFromFile,
  enableAgent,
  disableAgent,
  uninstallAgent
} from '../services/agent-manager.js';

const router = Router();

// GET /api/agents - List all agents
router.get('/', (_req, res) => {
  try {
    const agents = scanAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan agents' });
  }
});

// GET /api/agents/:id - Get agent details
router.get('/:id', (req, res) => {
  try {
    const agent = getAgentById(decodeURIComponent(req.params.id));
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const content = getAgentContent(agent.path);
    res.json({ ...agent, content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get agent details' });
  }
});

// POST /api/agents/install - Install from .md file (file/URL)
router.post('/install', async (req, res) => {
  try {
    const { url, filePath } = req.body;
    
    if (!url && !filePath) {
      return res.status(400).json({ error: 'url or filePath is required' });
    }
    
    let agent;
    if (url) {
      agent = await installAgentFromUrl(url);
    } else {
      agent = installAgentFromFile(filePath);
    }
    
    res.json(agent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to install agent';
    res.status(500).json({ error: message });
  }
});

// POST /api/agents/:id/enable - Enable agent
router.post('/:id/enable', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const agent = getAgentById(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    enableAgent(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable agent' });
  }
});

// POST /api/agents/:id/disable - Disable agent
router.post('/:id/disable', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const agent = getAgentById(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    disableAgent(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable agent' });
  }
});

// DELETE /api/agents/:id - Uninstall agent
router.delete('/:id', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const agent = getAgentById(id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    if (agent.source !== 'user') {
      return res.status(400).json({ error: 'Cannot uninstall plugin-provided agents' });
    }
    
    uninstallAgent(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to uninstall agent' });
  }
});

export default router;

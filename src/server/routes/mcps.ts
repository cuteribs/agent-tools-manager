import { Router } from 'express';
import { 
  scanMcps, 
  getMcpById, 
  installMcp,
  enableMcp,
  disableMcp,
  uninstallMcp
} from '../services/mcp-manager.js';

const router = Router();

// GET /api/mcps - List all MCP servers
router.get('/', (_req, res) => {
  try {
    const mcps = scanMcps();
    res.json(mcps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan MCPs' });
  }
});

// GET /api/mcps/:id - Get MCP details
router.get('/:id', (req, res) => {
  try {
    const mcp = getMcpById(decodeURIComponent(req.params.id));
    if (!mcp) {
      return res.status(404).json({ error: 'MCP not found' });
    }
    
    res.json(mcp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get MCP details' });
  }
});

// POST /api/mcps/install - Add MCP (name + command)
router.post('/install', (req, res) => {
  try {
    const { name, command, args, env } = req.body;
    
    if (!name || !command) {
      return res.status(400).json({ error: 'name and command are required' });
    }
    
    const mcp = installMcp(name, command, args, env);
    res.json(mcp);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add MCP';
    res.status(500).json({ error: message });
  }
});

// POST /api/mcps/:id/enable - Enable MCP
router.post('/:id/enable', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const mcp = getMcpById(id);
    if (!mcp) {
      return res.status(404).json({ error: 'MCP not found' });
    }
    
    enableMcp(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable MCP' });
  }
});

// POST /api/mcps/:id/disable - Disable MCP
router.post('/:id/disable', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const mcp = getMcpById(id);
    if (!mcp) {
      return res.status(404).json({ error: 'MCP not found' });
    }
    
    disableMcp(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable MCP' });
  }
});

// DELETE /api/mcps/:id - Remove MCP
router.delete('/:id', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const mcp = getMcpById(id);
    if (!mcp) {
      return res.status(404).json({ error: 'MCP not found' });
    }
    
    uninstallMcp(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove MCP' });
  }
});

export default router;

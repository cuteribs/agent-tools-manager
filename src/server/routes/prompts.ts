import { Router } from 'express';
import { 
  scanPrompts, 
  getPromptById, 
  getPromptContent,
  installPromptFromUrl,
  installPromptFromFile,
  enablePrompt,
  disablePrompt,
  uninstallPrompt
} from '../services/prompt-manager.js';

const router = Router();

// GET /api/prompts - List all prompts
router.get('/', (_req, res) => {
  try {
    const prompts = scanPrompts();
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan prompts' });
  }
});

// GET /api/prompts/:id - Get prompt details
router.get('/:id', (req, res) => {
  try {
    const prompt = getPromptById(decodeURIComponent(req.params.id));
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    const content = getPromptContent(prompt.path);
    res.json({ ...prompt, content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get prompt details' });
  }
});

// POST /api/prompts/install - Install from .md file (file/URL)
router.post('/install', async (req, res) => {
  try {
    const { url, filePath } = req.body;
    
    if (!url && !filePath) {
      return res.status(400).json({ error: 'url or filePath is required' });
    }
    
    let prompt;
    if (url) {
      prompt = await installPromptFromUrl(url);
    } else {
      prompt = installPromptFromFile(filePath);
    }
    
    res.json(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to install prompt';
    res.status(500).json({ error: message });
  }
});

// POST /api/prompts/:id/enable - Enable prompt
router.post('/:id/enable', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const prompt = getPromptById(id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    enablePrompt(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable prompt' });
  }
});

// POST /api/prompts/:id/disable - Disable prompt
router.post('/:id/disable', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const prompt = getPromptById(id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    disablePrompt(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable prompt' });
  }
});

// DELETE /api/prompts/:id - Uninstall prompt
router.delete('/:id', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const prompt = getPromptById(id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    
    if (prompt.source !== 'user') {
      return res.status(400).json({ error: 'Cannot uninstall plugin-provided prompts' });
    }
    
    uninstallPrompt(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to uninstall prompt' });
  }
});

export default router;

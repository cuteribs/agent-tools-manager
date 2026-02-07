import { Router } from 'express';
import { scanPlugins, getPluginById, getPluginReadme } from '../services/plugin-scanner.js';

const router = Router();

// GET /api/plugins - List all installed plugins
router.get('/', (_req, res) => {
  try {
    const plugins = scanPlugins();
    res.json(plugins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan plugins' });
  }
});

// GET /api/plugins/:id - Get plugin details
router.get('/:id', (req, res) => {
  try {
    const plugin = getPluginById(req.params.id);
    if (!plugin) {
      return res.status(404).json({ error: 'Plugin not found' });
    }
    
    const readme = getPluginReadme(plugin.installPath);
    res.json({ ...plugin, readme });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get plugin details' });
  }
});

// POST /api/plugins/install - Install from marketplace
router.post('/install', async (req, res) => {
  try {
    const { marketplaceId, pluginName } = req.body;
    if (!marketplaceId || !pluginName) {
      return res.status(400).json({ error: 'marketplaceId and pluginName are required' });
    }
    
    // TODO: Implement marketplace plugin installation
    res.status(501).json({ error: 'Plugin installation not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to install plugin' });
  }
});

// DELETE /api/plugins/:id - Uninstall plugin
router.delete('/:id', (req, res) => {
  try {
    const plugin = getPluginById(req.params.id);
    if (!plugin) {
      return res.status(404).json({ error: 'Plugin not found' });
    }
    
    // TODO: Implement plugin uninstallation
    res.status(501).json({ error: 'Plugin uninstallation not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to uninstall plugin' });
  }
});

export default router;

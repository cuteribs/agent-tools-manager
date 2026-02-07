import { Router } from 'express';
import { 
  scanMarketplaces, 
  addMarketplace,
  removeMarketplace
} from '../services/marketplace.js';

const router = Router();

// GET /api/marketplaces - List configured marketplaces
router.get('/', (_req, res) => {
  try {
    const marketplaces = scanMarketplaces();
    res.json(marketplaces);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan marketplaces' });
  }
});

// POST /api/marketplaces - Add new marketplace
router.post('/', (req, res) => {
  try {
    const { id, name, url } = req.body;
    
    if (!id || !name || !url) {
      return res.status(400).json({ error: 'id, name, and url are required' });
    }
    
    const marketplace = addMarketplace(id, name, url);
    res.json(marketplace);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add marketplace';
    res.status(500).json({ error: message });
  }
});

// DELETE /api/marketplaces/:id - Remove marketplace
router.delete('/:id', (req, res) => {
  try {
    removeMarketplace(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove marketplace' });
  }
});

export default router;

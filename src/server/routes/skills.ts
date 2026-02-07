import { Router } from 'express';
import { 
  scanSkills, 
  getSkillById, 
  getSkillContent,
  installSkillFromUrl,
  installSkillFromZip,
  enableSkill,
  disableSkill,
  uninstallSkill
} from '../services/skill-manager.js';

const router = Router();

// GET /api/skills - List all skills
router.get('/', (_req, res) => {
  try {
    const skills = scanSkills();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan skills' });
  }
});

// GET /api/skills/:id - Get skill details
router.get('/:id', (req, res) => {
  try {
    const skill = getSkillById(decodeURIComponent(req.params.id));
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    const content = getSkillContent(skill.path);
    res.json({ ...skill, content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get skill details' });
  }
});

// POST /api/skills/install - Install from zipball (file/URL)
router.post('/install', async (req, res) => {
  try {
    const { url, filePath } = req.body;
    
    if (!url && !filePath) {
      return res.status(400).json({ error: 'url or filePath is required' });
    }
    
    let skill;
    if (url) {
      skill = await installSkillFromUrl(url);
    } else {
      skill = await installSkillFromZip(filePath);
    }
    
    res.json(skill);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to install skill';
    res.status(500).json({ error: message });
  }
});

// POST /api/skills/:id/enable - Enable skill
router.post('/:id/enable', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const skill = getSkillById(id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    enableSkill(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable skill' });
  }
});

// POST /api/skills/:id/disable - Disable skill
router.post('/:id/disable', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const skill = getSkillById(id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    disableSkill(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable skill' });
  }
});

// DELETE /api/skills/:id - Uninstall skill
router.delete('/:id', (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const skill = getSkillById(id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    if (skill.source !== 'user') {
      return res.status(400).json({ error: 'Cannot uninstall plugin-provided skills' });
    }
    
    uninstallSkill(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to uninstall skill' });
  }
});

export default router;

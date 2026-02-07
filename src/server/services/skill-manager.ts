import { existsSync, readdirSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { getSkillsDir, readSettings, writeSettings, ensureDir } from './claude-config.js';
import AdmZip from 'adm-zip';
import fetch from 'node-fetch';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface Skill {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  path: string;
  source: 'plugin' | 'user';
  pluginId?: string;
}

export function scanSkills(): Skill[] {
  const skillsDir = getSkillsDir();
  const skills: Skill[] = [];
  const settings = readSettings();
  const disabledSkills = settings.disabledSkills || [];

  if (!existsSync(skillsDir)) {
    return skills;
  }

  const entries = readdirSync(skillsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillPath = join(skillsDir, entry.name);
      const skillMdPath = join(skillPath, 'SKILL.md');
      
      if (existsSync(skillMdPath)) {
        const content = readFileSync(skillMdPath, 'utf-8');
        const nameMatch = content.match(/^#\s+(.+)$/m);
        const descMatch = content.match(/^#.+\n+(.+?)(\n|$)/);
        
        const id = `local:${entry.name}`;
        skills.push({
          id,
          name: nameMatch ? nameMatch[1].trim() : entry.name,
          description: descMatch ? descMatch[1].trim() : '',
          enabled: !disabledSkills.includes(id),
          path: skillPath,
          source: 'user'
        });
      }
    }
  }

  return skills;
}

export function getSkillById(id: string): Skill | null {
  const skills = scanSkills();
  return skills.find(s => s.id === id) || null;
}

export function getSkillContent(skillPath: string): string | null {
  const skillMdPath = join(skillPath, 'SKILL.md');
  if (existsSync(skillMdPath)) {
    return readFileSync(skillMdPath, 'utf-8');
  }
  return null;
}

export async function installSkillFromUrl(url: string): Promise<Skill> {
  const skillsDir = getSkillsDir();
  ensureDir(skillsDir);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const tempPath = join(skillsDir, `temp-${Date.now()}.zip`);
  const fileStream = createWriteStream(tempPath);
  
  await pipeline(response.body!, fileStream);

  return installSkillFromZip(tempPath, true);
}

export async function installSkillFromZip(zipPath: string, deleteAfter = false): Promise<Skill> {
  const skillsDir = getSkillsDir();
  ensureDir(skillsDir);

  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  // Find the skill name from the zip structure
  let skillName = basename(zipPath, '.zip');
  const skillMdEntry = zipEntries.find(e => e.entryName.endsWith('SKILL.md'));
  
  if (skillMdEntry) {
    const parts = skillMdEntry.entryName.split('/');
    if (parts.length > 1) {
      skillName = parts[0];
    }
  }

  const targetDir = join(skillsDir, skillName);
  
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true });
  }

  zip.extractAllTo(skillsDir, true);

  if (deleteAfter) {
    rmSync(zipPath);
  }

  const skill = getSkillById(`local:${skillName}`);
  if (!skill) {
    throw new Error('Failed to install skill');
  }

  return skill;
}

export function enableSkill(id: string): void {
  const settings = readSettings();
  const disabledSkills = settings.disabledSkills || [];
  const index = disabledSkills.indexOf(id);
  
  if (index > -1) {
    disabledSkills.splice(index, 1);
    settings.disabledSkills = disabledSkills;
    writeSettings(settings);
  }
}

export function disableSkill(id: string): void {
  const settings = readSettings();
  const disabledSkills = settings.disabledSkills || [];
  
  if (!disabledSkills.includes(id)) {
    disabledSkills.push(id);
    settings.disabledSkills = disabledSkills;
    writeSettings(settings);
  }
}

export function uninstallSkill(id: string): void {
  const skill = getSkillById(id);
  if (skill && skill.source === 'user') {
    rmSync(skill.path, { recursive: true });
  }
}

import { existsSync, readdirSync, readFileSync, writeFileSync, rmSync, copyFileSync } from 'fs';
import { join, basename } from 'path';
import { getPromptsDir, readSettings, writeSettings, ensureDir } from './claude-config.js';
import fetch from 'node-fetch';

export interface Prompt {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  path: string;
  source: 'plugin' | 'user';
  pluginId?: string;
}

export function scanPrompts(): Prompt[] {
  const promptsDir = getPromptsDir();
  const prompts: Prompt[] = [];
  const settings = readSettings();
  const disabledPrompts = settings.disabledPrompts || [];

  if (!existsSync(promptsDir)) {
    return prompts;
  }

  const entries = readdirSync(promptsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const promptPath = join(promptsDir, entry.name);
      const content = readFileSync(promptPath, 'utf-8');
      const nameMatch = content.match(/^#\s+(.+)$/m);
      const descMatch = content.match(/^#.+\n+(.+?)(\n|$)/);
      
      const id = `local:${entry.name.replace('.md', '')}`;
      prompts.push({
        id,
        name: nameMatch ? nameMatch[1].trim() : entry.name.replace('.md', ''),
        description: descMatch ? descMatch[1].trim() : '',
        enabled: !disabledPrompts.includes(id),
        path: promptPath,
        source: 'user'
      });
    }
  }

  return prompts;
}

export function getPromptById(id: string): Prompt | null {
  const prompts = scanPrompts();
  return prompts.find(p => p.id === id) || null;
}

export function getPromptContent(promptPath: string): string | null {
  if (existsSync(promptPath)) {
    return readFileSync(promptPath, 'utf-8');
  }
  return null;
}

export async function installPromptFromUrl(url: string): Promise<Prompt> {
  const promptsDir = getPromptsDir();
  ensureDir(promptsDir);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const content = await response.text();
  const urlPath = new URL(url).pathname;
  const fileName = basename(urlPath) || 'prompt.md';
  const targetPath = join(promptsDir, fileName.endsWith('.md') ? fileName : `${fileName}.md`);

  writeFileSync(targetPath, content);

  const promptName = fileName.replace('.md', '');
  const prompt = getPromptById(`local:${promptName}`);
  if (!prompt) {
    throw new Error('Failed to install prompt');
  }

  return prompt;
}

export function installPromptFromFile(filePath: string): Prompt {
  const promptsDir = getPromptsDir();
  ensureDir(promptsDir);

  if (!existsSync(filePath)) {
    throw new Error('File not found');
  }

  const fileName = basename(filePath);
  const targetPath = join(promptsDir, fileName.endsWith('.md') ? fileName : `${fileName}.md`);

  copyFileSync(filePath, targetPath);

  const promptName = fileName.replace('.md', '');
  const prompt = getPromptById(`local:${promptName}`);
  if (!prompt) {
    throw new Error('Failed to install prompt');
  }

  return prompt;
}

export function enablePrompt(id: string): void {
  const settings = readSettings();
  const disabledPrompts = settings.disabledPrompts || [];
  const index = disabledPrompts.indexOf(id);
  
  if (index > -1) {
    disabledPrompts.splice(index, 1);
    settings.disabledPrompts = disabledPrompts;
    writeSettings(settings);
  }
}

export function disablePrompt(id: string): void {
  const settings = readSettings();
  const disabledPrompts = settings.disabledPrompts || [];
  
  if (!disabledPrompts.includes(id)) {
    disabledPrompts.push(id);
    settings.disabledPrompts = disabledPrompts;
    writeSettings(settings);
  }
}

export function uninstallPrompt(id: string): void {
  const prompt = getPromptById(id);
  if (prompt && prompt.source === 'user') {
    rmSync(prompt.path);
  }
}

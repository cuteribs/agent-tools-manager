import { existsSync, readdirSync, readFileSync, writeFileSync, rmSync, copyFileSync } from 'fs';
import { join, basename } from 'path';
import { getAgentsDir, readSettings, writeSettings, ensureDir } from './claude-config.js';
import fetch from 'node-fetch';

export interface Agent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  path: string;
  source: 'plugin' | 'user';
  pluginId?: string;
}

export function scanAgents(): Agent[] {
  const agentsDir = getAgentsDir();
  const agents: Agent[] = [];
  const settings = readSettings();
  const disabledAgents = settings.disabledAgents || [];

  if (!existsSync(agentsDir)) {
    return agents;
  }

  const entries = readdirSync(agentsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const agentPath = join(agentsDir, entry.name);
      const content = readFileSync(agentPath, 'utf-8');
      const nameMatch = content.match(/^#\s+(.+)$/m);
      const descMatch = content.match(/^#.+\n+(.+?)(\n|$)/);
      
      const id = `local:${entry.name.replace('.md', '')}`;
      agents.push({
        id,
        name: nameMatch ? nameMatch[1].trim() : entry.name.replace('.md', ''),
        description: descMatch ? descMatch[1].trim() : '',
        enabled: !disabledAgents.includes(id),
        path: agentPath,
        source: 'user'
      });
    }
  }

  return agents;
}

export function getAgentById(id: string): Agent | null {
  const agents = scanAgents();
  return agents.find(a => a.id === id) || null;
}

export function getAgentContent(agentPath: string): string | null {
  if (existsSync(agentPath)) {
    return readFileSync(agentPath, 'utf-8');
  }
  return null;
}

export async function installAgentFromUrl(url: string): Promise<Agent> {
  const agentsDir = getAgentsDir();
  ensureDir(agentsDir);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const content = await response.text();
  const urlPath = new URL(url).pathname;
  const fileName = basename(urlPath) || 'agent.md';
  const targetPath = join(agentsDir, fileName.endsWith('.md') ? fileName : `${fileName}.md`);

  writeFileSync(targetPath, content);

  const agentName = fileName.replace('.md', '');
  const agent = getAgentById(`local:${agentName}`);
  if (!agent) {
    throw new Error('Failed to install agent');
  }

  return agent;
}

export function installAgentFromFile(filePath: string): Agent {
  const agentsDir = getAgentsDir();
  ensureDir(agentsDir);

  if (!existsSync(filePath)) {
    throw new Error('File not found');
  }

  const fileName = basename(filePath);
  const targetPath = join(agentsDir, fileName.endsWith('.md') ? fileName : `${fileName}.md`);

  copyFileSync(filePath, targetPath);

  const agentName = fileName.replace('.md', '');
  const agent = getAgentById(`local:${agentName}`);
  if (!agent) {
    throw new Error('Failed to install agent');
  }

  return agent;
}

export function enableAgent(id: string): void {
  const settings = readSettings();
  const disabledAgents = settings.disabledAgents || [];
  const index = disabledAgents.indexOf(id);
  
  if (index > -1) {
    disabledAgents.splice(index, 1);
    settings.disabledAgents = disabledAgents;
    writeSettings(settings);
  }
}

export function disableAgent(id: string): void {
  const settings = readSettings();
  const disabledAgents = settings.disabledAgents || [];
  
  if (!disabledAgents.includes(id)) {
    disabledAgents.push(id);
    settings.disabledAgents = disabledAgents;
    writeSettings(settings);
  }
}

export function uninstallAgent(id: string): void {
  const agent = getAgentById(id);
  if (agent && agent.source === 'user') {
    rmSync(agent.path);
  }
}

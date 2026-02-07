import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

export function getClaudeDir(): string {
  return join(homedir(), '.claude');
}

export function getSettingsPath(): string {
  return join(getClaudeDir(), 'settings.json');
}

export function getMcpConfigPath(): string {
  return join(getClaudeDir(), '.mcp.json');
}

export function getPluginsDir(): string {
  return join(getClaudeDir(), 'plugins');
}

export function getSkillsDir(): string {
  return join(getClaudeDir(), 'skills');
}

export function getAgentsDir(): string {
  return join(getClaudeDir(), 'agents');
}

export function getPromptsDir(): string {
  return join(getClaudeDir(), 'prompts');
}

export interface ClaudeSettings {
  permissions?: {
    allow?: string[];
    deny?: string[];
  };
  enabledSkills?: string[];
  disabledSkills?: string[];
  enabledAgents?: string[];
  disabledAgents?: string[];
  enabledPrompts?: string[];
  disabledPrompts?: string[];
  mcpServers?: Record<string, McpServerConfig>;
  [key: string]: unknown;
}

export interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  disabled?: boolean;
}

export function readSettings(): ClaudeSettings {
  const settingsPath = getSettingsPath();
  if (!existsSync(settingsPath)) {
    return {};
  }
  try {
    const content = readFileSync(settingsPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export function writeSettings(settings: ClaudeSettings): void {
  const settingsPath = getSettingsPath();
  const dir = getClaudeDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

export function readMcpConfig(): Record<string, McpServerConfig> {
  const mcpPath = getMcpConfigPath();
  if (!existsSync(mcpPath)) {
    return {};
  }
  try {
    const content = readFileSync(mcpPath, 'utf-8');
    const config = JSON.parse(content);
    return config.mcpServers || {};
  } catch {
    return {};
  }
}

export function writeMcpConfig(mcpServers: Record<string, McpServerConfig>): void {
  const mcpPath = getMcpConfigPath();
  const dir = getClaudeDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(mcpPath, JSON.stringify({ mcpServers }, null, 2));
}

export function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

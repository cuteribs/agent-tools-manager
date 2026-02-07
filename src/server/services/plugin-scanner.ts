import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getPluginsDir } from './claude-config.js';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: { name: string; email?: string };
  enabled: boolean;
  installPath: string;
  installedAt: string;
  source: 'marketplace';
}

export interface InstalledPluginsData {
  plugins: Record<string, {
    name: string;
    version: string;
    description?: string;
    author?: { name: string; email?: string };
    installPath: string;
    installedAt: string;
    marketplaceId: string;
  }>;
}

export function getInstalledPluginsPath(): string {
  return join(getPluginsDir(), 'installed_plugins.json');
}

export function readInstalledPlugins(): InstalledPluginsData {
  const path = getInstalledPluginsPath();
  if (!existsSync(path)) {
    return { plugins: {} };
  }
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { plugins: {} };
  }
}

export function scanPlugins(): Plugin[] {
  const pluginsDir = getPluginsDir();
  const cacheDir = join(pluginsDir, 'cache');
  
  if (!existsSync(cacheDir)) {
    return [];
  }

  const installedData = readInstalledPlugins();
  const plugins: Plugin[] = [];

  for (const [id, data] of Object.entries(installedData.plugins)) {
    plugins.push({
      id,
      name: data.name,
      version: data.version,
      description: data.description || '',
      author: data.author || { name: 'Unknown' },
      enabled: true, // TODO: Check settings for enabled state
      installPath: data.installPath,
      installedAt: data.installedAt,
      source: 'marketplace'
    });
  }

  return plugins;
}

export function getPluginById(id: string): Plugin | null {
  const plugins = scanPlugins();
  return plugins.find(p => p.id === id) || null;
}

export function getPluginReadme(pluginPath: string): string | null {
  const readmePath = join(pluginPath, 'README.md');
  if (existsSync(readmePath)) {
    return readFileSync(readmePath, 'utf-8');
  }
  return null;
}

import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getPluginsDir, ensureDir } from './claude-config.js';

export interface Marketplace {
  id: string;
  name: string;
  url: string;
  plugins: MarketplacePlugin[];
}

export interface MarketplacePlugin {
  name: string;
  description: string;
  version: string;
  author: { name: string };
}

export function getKnownMarketplacesPath(): string {
  return join(getPluginsDir(), 'known_marketplaces.json');
}

export function getMarketplacesCacheDir(): string {
  return join(getPluginsDir(), 'marketplaces');
}

export function readKnownMarketplaces(): Array<{ id: string; name: string; url: string }> {
  const path = getKnownMarketplacesPath();
  if (!existsSync(path)) {
    return [];
  }
  try {
    const content = readFileSync(path, 'utf-8');
    const data = JSON.parse(content);
    return data.marketplaces || [];
  } catch {
    return [];
  }
}

export function writeKnownMarketplaces(marketplaces: Array<{ id: string; name: string; url: string }>): void {
  const path = getKnownMarketplacesPath();
  ensureDir(getPluginsDir());
  writeFileSync(path, JSON.stringify({ marketplaces }, null, 2));
}

export function scanMarketplaces(): Marketplace[] {
  const knownMarketplaces = readKnownMarketplaces();
  const cacheDir = getMarketplacesCacheDir();
  const marketplaces: Marketplace[] = [];

  for (const marketplace of knownMarketplaces) {
    const marketplaceDir = join(cacheDir, marketplace.id);
    const catalogPath = join(marketplaceDir, 'catalog.json');
    
    let plugins: MarketplacePlugin[] = [];
    
    if (existsSync(catalogPath)) {
      try {
        const content = readFileSync(catalogPath, 'utf-8');
        const catalog = JSON.parse(content);
        plugins = catalog.plugins || [];
      } catch {
        // Ignore parse errors
      }
    }

    marketplaces.push({
      id: marketplace.id,
      name: marketplace.name,
      url: marketplace.url,
      plugins
    });
  }

  return marketplaces;
}

export function addMarketplace(id: string, name: string, url: string): Marketplace {
  const marketplaces = readKnownMarketplaces();
  
  if (marketplaces.find(m => m.id === id)) {
    throw new Error('Marketplace already exists');
  }

  marketplaces.push({ id, name, url });
  writeKnownMarketplaces(marketplaces);

  return {
    id,
    name,
    url,
    plugins: []
  };
}

export function removeMarketplace(id: string): void {
  const marketplaces = readKnownMarketplaces();
  const filtered = marketplaces.filter(m => m.id !== id);
  writeKnownMarketplaces(filtered);
}

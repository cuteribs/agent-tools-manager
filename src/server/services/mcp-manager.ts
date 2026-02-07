import { readMcpConfig, writeMcpConfig, McpServerConfig } from './claude-config.js';

export interface MCP {
  id: string;
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
  source: 'plugin' | 'user';
}

export function scanMcps(): MCP[] {
  const mcpConfig = readMcpConfig();
  const mcps: MCP[] = [];

  for (const [name, config] of Object.entries(mcpConfig)) {
    mcps.push({
      id: name,
      name,
      command: config.command,
      args: config.args,
      env: config.env,
      enabled: !config.disabled,
      source: 'user'
    });
  }

  return mcps;
}

export function getMcpById(id: string): MCP | null {
  const mcps = scanMcps();
  return mcps.find(m => m.id === id) || null;
}

export function installMcp(name: string, command: string, args?: string[], env?: Record<string, string>): MCP {
  const mcpConfig = readMcpConfig();
  
  if (mcpConfig[name]) {
    throw new Error('MCP already exists');
  }

  const config: McpServerConfig = { command };
  if (args && args.length > 0) {
    config.args = args;
  }
  if (env && Object.keys(env).length > 0) {
    config.env = env;
  }

  mcpConfig[name] = config;
  writeMcpConfig(mcpConfig);

  return {
    id: name,
    name,
    command,
    args,
    env,
    enabled: true,
    source: 'user'
  };
}

export function enableMcp(id: string): void {
  const mcpConfig = readMcpConfig();
  
  if (mcpConfig[id]) {
    delete mcpConfig[id].disabled;
    writeMcpConfig(mcpConfig);
  }
}

export function disableMcp(id: string): void {
  const mcpConfig = readMcpConfig();
  
  if (mcpConfig[id]) {
    mcpConfig[id].disabled = true;
    writeMcpConfig(mcpConfig);
  }
}

export function uninstallMcp(id: string): void {
  const mcpConfig = readMcpConfig();
  
  if (mcpConfig[id]) {
    delete mcpConfig[id];
    writeMcpConfig(mcpConfig);
  }
}

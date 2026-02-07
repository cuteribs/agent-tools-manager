# Agent Tools Manager - Design Document

## Overview

A single npm package that provides a local web UI to manage Claude Code extensions (plugins, skills, agents, prompts, MCPs).

**Usage:**
```bash
npx agent-tools-manager [--port 3000] [--no-open]
```

## Core Features

### Extension Management
- **Plugins** - Install/uninstall from marketplaces
- **Skills** - Install from zipball (file path or URL), enable/disable, uninstall
- **Agents** - Install from .md file (file path or URL), enable/disable, uninstall
- **Prompts** - Install from .md file (file path or URL), enable/disable, uninstall
- **MCPs** - Add via name + command line, enable/disable, remove

### UI Features
- Tab-based navigation (Plugins, Skills, Agents, Prompts, MCPs)
- Search box for filtering items
- Full details view (README, version, author, path)
- Enable/disable toggle per item
- Uninstall with confirmation dialog
- Marketplace source management
- Theme toggle (light/dark, persisted)

### CLI Options
- `--port, -p <number>` - Port to run on (default: 3000)
- `--no-open` - Don't auto-open browser
- `--help, -h` - Show help
- `--version, -v` - Show version

## Tech Stack

### Server
- Node.js 18+
- Express
- TypeScript
- commander (CLI parsing)
- open (browser launch)
- adm-zip (zipball extraction)
- node-fetch (URL downloads)

### Client
- Vue 3 with Composition API
- Vite
- Tailwind CSS
- TypeScript

## Project Structure

```
agent-tools-manager/
├── package.json
├── tsconfig.json
├── tsconfig.server.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── bin/
│   └── cli.js                 # npx entry point
├── src/
│   ├── server/
│   │   ├── index.ts           # Entry, CLI parsing, Express setup
│   │   ├── routes/
│   │   │   ├── plugins.ts
│   │   │   ├── skills.ts
│   │   │   ├── agents.ts
│   │   │   ├── prompts.ts
│   │   │   ├── mcps.ts
│   │   │   └── marketplaces.ts
│   │   └── services/
│   │       ├── claude-config.ts
│   │       ├── plugin-scanner.ts
│   │       ├── skill-manager.ts
│   │       ├── agent-manager.ts
│   │       ├── prompt-manager.ts
│   │       ├── mcp-manager.ts
│   │       └── marketplace.ts
│   └── client/
│       ├── index.html
│       ├── main.ts
│       ├── App.vue
│       ├── router.ts
│       ├── views/
│       │   ├── PluginsView.vue
│       │   ├── SkillsView.vue
│       │   ├── AgentsView.vue
│       │   ├── PromptsView.vue
│       │   └── McpsView.vue
│       ├── components/
│       │   ├── Header.vue
│       │   ├── TabBar.vue
│       │   ├── ItemCard.vue
│       │   ├── DetailModal.vue
│       │   ├── InstallModal.vue
│       │   ├── ConfirmDialog.vue
│       │   └── SettingsPanel.vue
│       └── composables/
│           ├── useApi.ts
│           └── useTheme.ts
└── dist/                       # Built output
    ├── server/
    └── client/
```

## API Endpoints

### Config & Marketplaces
```
GET    /api/config                     # Get Claude settings.json
GET    /api/marketplaces               # List configured marketplaces
POST   /api/marketplaces               # Add new marketplace
DELETE /api/marketplaces/:id           # Remove marketplace
```

### Plugins
```
GET    /api/plugins                    # List all installed plugins
GET    /api/plugins/:id                # Get plugin details
POST   /api/plugins/install            # Install from marketplace
DELETE /api/plugins/:id                # Uninstall plugin
```

### Skills
```
GET    /api/skills                     # List all skills
GET    /api/skills/:id                 # Get skill details
POST   /api/skills/install             # Install from zipball (file/URL)
POST   /api/skills/:id/enable          # Enable skill
POST   /api/skills/:id/disable         # Disable skill
DELETE /api/skills/:id                 # Uninstall skill
```

### Agents
```
GET    /api/agents                     # List all agents
GET    /api/agents/:id                 # Get agent details
POST   /api/agents/install             # Install from .md file (file/URL)
POST   /api/agents/:id/enable          # Enable agent
POST   /api/agents/:id/disable         # Disable agent
DELETE /api/agents/:id                 # Uninstall agent
```

### Prompts
```
GET    /api/prompts                    # List all prompts
GET    /api/prompts/:id                # Get prompt details
POST   /api/prompts/install            # Install from .md file (file/URL)
POST   /api/prompts/:id/enable         # Enable prompt
POST   /api/prompts/:id/disable        # Disable prompt
DELETE /api/prompts/:id                # Uninstall prompt
```

### MCPs
```
GET    /api/mcps                       # List all MCP servers
GET    /api/mcps/:id                   # Get MCP details
POST   /api/mcps/install               # Add MCP (name + command)
POST   /api/mcps/:id/enable            # Enable MCP
POST   /api/mcps/:id/disable           # Disable MCP
DELETE /api/mcps/:id                   # Remove MCP
```

## Data Model

### Files Read/Written

| File | Purpose | Operations |
|------|---------|------------|
| `~/.claude/settings.json` | Enable/disable state | Read/Write |
| `~/.claude/plugins/installed_plugins.json` | Installed plugins | Read/Write |
| `~/.claude/plugins/known_marketplaces.json` | Marketplace sources | Read/Write |
| `~/.claude/plugins/marketplaces/*/` | Marketplace catalogs | Read only |
| `~/.claude/plugins/cache/*/` | Installed plugin files | Read/Delete |
| `~/.claude/skills/` | User-installed skills | Read/Write/Delete |
| `~/.claude/agents/` | User-installed agents | Read/Write/Delete |
| `~/.claude/prompts/` | User-installed prompts | Read/Write/Delete |
| `~/.claude/.mcp.json` | MCP server definitions | Read/Write |

### TypeScript Interfaces

```typescript
interface Plugin {
  id: string;                    // e.g., "superpowers@claude-plugins-official"
  name: string;
  version: string;
  description: string;
  author: { name: string; email?: string };
  enabled: boolean;
  installPath: string;
  installedAt: string;
  source: "marketplace";
}

interface Skill {
  id: string;                    // e.g., "superpowers:brainstorming" or "local:my-skill"
  name: string;
  description: string;
  enabled: boolean;
  path: string;
  source: "plugin" | "user";
  pluginId?: string;             // If from plugin
}

interface Agent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  path: string;
  source: "plugin" | "user";
  pluginId?: string;
}

interface Prompt {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  path: string;
  source: "plugin" | "user";
  pluginId?: string;
}

interface MCP {
  id: string;
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
  source: "plugin" | "user";
}

interface Marketplace {
  id: string;
  name: string;
  url: string;
  plugins: MarketplacePlugin[];
}

interface MarketplacePlugin {
  name: string;
  description: string;
  version: string;
  author: { name: string };
}
```

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Agent Tools Manager                    [☀/🌙] [⚙]     │
├─────────────────────────────────────────────────────────┤
│  [Plugins] [Skills] [Agents] [Prompts] [MCPs]           │
├─────────────────────────────────────────────────────────┤
│  [+ Install]                        [🔍 Search...]      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │ ☑ superpowers:brainstorming          v4.2.0    │    │
│  │   Core skills library for Claude Code...       │    │
│  │   [View Details] [Disable] [Uninstall]         │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ☐ superpowers:systematic-debugging   v4.2.0    │    │
│  │   Debugging workflow skill...                  │    │
│  │   [View Details] [Enable] [Uninstall]          │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Install Dialogs

**Skills (zipball):**
- Radio: File / URL
- File picker or URL text input
- Install button

**Agents/Prompts (.md file):**
- Radio: File / URL
- File picker or URL text input
- Install button

**MCPs (manual entry):**
- Name text input
- Command text input
- Args text input (comma-separated)
- Env key-value pairs
- Add button

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `~/.claude/` doesn't exist | Show error page with setup instructions |
| `settings.json` malformed | Show warning, allow viewing but not editing |
| Marketplace URL unreachable | Show error toast, skip that marketplace |
| Zipball extraction fails | Show error, clean up partial files |
| URL download fails | Show error with status code/message |
| File path doesn't exist | Show error "File not found" |
| Plugin already installed | Show warning "Already installed" |
| Port already in use | Try next port or show error with `--port` hint |

## npm Publishing

### package.json
```json
{
  "name": "agent-tools-manager",
  "version": "1.0.0",
  "description": "Web UI to manage Claude Code extensions",
  "author": "Your Name",
  "license": "MIT",
  "type": "module",
  "bin": {
    "agent-tools-manager": "./bin/cli.js"
  },
  "files": [
    "dist",
    "bin"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "tsx watch src/server/index.ts",
    "dev:client": "vite",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "prepublishOnly": "npm run build"
  },
  "engines": {
    "node": ">=18"
  }
}
```

### bin/cli.js
```javascript
#!/usr/bin/env node
import('../dist/server/index.js');
```

### Testing Before Publish
```bash
npm run build
npm pack
npm install -g ./agent-tools-manager-1.0.0.tgz
agent-tools-manager
```

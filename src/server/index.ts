import express from 'express';
import { Command } from 'commander';
import open from 'open';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

import pluginsRouter from './routes/plugins.js';
import skillsRouter from './routes/skills.js';
import agentsRouter from './routes/agents.js';
import promptsRouter from './routes/prompts.js';
import mcpsRouter from './routes/mcps.js';
import marketplacesRouter from './routes/marketplaces.js';
import { getClaudeDir } from './services/claude-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
  .name('agent-tools-manager')
  .description('Web UI to manage Claude Code extensions')
  .version('1.0.0')
  .option('-p, --port <number>', 'Port to run on', '3000')
  .option('--no-open', 'Don\'t auto-open browser')
  .parse();

const options = program.opts();
const port = parseInt(options.port, 10);

const app = express();
app.use(express.json());

// API routes
app.use('/api/plugins', pluginsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/prompts', promptsRouter);
app.use('/api/mcps', mcpsRouter);
app.use('/api/marketplaces', marketplacesRouter);

// Config endpoint
app.get('/api/config', async (_req, res) => {
  try {
    const claudeDir = getClaudeDir();
    if (!existsSync(claudeDir)) {
      return res.status(404).json({
        error: 'Claude directory not found',
        message: 'Please ensure Claude Code is installed and configured'
      });
    }
    res.json({ claudeDir, status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get config' });
  }
});

// Serve static files in production
const clientPath = join(__dirname, './client');
if (existsSync(clientPath)) {
  app.use(express.static(clientPath));
  app.get('*', (_req, res) => {
    res.sendFile(join(clientPath, 'index.html'));
  });
}

// Start server
const startServer = (attemptPort: number): void => {
  const server = app.listen(attemptPort, () => {
    console.log(`Agent Tools Manager running at http://localhost:${attemptPort}`);

    if (options.open !== false) {
      open(`http://localhost:${attemptPort}`);
    }
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${attemptPort} is in use, trying ${attemptPort + 1}...`);
      startServer(attemptPort + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

startServer(port);

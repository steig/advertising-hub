import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import platforms from '../data/platforms.json';
import agents from '../data/agents.json';

const healthRoutes = new Hono<{ Bindings: Env }>();

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'ok',
    platforms: platforms.length,
    agents: agents.length,
    timestamp: new Date().toISOString(),
  });
});

export { healthRoutes };

import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import registry from '../data/mcp-registry.json';

const mcpRoutes = new Hono<{ Bindings: Env }>();

mcpRoutes.get('/registry', (c) => {
  return c.json(registry);
});

export { mcpRoutes };

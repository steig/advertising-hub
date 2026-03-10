import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import type { AgentDefinition } from '../types/agent';
import agentsData from '../data/agents.json';

const agents = agentsData as AgentDefinition[];
const agentRoutes = new Hono<{ Bindings: Env }>();

agentRoutes.get('/', (c) => {
  const category = c.req.query('category');
  const result = category
    ? agents.filter((a) => a.category === category)
    : agents;
  return c.json(result);
});

agentRoutes.get('/:slug', (c) => {
  const slug = c.req.param('slug');
  const agent = agents.find((a) => a.slug === slug);
  if (!agent) return c.json({ ok: false, error: 'Agent not found' }, 404);
  return c.json(agent);
});

export { agentRoutes };

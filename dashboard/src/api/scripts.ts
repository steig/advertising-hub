import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import scriptsData from '../data/scripts-index.json';

interface ScriptEntry {
  id: string;
  filename: string;
  description: string;
  source: string;
}

const scripts = scriptsData as ScriptEntry[];
const scriptRoutes = new Hono<{ Bindings: Env }>();

scriptRoutes.get('/', (c) => {
  const list = scripts.map(({ source: _, ...rest }) => rest);
  return c.json(list);
});

scriptRoutes.get('/:id/source', (c) => {
  const id = c.req.param('id');
  const script = scripts.find((s) => s.id === id);
  if (!script) return c.json({ ok: false, error: 'Script not found' }, 404);
  return c.json({ id: script.id, filename: script.filename, source: script.source });
});

export { scriptRoutes };

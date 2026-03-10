import { Hono } from 'hono';
import type { Env } from '../types/bindings';
import type { PlatformConfig } from '../types/platform';
import platformsData from '../data/platforms.json';

const platforms = platformsData as PlatformConfig[];
const platformRoutes = new Hono<{ Bindings: Env }>();

platformRoutes.get('/', (c) => {
  const category = c.req.query('category');
  const result = category
    ? platforms.filter((p) => p.category === category)
    : platforms;
  return c.json(result);
});

platformRoutes.get('/:slug', (c) => {
  const slug = c.req.param('slug');
  const platform = platforms.find((p) => p.slug === slug);
  if (!platform) return c.json({ ok: false, error: 'Platform not found' }, 404);
  return c.json(platform);
});

export { platformRoutes };

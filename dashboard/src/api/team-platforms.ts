import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';

const teamPlatformRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET / - list enabled platforms for current team
teamPlatformRoutes.get('/', async (c) => {
  const teamId = c.var.team.id;
  const { results } = await c.env.DB.prepare(
    'SELECT platform, enabled_at, enabled_by FROM team_platforms WHERE team_id = ? ORDER BY enabled_at'
  ).bind(teamId).all();
  return c.json(results);
});

// POST /:platform - enable platform
teamPlatformRoutes.post('/:platform', async (c) => {
  if (!['owner', 'admin'].includes(c.var.team.role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const teamId = c.var.team.id;
  const platform = c.req.param('platform');
  const userId = c.var.user.id;

  await c.env.DB.prepare(
    'INSERT OR IGNORE INTO team_platforms (team_id, platform, enabled_by) VALUES (?, ?, ?)'
  ).bind(teamId, platform, userId).run();

  return c.json({ platform, enabled: true }, 201);
});

// DELETE /:platform - disable platform
teamPlatformRoutes.delete('/:platform', async (c) => {
  if (!['owner', 'admin'].includes(c.var.team.role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const teamId = c.var.team.id;
  const platform = c.req.param('platform');

  await c.env.DB.prepare(
    'DELETE FROM team_platforms WHERE team_id = ? AND platform = ?'
  ).bind(teamId, platform).run();

  return c.json({ platform, enabled: false });
});

export { teamPlatformRoutes };

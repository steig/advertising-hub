import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types/bindings';

export const teamMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const teamId = c.req.header('X-Team-Id');
  if (!teamId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const row = await c.env.DB.prepare(
    'SELECT tm.role, t.id, t.slug, t.name FROM team_members tm JOIN teams t ON t.id = tm.team_id WHERE tm.team_id = ? AND tm.user_id = ? AND t.deleted_at IS NULL',
  )
    .bind(teamId, c.var.user.id)
    .first<{ role: 'owner' | 'admin' | 'member'; id: string; slug: string; name: string }>();

  if (!row) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  c.set('team', {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
  });

  await next();
});

export function requireRole(...roles: string[]) {
  return createMiddleware<{ Bindings: Env; Variables: Variables }>(
    async (c, next) => {
      if (!roles.includes(c.var.team.role)) {
        return c.json({ error: 'Forbidden' }, 403);
      }
      await next();
    },
  );
}

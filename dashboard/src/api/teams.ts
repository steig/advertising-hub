import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import { authMiddleware } from '../middleware/auth';
import { teamMiddleware, requireRole } from '../middleware/team';
import { audit } from '../services/audit';

const RESERVED_SLUGS = new Set([
  'console', 'chat', 'api', 'www', 'admin', 'mail',
  'app', 'help', 'support', 'status', 'blog', 'docs',
]);

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function validateSlug(slug: string): string | null {
  if (slug.length < 3 || slug.length > 63) return 'Slug must be 3-63 characters';
  if (!SLUG_RE.test(slug)) return 'Slug must be lowercase alphanumeric with hyphens, not starting/ending with hyphen';
  if (slug.includes('--')) return 'Slug must not contain consecutive hyphens';
  if (RESERVED_SLUGS.has(slug)) return 'This slug is reserved';
  return null;
}

const teamRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// List user's teams (auth only)
teamRoutes.get('/', authMiddleware, async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT t.id, t.slug, t.name, tm.role FROM team_members tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = ? AND t.deleted_at IS NULL',
  )
    .bind(c.var.user.id)
    .all();
  return c.json(rows.results);
});

// Create team (auth only)
teamRoutes.post('/', authMiddleware, async (c) => {
  const body = await c.req.json<{ name: string; slug: string }>();
  if (!body.name || !body.slug) {
    return c.json({ error: 'name and slug are required' }, 400);
  }

  const slugErr = validateSlug(body.slug);
  if (slugErr) return c.json({ error: slugErr }, 400);

  const existing = await c.env.DB.prepare('SELECT id FROM teams WHERE slug = ? AND deleted_at IS NULL')
    .bind(body.slug)
    .first();
  if (existing) return c.json({ error: 'Slug already taken' }, 409);

  const teamId = crypto.randomUUID();
  const batch = [
    c.env.DB.prepare(
      "INSERT INTO teams (id, name, slug, created_at) VALUES (?, ?, ?, datetime('now'))",
    ).bind(teamId, body.name, body.slug),
    c.env.DB.prepare(
      "INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, 'owner', datetime('now'))",
    ).bind(teamId, c.var.user.id),
  ];
  await c.env.DB.batch(batch);

  await audit(c.env.DB, {
    teamId,
    userId: c.var.user.id,
    action: 'team.created',
    targetType: 'team',
    targetId: teamId,
    metadata: { name: body.name, slug: body.slug },
  });

  return c.json({ id: teamId, name: body.name, slug: body.slug }, 201);
});

// Get current team (team middleware)
teamRoutes.get('/current', authMiddleware, teamMiddleware, async (c) => {
  return c.json(c.var.team);
});

// Update current team (owner/admin)
teamRoutes.patch(
  '/current',
  authMiddleware,
  teamMiddleware,
  requireRole('owner', 'admin'),
  async (c) => {
    const body = await c.req.json<{ name?: string; slug?: string }>();
    const team = c.var.team;

    if (body.slug) {
      const slugErr = validateSlug(body.slug);
      if (slugErr) return c.json({ error: slugErr }, 400);

      const existing = await c.env.DB.prepare(
        'SELECT id FROM teams WHERE slug = ? AND id != ? AND deleted_at IS NULL',
      )
        .bind(body.slug, team.id)
        .first();
      if (existing) return c.json({ error: 'Slug already taken' }, 409);
    }

    const name = body.name ?? team.name;
    const slug = body.slug ?? team.slug;

    await c.env.DB.prepare('UPDATE teams SET name = ?, slug = ? WHERE id = ?')
      .bind(name, slug, team.id)
      .run();

    await audit(c.env.DB, {
      teamId: team.id,
      userId: c.var.user.id,
      action: 'team.updated',
      targetType: 'team',
      targetId: team.id,
      metadata: { name, slug },
    });

    return c.json({ id: team.id, name, slug });
  },
);

// Soft-delete team (owner only)
teamRoutes.delete(
  '/current',
  authMiddleware,
  teamMiddleware,
  requireRole('owner'),
  async (c) => {
    const team = c.var.team;

    const creds = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM credentials WHERE team_id = ?',
    )
      .bind(team.id)
      .first<{ count: number }>();

    if (creds && creds.count > 0) {
      return c.json({ error: 'Remove all credentials before deleting team' }, 400);
    }

    await c.env.DB.prepare("UPDATE teams SET deleted_at = datetime('now') WHERE id = ?")
      .bind(team.id)
      .run();

    await audit(c.env.DB, {
      teamId: team.id,
      userId: c.var.user.id,
      action: 'team.deleted',
      targetType: 'team',
      targetId: team.id,
    });

    return c.json({ ok: true });
  },
);

export { teamRoutes };

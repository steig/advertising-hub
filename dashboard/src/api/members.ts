import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import { authMiddleware } from '../middleware/auth';
import { teamMiddleware, requireRole } from '../middleware/team';
import { audit } from '../services/audit';

const memberRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// List team members
memberRoutes.get('/', authMiddleware, teamMiddleware, async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT u.id, u.email, u.name, u.avatar_url, tm.role, tm.joined_at FROM team_members tm JOIN users u ON u.id = tm.user_id WHERE tm.team_id = ?',
  )
    .bind(c.var.team.id)
    .all();
  return c.json(rows.results);
});

// Change member role (owner only)
memberRoutes.patch(
  '/:userId',
  authMiddleware,
  teamMiddleware,
  requireRole('owner'),
  async (c) => {
    const userId = c.req.param('userId');
    const body = await c.req.json<{ role: string }>();
    const team = c.var.team;

    if (!body.role || !['owner', 'admin', 'member'].includes(body.role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    const member = await c.env.DB.prepare(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
    )
      .bind(team.id, userId)
      .first<{ role: string }>();

    if (!member) return c.json({ error: 'Member not found' }, 404);

    // If demoting an owner, check owner invariant
    if (member.role === 'owner' && body.role !== 'owner') {
      const owners = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM team_members WHERE team_id = ? AND role = 'owner'",
      )
        .bind(team.id)
        .first<{ count: number }>();

      if (!owners || owners.count <= 1) {
        return c.json({ error: 'Team must have at least one owner' }, 400);
      }
    }

    await c.env.DB.prepare(
      'UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?',
    )
      .bind(body.role, team.id, userId)
      .run();

    await audit(c.env.DB, {
      teamId: team.id,
      userId: c.var.user.id,
      action: 'member.role_changed',
      targetType: 'user',
      targetId: userId,
      metadata: { from: member.role, to: body.role },
    });

    return c.json({ ok: true });
  },
);

// Remove member (owner/admin)
memberRoutes.delete(
  '/:userId',
  authMiddleware,
  teamMiddleware,
  requireRole('owner', 'admin'),
  async (c) => {
    const userId = c.req.param('userId');
    const team = c.var.team;

    const member = await c.env.DB.prepare(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
    )
      .bind(team.id, userId)
      .first<{ role: string }>();

    if (!member) return c.json({ error: 'Member not found' }, 404);

    // Admins cannot remove owners
    if (member.role === 'owner' && team.role !== 'owner') {
      return c.json({ error: 'Admins cannot remove owners' }, 403);
    }

    // Owner invariant
    if (member.role === 'owner') {
      const owners = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM team_members WHERE team_id = ? AND role = 'owner'",
      )
        .bind(team.id)
        .first<{ count: number }>();

      if (!owners || owners.count <= 1) {
        return c.json({ error: 'Team must have at least one owner' }, 400);
      }
    }

    await c.env.DB.prepare(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
    )
      .bind(team.id, userId)
      .run();

    await audit(c.env.DB, {
      teamId: team.id,
      userId: c.var.user.id,
      action: 'member.removed',
      targetType: 'user',
      targetId: userId,
    });

    return c.json({ ok: true });
  },
);

export { memberRoutes };

import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import { authMiddleware } from '../middleware/auth';
import { teamMiddleware, requireRole } from '../middleware/team';
import { audit } from '../services/audit';

const invitationRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Invite by email (team + owner/admin)
invitationRoutes.post(
  '/',
  authMiddleware,
  teamMiddleware,
  requireRole('owner', 'admin'),
  async (c) => {
    const body = await c.req.json<{ email: string; role: string }>();
    const team = c.var.team;

    if (!body.email || !body.role) {
      return c.json({ error: 'email and role are required' }, 400);
    }

    if (!['admin', 'member'].includes(body.role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    // Check pending invitation limit
    const pending = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM invitations WHERE team_id = ? AND accepted_at IS NULL AND expires_at > datetime('now')",
    )
      .bind(team.id)
      .first<{ count: number }>();

    if (pending && pending.count >= 50) {
      return c.json({ error: 'Maximum 50 pending invitations per team' }, 400);
    }

    // Check if already a member
    const existing = await c.env.DB.prepare(
      'SELECT u.id FROM users u JOIN team_members tm ON tm.user_id = u.id WHERE u.email = ? AND tm.team_id = ?',
    )
      .bind(body.email, team.id)
      .first();

    if (existing) {
      return c.json({ error: 'User is already a team member' }, 409);
    }

    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      "INSERT INTO invitations (id, team_id, email, role, invited_by, expires_at, created_at) VALUES (?, ?, ?, ?, ?, datetime('now', '+7 days'), datetime('now'))",
    )
      .bind(id, team.id, body.email, body.role, c.var.user.id)
      .run();

    await audit(c.env.DB, {
      teamId: team.id,
      userId: c.var.user.id,
      action: 'invitation.created',
      targetType: 'invitation',
      targetId: id,
      metadata: { email: body.email, role: body.role },
    });

    return c.json({ id, email: body.email, role: body.role }, 201);
  },
);

// List pending invitations for team (owner/admin)
invitationRoutes.get(
  '/',
  authMiddleware,
  teamMiddleware,
  requireRole('owner', 'admin'),
  async (c) => {
    const rows = await c.env.DB.prepare(
      "SELECT id, email, role, invited_by, expires_at, created_at FROM invitations WHERE team_id = ? AND accepted_at IS NULL AND expires_at > datetime('now')",
    )
      .bind(c.var.team.id)
      .all();
    return c.json(rows.results);
  },
);

// Revoke invitation (owner/admin)
invitationRoutes.delete(
  '/:id',
  authMiddleware,
  teamMiddleware,
  requireRole('owner', 'admin'),
  async (c) => {
    const id = c.req.param('id');
    const team = c.var.team;

    const inv = await c.env.DB.prepare(
      'SELECT id FROM invitations WHERE id = ? AND team_id = ?',
    )
      .bind(id, team.id)
      .first();

    if (!inv) return c.json({ error: 'Invitation not found' }, 404);

    await c.env.DB.prepare('DELETE FROM invitations WHERE id = ?')
      .bind(id)
      .run();

    await audit(c.env.DB, {
      teamId: team.id,
      userId: c.var.user.id,
      action: 'invitation.revoked',
      targetType: 'invitation',
      targetId: id,
    });

    return c.json({ ok: true });
  },
);

// List pending invitations for current user (auth only, no team)
invitationRoutes.get('/pending', authMiddleware, async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT i.id, i.team_id, i.email, i.role, i.expires_at, i.created_at, t.name as team_name FROM invitations i JOIN teams t ON t.id = i.team_id WHERE i.email = ? AND i.accepted_at IS NULL AND i.expires_at > datetime('now')",
  )
    .bind(c.var.user.email)
    .all();
  return c.json(rows.results);
});

// Accept invitation (auth only, no team)
invitationRoutes.post('/:id/accept', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.var.user;

  const inv = await c.env.DB.prepare(
    "SELECT id, team_id, email, role FROM invitations WHERE id = ? AND accepted_at IS NULL AND expires_at > datetime('now')",
  )
    .bind(id)
    .first<{ id: string; team_id: string; email: string; role: string }>();

  if (!inv) return c.json({ error: 'Invitation not found or expired' }, 404);

  if (inv.email !== user.email) {
    return c.json({ error: 'Invitation email does not match your account' }, 403);
  }

  // Check if already a member
  const existing = await c.env.DB.prepare(
    'SELECT user_id FROM team_members WHERE team_id = ? AND user_id = ?',
  )
    .bind(inv.team_id, user.id)
    .first();

  if (existing) {
    return c.json({ error: 'Already a member of this team' }, 409);
  }

  const batch = [
    c.env.DB.prepare(
      "INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, ?, datetime('now'))",
    ).bind(inv.team_id, user.id, inv.role),
    c.env.DB.prepare(
      "UPDATE invitations SET accepted_at = datetime('now') WHERE id = ?",
    ).bind(id),
  ];
  await c.env.DB.batch(batch);

  await audit(c.env.DB, {
    teamId: inv.team_id,
    userId: user.id,
    action: 'invitation.accepted',
    targetType: 'invitation',
    targetId: id,
  });

  return c.json({ ok: true, teamId: inv.team_id });
});

export { invitationRoutes };

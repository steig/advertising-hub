import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import { fkMiddleware } from '../middleware/fk';
import { csrfMiddleware } from '../middleware/csrf';
import { authMiddleware } from '../middleware/auth';
import { teamMiddleware } from '../middleware/team';
import { healthRoutes } from './health';
import { platformRoutes } from './platforms';
import { agentRoutes } from './agents';
import { scriptRoutes } from './scripts';
import { mcpRoutes } from './mcp';
import { credentialRoutes } from './credentials';
import { chatRoutes } from './chat';
import { conversationRoutes, sharedRoutes } from './conversations';
import { authRoutes } from './auth';
import { teamRoutes } from './teams';
import { memberRoutes } from './members';
import { invitationRoutes } from './invitations';
import { reportRoutes } from './reports';
import { teamPlatformRoutes } from './team-platforms';

const api = new Hono<{ Bindings: Env; Variables: Variables }>();

// Global middleware
api.use('*', fkMiddleware);
api.use('*', csrfMiddleware);

// Public routes (no auth)
api.route('/health', healthRoutes);
api.route('/platforms', platformRoutes);
api.route('/agents', agentRoutes);
api.route('/scripts', scriptRoutes);
api.route('/mcp', mcpRoutes);
api.route('/shared', sharedRoutes);
api.route('/auth', authRoutes);

// Auth-required routes (user level, no team needed)
api.use('/teams/*', authMiddleware);
api.use('/invitations/*', authMiddleware);
api.route('/teams', teamRoutes);
api.route('/invitations', invitationRoutes);

// Team-scoped routes (auth + team)
api.use('/credentials/*', authMiddleware);
api.use('/credentials/*', teamMiddleware);
api.use('/conversations/*', authMiddleware);
api.use('/conversations/*', teamMiddleware);
api.use('/chat/*', authMiddleware);
api.use('/chat/*', teamMiddleware);
api.use('/members/*', authMiddleware);
api.use('/members/*', teamMiddleware);
api.use('/team-platforms/*', authMiddleware);
api.use('/team-platforms/*', teamMiddleware);
api.use('/reports/*', authMiddleware);
api.use('/reports/*', teamMiddleware);
api.use('/audit/*', authMiddleware);
api.use('/audit/*', teamMiddleware);
api.route('/team-platforms', teamPlatformRoutes);
api.route('/reports', reportRoutes);
api.route('/credentials', credentialRoutes);
api.route('/conversations', conversationRoutes);
api.route('/chat', chatRoutes);
api.route('/members', memberRoutes);

// Audit route (paginated GET for admin panel)
api.get('/audit', async (c) => {
  if (!['owner', 'admin'].includes(c.var.team.role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const teamId = c.var.team.id;
  const page = Math.max(1, Number(c.req.query('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 50));
  const offset = (page - 1) * limit;

  const [countResult, { results }] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as total FROM audit_log WHERE team_id = ?').bind(teamId).first<{ total: number }>(),
    c.env.DB.prepare(
      `SELECT al.*, u.name as user_name FROM audit_log al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.team_id = ? ORDER BY al.created_at DESC LIMIT ? OFFSET ?`
    ).bind(teamId, limit, offset).all(),
  ]);

  const total = countResult?.total ?? 0;
  return c.json({ items: results, total, page, pages: Math.ceil(total / limit) });
});

export { api };

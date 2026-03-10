import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import agents from '../data/agents.json';

type AgentEntry = { slug: string; name: string; description: string; body: string };

const conversationRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/conversations - Create a new conversation
conversationRoutes.post('/', async (c) => {
  const { agentSlug } = await c.req.json<{ agentSlug: string }>();
  const agent = (agents as AgentEntry[]).find(a => a.slug === agentSlug);
  if (!agent) return c.json({ error: 'Agent not found' }, 404);

  const doId = c.env.CHAT_SESSION.newUniqueId();
  const id = doId.toString();
  const teamId = c.var.team.id;
  const createdBy = c.var.user.id;

  await c.env.DB.prepare(
    'INSERT INTO conversations (id, agent_slug, title, team_id, created_by) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, agentSlug, 'New conversation', teamId, createdBy).run();

  return c.json({ id, agentSlug, title: 'New conversation' }, 201);
});

// GET /api/conversations - List conversations for team
conversationRoutes.get('/', async (c) => {
  const teamId = c.var.team.id;
  const { results } = await c.env.DB.prepare(
    'SELECT id, agent_slug, title, created_at, updated_at, shared_at FROM conversations WHERE team_id = ? ORDER BY updated_at DESC'
  ).bind(teamId).all();
  return c.json(results);
});

// PATCH /api/conversations/:id - Update conversation (rename)
conversationRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const teamId = c.var.team.id;
  const { title } = await c.req.json<{ title: string }>();
  if (!title?.trim()) return c.json({ error: 'Title is required' }, 400);

  const result = await c.env.DB.prepare(
    'UPDATE conversations SET title = ?, updated_at = datetime(\'now\') WHERE id = ? AND team_id = ?'
  ).bind(title.trim(), id, teamId).run();

  if (!result.meta.changes) return c.json({ error: 'Not found' }, 404);
  return c.json({ id, title: title.trim() });
});

// DELETE /api/conversations/:id
conversationRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const teamId = c.var.team.id;

  // Verify conversation belongs to team
  const conv = await c.env.DB.prepare(
    'SELECT id FROM conversations WHERE id = ? AND team_id = ?'
  ).bind(id, teamId).first();
  if (!conv) return c.json({ error: 'Not found' }, 404);

  // Clean up DO storage
  try {
    const doId = c.env.CHAT_SESSION.idFromString(id);
    const stub = c.env.CHAT_SESSION.get(doId);
    await stub.fetch(new Request('https://do/delete'));
  } catch { /* DO may not exist */ }

  await c.env.DB.prepare('DELETE FROM conversations WHERE id = ? AND team_id = ?').bind(id, teamId).run();
  return c.json({ deleted: true });
});

// POST /api/conversations/:id/chat - Send message, stream SSE
conversationRoutes.post('/:id/chat', async (c) => {
  const id = c.req.param('id');
  const teamId = c.var.team.id;

  // Get conversation metadata, scoped to team
  const conv = await c.env.DB.prepare(
    'SELECT agent_slug, title FROM conversations WHERE id = ? AND team_id = ?'
  ).bind(id, teamId).first<{ agent_slug: string; title: string }>();
  if (!conv) return c.json({ error: 'Conversation not found' }, 404);

  const agent = (agents as AgentEntry[]).find(a => a.slug === conv.agent_slug);
  if (!agent) return c.json({ error: 'Agent not found' }, 404);

  const { message } = await c.req.json<{ message: string }>();
  if (!message?.trim()) return c.json({ error: 'Message is required' }, 400);

  // Auto-title on first message
  if (conv.title === 'New conversation') {
    const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
    await c.env.DB.prepare(
      'UPDATE conversations SET title = ?, updated_at = datetime(\'now\') WHERE id = ? AND team_id = ?'
    ).bind(title, id, teamId).run();
  } else {
    await c.env.DB.prepare(
      'UPDATE conversations SET updated_at = datetime(\'now\') WHERE id = ? AND team_id = ?'
    ).bind(id, teamId).run();
  }

  const doId = c.env.CHAT_SESSION.idFromString(id);
  const stub = c.env.CHAT_SESSION.get(doId);

  const systemPrompt = `You are ${agent.name}. ${agent.description}\n\n${agent.body}`;

  const doResponse = await stub.fetch(new Request('https://do/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, systemPrompt, agentName: agent.name, apiKey: c.env.ANTHROPIC_API_KEY }),
  }));

  return new Response(doResponse.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

// GET /api/conversations/:id/history - Get messages
conversationRoutes.get('/:id/history', async (c) => {
  const id = c.req.param('id');
  const teamId = c.var.team.id;

  // Verify conversation belongs to team
  const conv = await c.env.DB.prepare(
    'SELECT id FROM conversations WHERE id = ? AND team_id = ?'
  ).bind(id, teamId).first();
  if (!conv) return c.json({ error: 'Not found' }, 404);

  try {
    const doId = c.env.CHAT_SESSION.idFromString(id);
    const stub = c.env.CHAT_SESSION.get(doId);
    const response = await stub.fetch(new Request('https://do/history'));
    return new Response(response.body, { headers: response.headers });
  } catch {
    return c.json([]);
  }
});

// POST /api/conversations/:id/share - Toggle share
conversationRoutes.post('/:id/share', async (c) => {
  const id = c.req.param('id');
  const teamId = c.var.team.id;

  const conv = await c.env.DB.prepare(
    'SELECT shared_at FROM conversations WHERE id = ? AND team_id = ?'
  ).bind(id, teamId).first<{ shared_at: string | null }>();
  if (!conv) return c.json({ error: 'Not found' }, 404);

  if (conv.shared_at) {
    await c.env.DB.prepare('UPDATE conversations SET shared_at = NULL WHERE id = ? AND team_id = ?').bind(id, teamId).run();
    return c.json({ shared: false });
  } else {
    await c.env.DB.prepare(
      'UPDATE conversations SET shared_at = datetime(\'now\') WHERE id = ? AND team_id = ?'
    ).bind(id, teamId).run();
    return c.json({ shared: true, url: `/shared/${id}` });
  }
});

// Shared conversation routes (mounted at /api level, no auth required)
const sharedRoutes = new Hono<{ Bindings: Env }>();

// GET /api/shared/:id - Public read-only view
sharedRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const conv = await c.env.DB.prepare(
    'SELECT id, agent_slug, title, shared_at FROM conversations WHERE id = ? AND shared_at IS NOT NULL'
  ).bind(id).first();
  if (!conv) return c.json({ error: 'Not found or not shared' }, 404);

  // Get messages from DO
  try {
    const doId = c.env.CHAT_SESSION.idFromString(id);
    const stub = c.env.CHAT_SESSION.get(doId);
    const response = await stub.fetch(new Request('https://do/history'));
    const messages = await response.json();
    return c.json({ conversation: conv, messages });
  } catch {
    return c.json({ conversation: conv, messages: [] });
  }
});

export { conversationRoutes, sharedRoutes };

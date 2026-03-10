import { Hono } from 'hono';
import type { Env, Variables } from '../types/bindings';
import agents from '../data/agents.json';

const chatRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/chat/:agentSlug - Stream chat response via SSE
chatRoutes.post('/:agentSlug', async (c) => {
  const agentSlug = c.req.param('agentSlug');
  const agent = (agents as { slug: string; name: string; description: string; body: string }[]).find(a => a.slug === agentSlug);

  if (!agent) {
    return c.json({ error: 'Agent not found' }, 404);
  }

  const { message, sessionId } = await c.req.json<{ message: string; sessionId?: string }>();

  if (!message?.trim()) {
    return c.json({ error: 'Message is required' }, 400);
  }

  // Get or create Durable Object session
  const id = sessionId
    ? c.env.CHAT_SESSION.idFromString(sessionId)
    : c.env.CHAT_SESSION.newUniqueId();

  const stub = c.env.CHAT_SESSION.get(id);

  // Build system prompt from agent definition
  const systemPrompt = `You are ${agent.name}. ${agent.description}\n\n${agent.body}`;

  // Forward to Durable Object
  const doResponse = await stub.fetch(new Request('https://do/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, systemPrompt, agentName: agent.name, apiKey: c.env.ANTHROPIC_API_KEY }),
  }));

  // Return the SSE stream with session ID header
  const headers = new Headers(doResponse.headers);
  headers.set('X-Session-Id', id.toString());

  return new Response(doResponse.body, { headers });
});

// GET /api/chat/:agentSlug/history?sessionId=...
chatRoutes.get('/:agentSlug/history', async (c) => {
  const sessionId = c.req.query('sessionId');
  if (!sessionId) return c.json([]);

  try {
    const id = c.env.CHAT_SESSION.idFromString(sessionId);
    const stub = c.env.CHAT_SESSION.get(id);
    const response = await stub.fetch(new Request('https://do/history'));
    return new Response(response.body, { headers: response.headers });
  } catch {
    return c.json([]);
  }
});

// POST /api/chat/:agentSlug/clear
chatRoutes.post('/:agentSlug/clear', async (c) => {
  const { sessionId } = await c.req.json<{ sessionId?: string }>();
  if (!sessionId) return c.json({ cleared: true });

  try {
    const id = c.env.CHAT_SESSION.idFromString(sessionId);
    const stub = c.env.CHAT_SESSION.get(id);
    await stub.fetch(new Request('https://do/clear'));
  } catch { /* ignore */ }

  return c.json({ cleared: true });
});

export { chatRoutes };

import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types/bindings';
import { verifyJWT } from '../services/jwt';

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const cookie = c.req.header('Cookie') ?? '';
  const match = cookie.match(/(?:^|;\s*)__access=([^;]*)/);
  const token = match?.[1];

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const blocked = await c.env.CACHE.get('blocked:' + payload.jti);
  if (blocked) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', {
    id: payload.sub as string,
    email: payload.email as string,
    name: payload.name as string,
    avatar_url: (payload.avatar_url as string) ?? null,
  });

  await next();
});

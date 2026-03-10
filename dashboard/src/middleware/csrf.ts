import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types/bindings';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

export const csrfMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  if (MUTATING_METHODS.has(c.req.method)) {
    if (c.req.header('X-Requested-With') !== 'XMLHttpRequest') {
      return c.json({ error: 'Forbidden' }, 403);
    }
  }
  await next();
});

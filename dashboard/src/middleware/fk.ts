import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types/bindings';

export const fkMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  try {
    await c.env.DB.prepare('PRAGMA foreign_keys = ON').run();
  } catch {
    // Vite's local D1 emulator may not support PRAGMA — safe to skip in dev
  }
  await next();
});

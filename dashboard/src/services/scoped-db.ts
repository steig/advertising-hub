import type { Context } from 'hono';
import type { Env, Variables } from '../types/bindings';

type AppContext = Context<{ Bindings: Env; Variables: Variables }>;

export function scopedDb(c: AppContext) {
  const db = c.env.DB;
  const teamId = c.var.team.id;

  return {
    query<T = Record<string, unknown>>(
      sql: string,
      ...params: unknown[]
    ): D1PreparedStatement {
      return db.prepare(sql).bind(teamId, ...params);
    },
  };
}

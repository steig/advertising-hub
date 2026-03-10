import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env, Variables } from '../types/bindings';
import { signAccessToken, signRefreshToken, verifyJWT } from '../services/jwt';
import { audit } from '../services/audit';
import { authMiddleware } from '../middleware/auth';

type AppContext = { Bindings: Env; Variables: Variables };

const authRoutes = new Hono<AppContext>();

// --- Helpers ---

function setCookie(c: Context<AppContext>, name: string, value: string, options: { path?: string; maxAge: number }) {
  const domain = c.env.APP_DOMAIN;
  const cookie = `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=${options.path || '/'}; Domain=.${domain}; Max-Age=${options.maxAge}`;
  c.header('Set-Cookie', cookie, { append: true });
}

async function rateLimit(kv: KVNamespace, key: string, max: number, windowSec: number): Promise<boolean> {
  const current = parseInt(await kv.get(key) || '0');
  if (current >= max) return false;
  await kv.put(key, String(current + 1), { expirationTtl: windowSec });
  return true;
}

function parseCookie(header: string, name: string): string | undefined {
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1];
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64urlEncode(array);
}

function base64urlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(verifier));
  return base64urlEncode(new Uint8Array(digest));
}

// --- Routes ---

// GET /login
authRoutes.get('/login', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const allowed = await rateLimit(c.env.CACHE, `rl:login:${ip}`, 10, 60);
  if (!allowed) return c.json({ error: 'Too many requests' }, 429);

  const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  await c.env.CACHE.put(`oauth:${state}`, codeVerifier, { expirationTtl: 60 });

  const redirectUri = `https://console.${c.env.APP_DOMAIN}/api/auth/callback`;
  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// GET /callback
authRoutes.get('/callback', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const allowed = await rateLimit(c.env.CACHE, `rl:callback:${ip}`, 10, 60);
  if (!allowed) return c.json({ error: 'Too many requests' }, 429);

  const state = c.req.query('state');
  const code = c.req.query('code');
  if (!state || !code) return c.json({ error: 'Missing state or code' }, 400);

  // Verify state and get code_verifier
  const codeVerifier = await c.env.CACHE.get(`oauth:${state}`);
  if (!codeVerifier) return c.json({ error: 'Invalid or expired state' }, 400);
  await c.env.CACHE.delete(`oauth:${state}`);

  // Exchange code for tokens
  const redirectUri = `https://console.${c.env.APP_DOMAIN}/api/auth/callback`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) return c.json({ error: 'Token exchange failed' }, 502);
  const tokenData = (await tokenRes.json()) as { access_token: string };

  // Fetch userinfo
  const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userinfoRes.ok) return c.json({ error: 'Failed to fetch user info' }, 502);
  const userinfo = (await userinfoRes.json()) as {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  };

  // Upsert user in D1
  const userId = crypto.randomUUID();
  const upsertResult = await c.env.DB
    .prepare(
      `INSERT INTO users (id, google_id, email, name, avatar_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(google_id) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         avatar_url = excluded.avatar_url,
         updated_at = datetime('now')
       RETURNING id, email, name, avatar_url`
    )
    .bind(userId, userinfo.sub, userinfo.email, userinfo.name, userinfo.picture ?? null)
    .first<{ id: string; email: string; name: string; avatar_url: string | null }>();

  if (!upsertResult) return c.json({ error: 'Database error' }, 500);

  const user = upsertResult;

  // Check and auto-accept pending invitations
  const invitations = await c.env.DB
    .prepare(
      `SELECT id, team_id, role FROM invitations WHERE email = ? AND accepted_at IS NULL AND expires_at > datetime('now')`
    )
    .bind(user.email)
    .all<{ id: string; team_id: string; role: string }>();

  if (invitations.results.length > 0) {
    for (const inv of invitations.results) {
      await c.env.DB.batch([
        c.env.DB
          .prepare(
            `INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, ?, datetime('now'))`
          )
          .bind(inv.team_id, user.id, inv.role),
        c.env.DB
          .prepare(`UPDATE invitations SET accepted_at = datetime('now') WHERE id = ?`)
          .bind(inv.id),
      ]);
    }
  }

  // Create session
  const sessionId = crypto.randomUUID();
  await c.env.DB
    .prepare(
      `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))`
    )
    .bind(sessionId, user.id)
    .run();

  // Sign tokens
  const accessToken = await signAccessToken(
    { sub: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url, jti: crypto.randomUUID() },
    c.env.JWT_SECRET
  );
  const refreshToken = await signRefreshToken(
    { sub: user.id, sid: sessionId },
    c.env.JWT_SECRET
  );

  // Set cookies
  setCookie(c, '__access', accessToken, { path: '/', maxAge: 1800 });
  setCookie(c, '__refresh', refreshToken, { path: '/api/auth/refresh', maxAge: 604800 });

  return c.redirect(`https://console.${c.env.APP_DOMAIN}/`);
});

// POST /refresh
authRoutes.post('/refresh', async (c) => {
  const cookieHeader = c.req.header('Cookie') ?? '';
  const refreshCookie = parseCookie(cookieHeader, '__refresh');
  if (!refreshCookie) return c.json({ error: 'Unauthorized' }, 401);

  const payload = await verifyJWT(refreshCookie, c.env.JWT_SECRET);
  if (!payload || !payload.sub || !payload.sid) return c.json({ error: 'Unauthorized' }, 401);

  const userId = payload.sub as string;
  const sessionId = payload.sid as string;

  // Rate limit per user
  const allowed = await rateLimit(c.env.CACHE, `rl:refresh:${userId}`, 30, 60);
  if (!allowed) return c.json({ error: 'Too many requests' }, 429);

  // Check session exists
  const session = await c.env.DB
    .prepare(`SELECT id FROM sessions WHERE id = ? AND user_id = ? AND expires_at > datetime('now')`)
    .bind(sessionId, userId)
    .first();
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  // Get user info for new access token
  const user = await c.env.DB
    .prepare(`SELECT id, email, name, avatar_url FROM users WHERE id = ?`)
    .bind(userId)
    .first<{ id: string; email: string; name: string; avatar_url: string | null }>();
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  // Rotate session: delete old, create new
  const newSessionId = crypto.randomUUID();
  await c.env.DB.batch([
    c.env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(sessionId),
    c.env.DB
      .prepare(`INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))`)
      .bind(newSessionId, userId),
  ]);

  // Issue new tokens
  const accessToken = await signAccessToken(
    { sub: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url, jti: crypto.randomUUID() },
    c.env.JWT_SECRET
  );
  const refreshToken = await signRefreshToken(
    { sub: userId, sid: newSessionId },
    c.env.JWT_SECRET
  );

  setCookie(c, '__access', accessToken, { path: '/', maxAge: 1800 });
  setCookie(c, '__refresh', refreshToken, { path: '/api/auth/refresh', maxAge: 604800 });

  return c.json({ ok: true });
});

// POST /logout
authRoutes.post('/logout', async (c) => {
  const cookieHeader = c.req.header('Cookie') ?? '';

  // Block access token
  const accessCookie = parseCookie(cookieHeader, '__access');
  if (accessCookie) {
    const payload = await verifyJWT(accessCookie, c.env.JWT_SECRET);
    if (payload?.jti) {
      await c.env.CACHE.put(`blocked:${payload.jti}`, '1', { expirationTtl: 1800 });
    }
  }

  // Delete session
  const refreshCookie = parseCookie(cookieHeader, '__refresh');
  if (refreshCookie) {
    const payload = await verifyJWT(refreshCookie, c.env.JWT_SECRET);
    if (payload?.sid) {
      await c.env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(payload.sid).run();
    }
  }

  // Clear cookies
  setCookie(c, '__access', '', { path: '/', maxAge: 0 });
  setCookie(c, '__refresh', '', { path: '/api/auth/refresh', maxAge: 0 });

  return c.json({ ok: true });
});

// GET /me (auth required)
authRoutes.get('/me', authMiddleware, async (c) => {
  const { id: userId } = c.get('user');

  const user = await c.env.DB
    .prepare(`SELECT * FROM users WHERE id = ?`)
    .bind(userId)
    .first();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const teams = await c.env.DB
    .prepare(
      `SELECT t.id, t.slug, t.name, tm.role
       FROM team_members tm
       JOIN teams t ON t.id = tm.team_id
       WHERE tm.user_id = ? AND t.deleted_at IS NULL`
    )
    .bind(userId)
    .all();

  return c.json({ user, teams: teams.results });
});

// DELETE /account (auth required)
authRoutes.delete('/account', authMiddleware, async (c) => {
  const { id: userId } = c.get('user');

  // Check if user is last owner of any team
  const ownedTeams = await c.env.DB
    .prepare(
      `SELECT tm.team_id FROM team_members tm
       WHERE tm.user_id = ? AND tm.role = 'owner'`
    )
    .bind(userId)
    .all<{ team_id: string }>();

  for (const { team_id } of ownedTeams.results) {
    const otherOwners = await c.env.DB
      .prepare(
        `SELECT COUNT(*) as count FROM team_members
         WHERE team_id = ? AND role = 'owner' AND user_id != ?`
      )
      .bind(team_id, userId)
      .first<{ count: number }>();

    if (!otherOwners || otherOwners.count === 0) {
      return c.json({ error: 'Transfer ownership before deleting account' }, 409);
    }
  }

  // Delete user data
  await c.env.DB.batch([
    c.env.DB.prepare(`DELETE FROM team_members WHERE user_id = ?`).bind(userId),
    c.env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(userId),
    c.env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(userId),
  ]);

  // Audit log
  await audit(c.env.DB, {
    userId,
    action: 'account.deleted',
    targetType: 'user',
    targetId: userId,
  });

  // Clear cookies
  setCookie(c, '__access', '', { path: '/', maxAge: 0 });
  setCookie(c, '__refresh', '', { path: '/api/auth/refresh', maxAge: 0 });

  return c.json({ ok: true });
});

// GET /dev-init — apply schema for Vite's ephemeral D1 (dev only)
authRoutes.get('/dev-init', async (c) => {
  const domain = c.env.APP_DOMAIN;
  const host = c.req.header('host') || '';
  const isDev = domain === 'lvh.me' || domain === 'localhost' || host.match(/^(localhost|10\.|192\.168\.|127\.)/);
  if (!isDev) return c.json({ error: 'Not available' }, 404);

  try {
    const stmts = [
      `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, google_id TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, avatar_url TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, deleted_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS team_members (team_id TEXT NOT NULL REFERENCES teams(id), user_id TEXT NOT NULL REFERENCES users(id), role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner','admin','member')), joined_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (team_id, user_id))`,
      `CREATE TABLE IF NOT EXISTS invitations (id TEXT PRIMARY KEY, team_id TEXT NOT NULL REFERENCES teams(id), email TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin','member')), invited_by TEXT NOT NULL REFERENCES users(id), expires_at TEXT NOT NULL, accepted_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(team_id, email))`,
      `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, team_id TEXT, user_id TEXT, action TEXT NOT NULL, target_type TEXT, target_id TEXT, metadata TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS credentials (team_id TEXT NOT NULL, platform TEXT NOT NULL, encrypted_data TEXT NOT NULL, iv TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (team_id, platform))`,
      `CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, agent_slug TEXT NOT NULL, title TEXT NOT NULL DEFAULT 'New Chat', team_id TEXT, created_by TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), shared_at TEXT)`,
    ];
    await c.env.DB.batch(stmts.map(s => c.env.DB.prepare(s)));
    return c.json({ ok: true, message: 'Schema initialized' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 500);
  }
});

// GET /dev-login — dev-only bypass (creates fake user + team, sets real cookies)
authRoutes.get('/dev-login', async (c) => {
  const domain = c.env.APP_DOMAIN;
  const host = c.req.header('host') || '';
  const isDev = domain === 'lvh.me' || domain === 'localhost' || host.match(/^(localhost|10\.|192\.168\.|127\.)/);
  if (!isDev) {
    return c.json({ error: 'Not available' }, 404);
  }

  try {
    // Auto-init schema (Vite's D1 is ephemeral)
    const stmts = [
      `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, google_id TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, avatar_url TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, deleted_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS team_members (team_id TEXT NOT NULL REFERENCES teams(id), user_id TEXT NOT NULL REFERENCES users(id), role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner','admin','member')), joined_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (team_id, user_id))`,
      `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, team_id TEXT, user_id TEXT, action TEXT NOT NULL, target_type TEXT, target_id TEXT, metadata TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
      `CREATE TABLE IF NOT EXISTS credentials (team_id TEXT NOT NULL, platform TEXT NOT NULL, encrypted_data TEXT NOT NULL, iv TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (team_id, platform))`,
      `CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, agent_slug TEXT NOT NULL, title TEXT NOT NULL DEFAULT 'New Chat', team_id TEXT, created_by TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), shared_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS invitations (id TEXT PRIMARY KEY, team_id TEXT NOT NULL REFERENCES teams(id), email TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin','member')), invited_by TEXT NOT NULL REFERENCES users(id), expires_at TEXT NOT NULL, accepted_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(team_id, email))`,
    ];
    await c.env.DB.batch(stmts.map(s => c.env.DB.prepare(s)));

    const devUserId = 'dev-user-00000000';
    const devTeamId = 'dev-team-00000000';

    // Upsert dev user
    await c.env.DB
      .prepare(
        `INSERT INTO users (id, google_id, email, name, avatar_url, created_at, updated_at)
         VALUES (?, 'dev-google-id', 'dev@localhost', 'Dev User', NULL, datetime('now'), datetime('now'))
         ON CONFLICT(google_id) DO UPDATE SET updated_at = datetime('now')`
      )
      .bind(devUserId)
      .run();

    // Upsert dev team
    await c.env.DB
      .prepare(
        `INSERT INTO teams (id, name, slug, created_at, updated_at)
         VALUES (?, 'Dev Team', 'dev-team', datetime('now'), datetime('now'))
         ON CONFLICT(slug) DO UPDATE SET updated_at = datetime('now')`
      )
      .bind(devTeamId)
      .run();

    // Ensure membership exists
    await c.env.DB
      .prepare(
        `INSERT INTO team_members (team_id, user_id, role, joined_at)
         VALUES (?, ?, 'owner', datetime('now'))
         ON CONFLICT(team_id, user_id) DO NOTHING`
      )
      .bind(devTeamId, devUserId)
      .run();

    // Create session
    const sessionId = crypto.randomUUID();
    await c.env.DB
      .prepare(`INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))`)
      .bind(sessionId, devUserId)
      .run();

    // Sign tokens
    const accessToken = await signAccessToken(
      { sub: devUserId, email: 'dev@localhost', name: 'Dev User', avatar_url: null, jti: crypto.randomUUID() },
      c.env.JWT_SECRET
    );
    const refreshToken = await signRefreshToken(
      { sub: devUserId, sid: sessionId },
      c.env.JWT_SECRET
    );

    // Set cookies without Domain restriction for dev (works on any host/IP)
    c.header('Set-Cookie', `__access=${accessToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800`, { append: true });
    c.header('Set-Cookie', `__refresh=${refreshToken}; HttpOnly; SameSite=Lax; Path=/api/auth/refresh; Max-Age=604800`, { append: true });

    return c.redirect('/');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg }, 500);
  }
});

export { authRoutes };

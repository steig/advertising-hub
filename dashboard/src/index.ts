import { Hono } from 'hono';
import type { Env, Variables } from './types/bindings';
import { api } from './api';
import { landingHTML } from './api/landing';
import { getScheduledReports } from './services/d1-reports';
import { shouldRunInWindow } from './services/cron-matcher';
import { executeReport } from './services/report-executor';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({ error: err.message, stack: err.stack }, 500);
});


// Hostname routing: root domain → landing page
app.use('*', async (c, next) => {
  const host = c.req.header('host') || '';
  const url = new URL(c.req.url);

  // API routes work on all subdomains
  if (url.pathname.startsWith('/api/')) return next();

  // In dev, skip landing page for bare IP/localhost access
  const isDev = c.env.APP_DOMAIN === 'lvh.me' || c.env.APP_DOMAIN === 'localhost';
  const isLocalHost = host.match(/^(localhost|127\.|10\.|192\.168\.)/);

  // Root domain → landing page (static HTML)
  if (!host.startsWith('console.') && !host.startsWith('chat.') && !(isDev && isLocalHost)) {
    return landingHTML(c.env.APP_DOMAIN);
  }

  // console.* and chat.* → serve SPA assets
  return next();
});

app.route('/api', api);

export { ChatSessionDO } from './services/chat-session';

export default {
  fetch: app.fetch.bind(app),
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const now = new Date(event.scheduledTime);
    const reports = await getScheduledReports(env.DB);

    for (const report of reports) {
      if (!report.schedule || !shouldRunInWindow(report.schedule, now)) continue;

      ctx.waitUntil(
        executeReport({
          env,
          report,
          teamId: report.team_id,
          triggerType: 'scheduled',
        }).catch((err) => {
          console.error(`Scheduled report ${report.id} failed:`, err);
        })
      );
    }
  },
};

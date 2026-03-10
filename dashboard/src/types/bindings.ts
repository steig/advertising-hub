export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  CHAT_SESSION: DurableObjectNamespace;
  REPORTS_BUCKET: R2Bucket;
  ENCRYPTION_KEY: string;
  ANTHROPIC_API_KEY?: string;
  RESEND_API_KEY?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  APP_DOMAIN: string;
}

export interface Variables {
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
  };
  team: {
    id: string;
    name: string;
    slug: string;
    role: 'owner' | 'admin' | 'member';
  };
}

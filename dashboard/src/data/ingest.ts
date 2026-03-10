import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import matter from 'gray-matter';

const ROOT = path.resolve(import.meta.dirname, '..', '..', '..');
const OUT = path.resolve(import.meta.dirname);

console.log('📦 Ingesting advertising hub data...');

// 1. Parse platforms
const platformsDir = path.join(ROOT, 'platforms');
const platformSlugs = fs.readdirSync(platformsDir).filter(d =>
  fs.statSync(path.join(platformsDir, d)).isDirectory()
);

const platforms = platformSlugs.map(slug => {
  const yamlPath = path.join(platformsDir, slug, 'PLATFORM.yaml');
  if (!fs.existsSync(yamlPath)) return null;
  const raw = yaml.load(fs.readFileSync(yamlPath, 'utf-8')) as Record<string, any>;
  return {
    name: raw.name,
    slug: raw.slug || slug,
    category: raw.category || 'other',
    status: raw.status || 'active',
    api: raw.api ? {
      baseUrl: raw.api.base_url,
      currentVersion: raw.api.current_version,
      authType: raw.api.auth_type,
      authUrl: raw.api.auth_url,
      tokenUrl: raw.api.token_url,
      scopes: raw.api.scopes,
      documentation: raw.api.documentation,
      rateLimits: raw.api.rate_limits ? {
        requestsPerDay: raw.api.rate_limits.requests_per_day,
        requestsPerSecond: raw.api.rate_limits.requests_per_second,
        notes: raw.api.rate_limits.notes,
      } : undefined,
    } : undefined,
    login: raw.login ? {
      url: raw.login.url,
      apiConsole: raw.login.api_console,
      developerPortal: raw.login.developer_portal,
    } : undefined,
    upstreamRepos: (raw.upstream_repos || []).map((r: any) => ({
      repo: r.repo,
      description: r.description,
      language: r.language,
      advertisingRelevant: r.advertising_relevant,
    })),
    ourTools: (raw.our_tools || []).map((t: any) => ({
      name: t.name,
      repo: t.repo,
      type: t.type,
      status: t.status,
    })),
    agents: raw.agents || [],
    capabilities: Object.fromEntries(
      Object.entries(raw.capabilities || {}).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), // snake_case to camelCase
        v,
      ])
    ),
  };
}).filter(Boolean);

fs.writeFileSync(path.join(OUT, 'platforms.json'), JSON.stringify(platforms, null, 2));
console.log(`  ✅ ${platforms.length} platforms`);

// 2. Parse agents
const agentsDir = path.join(ROOT, 'agents');
const AGENT_CATEGORIES = ['paid-media', 'platform-specific', 'cross-platform', 'orchestrator'] as const;

const agents: any[] = [];
for (const category of AGENT_CATEGORIES) {
  const catDir = path.join(agentsDir, category);
  if (!fs.existsSync(catDir)) continue;
  const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const filePath = path.join(catDir, file);
    const { data: frontmatter, content } = matter(fs.readFileSync(filePath, 'utf-8'));
    const slug = file.replace(/\.md$/, '');
    agents.push({
      name: frontmatter.name || slug,
      slug,
      description: frontmatter.description || '',
      tools: typeof frontmatter.tools === 'string'
        ? frontmatter.tools.split(',').map((t: string) => t.trim())
        : (frontmatter.tools || []),
      author: frontmatter.author || '',
      category,
      body: content.trim(),
    });
  }
}

fs.writeFileSync(path.join(OUT, 'agents.json'), JSON.stringify(agents, null, 2));
console.log(`  ✅ ${agents.length} agents`);

// 3. Parse MCP registry
const registryPath = path.join(ROOT, 'mcp-servers', 'registry.yaml');
const registryRaw = yaml.load(fs.readFileSync(registryPath, 'utf-8')) as { servers: any[] };
const registry = {
  servers: registryRaw.servers.map(s => ({
    platform: s.platform,
    name: s.name,
    repo: s.repo,
    pypi: s.pypi,
    status: s.status,
    tools: s.tools,
    spec: s.spec,
  })),
};

fs.writeFileSync(path.join(OUT, 'mcp-registry.json'), JSON.stringify(registry, null, 2));
console.log(`  ✅ ${registry.servers.length} MCP servers`);

// 4. Parse scripts
const scriptsDir = path.join(ROOT, 'scripts');
const scriptFiles = fs.readdirSync(scriptsDir).filter(f =>
  fs.statSync(path.join(scriptsDir, f)).isFile()
);

const scripts = scriptFiles.map(file => {
  const filePath = path.join(scriptsDir, file);
  const source = fs.readFileSync(filePath, 'utf-8');
  const lines = source.split('\n');
  // Second line is typically the description comment
  const descLine = lines.find((l, i) => i > 0 && l.startsWith('#') && !l.startsWith('#!'));
  const description = descLine ? descLine.replace(/^#\s*/, '') : file;
  return {
    id: file.replace(/\.[^.]+$/, ''),
    filename: file,
    description,
    source,
  };
});

fs.writeFileSync(path.join(OUT, 'scripts-index.json'), JSON.stringify(scripts, null, 2));
console.log(`  ✅ ${scripts.length} scripts`);

console.log('📦 Done!');

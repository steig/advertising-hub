import { Link } from 'react-router';
import { Globe, Bot, Terminal, Activity, Settings, Server, ArrowRight } from 'lucide-react';
import { usePlatforms } from '../hooks/usePlatforms';
import { useAgents } from '../hooks/useAgents';
import { useScripts } from '../hooks/useScripts';
import { useHealth } from '../hooks/useHealth';
import { useEnabledPlatforms } from '../hooks/useEnabledPlatforms';

export function DashboardPage() {
  const { platforms, loading: pLoading, error: pError } = usePlatforms();
  const { agents, loading: aLoading, error: aError } = useAgents();
  const { scripts, loading: sLoading } = useScripts();
  const { health, loading: hLoading } = useHealth();
  const { enabledSlugs, loading: epLoading } = useEnabledPlatforms();

  const loading = pLoading || aLoading || sLoading || hLoading || epLoading;
  const hasError = pError || aError;

  const activePlatforms = platforms.filter(p => p.status === 'active').length;
  const mcpTools = platforms.reduce((n, p) => n + p.ourTools.filter(t => t.type === 'mcp-server').length, 0);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Advertising Hub</h2>
        <p className="text-sm text-slate-400 mt-1">Unified dashboard for ad platform management</p>
      </div>

      {hasError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">Some data failed to load. Try refreshing.</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryLink
          to="/platforms"
          icon={Globe}
          label="Platforms"
          value={loading ? '—' : platforms.length}
          subtext={loading ? undefined : `${activePlatforms} active`}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <SummaryLink
          to="/agents"
          icon={Bot}
          label="Agents"
          value={loading ? '—' : agents.length}
          subtext={loading ? undefined : `${new Set(agents.map(a => a.category)).size} categories`}
          color="text-purple-400"
          bg="bg-purple-500/10"
        />
        <SummaryLink
          to="/scripts"
          icon={Terminal}
          label="Scripts"
          value={loading ? '—' : scripts.length}
          subtext="CLI tools"
          color="text-amber-400"
          bg="bg-amber-500/10"
        />
        <SummaryLink
          to="/health"
          icon={Activity}
          label="Health"
          value={health ? 'OK' : loading ? '—' : '?'}
          subtext={health ? `v${health.timestamp?.slice(0, 10) || 'latest'}` : undefined}
          color="text-green-400"
          bg="bg-green-500/10"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <QuickSection title="Recent Platforms" icon={Globe}>
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : (() => {
            const filteredPlatforms = platforms.filter(p => enabledSlugs.includes(p.slug));
            return filteredPlatforms.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-400 mb-2">No platforms enabled yet</p>
                <Link to="/settings" className="text-sm text-blue-400 hover:text-blue-300">
                  Enable platforms in Settings to get started
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPlatforms.map(p => (
                  <Link
                    key={p.slug}
                    to={`/platforms/${p.slug}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-green-400' : 'bg-slate-500'}`} />
                      <span className="text-sm text-slate-200">{p.name}</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </Link>
                ))}
              </div>
            );
          })()}
          <Link to="/platforms" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3">
            View all platforms <ArrowRight size={12} />
          </Link>
        </QuickSection>

        <QuickSection title="Agent Categories" icon={Bot}>
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(
                agents.reduce((acc, a) => {
                  acc[a.category] = (acc[a.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([cat, count]) => (
                <div key={cat} className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-white">{count}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{cat}</p>
                </div>
              ))}
            </div>
          )}
          <Link to="/agents" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3">
            View all agents <ArrowRight size={12} />
          </Link>
        </QuickSection>
      </div>

      {/* MCP + Credentials row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickSection title="MCP Servers" icon={Server}>
          <div className="flex gap-4 mb-2">
            <div className="bg-green-500/10 rounded-lg px-4 py-2 text-center">
              <span className="text-lg font-bold text-green-400">{mcpTools}</span>
              <p className="text-xs text-slate-400">with MCP</p>
            </div>
            <div className="bg-slate-600/20 rounded-lg px-4 py-2 text-center flex-1">
              <p className="text-sm text-slate-300 py-1">MCP server registry tracks live and planned integrations</p>
            </div>
          </div>
        </QuickSection>

        <QuickSection title="Credentials" icon={Settings}>
          <p className="text-sm text-slate-400 mb-3">
            Manage API keys and OAuth tokens for connected platforms.
            Stored with AES-GCM encryption in Cloudflare D1.
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 rounded-lg transition-colors"
          >
            <Settings size={14} /> Manage Credentials
          </Link>
        </QuickSection>
      </div>
    </div>
  );
}

function SummaryLink({ to, icon: Icon, label, value, subtext, color, bg }: {
  to: string;
  icon: typeof Globe;
  label: string;
  value: number | string;
  subtext?: string;
  color: string;
  bg: string;
}) {
  return (
    <Link
      to={to}
      className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:bg-slate-700/50 transition-colors group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon size={18} className={color} />
        </div>
        <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm text-slate-400">{label}</span>
        {subtext && <span className="text-xs text-slate-500">{subtext}</span>}
      </div>
    </Link>
  );
}

function QuickSection({ title, icon: Icon, children }: {
  title: string;
  icon: typeof Globe;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-slate-400" />
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function LoadingSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 bg-slate-700 rounded animate-pulse" />
      ))}
    </div>
  );
}

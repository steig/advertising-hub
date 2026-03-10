import { useState, useEffect } from 'react';
import { Globe, Bot, Terminal, Activity, Check, X } from 'lucide-react';
import { usePlatforms } from '../hooks/usePlatforms';
import { useAgents } from '../hooks/useAgents';
import { useScripts } from '../hooks/useScripts';
import { getMcpRegistry } from '../lib/api';
import type { MCPRegistry } from '../../types/mcp-registry';

export function HealthPage() {
  const { platforms, loading: pLoading } = usePlatforms();
  const { agents, loading: aLoading } = useAgents();
  const { scripts, loading: sLoading } = useScripts();
  const [mcp, setMcp] = useState<MCPRegistry | null>(null);
  const [mcpLoading, setMcpLoading] = useState(true);

  useEffect(() => {
    getMcpRegistry()
      .then(setMcp)
      .catch(() => setMcp(null))
      .finally(() => setMcpLoading(false));
  }, []);

  const loading = pLoading || aLoading || sLoading || mcpLoading;

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-slate-700 rounded w-32 mb-3" />
              <div className="h-8 bg-slate-700 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Compute stats
  const agentsByCategory = agents.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const liveServers = mcp?.servers.filter(s => s.status === 'live').length ?? 0;
  const plannedServers = mcp?.servers.filter(s => s.status === 'planned').length ?? 0;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Health</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard icon={Globe} label="Platforms" value={platforms.length} color="text-blue-400" />
        <SummaryCard icon={Bot} label="Agents" value={agents.length} color="text-purple-400" />
        <SummaryCard icon={Activity} label="MCP Servers" value={(mcp?.servers.length ?? 0)} subtext={`${liveServers} live, ${plannedServers} planned`} color="text-green-400" />
        <SummaryCard icon={Terminal} label="Scripts" value={scripts.length} color="text-amber-400" />
      </div>

      {/* Platforms detail */}
      <Section title="Platforms" icon={Globe}>
        <div className="space-y-2">
          {platforms.map(p => {
            const hasCaps = Object.values(p.capabilities).some(Boolean);
            const hasAgents = p.agents.length > 0;
            return (
              <div key={p.slug} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-700/30">
                <span className="text-sm text-slate-200">{p.name}</span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    {hasCaps ? <Check size={14} className="text-green-400" /> : <X size={14} className="text-slate-600" />}
                    <span className="text-slate-400">Capabilities</span>
                  </span>
                  <span className="flex items-center gap-1">
                    {hasAgents ? <Check size={14} className="text-green-400" /> : <X size={14} className="text-slate-600" />}
                    <span className="text-slate-400">Agents</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Agents by category */}
      <Section title="Agents by Category" icon={Bot}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(agentsByCategory).map(([cat, count]) => (
            <div key={cat} className="bg-slate-700/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-slate-400 mt-1">{cat}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* MCP section */}
      <Section title="MCP Servers" icon={Activity}>
        <div className="flex gap-6 mb-4">
          <div className="bg-green-500/10 rounded-lg px-4 py-2">
            <span className="text-lg font-bold text-green-400">{liveServers}</span>
            <span className="text-xs text-slate-400 ml-2">Live</span>
          </div>
          <div className="bg-slate-600/20 rounded-lg px-4 py-2">
            <span className="text-lg font-bold text-slate-300">{plannedServers}</span>
            <span className="text-xs text-slate-400 ml-2">Planned</span>
          </div>
        </div>
      </Section>

      {/* Scripts */}
      <Section title="Scripts" icon={Terminal}>
        <div className="space-y-1">
          {scripts.map(s => (
            <div key={s.id} className="flex items-center gap-3 py-1.5 px-3 text-sm">
              <Terminal size={14} className="text-slate-500" />
              <span className="text-slate-300">{s.filename}</span>
              <span className="text-slate-500 text-xs">{s.description}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, subtext, color }: {
  icon: typeof Globe;
  label: string;
  value: number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} className={color} />
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
}

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: typeof Globe;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-slate-400" />
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

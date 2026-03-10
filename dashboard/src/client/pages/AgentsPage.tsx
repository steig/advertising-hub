import { useState } from 'react';
import { Search } from 'lucide-react';
import { useAgents } from '../hooks/useAgents';
import { AgentCard } from '../components/agents/AgentCard';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'paid-media', label: 'Paid Media' },
  { key: 'platform-specific', label: 'Platform Specific' },
  { key: 'cross-platform', label: 'Cross-Platform' },
  { key: 'orchestrator', label: 'Orchestrator' },
] as const;

export function AgentsPage() {
  const { agents, loading, error } = useAgents();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<string>('all');

  const filtered = agents.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === 'all' || a.category === tab;
    return matchesSearch && matchesTab;
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Agents</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search agents..."
            aria-label="Search agents"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-700 mb-6" role="tablist" aria-label="Agent categories">
        {tabs.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">Failed to load agents. Please try refreshing.</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-slate-700 rounded w-1/2 mb-3" />
              <div className="h-4 bg-slate-700 rounded w-full mb-2" />
              <div className="h-3 bg-slate-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <AgentCard key={a.slug} agent={a} />
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-500 col-span-full text-center py-8">No agents found</p>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ChevronDown, Bot } from 'lucide-react';
import { getAgents } from '../../lib/api';
import type { AgentDefinition } from '../../../types/agent';
import { AGENT_CATEGORY_COLORS } from '../../lib/constants';
import { useEnabledPlatforms } from '../../hooks/useEnabledPlatforms';

interface AgentPickerProps {
  onSelect: (slug: string) => void;
}

export function AgentPicker({ onSelect }: AgentPickerProps) {
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [open, setOpen] = useState(false);
  const { enabledSlugs } = useEnabledPlatforms();

  useEffect(() => {
    getAgents().then(setAgents).catch(() => {});
  }, []);

  const isAgentAvailable = (agent: AgentDefinition) => {
    if (agent.category !== 'platform-specific') return true;
    return enabledSlugs.some(slug => agent.slug.includes(slug.replace('-ads', '')));
  };
  const filteredAgents = agents.filter(isAgentAvailable);

  const grouped = filteredAgents.reduce<Record<string, AgentDefinition[]>>((acc, agent) => {
    (acc[agent.category] ??= []).push(agent);
    return acc;
  }, {});

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm text-white transition-colors"
      >
        <Bot size={18} />
        Select an agent
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-800">
                  {category}
                </div>
                {items.map((agent) => (
                  <button
                    key={agent.slug}
                    onClick={() => { onSelect(agent.slug); setOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${AGENT_CATEGORY_COLORS[agent.category]?.split(' ')[0] || 'bg-slate-500'}`} />
                      <span className="text-sm text-white truncate">{agent.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 ml-4 truncate">{agent.description}</p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

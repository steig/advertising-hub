import { Link } from 'react-router';
import { Bot } from 'lucide-react';
import type { AgentDefinition } from '../../../types/agent';
import { AGENT_CATEGORY_COLORS } from '../../lib/constants';

export function AgentCard({ agent }: { agent: AgentDefinition }) {
  const desc = agent.description.length > 120
    ? agent.description.slice(0, 120) + '...'
    : agent.description;

  return (
    <Link
      to={`/agents/${agent.slug}`}
      className="block bg-slate-800 border border-slate-700 rounded-xl p-5 hover:bg-slate-700/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Bot size={20} className="text-slate-400" />
          <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${AGENT_CATEGORY_COLORS[agent.category] || 'bg-slate-600 text-slate-300'}`}>
          {agent.category}
        </span>
      </div>

      <p className="text-sm text-slate-400 mb-3">{desc}</p>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {agent.tools.slice(0, 5).map(tool => (
          <span key={tool} className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
            {tool}
          </span>
        ))}
        {agent.tools.length > 5 && (
          <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
            +{agent.tools.length - 5}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500">by {agent.author}</p>
    </Link>
  );
}

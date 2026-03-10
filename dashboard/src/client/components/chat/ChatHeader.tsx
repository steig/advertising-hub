import { Bot, Share2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAgents } from '../../lib/api';
import type { AgentDefinition } from '../../../types/agent';

interface ChatHeaderProps {
  agentSlug: string;
  shared: boolean;
  onToggleShare: () => void;
}

export function ChatHeader({ agentSlug, shared, onToggleShare }: ChatHeaderProps) {
  const [agent, setAgent] = useState<AgentDefinition | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAgents().then((agents) => {
      setAgent(agents.find((a) => a.slug === agentSlug) ?? null);
    });
  }, [agentSlug]);

  const handleShare = () => {
    onToggleShare();
    if (!shared) {
      navigator.clipboard.writeText(`${window.location.origin}/shared/${window.location.pathname.split('/').pop()}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/80 shrink-0">
      <div className="flex items-center gap-3">
        <Bot size={20} className="text-slate-400" />
        <div>
          <h2 className="text-sm font-medium text-white">{agent?.name ?? agentSlug}</h2>
          {agent && <p className="text-xs text-slate-500">{agent.category}</p>}
        </div>
      </div>
      <button
        onClick={handleShare}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          shared
            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        {copied ? <Check size={14} /> : <Share2 size={14} />}
        {copied ? 'Copied!' : shared ? 'Shared' : 'Share'}
      </button>
    </div>
  );
}

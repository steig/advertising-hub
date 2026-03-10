import { MessageSquare } from 'lucide-react';
import { AgentPicker } from './AgentPicker';

interface EmptyStateProps {
  onSelectAgent: (slug: string) => void;
}

export function EmptyState({ onSelectAgent }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
        <MessageSquare size={32} className="text-slate-500" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Start a conversation</h2>
      <p className="text-sm text-slate-400 mb-6 max-w-sm">
        Pick an advertising agent to start chatting. Each agent specializes in different platforms and strategies.
      </p>
      <AgentPicker onSelect={onSelectAgent} />
    </div>
  );
}

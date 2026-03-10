import { Terminal } from 'lucide-react';
import type { ScriptMeta } from '../../lib/api';

interface ScriptListProps {
  scripts: ScriptMeta[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ScriptList({ scripts, selectedId, onSelect }: ScriptListProps) {
  return (
    <div className="space-y-1">
      {scripts.map(script => (
        <button
          key={script.id}
          onClick={() => onSelect(script.id)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
            selectedId === script.id
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Terminal size={14} />
            <span className="text-sm font-medium text-slate-200">{script.filename}</span>
          </div>
          <p className="text-xs text-slate-500 pl-5">{script.description}</p>
        </button>
      ))}
    </div>
  );
}

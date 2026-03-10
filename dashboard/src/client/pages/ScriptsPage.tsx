import { useState } from 'react';
import { Terminal } from 'lucide-react';
import { useScripts, useScriptSource } from '../hooks/useScripts';
import { ScriptList } from '../components/scripts/ScriptList';
import { ScriptViewer } from '../components/scripts/ScriptViewer';

export function ScriptsPage() {
  const { scripts, loading } = useScripts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { script: selectedScript, loading: sourceLoading } = useScriptSource(selectedId);

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Scripts</h2>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Script list */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <ScriptList
                scripts={scripts}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          </div>

          {/* Source viewer */}
          <div className="flex-1 min-w-0">
            {sourceLoading ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-48 mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-3 bg-slate-700 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                  ))}
                </div>
              </div>
            ) : selectedScript ? (
              <ScriptViewer source={selectedScript.source} filename={selectedScript.filename} />
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                <Terminal size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-500 text-sm">Select a script to view its source</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

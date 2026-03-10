import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Download } from 'lucide-react';
import { getExecutionDetail, getExecutionOutput, type ReportExecution } from '../lib/api';
import { ExecutionStatusBadge } from '../components/reports/ExecutionStatusBadge';
import { ExecutionTimeline } from '../components/reports/ExecutionTimeline';
import { useToast } from '../contexts/ToastContext';

export function ExecutionDetailPage() {
  const { id: reportId, execId } = useParams<{ id: string; execId: string }>();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<ReportExecution | null>(null);
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (!execId) return;
    getExecutionDetail(execId)
      .then(setExecution)
      .catch(() => addToast('Failed to load execution', 'error'))
      .finally(() => setLoading(false));
  }, [execId]);

  async function loadOutput() {
    if (!execId) return;
    try {
      const data = await getExecutionOutput(execId);
      setOutput(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load output', 'error');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-800 rounded w-32 animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-8 bg-slate-800 rounded w-64 animate-pulse" />
          <div className="h-6 bg-slate-800 rounded w-20 animate-pulse" />
        </div>
        <div className="h-24 bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-40 bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!execution) {
    return <p className="text-slate-400">Execution not found</p>;
  }

  return (
    <div>
      <button
        onClick={() => navigate(`/reports/${reportId}`)}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-4"
      >
        <ArrowLeft size={16} /> Back to Report
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            Execution
            <ExecutionStatusBadge status={execution.status} />
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Triggered {execution.trigger_type} &middot; v{execution.prompt_version || '?'}
            {execution.started_at && ` &middot; Started ${new Date(execution.started_at + 'Z').toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
        <ExecutionTimeline status={execution.status} />
        <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-slate-400">
          <div>Started: {execution.started_at ? new Date(execution.started_at + 'Z').toLocaleString() : '-'}</div>
          <div>Completed: {execution.completed_at ? new Date(execution.completed_at + 'Z').toLocaleString() : '-'}</div>
        </div>
      </div>

      {/* Error */}
      {execution.error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-red-400 mb-2">Error</h3>
          <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">{execution.error}</pre>
        </div>
      )}

      {/* Summary */}
      {execution.summary_text && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Summary</h3>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{execution.summary_text}</p>
        </div>
      )}

      {/* Delivery Status */}
      {execution.delivery_status && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Delivery</h3>
          <div className="flex gap-4 text-xs">
            {Object.entries(JSON.parse(execution.delivery_status) as Record<string, string>).map(([channel, status]) => (
              <span key={channel} className={`px-2 py-1 rounded ${status === 'sent' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {channel}: {status}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Full Output */}
      {execution.output_key && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300">Full Output</h3>
            <button
              onClick={loadOutput}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
            >
              <Download size={12} />
              {output ? 'Reload' : 'Load Output'}
            </button>
          </div>
          {output && (
            <pre className="text-xs text-slate-300 bg-slate-900 rounded-lg p-4 overflow-auto max-h-96 font-mono">
              {JSON.stringify(output, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

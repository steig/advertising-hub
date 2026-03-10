import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Play, Settings, Trash2 } from 'lucide-react';
import {
  getReport, getPromptVersions, getReportExecutions, runReport,
  createPromptVersion, deleteReport as deleteReportApi,
  type Report, type PromptVersion, type ReportExecution,
} from '../lib/api';
import { ExecutionStatusBadge } from '../components/reports/ExecutionStatusBadge';
import { PromptEditor } from '../components/reports/PromptEditor';
import { useTeam } from '../contexts/TeamContext';
import { useToast } from '../contexts/ToastContext';

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { team } = useTeam();
  const { addToast } = useToast();
  const isAdmin = team?.role === 'owner' || team?.role === 'admin';

  const [report, setReport] = useState<Report | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [execPage, setExecPage] = useState(1);
  const [execPages, setExecPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    Promise.all([
      getReport(id),
      getPromptVersions(id),
      getReportExecutions(id, execPage),
    ]).then(([r, v, e]) => {
      setReport(r);
      setVersions(v);
      setExecutions(e.items);
      setExecPages(e.pages);
    }).catch((err) => { console.error(err); addToast('Failed to load report', 'error'); }).finally(() => setLoading(false));
  }, [id, execPage]);

  useEffect(() => { load(); }, [load]);

  async function handleRun() {
    if (!id) return;
    setRunning(true);
    try {
      await runReport(id);
      addToast('Report triggered successfully', 'success');
      load();
    } catch (err) {
      console.error(err);
      addToast('Failed to run report', 'error');
    } finally {
      setRunning(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Delete this report and all its executions?')) return;
    try {
      await deleteReportApi(id);
      addToast('Report deleted', 'success');
      navigate('/reports');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete report', 'error');
    }
  }

  async function handleSavePrompt(text: string) {
    if (!id) return;
    try {
      await createPromptVersion(id, text);
      addToast('Prompt saved', 'success');
      load();
    } catch (err) {
      console.error(err);
      addToast('Failed to save prompt', 'error');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-64 animate-pulse" />
        <div className="h-4 bg-slate-800 rounded w-48 animate-pulse" />
        <div className="h-40 bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-32 bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!report) {
    return <p className="text-slate-400">Report not found</p>;
  }

  return (
    <div>
      <button onClick={() => navigate('/reports')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-4">
        <ArrowLeft size={16} /> Reports
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">{report.name}</h2>
          <p className="text-sm text-slate-400 mt-1">
            {report.platform} &middot; {report.schedule || 'Manual'} &middot; Created by {report.creator_name || 'Unknown'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Play size={14} />
              {running ? 'Running...' : 'Run Now'}
            </button>
            <Link
              to={`/reports/${id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
            >
              <Settings size={14} />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Prompt */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
        <PromptEditor
          currentPrompt={report.latest_prompt || ''}
          currentVersion={report.latest_version}
          onSave={handleSavePrompt}
          readOnly={!isAdmin}
        />
      </div>

      {/* Version history */}
      {versions.length > 1 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Prompt Versions</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-xs text-slate-400 py-1 border-b border-slate-700 last:border-0">
                <span>v{v.version} &middot; {v.creator_name || 'Unknown'}</span>
                <span>{new Date(v.created_at + 'Z').toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Executions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Execution History</h3>
        {executions.length === 0 ? (
          <p className="text-xs text-slate-500">No executions yet</p>
        ) : (
          <>
            <div className="space-y-2">
              {executions.map((e) => (
                <Link
                  key={e.id}
                  to={`/reports/${id}/executions/${e.id}`}
                  className="flex items-center justify-between p-3 bg-slate-900 rounded-lg hover:bg-slate-850 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ExecutionStatusBadge status={e.status} />
                    <span className="text-xs text-slate-400">
                      v{e.prompt_version || '?'} &middot; {e.trigger_type}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(e.created_at + 'Z').toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
            {execPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setExecPage((p) => Math.max(1, p - 1))}
                  disabled={execPage === 1}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs text-slate-500">Page {execPage} of {execPages}</span>
                <button
                  onClick={() => setExecPage((p) => Math.min(execPages, p + 1))}
                  disabled={execPage === execPages}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

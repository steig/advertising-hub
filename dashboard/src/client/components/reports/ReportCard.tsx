import { Link } from 'react-router';
import { Clock, Play, Globe } from 'lucide-react';
import type { Report } from '../../lib/api';
import { ExecutionStatusBadge } from './ExecutionStatusBadge';

function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr + 'Z');
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function ReportCard({ report }: { report: Report }) {
  return (
    <Link
      to={`/reports/${report.id}`}
      className="block bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{report.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Globe size={12} className="text-slate-500" />
            <span className="text-xs text-slate-400">{report.platform}</span>
          </div>
        </div>
        {!report.is_active && (
          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">Paused</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {report.schedule ? (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {report.schedule}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Play size={12} />
              Manual
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {report.last_execution_status && (
            <ExecutionStatusBadge status={report.last_execution_status} />
          )}
          <span>{formatRelative(report.last_execution_at)}</span>
        </div>
      </div>
    </Link>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FileText, Plus } from 'lucide-react';
import { getReports, type Report } from '../lib/api';
import { ReportCard } from '../components/reports/ReportCard';
import { useToast } from '../contexts/ToastContext';

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    getReports().then(setReports).catch(() => addToast('Failed to load reports', 'error')).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Reports</h2>
        <Link
          to="/reports/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Report
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <FileText size={32} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm mb-4">No reports yet</p>
          <Link
            to="/reports/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Create your first report
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}

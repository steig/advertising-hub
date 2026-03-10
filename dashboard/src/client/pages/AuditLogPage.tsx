import { useState, useEffect, useCallback } from 'react';
import { Shield, Search } from 'lucide-react';
import { Pagination } from '../components/ui/Pagination';

interface AuditEntry {
  id: number;
  user_id: string;
  user_name?: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: string | null;
  created_at: string;
}

export function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit?page=${p}&limit=50`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.items);
        setPages(data.pages);
        setPage(data.page);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  const handlePageChange = (p: number) => {
    fetchPage(p);
  };

  const filtered = filter
    ? entries.filter(
        (e) =>
          e.action.toLowerCase().includes(filter.toLowerCase()) ||
          (e.user_name || '').toLowerCase().includes(filter.toLowerCase()) ||
          (e.target_type || '').toLowerCase().includes(filter.toLowerCase())
      )
    : entries;

  function formatAction(action: string): string {
    return action.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr + 'Z').toLocaleString();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield size={24} />
          Audit Log
        </h1>
        <p className="text-slate-400 mt-1">Track team activity and changes</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by action, user, or target..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-slate-400">No audit entries found</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Target</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <span className="text-sm text-white">{formatAction(entry.action)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{entry.user_name || entry.user_id || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {entry.target_type ? `${entry.target_type}:${entry.target_id || ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{formatTime(entry.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
    </div>
  );
}

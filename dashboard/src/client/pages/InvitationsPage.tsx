import { useState, useEffect } from 'react';
import { Mail, Trash2, Clock, UserPlus, List } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'member';
  expires_at: string;
  created_at: string;
}

function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InvitationsPage() {
  const { addToast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  async function fetchInvitations() {
    try {
      const res = await fetch('/api/invitations', { credentials: 'include' });
      if (res.ok) setInvitations(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchInvitations(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to invite');
        return;
      }
      setEmail('');
      addToast('Invitation sent', 'success');
      fetchInvitations();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkInvite() {
    const emails = bulkEmails
      .split(/[,\n]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    const invalid = emails.filter((e) => !EMAIL_RE.test(e));
    if (invalid.length > 0) {
      setError(`Invalid emails: ${invalid.join(', ')}`);
      return;
    }
    if (emails.length === 0) return;

    setBulkSubmitting(true);
    setError('');
    const results = await Promise.allSettled(
      emails.map((em) =>
        fetch('/api/invitations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
          body: JSON.stringify({ email: em, role }),
        }).then((res) => { if (!res.ok) throw new Error(); })
      )
    );
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) {
      addToast(`${ok} invited, ${failed} failed`, 'error');
    } else {
      addToast(`${ok} invitation${ok !== 1 ? 's' : ''} sent`, 'success');
    }
    setBulkEmails('');
    setBulkSubmitting(false);
    fetchInvitations();
  }

  async function handleRevoke(id: string) {
    const res = await fetch(`/api/invitations/${id}`, {
      method: 'DELETE',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include',
    });
    if (res.ok) {
      addToast('Invitation revoked', 'success');
      fetchInvitations();
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Invitations</h1>
        <p className="text-slate-400 mt-1">Invite new members to your team</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserPlus size={20} />
            Invite Member
          </h2>
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <List size={14} />
            {bulkMode ? 'Single invite' : 'Bulk invite'}
          </button>
        </div>

        {bulkMode ? (
          <div className="space-y-3">
            <textarea
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder="Enter emails separated by commas or newlines..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="flex items-center gap-3">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleBulkInvite}
                disabled={bulkSubmitting || !bulkEmails.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {bulkSubmitting ? 'Inviting...' : 'Send All'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInvite}>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          </form>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Mail size={20} />
          Pending Invitations
        </h2>
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : invitations.length === 0 ? (
          <p className="text-slate-400">No pending invitations</p>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-400" />
                  <div>
                    <p className="text-white">{inv.email}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className={`px-1.5 py-0.5 rounded ${inv.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-600 text-slate-300'}`}>
                        {inv.role}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {timeUntil(inv.expires_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(inv.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Revoke invitation"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

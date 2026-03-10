import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Check, Plus } from 'lucide-react';

interface Invitation {
  id: string;
  teamName: string;
  role: string;
  expiresAt: string;
}

export function AcceptInvitationPage() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/invitations/pending', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch invitations');
        return res.json();
      })
      .then((data) => setInvitations(data.invitations ?? data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const accept = async (id: string) => {
    setAccepting(id);
    setError('');
    try {
      const res = await fetch(`/api/invitations/${id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to accept invitation');
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
      setAccepting(null);
    }
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-amber-900/50 text-amber-300 border-amber-700',
      admin: 'bg-purple-900/50 text-purple-300 border-purple-700',
      member: 'bg-slate-700 text-slate-300 border-slate-600',
    };
    return (
      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[role] ?? colors.member}`}>
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400">Loading invitations...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-2 text-2xl font-bold">Pending Invitations</h2>
      <p className="mb-6 text-slate-400">Accept an invitation to join a team.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
          <Mail className="mx-auto mb-3 h-10 w-10 text-slate-500" />
          <p className="mb-4 text-slate-400">No pending invitations</p>
          <Link
            to="/teams/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Create a Team
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-5 py-4"
            >
              <div>
                <p className="font-medium text-white">{inv.teamName}</p>
                <div className="mt-1 flex items-center gap-3">
                  {roleBadge(inv.role)}
                  <span className="text-xs text-slate-400">
                    Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => accept(inv.id)}
                disabled={accepting === inv.id}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {accepting === inv.id ? 'Accepting...' : 'Accept'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { UserMinus, Users, CheckSquare, Square } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface Member {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  isCurrentUser?: boolean;
}

const ROLES = ['owner', 'admin', 'member'] as const;

const roleBadgeClass: Record<string, string> = {
  owner: 'bg-amber-900/50 text-amber-300 border-amber-700',
  admin: 'bg-purple-900/50 text-purple-300 border-purple-700',
  member: 'bg-slate-700 text-slate-300 border-slate-600',
};

export function MembersPage() {
  const { addToast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentRole, setCurrentRole] = useState('member');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchRole, setBatchRole] = useState('admin');
  const [applyingBatch, setApplyingBatch] = useState(false);

  useEffect(() => {
    fetch('/api/members', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load members');
        return res.json();
      })
      .then((data) => {
        const list: Member[] = data.members ?? data;
        setMembers(list);
        const me = list.find((m) => m.isCurrentUser);
        if (me) setCurrentRole(me.role);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const isOwner = currentRole === 'owner';
  const isAdmin = isOwner || currentRole === 'admin';

  // Members eligible for batch: not current user, not sole owner
  const ownerCount = members.filter((m) => m.role === 'owner').length;
  const canBatchSelect = (m: Member) =>
    isOwner && !m.isCurrentUser && !(m.role === 'owner' && ownerCount <= 1);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const eligible = members.filter(canBatchSelect);
    if (selected.size === eligible.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(eligible.map((m) => m.userId)));
    }
  };

  const applyBatchRole = async () => {
    setApplyingBatch(true);
    const ids = Array.from(selected);
    const results = await Promise.allSettled(
      ids.map((userId) =>
        fetch(`/api/members/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
          body: JSON.stringify({ role: batchRole }),
        }).then((res) => { if (!res.ok) throw new Error(); })
      )
    );
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (ok > 0) {
      setMembers((prev) =>
        prev.map((m) => (selected.has(m.userId) ? { ...m, role: batchRole } : m))
      );
    }
    setSelected(new Set());
    if (failed > 0) {
      addToast(`${ok} updated to ${batchRole}, ${failed} failed`, 'error');
    } else {
      addToast(`${ok} member${ok !== 1 ? 's' : ''} updated to ${batchRole}`, 'success');
    }
    setApplyingBatch(false);
  };

  const changeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update role');
      }
      setMembers((prev) => prev.map((m) => (m.userId === userId ? { ...m, role } : m)));
      addToast(`Role changed to ${role}`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm('Remove this member from the team?')) return;
    try {
      const res = await fetch(`/api/members/${userId}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove member');
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      addToast('Member removed', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  if (loading) {
    return <p className="text-slate-400">Loading members...</p>;
  }

  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold">
        <Users className="h-6 w-6" />
        Members
      </h2>
      <p className="mb-6 text-slate-400">Manage team members and roles.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-xs uppercase text-slate-400">
            <tr>
              {isOwner && (
                <th className="px-3 py-3 w-8">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                    {selected.size > 0 && selected.size === members.filter(canBatchSelect).length ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
              )}
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Joined</th>
              {isAdmin && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {members.map((m) => (
              <tr
                key={m.userId}
                className={m.isCurrentUser ? 'bg-blue-900/10' : 'bg-slate-800/50'}
              >
                {isOwner && (
                  <td className="px-3 py-3">
                    {canBatchSelect(m) && (
                      <button onClick={() => toggleSelect(m.userId)} className="text-slate-400 hover:text-white">
                        {selected.has(m.userId) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    )}
                  </td>
                )}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-xs font-bold text-white">
                      {m.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {m.name}
                        {m.isCurrentUser && (
                          <span className="ml-2 text-xs text-slate-400">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {isOwner && !m.isCurrentUser ? (
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.userId, e.target.value)}
                      className="rounded border border-slate-600 bg-slate-700 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadgeClass[m.role] ?? roleBadgeClass.member}`}
                    >
                      {m.role}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {new Date(m.joinedAt).toLocaleDateString()}
                </td>
                {isAdmin && (
                  <td className="px-5 py-3 text-right">
                    {!m.isCurrentUser && (
                      <button
                        onClick={() => removeMember(m.userId)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-red-400"
                        title="Remove member"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 shadow-xl">
          <span className="text-sm text-slate-300">{selected.size} selected</span>
          <select
            value={batchRole}
            onChange={(e) => setBatchRole(e.target.value)}
            className="rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button
            onClick={applyBatchRole}
            disabled={applyingBatch}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {applyingBatch ? 'Applying...' : 'Apply'}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

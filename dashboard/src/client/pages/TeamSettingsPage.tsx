import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Settings, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface TeamInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export function TeamSettingsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/teams/current', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load team');
        return res.json();
      })
      .then((data) => {
        const t = data.team ?? data;
        setTeam(t);
        setName(t.name);
        setSlug(t.slug);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const isOwner = team?.role === 'owner';
  const isAdmin = isOwner || team?.role === 'admin';

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body: Record<string, string> = {};
      if (name !== team?.name) body.name = name;
      if (isOwner && slug !== team?.slug) body.slug = slug;
      const res = await fetch('/api/teams/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }
      addToast('Team settings saved', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== team?.slug) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/teams/current', {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete team');
      addToast('Team deleted', 'success');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-slate-400">Loading team settings...</p>;
  }

  if (!team) {
    return <p className="text-red-400">Could not load team information.</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold">
        <Settings className="h-6 w-6" />
        Team Settings
      </h2>
      <p className="mb-6 text-slate-400">Manage your team configuration.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div>
          <label htmlFor="team-name" className="mb-1 block text-sm font-medium text-slate-300">
            Team Name
          </label>
          <input
            id="team-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        {isOwner && (
          <div>
            <label htmlFor="team-slug" className="mb-1 block text-sm font-medium text-slate-300">
              Team Slug
            </label>
            <input
              id="team-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 font-mono text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {isAdmin && (
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </form>

      {isOwner && (
        <div className="mt-8 rounded-xl border border-red-800/50 bg-red-900/10 p-6">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h3>
          <p className="mb-4 text-sm text-slate-400">
            Deleting a team is permanent. All data associated with this team will be lost.
          </p>

          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 rounded-lg border border-red-700 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30"
            >
              <Trash2 className="h-4 w-4" />
              Delete Team
            </button>
          ) : (
            <div className="space-y-3 rounded-lg border border-red-800 bg-slate-800 p-4">
              <p className="text-sm text-slate-300">
                Type <span className="font-mono font-bold text-red-300">{team.slug}</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={team.slug}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 font-mono text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirm !== team.slug || deleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDelete(false);
                    setDeleteConfirm('');
                  }}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

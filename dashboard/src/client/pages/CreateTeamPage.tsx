import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Users, AlertTriangle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const RESERVED_SLUGS = new Set([
  'console', 'chat', 'api', 'www', 'admin', 'mail',
  'app', 'help', 'support', 'status', 'blog', 'docs',
]);

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function validateSlug(slug: string): string | null {
  if (slug.length < 3) return 'Slug must be at least 3 characters';
  if (slug.length > 63) return 'Slug must be at most 63 characters';
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    return 'Slug must be lowercase alphanumeric with hyphens, cannot start/end with hyphen';
  }
  if (/--/.test(slug)) return 'Slug cannot contain double hyphens';
  return null;
}

export function CreateTeamPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugEdited) setSlug(toSlug(val));
  };

  const handleSlugChange = (val: string) => {
    setSlugEdited(true);
    setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  const slugError = slug ? validateSlug(slug) : null;
  const isReserved = RESERVED_SLUGS.has(slug);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (slugError || !name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), slug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create team');
      }
      addToast('Team created successfully', 'success');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-2 text-2xl font-bold">Create a Team</h2>
      <p className="mb-6 text-slate-400">Set up a new team to collaborate with others.</p>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div>
          <label htmlFor="team-name" className="mb-1 block text-sm font-medium text-slate-300">
            Team Name
          </label>
          <input
            id="team-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="My Team"
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="team-slug" className="mb-1 block text-sm font-medium text-slate-300">
            Team Slug
          </label>
          <input
            id="team-slug"
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="my-team"
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 font-mono text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          {slugError && <p className="mt-1 text-sm text-red-400">{slugError}</p>}
          {!slugError && isReserved && (
            <p className="mt-1 flex items-center gap-1 text-sm text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              This slug is reserved and may not be available
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !!slugError || !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Users className="h-4 w-4" />
          {submitting ? 'Creating...' : 'Create Team'}
        </button>
      </form>
    </div>
  );
}

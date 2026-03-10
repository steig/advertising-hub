import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useTeam } from '../../contexts/TeamContext';

export function TeamGuard() {
  const { team } = useTeam();
  const [redirect, setRedirect] = useState<string | null>(null);
  const [checking, setChecking] = useState(!team);

  useEffect(() => {
    if (team) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    async function checkInvitations() {
      try {
        const res = await fetch('/api/invitations/pending', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setRedirect('/teams/new');
          return;
        }
        const data = await res.json() as { invitations?: unknown[] };
        const hasInvitations = Array.isArray(data.invitations) && data.invitations.length > 0;
        if (!cancelled) setRedirect(hasInvitations ? '/invitations' : '/teams/new');
      } catch {
        if (!cancelled) setRedirect('/teams/new');
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkInvitations();
    return () => { cancelled = true; };
  }, [team]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500" />
      </div>
    );
  }

  if (redirect) {
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}

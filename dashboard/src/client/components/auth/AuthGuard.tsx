import { Navigate, Outlet } from 'react-router';
import { useUser } from '../../contexts/UserContext';

export function AuthGuard() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500" />
      </div>
    );
  }

  if (!user) {
    const returnTo = encodeURIComponent(window.location.pathname);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return <Outlet />;
}

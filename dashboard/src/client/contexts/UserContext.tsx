import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface TeamInfo {
  id: string;
  slug: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
}

interface UserContextValue {
  user: User | null;
  teams: TeamInfo[];
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

async function fetchMe(): Promise<{ user: User; teams: TeamInfo[] }> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) throw res;
  return res.json();
}

async function refreshToken(): Promise<boolean> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (): Promise<boolean> => {
    try {
      const data = await fetchMe();
      setUser(data.user);
      setTeams(data.teams);
      return true;
    } catch (err) {
      if (err instanceof Response && err.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          try {
            const data = await fetchMe();
            setUser(data.user);
            setTeams(data.teams);
            return true;
          } catch {
            // refresh succeeded but fetchMe still failed
          }
        }
      }
      setUser(null);
      setTeams([]);
      return false;
    }
  }, []);

  useEffect(() => {
    loadUser().finally(() => setLoading(false));
  }, [loadUser]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setTeams([]);
  }, []);

  const refresh = useCallback(async (): Promise<boolean> => {
    return loadUser();
  }, [loadUser]);

  return (
    <UserContext.Provider value={{ user, teams, loading, logout, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

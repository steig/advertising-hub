import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useUser, type TeamInfo } from './UserContext';

let currentTeamId: string | null = null;

export function getTeamId(): string | null {
  return currentTeamId;
}

interface TeamContextValue {
  team: TeamInfo | null;
  switchTeam: (id: string) => void;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}

const STORAGE_KEY = 'selectedTeamId';
const CHANNEL_NAME = 'team-switch';

export function TeamProvider({ children }: { children: ReactNode }) {
  const { teams } = useUser();
  const [team, setTeam] = useState<TeamInfo | null>(null);

  // Initialize team from localStorage or first available
  useEffect(() => {
    if (teams.length === 0) {
      setTeam(null);
      currentTeamId = null;
      return;
    }

    const storedId = localStorage.getItem(STORAGE_KEY);
    const found = storedId ? teams.find((t) => t.id === storedId) : null;
    const selected = found ?? teams[0];

    setTeam(selected);
    currentTeamId = selected.id;
  }, [teams]);

  const switchTeam = useCallback(
    (id: string) => {
      const found = teams.find((t) => t.id === id);
      if (!found) return;

      setTeam(found);
      currentTeamId = found.id;
      localStorage.setItem(STORAGE_KEY, found.id);

      try {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({ teamId: found.id });
        bc.close();
      } catch {
        // BroadcastChannel not supported
      }
    },
    [teams],
  );

  // Listen for cross-tab team switches
  useEffect(() => {
    let bc: BroadcastChannel;
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event: MessageEvent<{ teamId: string }>) => {
        const found = teams.find((t) => t.id === event.data.teamId);
        if (found) {
          setTeam(found);
          currentTeamId = found.id;
          localStorage.setItem(STORAGE_KEY, found.id);
        }
      };
    } catch {
      // BroadcastChannel not supported
      return;
    }

    return () => bc.close();
  }, [teams]);

  return (
    <TeamContext.Provider value={{ team, switchTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

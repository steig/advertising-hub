import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { Link } from 'react-router';
import { useTeam } from '../../contexts/TeamContext';
import { useUser } from '../../contexts/UserContext';

const TEAM_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];

function getTeamColor(index: number): string {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}

export function TeamSwitcher() {
  const { team, switchTeam } = useTeam();
  const { teams } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!team) return null;

  const currentIndex = teams.findIndex((t) => t.id === team.id);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
      >
        <span className={`w-2 h-2 rounded-full ${getTeamColor(currentIndex)}`} />
        <span className="flex-1 text-sm font-medium text-white truncate">{team.name}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
          {teams.map((t, i) => (
            <button
              key={t.id}
              onClick={() => { switchTeam(t.id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-700 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${getTeamColor(i)}`} />
              <span className="flex-1 text-sm text-slate-200 truncate">{t.name}</span>
              {t.id === team.id && <Check size={14} className="text-blue-400" />}
            </button>
          ))}
          <div className="border-t border-slate-700 mt-1 pt-1">
            <Link
              to="/teams/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Plus size={14} />
              Create new team
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

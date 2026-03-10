import { Link, useLocation } from 'react-router';
import { LayoutDashboard, Globe, Bot, Terminal, Settings, Activity, Menu, X, MessageSquare, LogOut, Users, Settings2, Shield, Mail, FileText } from 'lucide-react';
import { useState } from 'react';
import { TeamSwitcher } from '../team/TeamSwitcher';
import { useTeam } from '../../contexts/TeamContext';
import { useUser } from '../../contexts/UserContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/platforms', icon: Globe, label: 'Platforms' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/scripts', icon: Terminal, label: 'Scripts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/health', icon: Activity, label: 'Health' },
];

const adminItems = [
  { to: '/settings/team', icon: Settings2, label: 'Team Settings' },
  { to: '/settings/members', icon: Users, label: 'Members' },
  { to: '/settings/invitations', icon: Mail, label: 'Invitations' },
  { to: '/settings/audit', icon: Shield, label: 'Audit Log' },
];

export function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { team } = useTeam();
  const { user, logout } = useUser();

  const isAdmin = team?.role === 'owner' || team?.role === 'admin';

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-slate-300"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-slate-950 border-r border-slate-800
        flex flex-col
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <span className="text-lg font-bold text-white">Ad Hub</span>
          <p className="text-xs text-slate-500 mt-1">Dashboard</p>
        </div>

        <div className="px-4 pt-4">
          <TeamSwitcher />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to ||
              (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${active
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1">
                <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Admin</p>
              </div>
              {adminItems.map(({ to, icon: Icon, label }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                      ${active
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                    `}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User menu */}
        {user && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

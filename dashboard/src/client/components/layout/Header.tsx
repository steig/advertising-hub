import { useLocation } from 'react-router';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/platforms': 'Platforms',
  '/agents': 'Agents',
  '/scripts': 'Scripts',
  '/settings': 'Settings',
  '/health': 'Health',
};

export function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/platforms/') ? 'Platform Details' :
     location.pathname.startsWith('/agents/') ? 'Agent Details' : 'Dashboard');

  return (
    <header className="h-14 border-b border-slate-800 flex items-center px-6 bg-slate-900/80 backdrop-blur-sm">
      <h1 className="text-lg font-semibold text-slate-100 lg:ml-0 ml-12">{title}</h1>
    </header>
  );
}

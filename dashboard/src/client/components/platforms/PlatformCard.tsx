import { Link } from 'react-router';
import { Globe } from 'lucide-react';
import type { PlatformConfig } from '../../../types/platform';
import { PLATFORM_CATEGORY_COLORS } from '../../lib/constants';

export function PlatformCard({ platform }: { platform: PlatformConfig }) {
  const capCount = Object.values(platform.capabilities).filter(Boolean).length;
  const agentCount = platform.agents.length;
  const hasMcp = platform.ourTools.some(t => t.type === 'mcp-server');

  return (
    <Link
      to={`/platforms/${platform.slug}`}
      className="block bg-slate-800 border border-slate-700 rounded-xl p-5 hover:bg-slate-700/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Globe size={20} className="text-slate-400" />
          <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${PLATFORM_CATEGORY_COLORS[platform.category] || 'bg-slate-600 text-slate-300'}`}>
          {platform.category}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${platform.status === 'active' ? 'bg-green-400' : 'bg-slate-500'}`} />
          {platform.status}
        </span>
        <span>{capCount} capabilities</span>
        <span>{agentCount} agent{agentCount !== 1 ? 's' : ''}</span>
      </div>

      {hasMcp && (
        <span className="inline-block rounded-full bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-xs font-medium">
          MCP
        </span>
      )}
    </Link>
  );
}

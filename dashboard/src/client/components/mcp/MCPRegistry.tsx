import { ExternalLink } from 'lucide-react';
import type { MCPServer } from '../../../types/mcp-registry';

export function MCPRegistryGrid({ servers }: { servers: MCPServer[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {servers.map(server => (
        <div key={server.name} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">{server.platform}</p>
              <h3 className="text-base font-semibold text-white">{server.name}</h3>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              server.status === 'live'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-slate-600/50 text-slate-400'
            }`}>
              {server.status === 'live' ? 'Live' : 'Planned'}
            </span>
          </div>

          {server.status === 'live' && (
            <>
              {server.tools && server.tools.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {server.tools.map(tool => (
                    <span key={tool} className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                      {tool}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 text-xs">
                {server.repo && (
                  <a
                    href={`https://github.com/${server.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink size={12} />
                    Repo
                  </a>
                )}
                {server.pypi && (
                  <a
                    href={`https://pypi.org/project/${server.pypi}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink size={12} />
                    PyPI
                  </a>
                )}
              </div>
            </>
          )}

          {server.status === 'planned' && server.spec && (
            <a
              href={server.spec}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <ExternalLink size={12} />
              Spec
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

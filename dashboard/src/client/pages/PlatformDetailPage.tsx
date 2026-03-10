import { useParams, Link, Navigate } from 'react-router';
import { ArrowLeft, ExternalLink, Check, X, Globe } from 'lucide-react';
import { usePlatform } from '../hooks/usePlatforms';
import { CAPABILITY_LABELS, PLATFORM_CATEGORY_COLORS, STATUS_COLORS } from '../lib/constants';

export function PlatformDetailPage() {
  const { slug } = useParams();
  const { platform, loading, error } = usePlatform(slug ?? '');

  if (!slug) return <Navigate to="/platforms" replace />;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-700 rounded w-48" />
        <div className="h-4 bg-slate-700 rounded w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="h-48 bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !platform) {
    return (
      <div>
        <Link to="/platforms" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4">
          <ArrowLeft size={16} /> Back to Platforms
        </Link>
        <p className="text-red-400">Platform not found.</p>
      </div>
    );
  }

  const api = platform.api;
  const login = platform.login;

  return (
    <div>
      <Link to="/platforms" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft size={16} /> Back to Platforms
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Globe size={28} className="text-slate-400" />
        <div>
          <h2 className="text-xl font-bold text-white">{platform.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PLATFORM_CATEGORY_COLORS[platform.category] || ''}`}>
              {platform.category}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[platform.status] || 'bg-slate-600 text-slate-300'}`}>
              {platform.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Info */}
        {api && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">API Information</h2>
            <dl className="space-y-3 text-sm">
              {api.baseUrl && (
                <div>
                  <dt className="text-slate-500">Base URL</dt>
                  <dd className="text-slate-300 font-mono text-xs">{api.baseUrl}</dd>
                </div>
              )}
              {api.currentVersion && (
                <div>
                  <dt className="text-slate-500">Version</dt>
                  <dd className="text-slate-300">{api.currentVersion}</dd>
                </div>
              )}
              {api.authType && (
                <div>
                  <dt className="text-slate-500">Auth Type</dt>
                  <dd className="text-slate-300">{api.authType}</dd>
                </div>
              )}
              {api.documentation && (
                <div>
                  <dt className="text-slate-500">Documentation</dt>
                  <dd>
                    <a href={api.documentation} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      <ExternalLink size={12} /> Docs
                    </a>
                  </dd>
                </div>
              )}
              {api.rateLimits && (
                <div>
                  <dt className="text-slate-500">Rate Limits</dt>
                  <dd className="text-slate-300 text-xs">
                    {api.rateLimits.requestsPerDay && <span>{api.rateLimits.requestsPerDay.toLocaleString()}/day</span>}
                    {api.rateLimits.requestsPerSecond && <span className="ml-2">{api.rateLimits.requestsPerSecond}/sec</span>}
                    {api.rateLimits.notes && <p className="text-slate-500 mt-1">{api.rateLimits.notes}</p>}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Login URLs */}
        {login && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Login URLs</h2>
            <dl className="space-y-3 text-sm">
              {login.url && (
                <div>
                  <dt className="text-slate-500">Login</dt>
                  <dd>
                    <a href={login.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                      <ExternalLink size={12} /> {login.url}
                    </a>
                  </dd>
                </div>
              )}
              {login.apiConsole && (
                <div>
                  <dt className="text-slate-500">API Console</dt>
                  <dd>
                    <a href={login.apiConsole} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                      <ExternalLink size={12} /> {login.apiConsole}
                    </a>
                  </dd>
                </div>
              )}
              {login.developerPortal && (
                <div>
                  <dt className="text-slate-500">Developer Portal</dt>
                  <dd>
                    <a href={login.developerPortal} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                      <ExternalLink size={12} /> {login.developerPortal}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      {/* Capabilities */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
        <h2 className="text-base font-semibold text-white mb-4">Capabilities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(platform.capabilities).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              {value ? (
                <Check size={16} className="text-green-400 shrink-0" />
              ) : (
                <X size={16} className="text-slate-600 shrink-0" />
              )}
              <span className={value ? 'text-slate-200' : 'text-slate-500'}>
                {CAPABILITY_LABELS[key] || key}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Agents */}
      {platform.agents.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
          <h2 className="text-base font-semibold text-white mb-4">Agents</h2>
          <div className="flex flex-wrap gap-2">
            {platform.agents.map(agent => (
              <Link
                key={agent}
                to={`/agents/${agent}`}
                className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-blue-400 hover:bg-slate-600 transition-colors"
              >
                {agent}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upstream Repos */}
      {platform.upstreamRepos.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
          <h2 className="text-base font-semibold text-white mb-4">Upstream Repos</h2>
          <div className="space-y-2">
            {platform.upstreamRepos.map(repo => (
              <a
                key={repo.repo}
                href={`https://github.com/${repo.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <div>
                  <span className="text-sm text-blue-400">{repo.repo}</span>
                  {repo.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{repo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {repo.language && (
                    <span className="text-xs text-slate-500">{repo.language}</span>
                  )}
                  <ExternalLink size={14} className="text-slate-500" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Our Tools */}
      {platform.ourTools.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
          <h2 className="text-base font-semibold text-white mb-4">Our Tools</h2>
          <div className="space-y-2">
            {platform.ourTools.map(tool => (
              <div key={tool.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                <div>
                  <span className="text-sm text-slate-200">{tool.name}</span>
                  {tool.type && (
                    <span className="ml-2 text-xs text-slate-500">{tool.type}</span>
                  )}
                </div>
                {tool.status && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tool.status === 'active' || tool.status === 'live'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-600/50 text-slate-400'
                  }`}>
                    {tool.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

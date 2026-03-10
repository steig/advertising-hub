import { useState } from 'react';
import { PLATFORM_CREDENTIALS } from '../../types/auth';
import { useCredentialStatuses } from '../hooks/useCredentials';
import { CredentialStatus } from '../components/credentials/CredentialStatus';
import { CredentialForm } from '../components/credentials/CredentialForm';
import { useEnabledPlatforms } from '../hooks/useEnabledPlatforms';
import { enablePlatform, disablePlatform } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useTeam } from '../contexts/TeamContext';

export function SettingsPage() {
  const { statuses, loading, refresh } = useCredentialStatuses();
  const { enabledSlugs, isEnabled, loading: platformsLoading, refresh: refreshPlatforms } = useEnabledPlatforms();
  const { addToast } = useToast();
  const { team } = useTeam();
  const isAdmin = team?.role === 'owner' || team?.role === 'admin';
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const isConfigured = (platform: string) =>
    statuses.some((s) => s.platform === platform && s.hasCredentials);

  const toggle = (platform: string) => {
    setExpanded((prev) => (prev === platform ? null : platform));
  };

  const handleTogglePlatform = async (platform: string) => {
    if (!isAdmin) return;
    setToggling(platform);
    try {
      if (isEnabled(platform)) {
        await disablePlatform(platform);
        addToast(`${formatName(platform)} disabled`, 'info');
        if (expanded === platform) setExpanded(null);
      } else {
        await enablePlatform(platform);
        addToast(`${formatName(platform)} enabled`, 'success');
      }
      refreshPlatforms();
    } catch {
      addToast('Failed to update platform', 'error');
    } finally {
      setToggling(null);
    }
  };

  const formatName = (slug: string) =>
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">Settings</h2>
      <p className="mb-6 text-slate-400">
        Enable platforms for your team and manage API credentials
      </p>

      {loading || platformsLoading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="space-y-3">
          {PLATFORM_CREDENTIALS.map((def) => {
            const configured = isConfigured(def.platform);
            const enabled = isEnabled(def.platform);
            const isOpen = expanded === def.platform;

            return (
              <div
                key={def.platform}
                className={`rounded-xl border ${enabled ? 'border-slate-700' : 'border-slate-800'} bg-slate-800`}
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    {isAdmin && (
                      <button
                        onClick={() => handleTogglePlatform(def.platform)}
                        disabled={toggling === def.platform}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          enabled ? 'bg-blue-600' : 'bg-slate-600'
                        } ${toggling === def.platform ? 'opacity-50' : ''}`}
                        role="switch"
                        aria-checked={enabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    )}
                    <span className={`text-lg font-semibold ${enabled ? 'text-white' : 'text-slate-500'}`}>
                      {formatName(def.platform)}
                    </span>
                    {enabled && <CredentialStatus configured={configured} />}
                  </div>
                  {enabled && (
                    <button
                      onClick={() => toggle(def.platform)}
                      className="p-1"
                      aria-expanded={isOpen}
                      aria-controls={`cred-${def.platform}`}
                    >
                      <svg
                        className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {enabled && isOpen && (
                  <div id={`cred-${def.platform}`} className="border-t border-slate-700 px-5 pb-5">
                    <CredentialForm platformDef={def} onSaved={refresh} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

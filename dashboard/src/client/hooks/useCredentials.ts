import { useState, useEffect, useCallback } from 'react';

export interface CredentialStatus {
  platform: string;
  hasCredentials: boolean;
  updatedAt?: string;
}

export interface MaskedCredentials {
  platform: string;
  configured: boolean;
  fields: Record<string, string>;
}

function getApiKey(): string {
  return localStorage.getItem('adhub_api_key') || '';
}

function authHeaders(): Record<string, string> {
  const key = getApiKey();
  if (!key) return {};
  return { 'X-API-Key': key };
}

export function useCredentialStatuses() {
  const [statuses, setStatuses] = useState<CredentialStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch('/api/credentials', { headers: authHeaders() })
      .then((r) => (r.ok ? (r.json() as Promise<CredentialStatus[]>) : []))
      .then(setStatuses)
      .catch(() => setStatuses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { statuses, loading, refresh };
}

export function useMaskedCredentials(platform: string | null) {
  const [data, setData] = useState<MaskedCredentials | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!platform) {
      setData(null);
      return;
    }
    setLoading(true);
    fetch(`/api/credentials/${platform}`, { headers: authHeaders() })
      .then((r) => r.json() as Promise<MaskedCredentials>)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [platform]);

  return { data, loading };
}

export async function saveCredentials(
  platform: string,
  fields: Record<string, string>
): Promise<boolean> {
  const res = await fetch(`/api/credentials/${platform}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ fields }),
  });
  return res.ok;
}

export async function deleteCredentials(
  platform: string
): Promise<boolean> {
  const res = await fetch(`/api/credentials/${platform}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.ok;
}

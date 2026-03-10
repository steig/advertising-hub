import { useState, useEffect } from 'react';
import type { PlatformConfig } from '../../types/platform';
import { getPlatforms, getPlatform } from '../lib/api';

export function usePlatforms(category?: string) {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getPlatforms(category)
      .then(setPlatforms)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [category]);

  return { platforms, loading, error };
}

export function usePlatform(slug: string) {
  const [platform, setPlatform] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getPlatform(slug)
      .then(setPlatform)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [slug]);

  return { platform, loading, error };
}

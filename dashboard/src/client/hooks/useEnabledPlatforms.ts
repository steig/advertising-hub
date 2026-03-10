import { useState, useEffect, useCallback } from 'react';
import { getEnabledPlatforms, type TeamPlatform } from '../lib/api';

export function useEnabledPlatforms() {
  const [platforms, setPlatforms] = useState<TeamPlatform[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    getEnabledPlatforms()
      .then(setPlatforms)
      .catch(() => setPlatforms([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const enabledSlugs = platforms.map(p => p.platform);

  const isEnabled = useCallback(
    (platform: string) => enabledSlugs.includes(platform),
    [enabledSlugs]
  );

  return { platforms, enabledSlugs, loading, isEnabled, refresh };
}

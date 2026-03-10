import { useState, useEffect } from 'react';
import { getHealth, type HealthStatus } from '../lib/api';

export function useHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getHealth()
      .then(setHealth)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { health, loading, error };
}

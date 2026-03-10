import { useState, useEffect } from 'react';
import type { AgentDefinition } from '../../types/agent';
import { getAgents, getAgent } from '../lib/api';

export function useAgents(category?: string) {
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getAgents(category)
      .then(setAgents)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [category]);

  return { agents, loading, error };
}

export function useAgent(slug: string) {
  const [agent, setAgent] = useState<AgentDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getAgent(slug)
      .then(setAgent)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [slug]);

  return { agent, loading, error };
}

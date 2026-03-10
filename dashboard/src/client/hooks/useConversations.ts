import { useState, useEffect, useCallback } from 'react';
import {
  getConversations,
  createConversation,
  deleteConversation,
  renameConversation,
  toggleShareConversation,
  type Conversation,
} from '../lib/api';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (agentSlug: string) => {
    const result = await createConversation(agentSlug);
    await refresh();
    return result;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    // Optimistic remove
    setConversations(prev => prev.filter(c => c.id !== id));
    await deleteConversation(id);
  }, []);

  const rename = useCallback(async (id: string, title: string) => {
    // Optimistic update
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    await renameConversation(id, title);
  }, []);

  const toggleShare = useCallback(async (id: string) => {
    const result = await toggleShareConversation(id);
    await refresh();
    return result;
  }, [refresh]);

  return { conversations, loading, create, remove, rename, toggleShare, refresh };
}

import { useState, useEffect } from 'react';
import { getScripts, getScriptSource, type ScriptMeta, type ScriptSource } from '../lib/api';

export function useScripts() {
  const [scripts, setScripts] = useState<ScriptMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getScripts()
      .then(setScripts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { scripts, loading, error };
}

export function useScriptSource(id: string | null) {
  const [script, setScript] = useState<ScriptSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) { setScript(null); return; }
    setLoading(true);
    getScriptSource(id)
      .then(setScript)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return { script, loading, error };
}

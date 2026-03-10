import { useState, useEffect } from 'react';
import type { PlatformCredentialFields } from '../../../types/auth';
import {
  useMaskedCredentials,
  saveCredentials,
  deleteCredentials,
} from '../../hooks/useCredentials';
import { useToast } from '../../contexts/ToastContext';

interface CredentialFormProps {
  platformDef: PlatformCredentialFields;
  onSaved: () => void;
}

export function CredentialForm({ platformDef, onSaved }: CredentialFormProps) {
  const { data: masked, loading: loadingMasked } = useMaskedCredentials(
    platformDef.platform
  );
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const f of platformDef.fields) {
      initial[f.key] = '';
    }
    setFields(initial);
    setConfirmDelete(false);
  }, [platformDef.platform]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await saveCredentials(platformDef.platform, fields);
    setSaving(false);
    if (ok) {
      addToast('Credentials saved successfully', 'success');
      const reset: Record<string, string> = {};
      for (const f of platformDef.fields) reset[f.key] = '';
      setFields(reset);
      onSaved();
    } else {
      addToast('Failed to save credentials', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const ok = await deleteCredentials(platformDef.platform);
    setDeleting(false);
    setConfirmDelete(false);
    if (ok) {
      addToast('Credentials deleted', 'success');
      onSaved();
    } else {
      addToast('Failed to delete credentials', 'error');
    }
  };

  const hasValues = Object.values(fields).some((v) => v.trim().length > 0);

  return (
    <div className="mt-4 space-y-4">
      {loadingMasked ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          {masked?.configured && (
            <div className="rounded-lg bg-slate-900 p-3 text-sm text-slate-400">
              <p className="mb-2 font-medium text-slate-300">
                Current values (masked):
              </p>
              {Object.entries(masked.fields).map(([k, v]) => (
                <div key={k} className="flex justify-between py-1">
                  <span>{k}</span>
                  <span className="font-mono">{v}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {platformDef.fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  {f.label}
                  {f.required && (
                    <span className="ml-1 text-red-400">*</span>
                  )}
                </label>
                <input
                  type="password"
                  placeholder={`Enter ${f.label}`}
                  value={fields[f.key] || ''}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      [f.key]: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !hasValues}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Credentials'}
            </button>

            {masked?.configured && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting
                  ? 'Deleting...'
                  : confirmDelete
                    ? 'Confirm Delete'
                    : 'Delete Credentials'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

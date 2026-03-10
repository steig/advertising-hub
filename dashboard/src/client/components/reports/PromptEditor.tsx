import { useState } from 'react';
import { Save } from 'lucide-react';

interface Props {
  currentPrompt: string;
  currentVersion?: number;
  onSave: (text: string) => Promise<void>;
  readOnly?: boolean;
}

export function PromptEditor({ currentPrompt, currentVersion, onSave, readOnly }: Props) {
  const [text, setText] = useState(currentPrompt);
  const [saving, setSaving] = useState(false);
  const hasChanges = text !== currentPrompt;

  async function handleSave() {
    if (!hasChanges || !text.trim()) return;
    setSaving(true);
    try {
      await onSave(text.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-300">Prompt</h3>
          {currentVersion != null && (
            <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
              v{currentVersion}
            </span>
          )}
        </div>
        {!readOnly && hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Save size={12} />
            {saving ? 'Saving...' : 'Save new version'}
          </button>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        readOnly={readOnly}
        rows={8}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 font-mono resize-y focus:outline-none focus:border-blue-500 disabled:opacity-60"
        placeholder="Enter your analysis prompt..."
      />
    </div>
  );
}

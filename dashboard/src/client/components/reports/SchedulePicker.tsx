import { useState } from 'react';

const presets = [
  { label: 'Manual only', value: '' },
  { label: 'Daily (9 AM)', value: '0 9 * * *' },
  { label: 'Weekly (Mon 9 AM)', value: '0 9 * * 1' },
  { label: 'Monthly (1st, 9 AM)', value: '0 9 1 * *' },
  { label: 'Custom', value: '__custom__' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SchedulePicker({ value, onChange }: Props) {
  const isPreset = presets.some((p) => p.value === value);
  const [mode, setMode] = useState<string>(isPreset ? value : '__custom__');
  const [custom, setCustom] = useState(isPreset ? '' : value);

  function handlePresetChange(preset: string) {
    setMode(preset);
    if (preset === '__custom__') {
      onChange(custom);
    } else {
      onChange(preset);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">Schedule</label>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.value || 'manual'}
            type="button"
            onClick={() => handlePresetChange(p.value)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              mode === p.value
                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {mode === '__custom__' && (
        <input
          type="text"
          value={custom}
          onChange={(e) => { setCustom(e.target.value); onChange(e.target.value); }}
          placeholder="*/30 * * * *"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
        />
      )}
    </div>
  );
}

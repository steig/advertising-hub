const dateRangePresets = [
  { label: 'Last 7 days', value: 'last_7d' },
  { label: 'Last 30 days', value: 'last_30d' },
  { label: 'Last 90 days', value: 'last_90d' },
  { label: 'This month', value: 'this_month' },
  { label: 'Last month', value: 'last_month' },
];

interface DataConfig {
  date_range: string;
  metrics: string;
  dimensions: string;
}

interface Props {
  value: DataConfig;
  onChange: (val: DataConfig) => void;
}

export function DataConfigEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-300">Data Configuration</h3>

      <div className="space-y-2">
        <label className="text-xs text-slate-400">Date range</label>
        <div className="flex flex-wrap gap-2">
          {dateRangePresets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange({ ...value, date_range: p.value })}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                value.date_range === p.value
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400">Metrics (comma-separated)</label>
        <input
          type="text"
          value={value.metrics}
          onChange={(e) => onChange({ ...value, metrics: e.target.value })}
          placeholder="impressions, clicks, spend, conversions"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400">Dimensions (comma-separated)</label>
        <input
          type="text"
          value={value.dimensions}
          onChange={(e) => onChange({ ...value, dimensions: e.target.value })}
          placeholder="campaign, ad_group, device"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}

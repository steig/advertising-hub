import { useState } from 'react';
import { Search } from 'lucide-react';
import { usePlatforms } from '../hooks/usePlatforms';
import { PlatformCard } from '../components/platforms/PlatformCard';

const categories = ['all', 'search', 'social', 'commerce', 'display', 'programmatic', 'b2b', 'audio', 'retargeting'] as const;

export function PlatformsPage() {
  const { platforms, loading, error } = usePlatforms();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const filtered = platforms.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Platforms</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search platforms..."
            aria-label="Search platforms"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Platform categories">
          {categories.map(cat => (
            <button
              key={cat}
              role="tab"
              aria-selected={category === cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">Failed to load platforms. Please try refreshing.</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-slate-700 rounded w-1/2 mb-3" />
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <PlatformCard key={p.slug} platform={p} />
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-500 col-span-full text-center py-8">No platforms found</p>
          )}
        </div>
      )}
    </div>
  );
}

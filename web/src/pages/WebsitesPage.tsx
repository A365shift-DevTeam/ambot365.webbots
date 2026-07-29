import { useEffect, useState } from 'react';
import WebsiteCard from '@/components/websites/WebsiteCard';
import WebsitePreviewModal from '@/components/websites/WebsitePreviewModal';
import { getWebsites } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { usePageTitle } from '@/lib/usePageTitle';
import type { DemoWebsite } from '@/lib/types';

export default function WebsitesPage() {
  usePageTitle('Demo Sites');

  const [websites, setWebsites] = useState<DemoWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [activePreview, setActivePreview] = useState<DemoWebsite | null>(null);

  useEffect(() => {
    let cancelled = false;

    getWebsites(true)
      .then((all) => {
        if (!cancelled) setWebsites(all);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load demo sites');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const search = query.trim().toLowerCase();
  const visible = websites.filter((site) => {
    const matchesCategory = category === 'all' || site.category === category;
    const matchesSearch =
      search === '' ||
      site.title.toLowerCase().includes(search) ||
      site.description.toLowerCase().includes(search) ||
      site.tags.some((tag) => tag.toLowerCase().includes(search));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50/50 to-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Demo <span className="gradient-text">Websites</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Live client websites you can explore in interactive preview.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search demo sites..."
              className="w-full lg:max-w-xs px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === 'all'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    category === cat.value
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loading && <p className="text-center text-slate-400 py-16">Loading demo sites…</p>}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🌐</div>
              <p className="text-slate-500 font-medium">No demo sites found</p>
              <p className="text-sm text-slate-400 mt-1">
                {websites.length === 0
                  ? 'No demo websites have been published yet.'
                  : 'Try a different search or category.'}
              </p>
            </div>
          )}

          {visible.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visible.map((site) => (
                <WebsiteCard key={site.id} website={site} onPreviewClick={setActivePreview} />
              ))}
            </div>
          )}
        </div>
      </section>

      <WebsitePreviewModal website={activePreview} onClose={() => setActivePreview(null)} />
    </>
  );
}

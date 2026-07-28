'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WebsiteCard from '@/components/websites/WebsiteCard';
import WebsitePreviewModal from '@/components/websites/WebsitePreviewModal';
import { DemoWebsite, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';

export default function DemoWebsitesPage() {
  const [websites, setWebsites] = useState<DemoWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewWebsite, setActivePreviewWebsite] = useState<DemoWebsite | null>(null);

  useEffect(() => {
    async function fetchWebsites() {
      try {
        const res = await fetch('/api/websites');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setWebsites(json.data);
        }
      } catch (err) {
        console.error('Failed to load demo websites:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWebsites();
  }, []);

  const filteredWebsites = websites.filter((site) => {
    const matchesCategory =
      selectedCategory === 'all' || site.category === selectedCategory;
    const matchesSearch =
      site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (site.tags && site.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50/50 min-h-screen">
        {/* Page Header */}
        <section className="bg-gradient-to-b from-brand-50/60 via-white to-slate-50/50 py-16 sm:py-20 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-100/80 text-brand-700 mb-4">
              🌐 Portfolio Showcase
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Explore Our <span className="gradient-text">Demo Websites</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Showcasing high-performing, custom-built websites across industries. Click any demo to view live interactive device previews for your clients.
            </p>

            {/* Search Input */}
            <div className="max-w-xl mx-auto mb-8 relative">
              <div className="relative flex items-center">
                <svg className="w-5 h-5 absolute left-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search websites by industry, keyword, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Projects ({websites.length})
              </button>

              {CATEGORIES.map((cat) => {
                const count = websites.filter((w) => w.category === cat.value).length;
                if (count === 0) return null;

                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      selectedCategory === cat.value
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-brand-50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Website Grid */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse flex flex-col gap-4">
                    <div className="aspect-video bg-slate-200 rounded-xl" />
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-8 bg-slate-100 rounded-xl mt-auto" />
                  </div>
                ))}
              </div>
            ) : filteredWebsites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredWebsites.map((site) => (
                  <WebsiteCard
                    key={site.id}
                    website={site}
                    onPreviewClick={(w) => setActivePreviewWebsite(w)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                  🌐
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  No websites found matching your criteria
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  Try adjusting your search query or selecting a different industry category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 bg-brand-500 text-white font-semibold text-xs rounded-xl hover:bg-brand-600 transition-colors shadow-sm"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Interactive Modal Viewer */}
      <WebsitePreviewModal
        website={activePreviewWebsite}
        onClose={() => setActivePreviewWebsite(null)}
      />

      <Footer />
    </>
  );
}

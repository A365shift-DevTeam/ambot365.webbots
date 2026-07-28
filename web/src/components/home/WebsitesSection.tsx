import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WebsiteCard from '@/components/websites/WebsiteCard';
import WebsitePreviewModal from '@/components/websites/WebsitePreviewModal';
import { getWebsites } from '@/lib/api';
import type { DemoWebsite } from '@/lib/types';

export default function WebsitesSection() {
  const [websites, setWebsites] = useState<DemoWebsite[]>([]);
  const [activePreviewWebsite, setActivePreviewWebsite] = useState<DemoWebsite | null>(null);

  useEffect(() => {
    let cancelled = false;

    getWebsites(true)
      .then((all) => {
        if (!cancelled) setWebsites(all.slice(0, 3));
      })
      .catch((err) => {
        console.error('Failed to load home demo websites:', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (websites.length === 0) return null;

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-3">
              🌐 Live Demo Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Featured Client <span className="text-brand-400">Demo Websites</span>
            </h2>
            <p className="text-slate-400 text-base max-w-2xl mt-2">
              Explore live high-converting websites built for various industries. Test them directly
              in interactive desktop, tablet, and mobile device viewports.
            </p>
          </div>

          <Link
            to="/websites"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg hover:shadow-brand-500/30 transition-all shrink-0"
          >
            <span>View All Demo Sites</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Website Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {websites.map((site) => (
            <WebsiteCard
              key={site.id}
              website={site}
              onPreviewClick={(w) => setActivePreviewWebsite(w)}
            />
          ))}
        </div>
      </div>

      {/* Interactive Modal Viewer */}
      <WebsitePreviewModal
        website={activePreviewWebsite}
        onClose={() => setActivePreviewWebsite(null)}
      />
    </section>
  );
}

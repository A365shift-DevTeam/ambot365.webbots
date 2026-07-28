import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFoundPage';
import { getWebsiteBySlug } from '@/lib/api';
import { usePageTitle } from '@/lib/usePageTitle';
import type { DemoWebsite } from '@/lib/types';

export default function WebsiteDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [website, setWebsite] = useState<DemoWebsite | null>(null);
  const [loading, setLoading] = useState(true);

  usePageTitle(website ? `${website.title} — Demo Website Showcase` : undefined);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    setLoading(true);
    getWebsiteBySlug(slug)
      .then((found) => {
        if (!cancelled) setWebsite(found);
      })
      .catch(() => {
        if (!cancelled) setWebsite(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!website) return <NotFoundPage />;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Presentation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 z-20">
        {/* Left Branding & Back Button */}
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/websites"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back to Showcase</span>
          </Link>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{website.title}</h1>
            <p className="text-xs text-slate-400 truncate hidden sm:block">{website.url}</p>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <span>Open Original Site</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </header>

      {/* Full-bleed Live Website Iframe */}
      <main className="flex-1 w-full bg-white relative">
        <iframe
          src={website.url}
          title={website.title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </main>
    </div>
  );
}

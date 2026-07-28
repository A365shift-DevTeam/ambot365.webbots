import { Link } from 'react-router-dom';
import type { DemoWebsite } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';

interface WebsiteCardProps {
  website: DemoWebsite;
  onPreviewClick?: (website: DemoWebsite) => void;
}

export default function WebsiteCard({ website, onPreviewClick }: WebsiteCardProps) {
  const categoryInfo = CATEGORIES.find((c) => c.value === website.category);

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Thumbnail & Preview Image */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {website.thumbnailUrl ? (
          <img
            src={website.thumbnailUrl}
            alt={website.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-600 to-indigo-800 text-white font-bold text-lg p-6 text-center">
            {website.title}
          </div>
        )}

        {/* Floating Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1.5 shadow-sm">
          <span>{categoryInfo?.icon || '🌐'}</span>
          <span>{categoryInfo?.label || website.category}</span>
        </div>

        {/* Featured Tag */}
        {website.featured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
            Featured
          </div>
        )}

        {/* Quick Hover Action Overlay */}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
          {onPreviewClick ? (
            <button
              onClick={() => onPreviewClick(website)}
              className="px-4 py-2 bg-white text-brand-700 text-xs font-bold rounded-xl shadow-lg hover:bg-brand-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Quick Preview
            </button>
          ) : (
            <Link
              to={`/website/${website.slug}`}
              className="px-4 py-2 bg-white text-brand-700 text-xs font-bold rounded-xl shadow-lg hover:bg-brand-50 transition-colors flex items-center gap-1.5"
            >
              Interactive View
            </Link>
          )}

          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-brand-600 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open URL
          </a>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-2">
            {website.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {website.description}
          </p>
        </div>

        <div>
          {/* Tags */}
          {website.tags && website.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {website.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <Link
              to={`/website/${website.slug}`}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group/btn"
            >
              Full Interactive Presentation
              <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <a
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              title="Open direct link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

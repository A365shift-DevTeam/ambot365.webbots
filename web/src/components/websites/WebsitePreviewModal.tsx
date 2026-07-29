import { useEffect, useState } from 'react';
import type { DemoWebsite } from '@/lib/types';

interface WebsitePreviewModalProps {
  website: DemoWebsite | null;
  onClose: () => void;
}

export default function WebsitePreviewModal({ website, onClose }: WebsitePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  // Escape closes the modal, and the page behind it must not scroll while open.
  useEffect(() => {
    if (!website) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [website, onClose]);

  if (!website) return null;

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/website/${website.slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Top Control Bar */}
        <div className="bg-slate-900 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-4">
          {/* Left Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
              🌐
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{website.title}</h3>
              <p className="text-xs text-slate-400 truncate">{website.url}</p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
              title="Copy Client Share Link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {copied ? 'Link Copied!' : 'Share Link'}
            </button>

            {/* Plain anchor, not a router Link: this deliberately opens a new tab. */}
            <a
              href={`/website/${website.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors hidden lg:inline-flex items-center gap-1.5"
            >
              Full Page View ↗
            </a>

            <a
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              Open Direct Site
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Viewport Frame Container */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
          <div className="h-full w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col">
            {/* Device Screen Bar */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
              </div>
              <div className="bg-white px-4 py-1 rounded-md text-[11px] font-mono text-slate-500 border border-slate-200 truncate max-w-md">
                {website.url}
              </div>
              <div className="w-12 text-right text-[10px] font-semibold text-slate-400 uppercase">
                Preview
              </div>
            </div>

            {/* Iframe Website Loader */}
            <iframe
              src={website.url}
              title={website.title}
              className="w-full flex-1 border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

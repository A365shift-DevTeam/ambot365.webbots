'use client';

import { useState, useCallback, useEffect } from 'react';
import { BRAND } from '@/lib/constants';

interface BotEmbedProps {
  botFlowUrl: string;
  botName: string;
  themeColor?: string;
  bubbleIconUrl?: string;
}

/**
 * Some chatbot providers block iframe embedding. In that case,
 * custom domain / white-label URL must be configured from the
 * chatbot platform dashboard.
 *
 * This component attempts iframe load first, then falls back to
 * a branded "Start Chat" button that opens the bot in a new tab.
 */
export default function BotEmbed({ botFlowUrl, botName, themeColor = '#22c55e', bubbleIconUrl }: BotEmbedProps) {
  const [iframeStatus, setIframeStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isOpen, setIsOpen] = useState(false); // Widget is closed by default

  const handleIframeLoad = useCallback(() => {
    setIframeStatus('loaded');
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeStatus('error');
  }, []);

  // Fallback timeout - if iframe doesn't load in 8 seconds after opening, show fallback
  // Fallback timeout - if iframe doesn't load in 8 seconds after opening, show fallback
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setIframeStatus((prev) => (prev === 'loading' ? 'error' : prev));
    }, 8000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <>
      {/* Floating Chat Bubble Launcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 animate-bounce'
        }`}
        style={{ backgroundColor: themeColor }}
        aria-label="Open chat widget"
      >
        {bubbleIconUrl ? (
          <img src={bubbleIconUrl} alt="Chat" className="w-full h-full object-cover rounded-full" />
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* The Floating Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header with Close Button */}
        <div 
          className="flex items-center justify-between p-4 text-white shadow-md z-20 shrink-0"
          style={{ backgroundColor: themeColor }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {bubbleIconUrl ? (
                <img src={bubbleIconUrl} alt="Bot Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold">🤖</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">{botName}</h3>
              <p className="text-[10px] text-brand-100 opacity-90">Powered by AMBOT 365</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={botFlowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Open in new window"
              aria-label="Open chat in new window"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close chat window"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Iframe embed attempt */}
        <div className="relative flex-1 bg-slate-50 overflow-hidden">
          {iframeStatus !== 'error' && (
            <>
              {/* Loading skeleton */}
              {iframeStatus === 'loading' && (
                <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
                  <p className="text-sm text-slate-500">Connecting...</p>
                </div>
              )}

              {isOpen && (
                <iframe
                  src={botFlowUrl}
                  title={`${botName} - Chat`}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
                  loading="lazy"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              )}
            </>
          )}

          {/* Fallback when iframe is blocked */}
          {iframeStatus === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-brand-50/50">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Pop-out Chat Required</h3>
              <p className="text-sm text-slate-500 mb-6">
                This chatbot needs to be opened in a new secure window.
              </p>
              <a
                href={botFlowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors shadow-md hover:shadow-lg"
              >
                Launch Chatbot
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

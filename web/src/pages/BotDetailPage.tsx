import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BotEmbed from '@/components/bots/BotEmbed';
import NotFoundPage from '@/pages/NotFoundPage';
import { assetUrl, getBotBySlug } from '@/lib/api';
import { BRAND, CATEGORIES } from '@/lib/constants';
import { usePageTitle } from '@/lib/usePageTitle';
import type { Bot } from '@/lib/types';

export default function BotDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);

  usePageTitle(bot?.name);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    setLoading(true);
    getBotBySlug(slug)
      .then((found) => {
        if (!cancelled) setBot(found);
      })
      .catch(() => {
        if (!cancelled) setBot(null);
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
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  // A disabled bot is treated as missing, matching the old server behaviour.
  if (!bot || !bot.enabled) {
    return <NotFoundPage />;
  }

  const category = CATEGORIES.find((c) => c.value === bot.category);

  // Full-bleed mode: the background image simulates the bot on a client's site.
  if (bot.backgroundImageUrl || bot.mobileBackgroundImageUrl) {
    const desktopBg = assetUrl(bot.backgroundImageUrl || bot.mobileBackgroundImageUrl);
    const mobileBg = assetUrl(bot.mobileBackgroundImageUrl || bot.backgroundImageUrl);

    return (
      <main
        className="fixed inset-0 w-full min-h-screen bg-cover bg-[position:30%_center] md:bg-center bg-no-repeat overflow-hidden bg-[image:var(--bg-mobile)] md:bg-[image:var(--bg-desktop)]"
        style={
          {
            '--bg-desktop': `url('${desktopBg}')`,
            '--bg-mobile': `url('${mobileBg}')`,
          } as CSSProperties
        }
      >
        <BotEmbed scriptCode={bot.scriptCode} botName={bot.name} />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Bot header */}
        <section className="bg-gradient-to-b from-brand-50/50 to-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100 mb-4">
              <span>{category?.icon}</span>
              {category?.label || bot.category}
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              {bot.name}
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              {bot.description}
            </p>
          </div>
        </section>

        {/* Embedded chatbot area (Widget) */}
        <section className="py-8 sm:py-12 min-h-[50vh]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-400 mb-8">
              Click the chat widget in the bottom right to interact with the bot.
            </p>
            <BotEmbed scriptCode={bot.scriptCode} botName={bot.name} />
          </div>
        </section>

        {/* Support link */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100">
              <p className="text-sm text-slate-500 mb-3">Need help with this chatbot?</p>
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {BRAND.supportEmail}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

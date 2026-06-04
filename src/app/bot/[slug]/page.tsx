import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BotEmbed from '@/components/bots/BotEmbed';
import { getBotBySlug, getEnabledBots } from '@/lib/bots';
import { BRAND, CATEGORIES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bot = await getBotBySlug(slug);

  if (!bot || !bot.enabled) {
    return { title: 'Bot Not Found' };
  }

  return {
    title: bot.name,
    description: bot.description,
    openGraph: {
      title: `${bot.name} | ${BRAND.name}`,
      description: bot.description,
      type: 'website',
    },
  };
}

export default async function BotLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bot = await getBotBySlug(slug);

  if (!bot || !bot.enabled) {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.value === bot.category);

  if (bot.backgroundImageUrl || bot.mobileBackgroundImageUrl) {
    const desktopBg = bot.backgroundImageUrl || bot.mobileBackgroundImageUrl;
    const mobileBg = bot.mobileBackgroundImageUrl || bot.backgroundImageUrl;

    return (
      <main 
        className="fixed inset-0 w-full min-h-screen bg-cover bg-[position:30%_center] md:bg-center bg-no-repeat overflow-hidden bg-[image:var(--bg-mobile)] md:bg-[image:var(--bg-desktop)]"
        style={{ 
          '--bg-desktop': `url('${desktopBg}')`,
          '--bg-mobile': `url('${mobileBg}')`
        } as React.CSSProperties}
      >
        <BotEmbed 
          botFlowUrl={bot.botFlowUrl} 
          botName={bot.name} 
          themeColor={bot.themeColor}
          bubbleIconUrl={bot.bubbleIconUrl}
        />
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Bot header */}
        <section className="bg-gradient-to-b from-brand-50/50 to-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Category badge */}
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
            <BotEmbed 
              botFlowUrl={bot.botFlowUrl} 
              botName={bot.name} 
              themeColor={bot.themeColor}
              bubbleIconUrl={bot.bubbleIconUrl}
            />
          </div>
        </section>

        {/* Support link */}
        <section className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100">
              <p className="text-sm text-slate-500 mb-3">
                Need help with this chatbot?
              </p>
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
    </>
  );
}

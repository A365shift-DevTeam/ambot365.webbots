import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BotCard from '@/components/bots/BotCard';
import { getEnabledBots } from '@/lib/bots';
import { CATEGORIES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Browse Bots',
  description:
    'Explore our collection of AI-powered chatbots. Find the right chatbot for your industry — education, real estate, healthcare, and more.',
};

export const dynamic = 'force-dynamic';

export default async function BotsPage() {
  const bots = await getEnabledBots();

  // Get unique categories from enabled bots
  const activeCategories = [...new Set(bots.map((b) => b.category))];

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Page header */}
        <section className="bg-gradient-to-b from-brand-50/50 to-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Browse <span className="gradient-text">Chatbots</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Choose a chatbot below to start a conversation. Each bot is tailored for a specific industry.
            </p>

            {/* Category pills */}
            {activeCategories.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                {activeCategories.map((cat) => {
                  const info = CATEGORIES.find((c) => c.value === cat);
                  return (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 shadow-sm"
                    >
                      <span>{info?.icon}</span>
                      {info?.label || cat}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Bot grid */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {bots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map((bot) => (
                  <BotCard key={bot.id} bot={bot} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No bots available yet
                </h3>
                <p className="text-sm text-slate-500">
                  Check back soon! New chatbots are being added.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

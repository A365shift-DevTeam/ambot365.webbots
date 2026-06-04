import Link from 'next/link';
import { Bot } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';

interface BotCardProps {
  bot: Bot;
}

export default function BotCard({ bot }: BotCardProps) {
  const category = CATEGORIES.find((c) => c.value === bot.category);

  return (
    <Link
      href={`/bot/${bot.slug}`}
      id={`bot-card-${bot.slug}`}
      className="group block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 overflow-hidden"
    >
      {/* Top gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-brand-400 to-brand-600 opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="p-6">
        {/* Category badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
            <span>{category?.icon}</span>
            {category?.label || bot.category}
          </span>
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-soft" title="Active" />
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-brand-700 transition-colors mb-2">
          {bot.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-5">
          {bot.description}
        </p>

        {/* CTA */}
        <div className="flex items-center text-sm font-medium text-brand-600 group-hover:text-brand-700 gap-1.5">
          Start Chat
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

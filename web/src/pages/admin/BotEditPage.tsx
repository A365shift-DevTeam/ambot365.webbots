import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BotForm from '@/components/bots/BotForm';
import { getBotById } from '@/lib/api';
import { usePageTitle } from '@/lib/usePageTitle';
import type { Bot } from '@/lib/types';

export default function BotEditPage() {
  usePageTitle('Edit Bot');

  const { id } = useParams<{ id: string }>();
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getBotById(id)
      .then((found) => {
        if (cancelled) return;
        if (found) setBot(found);
        else setError('That bot no longer exists.');
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load bot');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="p-6 sm:p-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Edit Bot</h1>
      <p className="text-sm text-slate-500 mb-8">Update this bot&apos;s details or visibility.</p>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}{' '}
          <Link to="/admin" className="font-semibold underline">
            Back to dashboard
          </Link>
        </div>
      )}

      {/* Keyed so the form re-initialises if the id changes. */}
      {bot && <BotForm key={bot.id} bot={bot} mode="edit" />}
    </div>
  );
}

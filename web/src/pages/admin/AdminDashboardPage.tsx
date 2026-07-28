import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DeleteButton from '@/components/admin/DeleteButton';
import { getBots, getWebsites } from '@/lib/api';
import { categoryIcon, categoryLabel } from '@/lib/constants';
import { usePageTitle } from '@/lib/usePageTitle';
import type { Bot, DemoWebsite } from '@/lib/types';

export default function AdminDashboardPage() {
  usePageTitle('Dashboard');

  const [bots, setBots] = useState<Bot[]>([]);
  const [websites, setWebsites] = useState<DemoWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      // Admin view: no `enabled` filter, so disabled entries are visible here.
      const [allBots, allWebsites] = await Promise.all([getBots(), getWebsites()]);
      setBots(allBots);
      setWebsites(allWebsites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="p-6 sm:p-10 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {bots.length} bot{bots.length === 1 ? '' : 's'} · {websites.length} demo site
            {websites.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/add"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-sm transition-all"
          >
            + Add Bot
          </Link>
          <Link
            to="/admin/websites/add"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-brand-300 transition-all"
          >
            + Add Website
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm py-12">Loading…</p>
      ) : (
        <div className="space-y-10">
          <CatalogSection
            title="AI Bots"
            emptyLabel="No bots yet."
            addTo="/admin/add"
            rows={bots.map((bot) => ({
              id: bot.id,
              name: bot.name,
              slug: bot.slug,
              category: categoryIcon(bot.category) + ' ' + categoryLabel(bot.category),
              enabled: bot.enabled,
              editTo: `/admin/edit/${bot.id}`,
              viewTo: `/bot/${bot.slug}`,
              type: 'bot' as const,
            }))}
            onChanged={load}
          />

          <CatalogSection
            title="Demo Websites"
            emptyLabel="No demo websites yet."
            addTo="/admin/websites/add"
            rows={websites.map((site) => ({
              id: site.id,
              name: site.title,
              slug: site.slug,
              category: categoryIcon(site.category) + ' ' + categoryLabel(site.category),
              enabled: site.enabled,
              editTo: `/admin/websites/edit/${site.id}`,
              viewTo: `/website/${site.slug}`,
              type: 'website' as const,
            }))}
            onChanged={load}
          />
        </div>
      )}
    </div>
  );
}

type Row = {
  id: string;
  name: string;
  slug: string;
  category: string;
  enabled: boolean;
  editTo: string;
  viewTo: string;
  type: 'bot' | 'website';
};

function CatalogSection({
  title,
  emptyLabel,
  addTo,
  rows,
  onChanged,
}: {
  title: string;
  emptyLabel: string;
  addTo: string;
  rows: Row[];
  onChanged: () => void;
}) {
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">{title}</h2>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500 mb-3">{emptyLabel}</p>
          <Link to={addTo} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Add the first one →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/60 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 truncate">{row.name}</span>
                  {!row.enabled && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-semibold uppercase tracking-wide">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono truncate">/{row.slug}</p>
              </div>

              <span className="text-xs text-slate-500 hidden sm:block whitespace-nowrap">
                {row.category}
              </span>

              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to={row.viewTo}
                  className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                  title="View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                <Link
                  to={row.editTo}
                  className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
                <DeleteButton id={row.id} name={row.name} type={row.type} onDeleted={onChanged} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

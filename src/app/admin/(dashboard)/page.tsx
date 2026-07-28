import Link from 'next/link';
import { getAllBots } from '@/lib/bots';
import { getAllWebsites } from '@/lib/websites';
import { CATEGORIES } from '@/lib/constants';
import DeleteButton from '@/components/admin/DeleteButton';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Admin Dashboard — AMBOT 365',
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [bots, websites] = await Promise.all([getAllBots(), getAllWebsites()]);

  const activeBots = bots.filter((b) => b.enabled);
  const activeWebsites = websites.filter((w) => w.enabled);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your AI Chatbots and Demo Websites showcase from one central portal.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/admin/websites/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-all"
          >
            <span>🌐 Add Website</span>
          </Link>
          <Link
            href="/admin/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs font-bold shadow-md hover:shadow-lg hover:from-brand-600 hover:to-brand-700 transition-all"
          >
            <span>🤖 Add Bot</span>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              🌐
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{websites.length}</p>
              <p className="text-xs font-medium text-slate-500">Demo Websites ({activeWebsites.length} Active)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
              🤖
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{bots.length}</p>
              <p className="text-xs font-medium text-slate-500">AI Chatbots ({activeBots.length} Active)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{activeWebsites.length + activeBots.length}</p>
              <p className="text-xs font-medium text-slate-500">Total Live Demos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              ⭐
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {websites.filter((w) => w.featured).length}
              </p>
              <p className="text-xs font-medium text-slate-500">Featured Sites</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: DEMO WEBSITES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🌐</span> Manage Demo Websites ({websites.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Website URLs showcased to clients</p>
          </div>
          <Link
            href="/admin/websites/add"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Add Website URL
          </Link>
        </div>

        {websites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Website</th>
                  <th className="px-6 py-3 hidden sm:table-cell">URL</th>
                  <th className="px-6 py-3 hidden md:table-cell">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {websites.map((w) => {
                  const category = CATEGORIES.find((c) => c.value === w.category);
                  return (
                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 flex items-center gap-2">
                            {w.title}
                            {w.featured && (
                              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Featured
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-sm">
                            {w.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell font-mono text-xs text-brand-600">
                        <a href={w.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-xs block">
                          {w.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-xs text-slate-600">
                        <span>{category?.icon} {category?.label || w.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          w.enabled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${w.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                          {w.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/website/${w.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                            title="Interactive View"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/websites/edit/${w.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                            title="Edit Website"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <DeleteButton id={w.id} name={w.title} type="website" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            No demo websites added yet.
          </div>
        )}
      </div>

      {/* SECTION 2: AI CHATBOTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🤖</span> Manage AI Chatbots ({bots.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Embedded chatbot landing pages</p>
          </div>
          <Link
            href="/admin/add"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Add New Bot
          </Link>
        </div>

        {bots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Bot Name</th>
                  <th className="px-6 py-3 hidden sm:table-cell">Slug</th>
                  <th className="px-6 py-3 hidden md:table-cell">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bots.map((bot) => {
                  const category = CATEGORIES.find((c) => c.value === bot.category);
                  return (
                    <tr key={bot.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{bot.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-sm">
                            {bot.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell font-mono text-xs text-brand-600">
                        /bot/{bot.slug}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-xs text-slate-600">
                        <span>{category?.icon} {category?.label || bot.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          bot.enabled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${bot.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                          {bot.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/bot/${bot.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                            title="Preview Bot"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/edit/${bot.id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                            title="Edit Bot"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <DeleteButton id={bot.id} name={bot.name} type="bot" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            No bots added yet.
          </div>
        )}
      </div>
    </div>
  );
}

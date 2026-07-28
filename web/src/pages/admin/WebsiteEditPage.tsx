import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import WebsiteForm from '@/components/websites/WebsiteForm';
import { getWebsiteById } from '@/lib/api';
import { usePageTitle } from '@/lib/usePageTitle';
import type { DemoWebsite } from '@/lib/types';

export default function WebsiteEditPage() {
  usePageTitle('Edit Website');

  const { id } = useParams<{ id: string }>();
  const [website, setWebsite] = useState<DemoWebsite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getWebsiteById(id)
      .then((found) => {
        if (cancelled) return;
        if (found) setWebsite(found);
        else setError('That demo website no longer exists.');
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load website');
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
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Edit Demo Website</h1>
      <p className="text-sm text-slate-500 mb-8">Update this demo site&apos;s details.</p>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}{' '}
          <Link to="/admin" className="font-semibold underline">
            Back to dashboard
          </Link>
        </div>
      )}

      {website && <WebsiteForm key={website.id} website={website} mode="edit" />}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { usePageTitle } from '@/lib/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Not Found');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Page not found</h1>
      <p className="text-slate-500 max-w-md mb-8">
        The page you are looking for doesn&apos;t exist, or the demo has been unpublished.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}

import WebsiteForm from '@/components/websites/WebsiteForm';
import { usePageTitle } from '@/lib/usePageTitle';

export default function WebsiteAddPage() {
  usePageTitle('Add Website');

  return (
    <div className="p-6 sm:p-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Add Demo Website</h1>
      <p className="text-sm text-slate-500 mb-8">
        Add a live client site to the showcase. It loads in a sandboxed iframe.
      </p>
      <WebsiteForm mode="add" />
    </div>
  );
}

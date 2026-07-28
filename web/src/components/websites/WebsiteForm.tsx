import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '@/components/admin/ImageUploader';
import { CATEGORIES } from '@/lib/constants';
import { createWebsite, deleteWebsite, isValidUrl, updateWebsite } from '@/lib/api';
import type { DemoWebsite, WebsiteFormData } from '@/lib/types';

interface WebsiteFormProps {
  website?: DemoWebsite;
  mode: 'add' | 'edit';
}

export default function WebsiteForm({ website, mode }: WebsiteFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<WebsiteFormData>({
    title: website?.title || '',
    description: website?.description || '',
    url: website?.url || '',
    thumbnailUrl: website?.thumbnailUrl || '',
    category: website?.category || 'other',
    tags: website?.tags || [],
  });
  const [tagInput, setTagInput] = useState((website?.tags || []).join(', '));
  const [enabled, setEnabled] = useState(website?.enabled ?? true);
  const [featured, setFeatured] = useState(website?.featured ?? false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // The API and the database both require an absolute http(s) URL, so catch
    // it here rather than surfacing a constraint violation.
    if (!isValidUrl(formData.url)) {
      setError('Please enter a full website URL starting with http:// or https://');
      return;
    }

    setLoading(true);

    const payload: WebsiteFormData = {
      ...formData,
      tags: tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      enabled,
      featured,
    };

    try {
      if (mode === 'add') {
        await createWebsite(payload);
      } else {
        await updateWebsite(website!.id, payload);
      }
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!website || !confirm('Are you sure you want to delete this demo website?')) return;
    setLoading(true);

    try {
      await deleteWebsite(website.id);
      navigate('/admin');
    } catch {
      setError('Failed to delete website');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="website-form">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
          Website Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., Pearl Storefront"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          placeholder="Briefly describe this demo website..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none resize-none"
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
          Live URL *
        </label>
        <input
          type="text"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          required
          placeholder="https://example.com/"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-mono text-sm"
        />
        <p className="mt-2 text-xs text-slate-400">
          Loaded in a sandboxed iframe. Must start with http:// or https://.
        </p>
      </div>

      <ImageUploader
        label="Thumbnail Image"
        value={formData.thumbnailUrl || ''}
        onChange={(url) => setFormData((prev) => ({ ...prev, thumbnailUrl: url }))}
      />

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
          Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none cursor-pointer"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-2">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="storefront, retail, responsive"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
        />
        <p className="mt-2 text-xs text-slate-400">Comma separated.</p>
      </div>

      {/* Visibility and featured toggles */}
      <div className="space-y-3">
        <ToggleRow
          label="Visibility"
          hint={enabled ? 'Visible to the public' : 'Hidden from the public'}
          checked={enabled}
          onChange={setEnabled}
        />
        <ToggleRow
          label="Featured"
          hint={featured ? 'Highlighted on the home page' : 'Not featured'}
          checked={featured}
          onChange={setFeatured}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          id="submit-website-btn"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-brand-600 hover:to-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Saving...' : mode === 'add' ? 'Create Website' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all cursor-pointer"
        >
          Cancel
        </button>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="ml-auto px-6 py-3 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-brand-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, BRAND } from '@/lib/constants';
import { createBot, deleteBot, updateBot, uploadImage } from '@/lib/api';
import type { Bot, BotFormData } from '@/lib/types';

interface BotFormProps {
  bot?: Bot;
  mode: 'add' | 'edit';
}

type ImageField = 'backgroundImageUrl' | 'mobileBackgroundImageUrl';

export default function BotForm({ bot, mode }: BotFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState<ImageField | null>(null);
  const [formData, setFormData] = useState<BotFormData>({
    name: bot?.name || '',
    description: bot?.description || '',
    scriptCode: bot?.scriptCode || '',
    backgroundImageUrl: bot?.backgroundImageUrl || '',
    mobileBackgroundImageUrl: bot?.mobileBackgroundImageUrl || '',
    category: bot?.category || 'other',
  });
  const [enabled, setEnabled] = useState(bot?.enabled ?? true);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, field: ImageField) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(field);
    setError('');

    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.scriptCode.trim()) {
      setError('Please enter the bot script code');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'add') {
        await createBot(formData);
      } else {
        await updateBot(bot!.id, { ...formData, enabled });
      }
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bot || !confirm('Are you sure you want to delete this bot?')) return;
    setLoading(true);

    try {
      await deleteBot(bot.id);
      navigate('/admin');
    } catch {
      setError('Failed to delete bot');
      setLoading(false);
    }
  };

  const slug = formData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="bot-form">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Bot Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          Bot Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., School Admission Bot"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
        />
        {slug && (
          <p className="mt-2 text-xs text-slate-400">
            URL: <span className="font-mono text-brand-600">{BRAND.domain}/bot/{slug}</span>
          </p>
        )}
      </div>

      {/* Description */}
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
          placeholder="Briefly describe what this bot does..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none resize-none"
        />
      </div>

      {/* Bot Script Code */}
      <div>
        <label htmlFor="scriptCode" className="block text-sm font-medium text-slate-700 mb-2">
          Bot Script Code *
        </label>
        <textarea
          id="scriptCode"
          name="scriptCode"
          value={formData.scriptCode}
          onChange={handleChange}
          required
          rows={4}
          placeholder='<script id="messenger-widget-b" src="https://cdn.example.com/bot.js" defer>your-bot-id</script>'
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-mono text-sm resize-none"
        />
        <p className="mt-2 text-xs text-slate-400">
          Paste the full &lt;script&gt; tag provided by your chatbot platform.
        </p>
      </div>

      {/* Background Image URL */}
      <div>
        <label htmlFor="backgroundImageUrl" className="block text-sm font-medium text-slate-700 mb-2">
          Website Background Image URL (Optional)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            id="backgroundImageUrl"
            name="backgroundImageUrl"
            value={formData.backgroundImageUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/screenshot.png or upload a file"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-mono text-sm"
          />
          <label className="flex items-center justify-center px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors border border-slate-200 whitespace-nowrap">
            {uploadingImage === 'backgroundImageUrl' ? 'Uploading...' : 'Upload File'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/avif"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'backgroundImageUrl')}
              disabled={uploadingImage !== null}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Paste a link to an image of the client&apos;s website. If provided, it will be used as a
          full-screen background to simulate the bot on their site.
        </p>
      </div>

      {/* Mobile Background Image URL */}
      <div>
        <label
          htmlFor="mobileBackgroundImageUrl"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Mobile Background Image URL (Optional)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            id="mobileBackgroundImageUrl"
            name="mobileBackgroundImageUrl"
            value={formData.mobileBackgroundImageUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/mobile-screenshot.png or upload a file"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-mono text-sm"
          />
          <label className="flex items-center justify-center px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors border border-slate-200 whitespace-nowrap">
            {uploadingImage === 'mobileBackgroundImageUrl' ? 'Uploading...' : 'Upload File'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/avif"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'mobileBackgroundImageUrl')}
              disabled={uploadingImage !== null}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Upload a portrait version of the background specifically for mobile screens. If left blank,
          the desktop background will be used on mobile.
        </p>
      </div>

      {/* Category */}
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

      {/* Enable/Disable toggle (edit mode only) */}
      {mode === 'edit' && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-700">Bot Status</p>
            <p className="text-xs text-slate-400">
              {enabled ? 'This bot is visible to the public' : 'This bot is hidden from the public'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${
              enabled ? 'bg-brand-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          id="submit-bot-btn"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-brand-600 hover:to-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Saving...' : mode === 'add' ? 'Create Bot' : 'Save Changes'}
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

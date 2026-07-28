'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  id: string;
  name: string;
  type: 'website' | 'bot';
}

export default function DeleteButton({ id, name, type }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setLoading(true);
    try {
      const endpoint = type === 'website' ? `/api/websites/${id}` : `/api/bots/${id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const json = await res.json();

      if (json.success) {
        router.refresh();
      } else {
        alert(json.error || `Failed to delete ${type}`);
      }
    } catch {
      alert(`An error occurred while deleting ${type}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50"
      title={`Delete ${type === 'website' ? 'Website' : 'Bot'}`}
      aria-label={`Delete ${name}`}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  );
}

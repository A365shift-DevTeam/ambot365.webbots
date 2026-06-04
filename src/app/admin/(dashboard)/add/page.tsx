import { Metadata } from 'next';
import BotForm from '@/components/bots/BotForm';

export const metadata: Metadata = {
  title: 'Add New Bot',
};

export default function AddBotPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Add New Bot</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create a new chatbot landing page
        </p>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <BotForm mode="add" />
      </div>
    </div>
  );
}

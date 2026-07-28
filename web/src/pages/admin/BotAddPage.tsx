import BotForm from '@/components/bots/BotForm';
import { usePageTitle } from '@/lib/usePageTitle';

export default function BotAddPage() {
  usePageTitle('Add Bot');

  return (
    <div className="p-6 sm:p-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Add Bot</h1>
      <p className="text-sm text-slate-500 mb-8">
        Paste your chatbot platform&apos;s embed script to publish a new bot.
      </p>
      <BotForm mode="add" />
    </div>
  );
}

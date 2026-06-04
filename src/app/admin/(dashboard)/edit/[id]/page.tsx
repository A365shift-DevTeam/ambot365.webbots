import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BotForm from '@/components/bots/BotForm';
import { getBotById } from '@/lib/bots';

export const metadata: Metadata = {
  title: 'Edit Bot',
};

export const dynamic = 'force-dynamic';

export default async function EditBotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bot = await getBotById(id);

  if (!bot) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Bot</h1>
        <p className="text-sm text-slate-500 mt-1">
          Modify &quot;{bot.name}&quot; settings
        </p>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <BotForm mode="edit" bot={bot} />
      </div>
    </div>
  );
}

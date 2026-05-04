// =====================================================================
// app/admin/board-setup/page.tsx
// Server Component — fetches associations, passes to client
// =====================================================================

import { supabaseAdmin } from '@/lib/supabase-admin';
import BoardSetupClient from './BoardSetupClient';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Board Setup — PMI Top Florida' };

async function getAssociations() {
  const { data, error } = await supabaseAdmin
    .from('associations')
    .select('association_code, association_name')
    .order('association_name');

  if (error) {
    console.error('[board-setup/page] fetch error', error);
    return [];
  }
  return data ?? [];
}

export default async function BoardSetupPage() {
  const associations = await getAssociations();

  return (
    <main className="min-h-screen bg-white p-6">
      <header className="mb-6 border-l-4 border-[#f26a1b] pl-4">
        <h1 className="text-3xl font-bold text-[#0d0d0d]">Board Setup</h1>
        <p className="text-gray-600 mt-1">
          Configure board members, required signatures, and approval letter templates per association.
        </p>
      </header>

      <BoardSetupClient associations={associations} />
    </main>
  );
}

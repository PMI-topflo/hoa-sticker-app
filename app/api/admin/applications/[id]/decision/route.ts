// =====================================================================
// app/api/admin/applications/[id]/decision/route.ts
//
// PATCH — update board decision for an application and optionally
// send a notification email to the primary applicant.
// =====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

type Decision = 'approved' | 'rejected' | 'pending';

interface Body {
  decision: Decision;
  notes?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: Body = await req.json();
  const { decision, notes } = body;

  if (!['approved', 'rejected', 'pending'].includes(decision)) {
    return NextResponse.json({ ok: false, error: 'Invalid decision value' }, { status: 400 });
  }

  // 1. Update the application row
  const { data: updated, error } = await supabaseAdmin
    .from('applications')
    .update({
      board_decision: decision,
      board_decided_at: new Date().toISOString(),
      board_notes: notes ?? null,
    })
    .eq('id', id)
    .select('association, applicants, app_type, entity_name')
    .single();

  if (error) {
    console.error('[decision/PATCH] supabase error', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // 2. Send email for approved / rejected decisions
  if (decision === 'approved' || decision === 'rejected') {
    const applicants = (updated?.applicants ?? []) as Array<{
      firstName?: string;
      lastName?: string;
      email?: string;
    }>;
    const association = updated?.association ?? 'the community';
    const primaryEmail = applicants[0]?.email;

    if (primaryEmail) {
      const firstName = applicants[0]?.firstName ?? 'Applicant';
      const subject =
        decision === 'approved'
          ? `Your application for ${association} has been approved`
          : `Application update — ${association}`;

      const html =
        decision === 'approved'
          ? `<p>Dear ${firstName},</p><p>Your application for <strong>${association}</strong> has been approved. Welcome to the community.</p><p>PMI Top Florida Properties</p>`
          : `<p>Dear ${firstName},</p><p>Your application for <strong>${association}</strong> has been reviewed. Unfortunately the board has decided not to proceed at this time.</p><p>PMI Top Florida Properties</p>`;

      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: primaryEmail, subject, html }),
        });
      } catch (emailErr) {
        // Log but don't fail the request — decision was already saved
        console.error('[decision/PATCH] email send error', emailErr);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

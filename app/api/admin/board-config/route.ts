// =====================================================================
// app/api/admin/board-config/route.ts
// GET   ?code=XXX → return required_signatures + approval_letter_template
// PATCH           → upsert board config into association_config
// =====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('association_config')
    .select('required_signatures, approval_letter_template')
    .eq('association_code', code)
    .maybeSingle();

  if (error) {
    console.error('[board-config/GET]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    required_signatures: data?.required_signatures ?? 1,
    approval_letter_template: data?.approval_letter_template ?? null,
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { association_code, required_signatures, approval_letter_template } = body;

  if (!association_code) {
    return NextResponse.json({ ok: false, error: 'Missing association_code' }, { status: 400 });
  }

  const patch: Record<string, unknown> = { association_code };
  if (required_signatures !== undefined) patch.required_signatures = required_signatures;
  if (approval_letter_template !== undefined) patch.approval_letter_template = approval_letter_template;

  const { error } = await supabaseAdmin
    .from('association_config')
    .upsert(patch, { onConflict: 'association_code' });

  if (error) {
    console.error('[board-config/PATCH]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

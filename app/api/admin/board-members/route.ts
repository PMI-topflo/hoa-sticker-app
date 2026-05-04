// =====================================================================
// app/api/admin/board-members/route.ts
// GET  ?code=XXX  → list board members for association
// POST            → insert new board member
// =====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('association_board_members')
    .select('*')
    .eq('association_code', code)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[board-members/GET]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, members: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { association_code, name, email, role, sort_order } = body;

  if (!association_code || !name || !email) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('association_board_members')
    .insert({
      association_code,
      name,
      email,
      role: role ?? null,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('[board-members/POST]', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, member: data });
}

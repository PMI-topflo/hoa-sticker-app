import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, phone } = await req.json()

  if (!email && !phone) {
    return NextResponse.json({ found: false, reason: 'missing_fields' })
  }

  const digits = (phone ?? '').replace(/\D/g, '').slice(-10)
  const inFirst = (firstName ?? '').toLowerCase().trim()
  const inLast  = (lastName  ?? '').toLowerCase().trim()

  // ── Staff check (silent — only personal_email / personal_phone) ───────────
  const emailConds = email
    ? `email.ilike.%${email}%,personal_email.ilike.%${email}%`
    : null
  const phoneConds = digits.length >= 7
    ? `phone.ilike.%${digits}%,personal_phone.ilike.%${digits}%`
    : null
  const orClause = [emailConds, phoneConds].filter(Boolean).join(',')

  if (orClause) {
    const { data: staff } = await supabaseAdmin
      .from('pmi_staff')
      .select('id')
      .eq('active', true)
      .or(orClause)
      .limit(1)
      .single()

    if (staff?.id) {
      return NextResponse.json({ found: true, staff: true })
    }
  }

  // ── Name soft-validator ───────────────────────────────────────────────────
  // Returns false only when a provided name (≥3 chars) has zero overlap with DB.
  function nameMatches(row: { first_name?: string | null; last_name?: string | null }): boolean {
    if (!inFirst && !inLast) return true
    const dbFull = `${row.first_name ?? ''} ${row.last_name ?? ''}`.toLowerCase().trim()
    if (inFirst.length >= 3 && !dbFull.includes(inFirst) && !inFirst.startsWith(dbFull.split(' ')[0])) {
      return false
    }
    if (inLast.length >= 3 && !dbFull.includes(inLast)) {
      return false
    }
    return true
  }

  // ── Search owners by email ────────────────────────────────────────────────
  if (email) {
    const { data: rows } = await supabaseAdmin
      .from('owners')
      .select('id, association_code, first_name, last_name')
      .ilike('emails', `%${email}%`)
      .limit(5)

    const match = rows?.find(nameMatches)
    if (match?.association_code) {
      return NextResponse.json({
        found: true,
        owner_id: match.id,
        association_code: match.association_code,
      })
    }
  }

  // ── Search owners by phone ────────────────────────────────────────────────
  if (digits.length >= 7) {
    const { data: rows } = await supabaseAdmin
      .from('owners')
      .select('id, association_code, first_name, last_name')
      .or(
        `phone.ilike.%${digits}%,phone_e164.ilike.%${digits}%,phone_2.ilike.%${digits}%,phone_3.ilike.%${digits}%`
      )
      .limit(5)

    const match = rows?.find(nameMatches)
    if (match?.association_code) {
      return NextResponse.json({
        found: true,
        owner_id: match.id,
        association_code: match.association_code,
      })
    }
  }

  return NextResponse.json({ found: false })
}

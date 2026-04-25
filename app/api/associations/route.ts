import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('associations')
    .select('association_code, association_name, principal_address, city, state, zip')
    .eq('active', true)
    .order('association_name')

  if (error) {
    console.error('[associations]', error)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { session_id, member_name } = await req.json()

  if (!session_id || !member_name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  await supabase
    .from('presences')
    .upsert({ session_id, member_name }, { onConflict: 'session_id,member_name' })

  return NextResponse.json({ success: true })
}

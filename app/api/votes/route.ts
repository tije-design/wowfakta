import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { session_id, voter_name, fact_id } = await req.json()

  if (!session_id || !voter_name || !fact_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // pastikan session dalam fase voting
  const { data: session } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', session_id)
    .single()

  if (!session || session.status !== 'voting') {
    return NextResponse.json({ error: 'Session tidak dalam fase voting' }, { status: 400 })
  }

  // pastikan voter sudah submit fakta
  const { data: voterFact } = await supabase
    .from('facts')
    .select('id')
    .eq('session_id', session_id)
    .eq('member_name', voter_name)
    .single()

  if (!voterFact) {
    return NextResponse.json({ error: 'Hanya yang submit fakta yang bisa vote' }, { status: 403 })
  }

  // pastikan tidak vote fakta sendiri
  const { data: targetFact } = await supabase
    .from('facts')
    .select('member_name')
    .eq('id', fact_id)
    .single()

  if (!targetFact) {
    return NextResponse.json({ error: 'Fakta tidak ditemukan' }, { status: 404 })
  }

  if (targetFact.member_name === voter_name) {
    return NextResponse.json({ error: 'Tidak bisa vote fakta sendiri' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('votes')
    .upsert({ session_id, voter_name, fact_id }, { onConflict: 'session_id,voter_name' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ vote: data })
}

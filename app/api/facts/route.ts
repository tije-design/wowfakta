import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { MAX_FACT_LENGTH } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { session_id, member_name, content } = await req.json()

  if (!session_id || !member_name || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (content.length > MAX_FACT_LENGTH) {
    return NextResponse.json({ error: `Max ${MAX_FACT_LENGTH} karakter` }, { status: 400 })
  }

  // pastikan session masih dalam fase submission
  const { data: session } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', session_id)
    .single()

  if (!session || session.status !== 'submission') {
    return NextResponse.json({ error: 'Session tidak dalam fase submission' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('facts')
    .insert({ session_id, member_name, content: content.trim() })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Kamu sudah submit fakta hari ini' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ fact: data })
}

export async function DELETE(req: NextRequest) {
  const { session_id, member_name } = await req.json()

  if (!session_id || !member_name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // hanya bisa cancel kalau masih fase submission
  const { data: session } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', session_id)
    .single()

  if (!session || session.status !== 'submission') {
    return NextResponse.json({ error: 'Tidak bisa cancel setelah voting dimulai' }, { status: 400 })
  }

  const { error } = await supabase
    .from('facts')
    .delete()
    .eq('session_id', session_id)
    .eq('member_name', member_name)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

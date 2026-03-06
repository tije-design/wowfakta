import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ADMIN } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { session_id, action, requester } = await req.json()

  if (requester !== ADMIN) {
    return NextResponse.json({ error: 'Hanya admin yang bisa melakukan ini' }, { status: 403 })
  }

  if (!session_id || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', session_id)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session tidak ditemukan' }, { status: 404 })
  }

  if (action === 'start_voting') {
    if (session.status !== 'submission') {
      return NextResponse.json({ error: 'Session tidak dalam fase submission' }, { status: 400 })
    }

    // pastikan minimal ada 2 fakta sebelum mulai voting
    const { count } = await supabase
      .from('facts')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id)

    if (!count || count < 2) {
      return NextResponse.json({ error: 'Minimal 2 fakta sebelum mulai voting' }, { status: 400 })
    }

    const { error } = await supabase
      .from('sessions')
      .update({ status: 'voting' })
      .eq('id', session_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, status: 'voting' })
  }

  if (action === 'end_voting') {
    if (session.status !== 'voting') {
      return NextResponse.json({ error: 'Session tidak dalam fase voting' }, { status: 400 })
    }

    const { error } = await supabase
      .from('sessions')
      .update({ status: 'completed' })
      .eq('id', session_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, status: 'completed' })
  }

  if (action === 'reset') {
    // Hapus semua votes sesi ini
    await supabase.from('votes').delete().eq('session_id', session_id)
    // Hapus semua facts sesi ini
    await supabase.from('facts').delete().eq('session_id', session_id)
    // Reset status ke submission
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'submission' })
      .eq('id', session_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, status: 'submission' })
  }

  return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: ambil atau buat session hari ini
export async function GET(req: NextRequest) {
  const voter = req.nextUrl.searchParams.get('voter') ?? ''
  const today = new Date().toISOString().split('T')[0]

  let { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('date', today)
    .single()

  if (error && error.code === 'PGRST116') {
    // belum ada, buat baru
    const { data: newSession, error: createError } = await supabase
      .from('sessions')
      .insert({ date: today, status: 'submission' })
      .select()
      .single()

    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })
    session = newSession
  } else if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // ambil facts untuk session ini
  const { data: rawFacts } = await supabase
    .from('facts')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })

  // Saat voting: sembunyikan member_name kecuali untuk fact milik voter sendiri
  const facts = (rawFacts || []).map(f => {
    if (session.status === 'voting' && f.member_name !== voter) {
      return { ...f, member_name: '' }
    }
    return f
  })

  // ambil votes untuk session ini
  const { data: votes } = await supabase
    .from('votes')
    .select('*')
    .eq('session_id', session.id)

  // ambil presences untuk session ini
  const { data: presences } = await supabase
    .from('presences')
    .select('member_name')
    .eq('session_id', session.id)

  return NextResponse.json({ session, facts, votes: votes || [], presences: presences || [] })
}

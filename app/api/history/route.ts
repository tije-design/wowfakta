import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'completed')
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ history: [] })
  }

  const sessionIds = sessions.map(s => s.id)

  const { data: facts } = await supabase
    .from('facts')
    .select('*')
    .in('session_id', sessionIds)

  const { data: votes } = await supabase
    .from('votes')
    .select('*')
    .in('session_id', sessionIds)

  const history = sessions.map(session => {
    const sessionFacts = (facts || []).filter(f => f.session_id === session.id)
    const sessionVotes = (votes || []).filter(v => v.session_id === session.id)

    const factsWithVotes = sessionFacts.map(fact => ({
      ...fact,
      vote_count: sessionVotes.filter(v => v.fact_id === fact.id).length,
    })).sort((a, b) => b.vote_count - a.vote_count)

    return { session, facts: factsWithVotes }
  })

  return NextResponse.json({ history })
}

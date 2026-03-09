import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { MEMBERS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Compute wins per member from completed sessions
  const winsMap = new Map<string, number>()
  const { data: completedSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('status', 'completed')

  if (completedSessions && completedSessions.length > 0) {
    const sessionIds = completedSessions.map(s => s.id)

    const [{ data: allFacts }, { data: allVotes }] = await Promise.all([
      supabase.from('facts').select('id, session_id, member_name').in('session_id', sessionIds),
      supabase.from('votes').select('fact_id, session_id').in('session_id', sessionIds),
    ])

    for (const session of completedSessions) {
      const sessionFacts = (allFacts || []).filter(f => f.session_id === session.id)
      const sessionVotes = (allVotes || []).filter(v => v.session_id === session.id)

      const sorted = sessionFacts
        .map(f => ({ name: f.member_name, votes: sessionVotes.filter(v => v.fact_id === f.id).length }))
        .sort((a, b) => b.votes - a.votes)

      if (sorted[0]?.votes > 0) {
        const winner = sorted[0].name
        winsMap.set(winner, (winsMap.get(winner) ?? 0) + 1)
      }
    }
  }

  const leaderboard = MEMBERS.map(name => {
    const entry = data?.find(d => d.member_name === name)
    return {
      member_name: name,
      total_points: entry?.total_points ?? 0,
      sessions_participated: entry?.sessions_participated ?? 0,
      wins: winsMap.get(name) ?? 0,
    }
  }).sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points
    if (b.wins !== a.wins) return b.wins - a.wins
    if (b.sessions_participated !== a.sessions_participated) return b.sessions_participated - a.sessions_participated
    return a.member_name.localeCompare(b.member_name)
  })

  return NextResponse.json({ leaderboard })
}

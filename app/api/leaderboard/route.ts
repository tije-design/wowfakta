import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { MEMBERS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // pastikan semua member muncul, bahkan yang belum punya poin
  const leaderboard = MEMBERS.map(name => {
    const entry = data?.find(d => d.member_name === name)
    return {
      member_name: name,
      total_points: entry?.total_points ?? 0,
      sessions_participated: entry?.sessions_participated ?? 0,
    }
  }).sort((a, b) => b.total_points - a.total_points)

  return NextResponse.json({ leaderboard })
}

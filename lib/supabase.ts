import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type SessionStatus = 'submission' | 'voting' | 'completed'

export type Session = {
  id: string
  date: string
  status: SessionStatus
  created_at: string
}

export type Fact = {
  id: string
  session_id: string
  member_name: string
  content: string
  created_at: string
}

export type Vote = {
  id: string
  session_id: string
  voter_name: string
  fact_id: string
  created_at: string
}

export type LeaderboardEntry = {
  member_name: string
  total_points: number
  sessions_participated: number
  wins: number
}

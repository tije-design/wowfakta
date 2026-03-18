'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Member, MEMBERS } from '@/lib/constants'
import { Session, Fact, Vote, LeaderboardEntry } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import NamePicker from '@/components/NamePicker'
import SubmissionPhase from '@/components/SubmissionPhase'
import VotingPhase from '@/components/VotingPhase'
import ResultPhase from '@/components/ResultPhase'

type SessionData = {
  session: Session
  facts: Fact[]
  votes: Vote[]
  presences: { member_name: string }[]
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const currentUserRef = useRef<Member | null>(null)

  const fetchSession = useCallback(async () => {
    const voter = currentUserRef.current ?? ''
    const params = voter ? `?voter=${encodeURIComponent(voter)}` : ''
    const res = await fetch(`/api/session${params}`)
    const data = await res.json()
    if (!res.ok) {
      console.error(data.error)
      return
    }
    setSessionData(data)
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    const res = await fetch('/api/leaderboard')
    const data = await res.json()
    if (res.ok) setLeaderboard(data.leaderboard)
  }, [])

  useEffect(() => {
    const savedName = localStorage.getItem('factboard_name') as Member | null
    if (savedName && MEMBERS.includes(savedName)) {
      setCurrentUser(savedName)
      currentUserRef.current = savedName
    }
    Promise.all([fetchSession(), fetchLeaderboard()]).finally(() => setLoading(false))
  }, [fetchSession, fetchLeaderboard])

  // Realtime: DB changes (sessions, facts, votes, presences)
  useEffect(() => {
    const channel = supabase
      .channel('factboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => fetchSession())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'facts' }, () => fetchSession())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => fetchSession())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presences' }, () => fetchSession())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchSession])

  // Polling fallback — jika Supabase Realtime lambat di prod
  useEffect(() => {
    const interval = setInterval(() => fetchSession(), 8000)
    return () => clearInterval(interval)
  }, [fetchSession])

  // Sync ref agar fetchSession selalu tahu voter terkini
  useEffect(() => { currentUserRef.current = currentUser }, [currentUser])

  // Daftarkan presence ke DB setiap kali user + session tersedia
  useEffect(() => {
    if (!currentUser || !sessionData?.session.id) return
    fetch('/api/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionData.session.id, member_name: currentUser }),
    })
  }, [currentUser, sessionData?.session.id])

  const handleSelectName = (name: Member) => {
    localStorage.setItem('factboard_name', name)
    currentUserRef.current = name
    setCurrentUser(name)
  }

  const handleLogout = () => {
    localStorage.removeItem('factboard_name')
    setCurrentUser(null)
  }

  const handleSubmitFact = async (content: string) => {
    if (!sessionData || !currentUser) return
    const res = await fetch('/api/facts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionData.session.id, member_name: currentUser, content }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await fetchSession()
  }

  const handleCancelFact = async () => {
    if (!sessionData || !currentUser) return
    const res = await fetch('/api/facts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionData.session.id, member_name: currentUser }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await fetchSession()
  }

  const handleStartVoting = async () => {
    if (!sessionData || !currentUser) return
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionData.session.id, action: 'start_voting', requester: currentUser }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await fetchSession()
  }

  const handleVote = async (factId: string) => {
    if (!sessionData || !currentUser) return
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionData.session.id, voter_name: currentUser, fact_id: factId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await fetchSession()
  }

  const handleEndVoting = async () => {
    if (!sessionData || !currentUser) return
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionData.session.id, action: 'end_voting', requester: currentUser }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await Promise.all([fetchSession(), fetchLeaderboard()])
  }

  const handleReset = async () => {
    if (!sessionData || !currentUser) return
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionData.session.id, action: 'reset', requester: currentUser }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    await Promise.all([fetchSession(), fetchLeaderboard()])
  }

  if (loading) {
    return (
      <div className="menti-bg min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.1) rgba(255,255,255,0.1) rgba(255,255,255,0.1) #60a5fa' }} />
      </div>
    )
  }

  // Nama yang sudah hadir (dari DB presences) — untuk disable di NamePicker
  const dbPresentNames = sessionData?.presences.map(p => p.member_name) ?? []

  if (!currentUser) {
    return <NamePicker onSelect={handleSelectName} presentNames={dbPresentNames} />
  }

  if (!sessionData) {
    return (
      <div className="menti-bg min-h-screen flex items-center justify-center text-white/40">
        Gagal memuat session
      </div>
    )
  }

  const { session, facts, votes } = sessionData
  const myFact = facts.find(f => f.member_name === currentUser) || null
  const myVote = votes.find(v => v.voter_name === currentUser) || null

  // Union: current user (selalu) + DB presences + submitted facts
  const presences = [...new Set([
    currentUser,
    ...sessionData.presences.map(p => p.member_name),
    ...facts.map(f => f.member_name),
  ])].map(name => ({ member_name: name }))

  if (session.status === 'submission') {
    return (
      <SubmissionPhase
        session={session}
        currentUser={currentUser}
        myFact={myFact}
        allFacts={facts}
        presences={presences}
        onSubmit={handleSubmitFact}
        onCancelFact={handleCancelFact}
        onStartVoting={handleStartVoting}
        onReset={handleReset}
        onLogout={handleLogout}
      />
    )
  }

  if (session.status === 'voting') {
    return (
      <VotingPhase
        currentUser={currentUser}
        facts={facts}
        myFact={myFact}
        myVote={myVote}
        votes={votes}
        presences={presences}
        onVote={handleVote}
        onEndVoting={handleEndVoting}
        onReset={handleReset}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <ResultPhase
      currentUser={currentUser}
      facts={facts}
      votes={votes}
      leaderboard={leaderboard}
      onReset={handleReset}
      onLogout={handleLogout}
    />
  )
}

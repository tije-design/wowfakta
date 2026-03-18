'use client'

import { useEffect, useState, useCallback } from 'react'
import { MEMBERS } from '@/lib/constants'
import { LeaderboardEntry } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import TopBar from '@/components/TopBar'
import RacingLeaderboard from '@/components/RacingLeaderboard'

type SessionData = {
  session: { id: string; status: string; date: string }
  facts: { id: string; member_name: string; content: string }[]
  votes: { id: string; voter_name: string; fact_id: string }[]
  presences: { member_name: string }[]
  submitters?: string[]
}

const BAR_COLORS = ['#0846A1','#2563eb','#db2777','#d97706','#059669','#0655BA','#ec4899']

const TILE_COLORS = [
  { tint: 'rgba(99,102,241,0.18)',  border: 'rgba(99,102,241,0.4)'  },
  { tint: 'rgba(20,184,166,0.18)',  border: 'rgba(20,184,166,0.4)'  },
  { tint: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.38)' },
  { tint: 'rgba(168,85,247,0.18)',  border: 'rgba(168,85,247,0.4)'  },
  { tint: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.38)'  },
  { tint: 'rgba(251,113,133,0.15)', border: 'rgba(251,113,133,0.38)'},
  { tint: 'rgba(56,189,248,0.15)',  border: 'rgba(56,189,248,0.38)' },
]

export default function SpectatorPage() {
  const [data, setData] = useState<SessionData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [sessionRes, lbRes] = await Promise.all([
      fetch('/api/session?spectator=true'),
      fetch('/api/leaderboard'),
    ])
    if (!sessionRes.ok) return
    const json = await sessionRes.json()
    setData(json)
    setLoading(false)
    if (lbRes.ok) {
      const lbJson = await lbRes.json()
      setLeaderboard(lbJson.leaderboard ?? [])
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="menti-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.1) rgba(255,255,255,0.1) rgba(255,255,255,0.1) #60a5fa' }} />
      </div>
    )
  }

  if (!data) return null

  const { session, facts, votes, presences, submitters } = data
  // submitters: unmasked list of who submitted (from API when ?spectator=true)
  const submittedNames = new Set(submitters ?? facts.map(f => f.member_name).filter(Boolean))
  const votedNames = new Set(votes.map(v => v.voter_name))
  const presentNames = new Set([
    ...presences.map(p => p.member_name),
    ...(submitters ?? facts.map(f => f.member_name).filter(Boolean)),
  ])

  const STAGE_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
    submission: { label: 'Fase Submission',  color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
    voting:     { label: 'Fase Voting',      color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
    completed:  { label: 'Selesai',          color: '#86efac', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'   },
  }
  const stage = STAGE_LABELS[session.status] ?? { label: session.status, color: '#fff', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)' }
  const formattedDate = new Date(session.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="menti-bg min-h-screen text-white flex flex-col">

      <TopBar spectatorMode />

      {/* Date + Stage bar */}
      <div className="flex items-center gap-3 px-10 pb-4">
        <span className="text-white/40 text-sm font-semibold">{formattedDate}</span>
        <span className="text-white/15">·</span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ color: stage.color, background: stage.bg, border: `1px solid ${stage.border}` }}
        >
          {stage.label}
        </span>
      </div>

      <div className="flex-1 px-10 pb-10">

        {/* ── SUBMISSION PHASE ── */}
        {session.status === 'submission' && (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <h1 className="text-3xl font-black text-white mb-2 text-center">Siapa yang sudah submit?</h1>
            <p className="text-white/35 text-sm mb-12">
              {submittedNames.size} dari {MEMBERS.length} orang sudah submit fakta
            </p>

            <div className="grid grid-cols-7 gap-8 mb-10">
              {MEMBERS.map(name => {
                const submitted = submittedNames.has(name)
                return (
                  <div key={name} className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div style={{ opacity: submitted ? 1 : 0.25, transition: 'opacity 0.4s' }}>
                        <Avatar name={name} size={80} rounded="rounded-2xl" />
                      </div>
                      {submitted && (
                        <div
                          className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black"
                          style={{ background: '#22c55e', boxShadow: '0 0 0 3px #020b16' }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                    <span
                      className="text-sm font-bold text-center"
                      style={{ color: submitted ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)' }}
                    >
                      {name}
                    </span>
                    <span className="text-xs" style={{ color: submitted ? '#86efac' : 'rgba(255,255,255,0.15)' }}>
                      {submitted ? 'Sudah ✓' : 'Belum...'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round((submittedNames.size / MEMBERS.length) * 100)}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/30 text-xs">{submittedNames.size} submit</span>
                <span className="text-white/30 text-xs">{MEMBERS.length} total</span>
              </div>
            </div>
          </div>
        )}

        {/* ── VOTING PHASE ── */}
        {session.status === 'voting' && (
          <div className="flex gap-10 min-h-[70vh]">

            {/* Left: who voted */}
            <div className="w-64 flex-shrink-0">
              <h2 className="text-base font-black text-white mb-1">Status Voting</h2>
              <p className="text-white/35 text-xs mb-6">
                {votedNames.size} / {presentNames.size} sudah vote
              </p>

              <div className="flex flex-col gap-4 mb-6">
                {MEMBERS.filter(n => presentNames.has(n)).map(name => {
                  const voted = votedNames.has(name)
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <div style={{ opacity: voted ? 1 : 0.3, transition: 'opacity 0.4s' }}>
                        <Avatar name={name} size={40} rounded="rounded-xl" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: voted ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)' }}>
                          {name}
                        </div>
                        <div className="text-xs" style={{ color: voted ? '#86efac' : 'rgba(255,255,255,0.2)' }}>
                          {voted ? 'Sudah vote ✓' : 'Belum...'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: presentNames.size > 0 ? `${Math.round((votedNames.size / presentNames.size) * 100)}%` : '0%',
                    background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                  }}
                />
              </div>
            </div>

            {/* Right: anonymous fact tiles */}
            <div className="flex-1">
              <h2 className="text-base font-black text-white mb-1">Fakta Hari Ini</h2>
              <p className="text-white/35 text-xs mb-6">Identitas disembunyikan selama voting</p>

              <div className="grid grid-cols-3 gap-4">
                {facts.map((fact, i) => {
                  const color = TILE_COLORS[i % TILE_COLORS.length]
                  return (
                    <div
                      key={fact.id}
                      className="rounded-2xl p-5"
                      style={{
                        background: color.tint,
                        border: `1px solid ${color.border}`,
                        minHeight: 140,
                      }}
                    >
                      <div
                        className="text-[10px] font-black uppercase tracking-widest mb-3 px-2 py-0.5 rounded w-fit"
                        style={{ background: color.border, color: 'rgba(255,255,255,0.7)' }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <p className="text-white/85 text-sm font-semibold leading-snug">
                        {fact.content}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULT PHASE ── */}
        {session.status === 'completed' && (() => {
          const sorted = [...facts]
            .map(f => ({ ...f, voteCount: votes.filter(v => v.fact_id === f.id).length }))
            .sort((a, b) => b.voteCount - a.voteCount)
          const winner = sorted[0]
          const maxVotes = Math.max(...sorted.map(f => f.voteCount), 1)

          return (
            <div className="flex gap-12 min-h-[70vh] items-start">

              {/* Left: winner spotlight */}
              <div className="flex-shrink-0 w-80 flex flex-col items-center pt-4">

                {/* Confetti */}
                <div className="relative w-full flex justify-center" style={{ height: 0 }}>
                  {[...Array(14)].map((_, i) => (
                    <div key={`cf${i}`} className="absolute pointer-events-none" style={{
                      width: i % 2 === 0 ? 7 : 5,
                      height: i % 2 === 0 ? 7 : 11,
                      borderRadius: i % 3 === 0 ? '50%' : '2px',
                      background: ['#fbbf24','#f87171','#60a5fa','#34d399','#c084fc','#fb923c'][i % 6],
                      left: `${4 + i * 6.5}%`,
                      top: 0,
                      animation: `confetti-fall ${1.1 + (i % 4) * 0.35}s ease-in ${i * 0.18}s infinite`,
                    }} />
                  ))}
                </div>

                {/* Crown */}
                <div className="text-4xl animate-crown mb-2 select-none">👑</div>

                {/* Orbit */}
                <div className="relative flex items-center justify-center mb-5" style={{ width: 140, height: 140 }}>
                  <div className="absolute inset-0 rounded-full animate-spin-cw pointer-events-none"
                    style={{ border: '1.5px dashed rgba(251,191,36,0.35)' }} />
                  {(['⭐','✨','💫','🌟'] as const).map((em, i) => (
                    <div key={em} className="absolute inset-0 pointer-events-none"
                      style={{ animation: `spin-cw ${4 + i * 0.8}s linear infinite`, animationDelay: `${i * -1.1}s` }}>
                      <span className="absolute text-lg select-none" style={{ top: -14, left: '50%', transform: 'translateX(-50%)' }}>{em}</span>
                    </div>
                  ))}
                  <div className="relative z-10 animate-winner-glow animate-winner-enter rounded-full overflow-hidden" style={{ width: 80, height: 80 }}>
                    {winner && <Avatar name={winner.member_name} size={80} rounded="rounded-full" />}
                  </div>
                </div>

                <p className="text-white/40 text-[11px] font-bold tracking-widest uppercase mb-1">Pemenang hari ini</p>
                {winner && (
                  <>
                    <h2 className="text-2xl font-black text-white mb-3">{winner.member_name}</h2>
                    <div className="px-4 py-1.5 rounded-full text-sm font-bold mb-5"
                      style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
                      🏆 {winner.voteCount} vote{winner.voteCount !== 1 ? 's' : ''}
                    </div>
                    {/* Winner fact card */}
                    <div className="rounded-2xl p-5 w-full text-center"
                      style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                      <p className="text-white/85 text-sm font-semibold leading-snug">&ldquo;{winner.content}&rdquo;</p>
                    </div>
                  </>
                )}
              </div>

              {/* Right: bar chart + leaderboard */}
              <div className="flex-1 pt-4 flex flex-col gap-8">

                {/* Bar chart */}
                <div>
                  <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-5">Hasil Hari Ini</p>
                  <div className="space-y-4">
                    {sorted.map((fact, i) => {
                      const pct = maxVotes > 0 ? (fact.voteCount / maxVotes) * 100 : 0
                      const isTop = i === 0 && fact.voteCount > 0
                      const memberIdx = MEMBERS.indexOf(fact.member_name as typeof MEMBERS[number])
                      const barColor = BAR_COLORS[memberIdx % BAR_COLORS.length]

                      return (
                        <div key={fact.id} className="animate-slide-up" style={{ animationDelay: `${0.1 + i * 0.07}s`, opacity: 0 }}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Avatar name={fact.member_name} size={22} rounded="rounded-md" />
                            <span className="text-sm font-semibold text-white/80">{fact.member_name}</span>
                            {isTop && <span className="text-xs ml-1">🏆</span>}
                            <span className="text-white/60 font-bold text-sm ml-auto">{fact.voteCount}</span>
                          </div>
                          <div className="h-10 rounded-xl overflow-hidden relative"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="h-full rounded-xl animate-bar-grow"
                              style={{
                                width: `${Math.max(pct, 2)}%`,
                                background: isTop ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : `${barColor}99`,
                                minWidth: fact.voteCount > 0 ? '2rem' : '0',
                                animationDelay: `${0.15 + i * 0.08}s`,
                              }} />
                            <p className="absolute inset-0 flex items-center px-4 text-xs text-white/40 leading-tight">
                              {fact.content}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Leaderboard global */}
                {leaderboard.length > 0 && (
                  <RacingLeaderboard
                    leaderboard={leaderboard}
                    todayPoints={Object.fromEntries(
                      sorted.filter(f => f.voteCount > 0).map(f => [f.member_name, f.voteCount])
                    )}
                  />
                )}
              </div>
            </div>
          )
        })()}

      </div>

      {/* Footer */}
      <div className="flex items-center justify-center pb-4 gap-2">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
        <span className="text-white/20 text-[10px]">Live · refresh setiap 5 detik</span>
      </div>
    </div>
  )
}

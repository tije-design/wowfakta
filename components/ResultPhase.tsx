'use client'

import { useState, useEffect } from 'react'
import { Fact, Vote, LeaderboardEntry } from '@/lib/supabase'
import { Member, MEMBERS, ADMIN } from '@/lib/constants'
import Avatar from '@/components/Avatar'
import RacingLeaderboard from '@/components/RacingLeaderboard'
import TopBar from '@/components/TopBar'
import ResetConfirmModal from '@/components/ResetConfirmModal'

type FactWithVotes = Fact & { vote_count: number }

type AiEvaluation = {
  member_name: string
  interest_score: number
  accuracy: 'Tinggi' | 'Sedang' | 'Rendah'
  comment: string
}

type AiResult = {
  evaluations: AiEvaluation[]
  winner: {
    member_name: string
    reason: string
  }
}

type Props = {
  currentUser: Member
  facts: Fact[]
  votes: Vote[]
  leaderboard: LeaderboardEntry[]
  onReset: () => Promise<void>
  onLogout: () => void
}

const BAR_COLORS = ['#0846A1','#2563eb','#db2777','#d97706','#059669','#0655BA','#ec4899']

const ACCURACY_COLOR: Record<string, string> = {
  Tinggi: '#4ade80',
  Sedang: '#fbbf24',
  Rendah: '#f87171',
}

export default function ResultPhase({ currentUser, facts, votes, leaderboard, onReset, onLogout }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [aiLoading, setAiLoading] = useState(true)
  const [selectedFact, setSelectedFact] = useState<FactWithVotes | null>(null)

  const isAdmin = currentUser === ADMIN

  const factsWithVotes: FactWithVotes[] = facts
    .map(fact => ({ ...fact, vote_count: votes.filter(v => v.fact_id === fact.id).length }))
    .sort((a, b) => b.vote_count - a.vote_count)

  const myVote = votes.find(v => v.voter_name === currentUser)
  const votedFact = myVote ? facts.find(f => f.id === myVote.fact_id) : null
  const maxVotes = Math.max(...factsWithVotes.map(f => f.vote_count), 1)
  const winner = factsWithVotes[0]
  const isWinner = winner?.member_name === currentUser && winner.vote_count > 0


  return (
    <div className="menti-bg min-h-screen text-white flex flex-col">

      <TopBar currentUser={currentUser} onLogout={onLogout} />

      <div className="flex-1 flex flex-col px-5 pb-8 max-w-lg mx-auto w-full">

        {/* Hero — Winner Spotlight */}
        {winner && winner.vote_count > 0 ? (
          <div className="relative flex flex-col items-center pt-4 pb-5 animate-slide-up overflow-hidden">

            {/* Confetti rain */}
            {[...Array(14)].map((_, i) => (
              <div
                key={`cf${i}`}
                className="absolute pointer-events-none"
                style={{
                  width:  i % 2 === 0 ? 7 : 5,
                  height: i % 2 === 0 ? 7 : 11,
                  borderRadius: i % 3 === 0 ? '50%' : '2px',
                  background: ['#fbbf24','#f87171','#60a5fa','#34d399','#c084fc','#fb923c'][i % 6],
                  left: `${4 + i * 7}%`,
                  top: 0,
                  animation: `confetti-fall ${1.1 + (i % 4) * 0.35}s ease-in ${i * 0.18}s infinite`,
                }}
              />
            ))}

            {/* Crown */}
            <div className="text-4xl animate-crown mb-1 z-10 select-none">👑</div>

            {/* Orbit area */}
            <div className="relative flex items-center justify-center mb-4" style={{ width: 168, height: 168 }}>

              {/* Dashed ring — clockwise */}
              <div className="absolute inset-0 rounded-full animate-spin-cw"
                style={{ border: '1.5px dashed rgba(251,191,36,0.35)' }} />

              {/* Orbiting emojis — each in its own rotating wrapper */}
              {(['⭐','✨','💫','🌟'] as const).map((em, i) => (
                <div
                  key={em}
                  className="absolute inset-0"
                  style={{ animation: `spin-cw ${4 + i * 0.8}s linear infinite`, animationDelay: `${i * -1.1}s` }}
                >
                  <span className="absolute text-lg select-none" style={{ top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                    {em}
                  </span>
                </div>
              ))}

              {/* Avatar */}
              <div className="relative z-10 animate-winner-glow animate-winner-enter rounded-full overflow-hidden"
                style={{ width: 86, height: 86 }}>
                <Avatar name={winner.member_name} size={86} rounded="rounded-full" />
              </div>
            </div>

            {/* Name */}
            {isWinner ? (
              <>
                <h2 className="text-3xl font-black gradient-text mb-1">Kamu menang!</h2>
                <p className="text-white/40 text-sm mb-3">Faktamu paling disukai hari ini 🎊</p>
              </>
            ) : (
              <>
                <p className="text-white/40 text-[11px] font-bold tracking-widest uppercase mb-1">Pemenang hari ini</p>
                <h2 className="text-2xl font-black text-white mb-1">{winner.member_name}</h2>
                {votedFact && <p className="text-white/35 text-xs mb-3">Kamu vote fakta milik {votedFact.member_name}</p>}
              </>
            )}

            {/* Vote badge */}
            <div className="px-4 py-1.5 rounded-full text-sm font-bold" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
              🏆 {winner.vote_count} vote{winner.vote_count !== 1 ? 's' : ''}
            </div>
          </div>
        ) : (
          <div className="text-center pt-5 pb-7 animate-slide-up">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-3xl font-black text-white mb-2">Hasil voting!</h2>
            <p className="text-white/50 text-sm">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        )}

        {/* Results — bar chart */}
        <div className="glass-card rounded-xl p-5 mb-5 animate-slide-up" style={{ animationDelay: '0.07s', opacity: 0 }}>
          <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-4">Hasil Hari Ini</p>

          <div className="space-y-4">
            {factsWithVotes.map((fact, i) => {
              const pct = maxVotes > 0 ? (fact.vote_count / maxVotes) * 100 : 0
              const isTop = i === 0 && fact.vote_count > 0
              const isMe = fact.member_name === currentUser
              const fMemberIdx = MEMBERS.indexOf(fact.member_name as typeof MEMBERS[number])
              const barColor = BAR_COLORS[fMemberIdx % BAR_COLORS.length]

              return (
                <div key={fact.id} className="animate-slide-up" style={{ animationDelay: `${0.1 + i * 0.07}s`, opacity: 0 }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Avatar name={fact.member_name} size={20} rounded="rounded-md" />
                    <span className={`text-sm font-semibold ${isMe ? 'text-white' : 'text-white/80'}`}>
                      {fact.member_name}
                      {isMe && <span className="text-white/30 font-normal ml-1.5 text-xs">· kamu</span>}
                    </span>
                    {isTop && <span className="text-xs ml-auto">🏆</span>}
                    <span className="text-white/60 font-bold text-sm ml-auto">{fact.vote_count}</span>
                  </div>

                  {/* Bar */}
                  <div
                    className="h-8 rounded-xl overflow-hidden relative cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                    onClick={() => setSelectedFact(fact)}
                  >
                    <div
                      className="h-full rounded-xl animate-bar-grow"
                      style={{
                        width: `${Math.max(pct, 4)}%`,
                        background: isTop
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : `${barColor}99`,
                        minWidth: fact.vote_count > 0 ? '2rem' : '0',
                        animationDelay: `${0.15 + i * 0.08}s`,
                      }}
                    />
                    <p className="absolute inset-0 flex items-center px-3 text-xs text-white/30">
                      Lihat fakta →
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Racing leaderboard */}
        <RacingLeaderboard
          leaderboard={leaderboard}
          currentUser={currentUser}
          todayPoints={Object.fromEntries(factsWithVotes.filter(f => f.vote_count > 0).map(f => [f.member_name, f.vote_count]))}
        />

        {/* Admin panel */}
        {isAdmin && (
          <div className="mt-5 rounded-xl p-5 animate-slide-up" style={{ animationDelay: '0.7s', opacity: 0, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 text-sm">⚡</span>
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Panel Admin</span>
            </div>
            <p className="text-white/30 text-xs mb-4">Mulai sesi baru untuk hari berikutnya</p>
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{ color: 'rgba(248,113,113,0.6)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              🗑️ Reset data hari ini
            </button>
          </div>
        )}

      </div>

      {confirmReset && (
        <ResetConfirmModal
          onConfirm={async () => { await onReset(); setConfirmReset(false) }}
          onCancel={() => setConfirmReset(false)}
        />
      )}

      {selectedFact && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-5"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSelectedFact(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl p-5 animate-slide-up"
            style={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <Avatar name={selectedFact.member_name} size={22} rounded="rounded-md" />
              <span className="text-white font-bold text-sm">{selectedFact.member_name}</span>
              <span className="text-white/30 text-xs ml-auto">{selectedFact.vote_count} vote</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4">&ldquo;{selectedFact.content}&rdquo;</p>
            <button
              onClick={() => setSelectedFact(null)}
              className="w-full py-2.5 rounded-lg text-sm text-white/40 font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

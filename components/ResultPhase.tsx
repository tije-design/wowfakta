'use client'

import { useState } from 'react'
import { Fact, Vote, LeaderboardEntry } from '@/lib/supabase'
import { Member, MEMBERS, ADMIN } from '@/lib/constants'
import Avatar from '@/components/Avatar'
import RacingLeaderboard from '@/components/RacingLeaderboard'
import TopBar from '@/components/TopBar'
import ResetConfirmModal from '@/components/ResetConfirmModal'

type FactWithVotes = Fact & { vote_count: number }

type Props = {
  currentUser: Member
  facts: Fact[]
  votes: Vote[]
  leaderboard: LeaderboardEntry[]
  onReset: () => Promise<void>
  onLogout: () => void
}

const BAR_COLORS = ['#0846A1','#2563eb','#db2777','#d97706','#059669','#0655BA','#ec4899']

export default function ResultPhase({ currentUser, facts, votes, leaderboard, onReset, onLogout }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)

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

        {/* Hero */}
        <div className="text-center pt-5 pb-7 animate-slide-up">
          <div className="text-5xl mb-3 animate-float">
            {isWinner ? '🏆' : '🎉'}
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            {isWinner ? 'Kamu menang!' : 'Hasil voting!'}
          </h2>
          <p className="text-white/50 text-sm">
            {isWinner
              ? 'Faktamu yang paling menarik hari ini 🎊'
              : votedFact
              ? `Kamu vote fakta milik ${votedFact.member_name}`
              : new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Results — bar chart */}
        <div className="glass-card rounded-3xl p-5 mb-5 animate-slide-up" style={{ animationDelay: '0.07s', opacity: 0 }}>
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
                  <div className="h-8 rounded-xl overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-xl animate-bar-grow flex items-center px-3"
                      style={{
                        width: `${Math.max(pct, 4)}%`,
                        background: isTop
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : `${barColor}99`,
                        minWidth: fact.vote_count > 0 ? '2rem' : '0',
                        animationDelay: `${0.15 + i * 0.08}s`,
                      }}
                    />
                    <p className="absolute inset-0 flex items-center px-3 text-xs text-white/50 truncate">
                      {fact.content}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Racing leaderboard */}
        <RacingLeaderboard leaderboard={leaderboard} currentUser={currentUser} />

        {/* Admin panel */}
        {isAdmin && (
          <div className="mt-5 rounded-3xl p-5 animate-slide-up" style={{ animationDelay: '0.7s', opacity: 0, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 text-sm">⚡</span>
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Panel Admin</span>
            </div>
            <p className="text-white/30 text-xs mb-4">Mulai sesi baru untuk hari berikutnya</p>
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-colors"
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
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { LeaderboardEntry } from '@/lib/supabase'
import { Member } from '@/lib/constants'
import Avatar from '@/components/Avatar'
import Link from 'next/link'

type Props = {
  leaderboard: LeaderboardEntry[]
  currentUser: Member
}

const RANK_EMOJI = ['🥇', '🥈', '🥉']

export default function RacingLeaderboard({ leaderboard, currentUser }: Props) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120)
    return () => clearTimeout(t)
  }, [])

  const maxPts = leaderboard[0]?.total_points || 1

  // Simpan rank asli (by points) sebelum sort
  const rankMap = new Map(leaderboard.map((e, i) => [e.member_name, i]))

  // Sort alphabetically untuk display
  const sorted = [...leaderboard].sort((a, b) =>
    a.member_name.localeCompare(b.member_name)
  )

  return (
    <div className="glass-card rounded-xl p-5 animate-slide-up" style={{ animationDelay: '0.5s', opacity: 0 }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-white/50 text-xs font-bold tracking-widest uppercase">🏁 Leaderboard</p>
        <Link href="/history" className="text-white/30 text-xs hover:text-white/60 transition-colors">
          History →
        </Link>
      </div>

      {/* Racing track lanes */}
      <div className="space-y-2.5">
        {sorted.map((entry, i) => {
          const isMe = entry.member_name === currentUser
          const rank = rankMap.get(entry.member_name) ?? i
          const isLeader = rank === 0 && entry.total_points > 0
          const pct = maxPts > 0 ? (entry.total_points / maxPts) * 100 : 0
          const carPct = entry.total_points > 0 ? Math.min(pct * 0.84, 84) : 0
          const medal = rank < 3 ? RANK_EMOJI[rank] : null

          return (
            <div
              key={entry.member_name}
              className="animate-slide-up"
              style={{ animationDelay: `${0.55 + i * 0.06}s`, opacity: 0 }}
            >
              <div className="flex items-center gap-2">

                {/* Medal (only top 3, else empty space) */}
                <div className="w-5 flex-shrink-0 text-center">
                  {medal && <span className="text-sm">{medal}</span>}
                </div>

                {/* Name */}
                <span className={`text-xs font-bold w-12 flex-shrink-0 truncate ${isMe ? 'text-white' : 'text-white/55'}`}>
                  {entry.member_name}
                </span>

                {/* Track */}
                <div
                  className="flex-1 relative rounded-xl overflow-hidden"
                  style={{
                    height: 36,
                    background: isMe ? 'rgba(8,70,161,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isMe ? 'rgba(8,70,161,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  {/* Road dashes */}
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className="w-full"
                      style={{
                        borderTop: '1px dashed rgba(255,255,255,0.08)',
                        marginLeft: 8,
                        marginRight: 28,
                      }}
                    />
                  </div>

                  {/* Start line */}
                  <div
                    className="absolute top-0 bottom-0 left-0 w-1.5"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  />

                  {/* Finish line — checkered */}
                  <div
                    className="absolute top-0 right-0 bottom-0 w-6 flex flex-col overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {[0,1,2,3].map(row => (
                      <div key={row} className="flex flex-1">
                        {[0,1].map(col => (
                          <div
                            key={col}
                            className="flex-1"
                            style={{
                              background: (row + col) % 2 === 0
                                ? 'rgba(255,255,255,0.18)'
                                : 'transparent'
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Car (avatar) */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 z-10"
                    style={{
                      left: animated
                        ? (entry.total_points === 0 ? '4px' : `calc(${carPct}% - 14px)`)
                        : '-28px',
                      transition: `left ${0.75 + i * 0.08}s cubic-bezier(0.34, 1.3, 0.64, 1)`,
                      transitionDelay: `${0.15 + i * 0.07}s`,
                    }}
                  >
                    <div className="relative">
                      <Avatar
                        name={entry.member_name}
                        size={28}
                        rounded="rounded-full"
                        className={isLeader ? 'ring-2 ring-yellow-400/70' : isMe ? 'ring-2 ring-blue-500/50' : ''}
                      />
                      {isLeader && (
                        <span
                          className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs leading-none"
                          style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.8))' }}
                        >
                          👑
                        </span>
                      )}
                      {entry.total_points > 0 && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 right-full mr-0.5"
                          style={{
                            width: Math.min(carPct * 0.3, 20),
                            height: 2,
                            background: `linear-gradient(to left, ${isLeader ? 'rgba(251,191,36,0.4)' : 'rgba(96,165,250,0.3)'}, transparent)`,
                            borderRadius: 2,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Points */}
                <span
                  className={`text-xs font-black w-10 text-right flex-shrink-0 tabular-nums ${
                    rank < 3 && entry.total_points > 0 ? 'text-white' : 'text-white/25'
                  }`}
                >
                  {entry.total_points}
                  <span className="text-white/20 font-normal"> p</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

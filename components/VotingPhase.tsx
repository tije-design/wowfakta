'use client'

import { useState } from 'react'
import { Member, ADMIN } from '@/lib/constants'
import { Fact, Vote } from '@/lib/supabase'
import TopBar from '@/components/TopBar'
import ResetConfirmModal from '@/components/ResetConfirmModal'
import Avatar from '@/components/Avatar'

type Props = {
  currentUser: Member
  facts: Fact[]
  myFact: Fact | null
  myVote: Vote | null
  votes: Vote[]
  presences: { member_name: string }[]
  onVote: (factId: string) => Promise<void>
  onEndVoting: () => Promise<void>
  onReset: () => Promise<void>
  onLogout: () => void
}

const TILE_COLORS = [
  { tint: 'rgba(99,102,241,0.18)',  border: 'rgba(99,102,241,0.35)',  glow: 'rgba(99,102,241,0.5)',   label: 'rgba(165,180,252,0.9)'  },
  { tint: 'rgba(20,184,166,0.18)',  border: 'rgba(20,184,166,0.35)',  glow: 'rgba(20,184,166,0.5)',   label: 'rgba(94,234,212,0.9)'   },
  { tint: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.32)',  glow: 'rgba(245,158,11,0.45)',  label: 'rgba(253,211,77,0.9)'   },
  { tint: 'rgba(168,85,247,0.18)',  border: 'rgba(168,85,247,0.35)',  glow: 'rgba(168,85,247,0.5)',   label: 'rgba(216,180,254,0.9)'  },
  { tint: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.32)',   glow: 'rgba(34,197,94,0.45)',   label: 'rgba(134,239,172,0.9)'  },
  { tint: 'rgba(251,113,133,0.15)', border: 'rgba(251,113,133,0.32)', glow: 'rgba(251,113,133,0.45)', label: 'rgba(253,164,175,0.9)'  },
  { tint: 'rgba(56,189,248,0.15)',  border: 'rgba(56,189,248,0.32)',  glow: 'rgba(56,189,248,0.45)',  label: 'rgba(125,211,252,0.9)'  },
]

const TILE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

export default function VotingPhase({ currentUser, facts, myFact, myVote, votes, presences, onVote, onEndVoting, onReset, onLogout }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const isAdmin = currentUser === ADMIN
  const canVote = !!myFact
  const allSorted = [...facts].sort((a, b) => a.id.localeCompare(b.id))
  const votedNames = new Set(votes.map(v => v.voter_name))
  const participantNames = presences.map(p => p.member_name)
  const votePct = participantNames.length > 0 ? Math.round((votedNames.size / participantNames.length) * 100) : 0
  const otherFacts = allSorted.filter(f => f.id !== myFact?.id)

  const handleVote = async (factId: string) => {
    if (!canVote || loading) return
    if (myVote?.fact_id === factId) return
    setLoading(factId)
    setError('')
    try { await onVote(factId) }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Terjadi kesalahan') }
    finally { setLoading(null) }
  }

  const handleEndVoting = async () => {
    setAdminLoading(true)
    try { await onEndVoting() }
    finally { setAdminLoading(false) }
  }

  return (
    <div className="menti-bg min-h-screen text-white flex flex-col">

      <TopBar currentUser={currentUser} onLogout={onLogout} />

      <div className="flex-1 flex flex-col px-5 pb-6 max-w-lg mx-auto w-full">

        {/* Hero */}
        <div className="text-center pt-4 pb-4 animate-slide-up">
          {myVote ? (
            <>
              <div className="text-3xl mb-1.5">✅</div>
              <h2 className="text-lg font-black text-white mb-0.5">Vote terkirim!</h2>
              <p className="text-white/40 text-xs">Tap sticky note lain untuk ganti vote</p>
            </>
          ) : !myFact ? (
            <>
              <div className="text-3xl mb-1.5">👀</div>
              <h2 className="text-lg font-black text-white mb-0.5">Kamu tidak submit hari ini</h2>
              <p className="text-white/40 text-xs">Hanya yang submit yang bisa vote</p>
            </>
          ) : (
            <>
              <div className="text-3xl mb-1.5">🗳️</div>
              <h2 className="text-lg font-black text-white mb-0.5">Pilih yang terbaik!</h2>
              <p className="text-white/40 text-xs">Tap sticky note untuk vote · Bisa ganti2</p>
            </>
          )}
        </div>

        {/* Voting progress card */}
        {participantNames.length > 0 && (
          <div className="glass-card rounded-lg p-4 mb-4 animate-slide-up" style={{ animationDelay: '0.04s', opacity: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">Voting</span>
              <span className="text-white/80 text-xs font-bold">
                {votedNames.size} vote · {participantNames.length} hadir
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mb-3">
              {participantNames.map(name => {
                const voted = votedNames.has(name)
                return (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <div style={{ opacity: voted ? 1 : 0.35, transition: 'opacity 0.3s' }}>
                        <Avatar name={name as Member} size={38} rounded="rounded-xl" />
                      </div>
                      {voted && (
                        <div
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                          style={{ background: '#22c55e', boxShadow: '0 0 0 2px #020b16' }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-semibold max-w-[40px] truncate text-center"
                      style={{ color: voted ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}
                    >
                      {name}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${votePct}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
              />
            </div>
          </div>
        )}

        {/* Own fact card */}
        {myFact && (
          <div className="mb-5 animate-slide-up" style={{ animationDelay: '0.06s', opacity: 0 }}>
            <p className="text-[10px] font-bold text-white/25 tracking-widest uppercase mb-2 ml-1">Fakta kamu</p>
            <div
              className="rounded-lg px-4 py-4 flex items-start gap-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-base mt-0.5">🔒</span>
              <p className="text-white/70 text-sm leading-relaxed">&ldquo;{myFact.content}&rdquo;</p>
            </div>
          </div>
        )}

        {/* Section title */}
        {otherFacts.length > 0 && (
          <div className="mb-4 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <p className="text-base font-black text-white mb-0.5">
              {myFact ? '🗳️ Pilih favoritmu' : '📋 Fakta hari ini'}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {myFact ? 'Tap tile untuk vote · Bisa ganti kapan saja' : 'Kamu tidak submit, tidak bisa vote'}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl px-4 py-2.5 mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Kahoot-style tile grid — other facts only */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {otherFacts.map((fact, i) => {
            const isVoted = myVote?.fact_id === fact.id
            const isOther = !!myVote && !isVoted
            const isLoadingThis = loading === fact.id
            const clickable = canVote && !loading
            const color = TILE_COLORS[i % TILE_COLORS.length]
            const label = TILE_LABELS[i % TILE_LABELS.length]

            return (
              <button
                key={fact.id}
                disabled={!!loading}
                onClick={() => handleVote(fact.id)}
                className="relative text-left animate-slide-up"
                style={{
                  animationDelay: `${0.14 + i * 0.07}s`,
                  opacity: 0,
                  transition: 'transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease',
                  cursor: clickable ? 'pointer' : 'default',
                }}
                onMouseEnter={e => {
                  if (clickable && !isVoted && !isOther) {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (clickable && !isVoted && !isOther) {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                  }
                }}
              >
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: color.tint,
                    border: `1px solid ${isVoted ? color.glow : color.border}`,
                    minHeight: 130,
                    padding: '14px 14px 14px',
                    position: 'relative',
                    opacity: isOther ? 0.25 : 1,
                    boxShadow: isVoted
                      ? `0 0 16px ${color.glow}, 0 4px 16px rgba(0,0,0,0.3)`
                      : '0 2px 8px rgba(0,0,0,0.2)',
                    transform: isVoted ? 'scale(1.04)' : 'scale(1)',
                    transition: 'opacity 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  {/* Label badge top-left */}
                  <div
                    className="text-xs font-black mb-2 w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: color.border, color: color.label, fontSize: 10 }}
                  >
                    {label}
                  </div>

                  {/* Fact text */}
                  <p
                    className="text-sm leading-snug font-semibold"
                    style={{ color: 'rgba(255,255,255,0.88)', wordBreak: 'break-word' }}
                  >
                    {fact.content}
                  </p>

                  {/* Selected checkmark badge */}
                  {isVoted && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 22,
                        height: 22,
                        background: color.border,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 900,
                        color: '#fff',
                      }}
                    >
                      ✓
                    </div>
                  )}

                  {/* Loading spinner */}
                  {isLoadingThis && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.25)',
                        borderRadius: 'inherit',
                      }}
                    >
                      <div className="w-5 h-5 border-2 rounded-full animate-spin"
                        style={{ borderColor: 'rgba(255,255,255,0.2) rgba(255,255,255,0.2) rgba(255,255,255,0.2) #fff' }}
                      />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Admin panel */}
        {isAdmin && (
          <div className="rounded-xl p-5 animate-slide-up" style={{ animationDelay: '0.5s', opacity: 0, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 text-sm">⚡</span>
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Panel Admin</span>
            </div>
            <p className="text-white/30 text-xs mb-4">Tutup voting untuk reveal hasil</p>
            <button
              onClick={handleEndVoting}
              disabled={adminLoading}
              className="w-full py-3.5 rounded-lg font-black text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#1a1035' }}
            >
              {adminLoading ? 'Menutup...' : '🏁 Selesai Voting'}
            </button>

            <div style={{ height: 1, background: 'rgba(245,158,11,0.15)', margin: '14px 0' }} />

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
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Member, ADMIN } from '@/lib/constants'
import { Fact, Vote } from '@/lib/supabase'
import TopBar from '@/components/TopBar'
import ResetConfirmModal from '@/components/ResetConfirmModal'

type Props = {
  currentUser: Member
  facts: Fact[]
  myFact: Fact | null
  myVote: Vote | null
  onVote: (factId: string) => Promise<void>
  onEndVoting: () => Promise<void>
  onReset: () => Promise<void>
  onLogout: () => void
}

const STICKY_COLORS = [
  { bg: '#fef08a', text: '#713f12', shadow: 'rgba(161,100,15,0.25)', tape: 'rgba(255,255,255,0.55)' },
  { bg: '#fda4af', text: '#881337', shadow: 'rgba(136,19,55,0.2)',  tape: 'rgba(255,255,255,0.55)' },
  { bg: '#86efac', text: '#14532d', shadow: 'rgba(20,83,45,0.2)',   tape: 'rgba(255,255,255,0.55)' },
  { bg: '#93c5fd', text: '#1e3a8a', shadow: 'rgba(30,58,138,0.2)',  tape: 'rgba(255,255,255,0.55)' },
  { bg: '#fdba74', text: '#7c2d12', shadow: 'rgba(124,45,18,0.2)',  tape: 'rgba(255,255,255,0.55)' },
  { bg: '#d8b4fe', text: '#581c87', shadow: 'rgba(88,28,135,0.2)',  tape: 'rgba(255,255,255,0.55)' },
  { bg: '#67e8f9', text: '#164e63', shadow: 'rgba(22,78,99,0.2)',   tape: 'rgba(255,255,255,0.55)' },
]

const ROTATIONS = [-2.2, 1.8, -1.2, 2.4, -1.8, 1.2, -2.8]

export default function VotingPhase({ currentUser, facts, myFact, myVote, onVote, onEndVoting, onReset, onLogout }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const isAdmin = currentUser === ADMIN
  const canVote = !!myFact
  const allSorted = [...facts].sort((a, b) => a.id.localeCompare(b.id))
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

        {/* Divider */}
        {otherFacts.length > 0 && (
          <div className="flex items-center gap-3 mb-5 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-white/25 text-[10px] tracking-widest uppercase font-semibold">
              {myFact ? 'Pilih favoritmu' : 'Fakta hari ini'}
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
        )}

        {error && (
          <div className="rounded-xl px-4 py-2.5 mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Sticky note grid — other facts only */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {otherFacts.map((fact, i) => {
            const isVoted = myVote?.fact_id === fact.id
            const isLoadingThis = loading === fact.id
            const clickable = canVote && !loading
            const color = STICKY_COLORS[i % STICKY_COLORS.length]
            const rot = ROTATIONS[i % ROTATIONS.length]

            return (
              <button
                key={fact.id}
                disabled={!!loading}
                onClick={() => handleVote(fact.id)}
                className="relative text-left animate-slide-up"
                style={{
                  animationDelay: `${0.14 + i * 0.07}s`,
                  opacity: 0,
                  transform: isVoted
                    ? `rotate(${rot * 0.4}deg) scale(1.04)`
                    : `rotate(${rot}deg)`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease',
                  cursor: clickable ? 'pointer' : 'default',
                  filter: isLoadingThis ? 'brightness(0.85)' : 'none',
                }}
                onMouseEnter={e => {
                  if (clickable && !isVoted) {
                    (e.currentTarget as HTMLElement).style.transform = `rotate(${rot * 0.5}deg) scale(1.06)`
                    ;(e.currentTarget as HTMLElement).style.zIndex = '10'
                  }
                }}
                onMouseLeave={e => {
                  if (clickable && !isVoted) {
                    (e.currentTarget as HTMLElement).style.transform = `rotate(${rot}deg) scale(1)`
                    ;(e.currentTarget as HTMLElement).style.zIndex = '1'
                  }
                }}
              >
                {/* Sticky note body */}
                <div
                  className="rounded-sm"
                  style={{
                    background: color.bg,
                    boxShadow: isVoted
                      ? `0 8px 24px ${color.shadow}, 0 2px 6px rgba(0,0,0,0.15), inset 0 0 0 2.5px rgba(0,0,0,0.12)`
                      : `0 4px 12px ${color.shadow}, 0 1px 4px rgba(0,0,0,0.1)`,
                    minHeight: 130,
                    padding: '28px 12px 14px',
                    position: 'relative',
                  }}
                >
                  {/* Tape strip */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 40,
                      height: 16,
                      background: color.tape,
                      borderRadius: 3,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }}
                  />

                  {/* Selected checkmark */}
                  {isVoted && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        background: 'rgba(0,0,0,0.15)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
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
                        background: 'rgba(255,255,255,0.3)',
                        borderRadius: 'inherit',
                      }}
                    >
                      <div
                        className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: `${color.text} transparent transparent transparent` }}
                      />
                    </div>
                  )}

                  {/* Fact text */}
                  <p
                    className="text-sm leading-snug font-semibold mb-3"
                    style={{ color: color.text, wordBreak: 'break-word' }}
                  >
                    {fact.content}
                  </p>

                  {/* Footer */}
                  {isVoted && (
                    <div className="flex items-center mt-auto">
                      <span className="text-xs font-black ml-auto" style={{ color: color.text }}>Pilihanmu ✓</span>
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

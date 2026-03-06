'use client'

import { useState } from 'react'
import { Member, ADMIN, MAX_FACT_LENGTH } from '@/lib/constants'
import { Session, Fact } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import TopBar from '@/components/TopBar'
import ResetConfirmModal from '@/components/ResetConfirmModal'

type Props = {
  session: Session
  currentUser: Member
  myFact: Fact | null
  allFacts: Fact[]
  presences: { member_name: string }[]
  onSubmit: (content: string) => Promise<void>
  onCancelFact: () => Promise<void>
  onStartVoting: () => Promise<void>
  onReset: () => Promise<void>
  onLogout: () => void
}

export default function SubmissionPhase({
  session: _session,
  currentUser,
  myFact,
  allFacts,
  presences,
  onSubmit,
  onCancelFact,
  onStartVoting,
  onReset,
  onLogout,
}: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError('')
    try {
      await onSubmit(content.trim())
      setContent('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelFact = async () => {
    setCancelLoading(true)
    try {
      await onCancelFact()
      setConfirmCancel(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal membatalkan')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleStartVoting = async () => {
    setAdminLoading(true)
    try { await onStartVoting() }
    finally { setAdminLoading(false) }
  }

  const remaining = MAX_FACT_LENGTH - content.length
  const isAdmin = currentUser === ADMIN

  const submittedNames = new Set(allFacts.map(f => f.member_name))
  // Hadir = dari Realtime Presence (dikelola page.tsx). Union dengan facts agar tetap muncul jika disconnect.
  const presentNames = [...new Set([
    ...presences.map(p => p.member_name),
    ...allFacts.map(f => f.member_name),
  ])]
  const submitPct = presentNames.length > 0 ? Math.round((submittedNames.size / presentNames.length) * 100) : 0

  return (
    <div className="menti-bg min-h-screen text-white flex flex-col">

      <TopBar currentUser={currentUser} onLogout={onLogout} />

      <div className="flex-1 flex flex-col px-5 pb-6 max-w-lg mx-auto w-full">

        {/* Hero section */}
        <div className="text-center pt-6 pb-8 animate-slide-up">
          <div className="text-5xl mb-3">📝</div>
          <h2 className="text-3xl font-black text-white mb-2">Fakta Hari Ini</h2>
          <p className="text-white/50 text-sm">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Progress card */}
        <div className="glass-card rounded-lg p-4 mb-4 animate-slide-up" style={{ animationDelay: '0.06s', opacity: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">Submission</span>
            <span className="text-white/80 text-xs font-bold">
              {submittedNames.size} submit · {presentNames.length} hadir
            </span>
          </div>

          {presentNames.length > 0 ? (
            <div className="flex flex-wrap gap-3 mb-3">
              {presentNames.map(name => {
                const submitted = submittedNames.has(name)
                return (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <div style={{ opacity: submitted ? 1 : 0.35, transition: 'opacity 0.3s' }}>
                        <Avatar name={name} size={38} rounded="rounded-xl" />
                      </div>
                      {submitted && (
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
                      style={{ color: submitted ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}
                    >
                      {name}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-white/20 text-xs mb-3">Belum ada yang masuk...</p>
          )}

          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${submitPct}%`, background: 'linear-gradient(90deg, #0846A1, #3d8bcd)' }}
            />
          </div>
        </div>

        {/* Main content */}
        {myFact ? (
          <div className="glass-card rounded-xl p-6 animate-pop-in">

            {/* Submitted state */}
            {!confirmCancel ? (
              <>
                <div className="text-center mb-5">
                  <div className="w-14 h-14 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    ✅
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">Faktamu sudah masuk!</h3>
                  <div className="rounded-lg p-4 mb-4 text-left" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-white/80 text-sm leading-relaxed italic">"{myFact.content}"</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: 'rgba(96,165,250,0.7)', animationDelay: `${i*0.25}s` }} />
                    ))}
                    <span className="text-white/30 text-xs ml-1">Menunggu voting dimulai</span>
                  </div>
                </div>

                {/* Edit button */}
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="w-full py-2.5 rounded-lg text-white/40 text-sm font-semibold hover:text-white/70 transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  ✏️ Edit fakta
                </button>
              </>
            ) : (
              /* Confirm cancel */
              <div className="text-center animate-slide-up">
                <div className="text-4xl mb-4">✏️</div>
                <h3 className="text-base font-bold text-white mb-1">Batalkan submission?</h3>
                <p className="text-white/40 text-xs mb-6">Faktamu akan dihapus dan kamu bisa tulis ulang</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="flex-1 py-3 rounded-lg text-white/50 font-semibold text-sm transition-colors hover:text-white/80"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Tidak
                  </button>
                  <button
                    onClick={handleCancelFact}
                    disabled={cancelLoading}
                    className="flex-1 py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    {cancelLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        Membatalkan...
                      </span>
                    ) : 'Ya, batalkan'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-5 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tulis fakta unik yang kamu tahu..."
              maxLength={MAX_FACT_LENGTH}
              rows={5}
              className="w-full rounded-lg p-4 text-white text-base resize-none focus:outline-none placeholder:text-white/20 transition-all duration-200 mb-3"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => e.target.style.border = '1px solid rgba(8,70,161,0.6)'}
              onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
            />

            {/* Char count */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${(content.length / MAX_FACT_LENGTH) * 100}%`,
                    background: remaining < 30 ? '#ef4444' : remaining < 80 ? '#f59e0b' : '#0846A1'
                  }}
                />
              </div>
              <span className="text-white/30 text-xs tabular-nums">{remaining}</span>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-2.5 mb-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="w-full py-4 rounded-lg text-white font-black text-base tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: loading || !content.trim() ? 'rgba(8,70,161,0.4)' : 'linear-gradient(135deg, #0846A1, #0655BA)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim...
                </span>
              ) : 'Kirim Fakta →'}
            </button>
          </div>
        )}

        {/* Admin panel */}
        {isAdmin && (
          <div className="mt-4 rounded-xl p-5 animate-slide-up" style={{ animationDelay: '0.15s', opacity: 0, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 text-sm">⚡</span>
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Panel Admin</span>
            </div>
            <p className="text-white/30 text-xs mb-4">
              {allFacts.length < 2
                ? `Minimal 2 fakta diperlukan (${allFacts.length} sekarang)`
                : `${allFacts.length} fakta siap — bisa mulai voting`}
            </p>
            <button
              onClick={handleStartVoting}
              disabled={adminLoading || allFacts.length < 2}
              className="w-full py-3.5 rounded-lg font-black text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#1a1035' }}
            >
              {adminLoading ? 'Memulai...' : '⚡ Mulai Voting'}
            </button>

            {/* Divider */}
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

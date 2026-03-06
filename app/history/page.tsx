'use client'

import { useEffect, useState } from 'react'
import { Fact, Session } from '@/lib/supabase'
import { MEMBERS } from '@/lib/constants'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

type FactWithVotes = Fact & { vote_count: number }
type HistoryItem = { session: Session; facts: FactWithVotes[] }

const BAR_COLORS = ['#0846A1','#2563eb','#db2777','#d97706','#059669','#0655BA','#ec4899']

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(data => setHistory(data.history || []))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="menti-bg min-h-screen text-white flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 animate-fade-in">
        <span className="text-white/40 text-sm font-semibold tracking-widest uppercase">WOW! Fakta</span>
        <Link href="/" className="glass-card text-white/60 text-sm px-4 py-1.5 rounded-full hover:text-white transition-colors">
          ← Kembali
        </Link>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-10 max-w-lg mx-auto w-full">

        <div className="pt-6 pb-8 animate-slide-up">
          <h2 className="text-3xl font-black text-white mb-1">History</h2>
          <p className="text-white/40 text-sm">Arsip sesi-sesi sebelumnya</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3">
            <div className="w-8 h-8 border-2 border-t-blue-400 rounded-full animate-spin"
              style={{ borderColor: 'rgba(255,255,255,0.1) rgba(255,255,255,0.1) rgba(255,255,255,0.1) #60a5fa' }} />
            <p className="text-white/20 text-sm">Memuat...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center pt-20 animate-slide-up">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-white/60 font-semibold text-lg mb-1">Belum ada history</p>
            <p className="text-white/30 text-sm mb-8">Selesaikan sesi pertama dulu</p>
            <Link href="/" className="inline-block py-3 px-8 rounded-2xl font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #0846A1, #0655BA)' }}>
              Mulai Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map(({ session, facts }, si) => {
              const maxVotes = Math.max(...facts.map(f => f.vote_count), 1)
              const winner = facts[0]

              return (
                <div key={session.id} className="animate-slide-up" style={{ animationDelay: `${si * 0.08}s`, opacity: 0 }}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-white/30 text-xs font-semibold">{formatDate(session.date)}</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    {winner?.vote_count > 0 && (
                      <span className="text-xs text-white/30">🏆 {winner.member_name}</span>
                    )}
                  </div>

                  {/* Facts with bars */}
                  <div className="glass-card rounded-3xl p-4 space-y-3">
                    {facts.map((fact, fi) => {
                      const fMemberIdx = MEMBERS.indexOf(fact.member_name as typeof MEMBERS[number])
                      const barColor = BAR_COLORS[fMemberIdx % BAR_COLORS.length]
                      const pct = maxVotes > 0 ? (fact.vote_count / maxVotes) * 100 : 0
                      const isTop = fi === 0 && fact.vote_count > 0

                      return (
                        <div key={fact.id}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Avatar name={fact.member_name} size={20} rounded="rounded-md" />
                            <span className="text-white/70 text-xs font-semibold">{fact.member_name}</span>
                            {isTop && <span className="text-xs">🏆</span>}
                            <span className="ml-auto text-white/40 text-xs font-bold">{fact.vote_count} vote</span>
                          </div>
                          <div className="h-7 rounded-xl overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            {fact.vote_count > 0 && (
                              <div
                                className="h-full rounded-xl animate-bar-grow"
                                style={{
                                  width: `${pct}%`,
                                  background: isTop ? 'linear-gradient(90deg, #f59e0b80, #fbbf2480)' : `${barColor}50`,
                                }}
                              />
                            )}
                            <p className="absolute inset-0 flex items-center px-3 text-xs text-white/40 truncate">
                              {fact.content}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

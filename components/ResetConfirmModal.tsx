'use client'

import { useState } from 'react'

type Props = {
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function ResetConfirmModal({ onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try { await onConfirm() }
    finally { setLoading(false) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 animate-pop-in"
        style={{
          background: '#060f1e',
          border: '1px solid rgba(239,68,68,0.35)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          🗑️
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-black text-white mb-2">Reset data hari ini?</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            Semua fakta dan vote akan dihapus. Sesi kembali ke fase submission.
          </p>
          <p className="text-red-400/60 text-xs mt-2 font-semibold">Tindakan ini tidak bisa dibatalkan.</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl text-white/50 font-semibold text-sm transition-colors hover:text-white/80 disabled:opacity-40"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(248,113,113,0.3) rgba(248,113,113,0.3) rgba(248,113,113,0.3) #f87171' }} />
                Mereset...
              </span>
            ) : 'Ya, reset'}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Member } from '@/lib/constants'
import TopBar from '@/components/TopBar'

type Props = {
  currentUser: Member
  onReveal: () => void
  onLogout: () => void
}

export default function RevealPhase({ currentUser, onReveal, onLogout }: Props) {
  const [pressed, setPressed] = useState(false)

  const handleReveal = () => {
    setPressed(true)
    setTimeout(onReveal, 500)
  }

  return (
    <div className="menti-bg min-h-screen text-white flex flex-col">
      <TopBar currentUser={currentUser} onLogout={onLogout} />

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <div className="text-center animate-slide-up w-full max-w-sm">

          {/* Trophy animation */}
          <div
            className="text-7xl mb-6"
            style={{
              display: 'inline-block',
              animation: 'trophy-bounce 1.8s ease-in-out infinite',
            }}
          >
            🏆
          </div>

          <h2 className="text-2xl font-black text-white mb-2">Voting selesai!</h2>
          <p className="text-white/40 text-sm mb-10">
            Siap-siap lihat siapa yang paling berkesan hari ini...
          </p>

          {/* Pulsing dots */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  background: 'rgba(96,165,250,0.5)',
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          {/* Reveal button */}
          <button
            onClick={handleReveal}
            disabled={pressed}
            className="w-full py-4 rounded-lg font-black text-base tracking-wide transition-all duration-300 active:scale-[0.97] disabled:opacity-60"
            style={{
              background: pressed
                ? 'rgba(8,70,161,0.5)'
                : 'linear-gradient(135deg, #0846A1, #0655BA)',
              color: 'white',
              boxShadow: pressed ? 'none' : '0 8px 24px rgba(8,70,161,0.4)',
            }}
          >
            {pressed ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading hasil...
              </span>
            ) : (
              'Lihat Hasil →'
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes trophy-bounce {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
      `}</style>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { MEMBERS, Member, ADMIN } from '@/lib/constants'
import Avatar from '@/components/Avatar'

const ADMIN_PASSWORD = 'saxofour37'

type Props = {
  onSelect: (name: Member) => void
}

export default function NamePicker({ onSelect }: Props) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleNameClick = (name: Member) => {
    if (name === ADMIN) {
      setShowPasswordModal(true)
      setPassword('')
      setPasswordError(false)
    } else {
      onSelect(name)
    }
  }

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setShowPasswordModal(false)
      onSelect(ADMIN)
    } else {
      setPasswordError(true)
      setShake(true)
      setPassword('')
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="menti-bg min-h-screen flex flex-col items-center justify-center p-6">

      {/* Logo area */}
      <div className="text-center mb-12 animate-slide-up">
        {/* TransJakarta branding */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div
            className="flex-shrink-0 rounded flex items-center justify-center animate-float"
            style={{ width: 44, height: 44, background: '#0846A1' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tj-gram.svg" alt="TransJakarta" width={28} height={28} />
          </div>
          <div className="text-left">
            <div className="text-white font-black text-lg leading-tight tracking-tight">WOW! Fakta</div>
            <div className="text-white/35 text-xs font-semibold tracking-wider leading-tight">TIJE Design Team</div>
          </div>
        </div>
        <p className="text-blue-300/50 text-sm">
          Satu fakta menarik setiap hari
        </p>
      </div>

      {/* Join card */}
      <div className="w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.08s', opacity: 0 }}>
        <div className="glass-card rounded-xl p-6">
          <div className="grid grid-cols-2 gap-2.5">
            {MEMBERS.map((name, i) => (
              <button
                key={name}
                onClick={() => handleNameClick(name)}
                className="glass-card glass-card-hover group relative rounded-lg px-3 py-3 flex items-center gap-3 transition-all duration-200 active:scale-95 animate-slide-up"
                style={{ animationDelay: `${0.12 + i * 0.05}s`, opacity: 0 }}
              >
                <Avatar name={name} size={36} rounded="rounded-xl" />
                <div className="flex flex-col items-start">
                  <span className="text-white font-semibold text-sm">{name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-white/20 text-xs mt-8 animate-fade-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
        Namamu tersimpan otomatis
      </p>

      {/* Password modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6 z-50"
          style={{ background: 'rgba(2,11,22,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowPasswordModal(false) }}
        >
          <div
            className="glass-card rounded-xl p-6 w-full max-w-xs animate-pop-in"
            style={{ border: '1px solid rgba(8,70,161,0.4)' }}
          >
            {/* Admin avatar */}
            <div className="flex flex-col items-center mb-5">
              <Avatar name={ADMIN} size={56} rounded="rounded-lg" className="mb-3" />
              <p className="text-white font-black text-lg">{ADMIN}</p>
              <p className="text-white/40 text-xs mt-0.5">Masukkan password admin</p>
            </div>

            {/* Password input */}
            <div
              className={`transition-all duration-100 ${shake ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}`}
              style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}
            >
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError(false) }}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Password..."
                autoFocus
                className="w-full rounded-lg px-4 py-3 text-white text-base focus:outline-none placeholder:text-white/20 transition-all duration-200 mb-3"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: passwordError
                    ? '1px solid rgba(239,68,68,0.6)'
                    : '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>

            {passwordError && (
              <p className="text-red-400 text-xs text-center mb-3">Password salah, coba lagi</p>
            )}

            <button
              onClick={handlePasswordSubmit}
              className="w-full py-3.5 rounded-lg font-black text-white text-sm tracking-wide transition-all duration-200 active:scale-[0.98] mb-2"
              style={{ background: 'linear-gradient(135deg, #0846A1, #0655BA)' }}
            >
              Masuk →
            </button>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="w-full py-2.5 rounded-lg text-white/30 text-sm hover:text-white/60 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}

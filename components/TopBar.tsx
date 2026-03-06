'use client'

import { useState, useEffect, useRef } from 'react'
import { Member, ADMIN } from '@/lib/constants'
import Avatar from '@/components/Avatar'
import Link from 'next/link'

type Props = {
  currentUser: Member
  onLogout: () => void
}

export default function TopBar({ currentUser, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isAdmin = currentUser === ADMIN

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3 animate-fade-in">

      {/* Left: branding + dropdown menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="flex items-center gap-2.5 group"
        >
          {/* TransJakarta logo */}
          <div
            className="flex-shrink-0 rounded flex items-center justify-center"
            style={{ width: 30, height: 30, background: '#0846A1' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tj-gram.svg" alt="TransJakarta" width={20} height={20} />
          </div>

          {/* Text stack */}
          <div className="text-left">
            <div className="text-white/55 text-xs font-bold tracking-widest uppercase group-hover:text-white/75 transition-colors leading-tight">
              WOW! Fakta
            </div>
            <div className="text-white/25 text-[9px] font-semibold tracking-wider leading-tight">
              TIJE Design Team
            </div>
          </div>

          <span
            className="text-white/25 text-xs transition-transform duration-200"
            style={{ display: 'inline-block', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▾
          </span>
        </button>

        {menuOpen && (
          <div
            className="absolute top-full left-0 mt-2 z-50 rounded-2xl overflow-hidden animate-pop-in"
            style={{
              background: 'rgba(10,20,40,0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              minWidth: 160,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <Link
              href="/history"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white/70 text-sm hover:bg-white/05 hover:text-white transition-colors"
            >
              <span>📋</span>
              <span className="font-semibold">History</span>
            </Link>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

            <button
              onClick={() => { setMenuOpen(false); onLogout() }}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/70 text-sm hover:bg-white/05 hover:text-white transition-colors"
            >
              <span>🚪</span>
              <span className="font-semibold">Ganti nama</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: admin badge + avatar */}
      <div className="flex items-center gap-2">
        {isAdmin && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            Admin
          </span>
        )}
        <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full">
          <Avatar name={currentUser} size={20} rounded="rounded-md" />
          <span className="text-sm font-semibold">{currentUser}</span>
        </div>
      </div>
    </div>
  )
}

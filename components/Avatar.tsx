'use client'

import Image from 'next/image'

// Map nama member ke file foto (case-sensitive sesuai file di /public/avatars/)
const AVATAR_PHOTOS: Record<string, string> = {
  'Emir': '/avatars/Emir.png',
  'Indah': '/avatars/Indah.png',
  'Farah': '/avatars/Farah.png',
  'Reza': '/avatars/Reza.png',
  'Bagas': '/avatars/Bagas.png',
  'Sissy': '/avatars/Sissy.png',
}

// TransJakarta-inspired colors for fallback initials
const AVATAR_COLORS: Record<string, string> = {
  'Emir': '#0846A1',
  'Indah': '#2563eb',
  'Farah': '#db2777',
  'Reza': '#d97706',
  'Bagas': '#059669',
  'Sissy': '#0655BA',
  'Ganta': '#0564c7',
}

type Props = {
  name: string
  size?: number      // pixel size, default 32
  rounded?: string   // tailwind rounded class, default 'rounded-xl'
  className?: string
}

export default function Avatar({ name, size = 32, rounded = 'rounded-xl', className = '' }: Props) {
  const photoSrc = AVATAR_PHOTOS[name]
  const bgColor = AVATAR_COLORS[name] || '#0846A1'

  if (photoSrc) {
    return (
      <div
        className={`overflow-hidden flex-shrink-0 ${rounded} ${className}`}
        style={{ width: size, height: size, minWidth: size }}
      >
        <Image
          src={photoSrc}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  // Fallback: initial colored circle
  return (
    <div
      className={`flex items-center justify-center text-white font-black flex-shrink-0 ${rounded} ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        background: bgColor,
        fontSize: size * 0.35,
      }}
    >
      {name.slice(0, 1)}
    </div>
  )
}

export { AVATAR_COLORS, AVATAR_PHOTOS }

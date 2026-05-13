'use client'

import { useState } from 'react'

export default function LogoImage({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const [error, setError] = useState(false)

  const dims = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20' }[size]
  const text = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg' }[size]

  if (error) {
    return (
      <div className={`${dims} bg-[#F5DEB3] rounded-full flex items-center justify-center shrink-0 ${className}`}>
        <span className={`text-[#5C2D0E] font-bold ${text}`}>TE</span>
      </div>
    )
  }

  return (
    <img
      src="/logo.jpeg"
      alt="Tía Elena"
      className={`${dims} rounded-full object-cover shrink-0 ${className}`}
      onError={() => setError(true)}
    />
  )
}

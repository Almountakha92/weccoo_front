import React from 'react'

type BrandMarkSize = 'sm' | 'md'

interface BrandMarkProps {
  size?: BrandMarkSize
  className?: string
  showWordmark?: boolean
}

const sizeClasses: Record<BrandMarkSize, { container: string; text: string }> = {
  sm: {
    container: 'w-[44px] h-[44px] rounded-[14px]',
    text: 'text-[18px]'
  },
  md: {
    container: 'w-[60px] h-[60px] rounded-[18px]',
    text: 'text-[22px]'
  }
}

export default function BrandMark({ size = 'md', className = '', showWordmark = true }: BrandMarkProps) {
  const classes = sizeClasses[size]

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <div
        className={`${classes.container} bg-white flex items-center justify-center shadow-[0_8px_32px_rgba(30,99,214,0.25)] overflow-hidden border border-[#E5E7EB]`}
      >
        <img
          src="/images/logo.jpeg"
          alt="Wecoo logo"
          className="w-full h-full object-cover"
        />
      </div>
      {showWordmark && (
        <div className={`font-[Cabinet_Grotesk] font-extrabold text-[#1E63D6] ${classes.text}`}>
          Wec<span className="text-[#F5C400]">coo</span>
        </div>
      )}
    </div>
  )
}


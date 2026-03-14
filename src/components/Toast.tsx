import { useState, useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | ''
  show: boolean
  onClose: () => void
}

export default function Toast({ message, type = '', show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  const baseClasses = "fixed bottom-7 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg transition-transform duration-300"
  
  const typeClasses = type === 'success' 
    ? "bg-[#2ECC8F] text-white"
    : "bg-[#0F172A] text-white"

  return (
    <div className={`${baseClasses} ${typeClasses} translate-y-0`}>
      <span>{message}</span>
    </div>
  )
}

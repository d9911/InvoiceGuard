import React from 'react'

interface CardProps {
  variant?: 'canvas' | 'sage' | 'green' | 'dark'
  children?: React.ReactNode
  className?: string
  id?: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export function Card({ variant = 'canvas', children, className = '', id, onClick, ...props }: CardProps) {
  // Mapping variants to the design guidelines:
  // - canvas: Pure white (#ffffff) for card interiors
  // - sage: Sage-tinted page background (#e8ebe6)
  // - green: Light green (#e2f6d5)
  // - dark: Polarity-flipped dark container (#0e0f0c) with green text
  const variantStyles = {
    canvas: 'bg-white text-ink shadow-[0_4px_24px_rgba(14,15,12,0.03)]',
    sage: 'bg-canvas-soft text-ink',
    green: 'bg-primary-pale text-ink',
    dark: 'bg-ink text-primary shadow-xl border border-primary/20'
  }

  return (
    <div
      id={id}
      onClick={onClick}
      className={`rounded-xl p-8 transition-all hover:border-ink/20 border border-transparent ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

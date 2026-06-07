import React from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
  className?: string
  onClick?: any
  disabled?: boolean
  type?: 'submit' | 'reset' | 'button'
}

export function Button({ variant = 'primary', size = 'md', className = '', children, onClick, disabled, type = 'button', ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

  const variants = {
    // Wise Green (#9fe870) background, Near-black text, light-green hover
    primary: 'bg-primary text-ink hover:bg-primary-active border border-transparent shadow-sm',
    // Sage-tinted canvas background, Near-black text
    secondary: 'bg-canvas-soft text-ink hover:bg-ink hover:text-white border border-transparent',
    // Pure White, 1px solid Near-Black borders
    tertiary: 'bg-white text-ink border border-ink hover:bg-canvas-soft',
    // Red negative indicator for destructive actions
    danger: 'bg-negative text-white hover:bg-negative-deep border border-transparent'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-5 text-lg'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
export default Button

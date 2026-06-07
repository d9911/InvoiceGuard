import React from 'react'

interface InputProps {
  label?: string
  suffix?: string
  error?: string
  className?: string
  type?: string
  placeholder?: string
  value?: any
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  maxLength?: number
  step?: string
}

export function Input({ 
  label, suffix, error, className = '', type = 'text', placeholder, value, onChange, required, maxLength, step, ...props 
}: InputProps) {
  return (
    <div className="flex flex-col space-y-2 w-full text-left">
      {label && (
        <label className="text-sm font-semibold text-ink tracking-tight">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          step={step}
          className={`w-full bg-white text-ink border border-ink/20 focus:border-ink focus:ring-1 focus:ring-ink outline-none px-4 py-3.5 rounded-lg text-base transition-colors placeholder:text-mute ${
            suffix ? 'pr-16' : ''
          } ${error ? 'border-negative ring-1 ring-negative' : ''} ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 text-sm font-black text-ink select-none tracking-wider bg-canvas-soft px-2.5 py-1 rounded">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <span className="text-xs text-negative font-medium">
          {error}
        </span>
      )}
    </div>
  )
}
export default Input

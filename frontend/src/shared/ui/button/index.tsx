import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({ variant = 'primary', className, children, ...props }: ButtonProps) => {
  const baseStyles = "px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50";
  const variants = {
    primary: "bg-primary text-ink hover:bg-primary-active",
    secondary: "bg-canvas-soft text-ink hover:opacity-80",
    outline: "bg-transparent border-2 border-ink text-ink hover:bg-ink hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

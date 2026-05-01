import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
}

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "",
  disabled = false,
  type = 'button',
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-agro-green-600 text-white active:bg-agro-green-700',
    secondary: 'bg-agro-earth text-white active:bg-amber-900',
    outline: 'border-2 border-agro-green-600 text-agro-green-600 active:bg-agro-green-50',
    ghost: 'text-slate-600 active:bg-slate-100'
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = "",
  disabled = false,
  type = 'button',
  ...props
}) => {
  const variants = {
    primary: 'bg-agro-green-600 text-white active:scale-[0.98] shadow-lg shadow-agro-green-600/20 hover:bg-agro-green-700',
    secondary: 'bg-agro-earth text-white active:scale-[0.98] shadow-lg shadow-agro-earth/20 hover:bg-opacity-90',
    outline: 'border-2 border-slate-200 text-agro-green-700 active:scale-[0.98] hover:bg-slate-50 hover:border-slate-300',
    ghost: 'text-slate-500 active:bg-slate-100 hover:text-slate-700'
  };

  return (
    <button 
      type={type}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

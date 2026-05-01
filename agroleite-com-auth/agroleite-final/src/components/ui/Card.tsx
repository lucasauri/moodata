import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = "", ...props }: CardProps) => (
  <div className={`rounded-2xl p-4 shadow-sm border border-agro-green-100 ${!className.includes('bg-') ? 'bg-white' : ''} ${className}`} {...props}>
    {children}
  </div>
);

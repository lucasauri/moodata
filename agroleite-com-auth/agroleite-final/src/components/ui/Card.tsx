import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`rounded-[24px] p-5 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] border border-white/50 ${!className.includes('bg-') ? 'bg-white' : ''} ${className}`} {...props}>
    {children}
  </div>
);

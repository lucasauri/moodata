import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelSize?: 'sm' | 'xs';
}

export const Input: React.FC<InputProps> = ({ label, labelSize = 'sm', className = '', ...props }) => (
  <div>
    <label className={`block ${labelSize === 'xs' ? 'text-xs' : 'text-sm'} font-bold mb-${labelSize === 'xs' ? '1' : '2'}`}>
      {label}
    </label>
    <input
      className={`w-full ${props.type === 'date' && labelSize === 'xs' ? 'p-3 text-xs' : 'p-4'} bg-slate-50 rounded-xl border-none outline-none font-semibold ${className}`}
      {...props}
    />
  </div>
);

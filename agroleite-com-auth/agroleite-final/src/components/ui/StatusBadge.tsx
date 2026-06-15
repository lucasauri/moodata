import React from 'react';
import { Animal } from '../../types';

const STATUS_CONFIG: Record<Animal['status'], { label: string; className: string }> = {
  lactation: { label: 'Lactação', className: 'bg-green-100 text-green-700' },
  pregnant: { label: 'Prenha', className: 'bg-blue-100 text-blue-700' },
  dry: { label: 'Seca', className: 'bg-slate-100 text-slate-700' },
  'pre-calving': { label: 'Pré-Parto', className: 'bg-orange-100 text-orange-700' },
  sick: { label: 'Doente', className: 'bg-red-100 text-red-700' },
  dead: { label: 'Baixado/Morto', className: 'bg-red-100 text-red-700' },
};

interface StatusBadgeProps {
  status: Animal['status'];
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || { label: status || 'Desconhecido', className: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${config.className} ${className}`}>
      {config.label}
    </span>
  );
};

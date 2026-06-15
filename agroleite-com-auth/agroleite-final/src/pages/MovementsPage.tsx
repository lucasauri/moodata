import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { Search, X, Calendar, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Animal, HealthEvent } from '../types';

interface MovementsPageProps {
  events: HealthEvent[];
  animals: Animal[];
}

export const MovementsPage: React.FC<MovementsPageProps> = ({ events, animals }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'birth' | 'purchase' | 'death'>('all');

  // Filter only movements and match type + search term
  const filteredEvents = useMemo(() => {
    const movements = events.filter(e =>
      e.type === 'birth' || e.type === 'purchase' || e.type === 'death'
    );

    return movements.filter(e => {
      const animal = animals.find(a => a.id === e.animalId);
      const animalName = animal?.name || '';
      const animalTag = animal?.tag || '';

      const matchesSearch =
        animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animalTag.includes(searchTerm) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = activeFilter === 'all' || e.type === activeFilter;

      return matchesSearch && matchesType;
    });
  }, [events, animals, searchTerm, activeFilter]);

  const typeLabel = (t: string) => {
    if (t === 'birth') return 'Nascimento';
    if (t === 'purchase') return 'Compra';
    if (t === 'death') return 'Morte';
    return t;
  };

  const getStyle = (t: string) => {
    if (t === 'birth') return { bg: 'bg-green-50 text-green-700 border-green-200', icon: <ArrowUpRight size={16} /> };
    if (t === 'purchase') return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <ArrowUpRight size={16} /> };
    if (t === 'death') return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: <ArrowDownRight size={16} /> };
    return { bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: <Activity size={16} /> };
  };

  return (
    <motion.div
      key="movements"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-extrabold text-agro-green-700 tracking-tight">Movimentação de Animais</h2>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: 'Todos', icon: '📋' },
          { id: 'birth', label: 'Nascimentos', icon: '🍼' },
          { id: 'purchase', label: 'Compras', icon: '💵' },
          { id: 'death', label: 'Mortes', icon: '🪦' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id as any)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
              activeFilter === cat.id
                ? cat.id === 'death'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-agro-green-600 text-white shadow-md'
                : 'bg-white text-slate-500 border border-agro-green-100'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por animal, brinco ou descrição..."
          className="w-full pl-10 pr-4 py-4 bg-white rounded-[20px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white/50 focus:ring-2 focus:ring-agro-green-600 outline-none transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* History Cards */}
      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => {
            const animal = animals.find(a => a.id === event.animalId);
            const style = getStyle(event.type);
            return (
              <Card key={event.id} className="flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${style.bg}`}>
                  {style.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${style.bg}`}>
                      {typeLabel(event.type)}
                    </span>
                    <p className="font-bold text-sm text-slate-800">{event.description}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Animal: <span className="font-semibold text-slate-700">{animal?.name || 'Desconhecido'}</span>
                    {' • '} Brinco: <span className="font-semibold text-slate-700">{animal?.tag || '—'}</span>
                    {event.responsible && (
                      <>
                        {' • '} Responsável: <span className="font-semibold text-slate-700">{event.responsible}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 justify-end">
                    <Calendar size={12} />
                    {format(new Date(event.date), 'dd/MM/yyyy')}
                  </p>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 font-semibold">Nenhuma movimentação encontrada.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

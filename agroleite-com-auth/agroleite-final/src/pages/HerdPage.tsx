import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, X, ChevronRight } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Animal } from '../types';

interface HerdPageProps {
  animals: Animal[];
  setIsAddingAnimal: (val: boolean) => void;
  setSelectedAnimalId: (id: string) => void;
}

export const HerdPage: React.FC<HerdPageProps> = ({
  animals,
  setIsAddingAnimal,
  setSelectedAnimalId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'cow' | 'heifer' | 'drying' | 'calving'>('all');

  const filteredAnimals = useMemo(() => {
    return animals.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.tag.includes(searchTerm);
      
      let matchesCategory = true;
      if (activeCategory === 'cow') matchesCategory = a.category === 'cow';
      else if (activeCategory === 'heifer') matchesCategory = a.category === 'heifer';
      else if (activeCategory === 'drying') {
        const daysToDry = a.dryingDate ? differenceInDays(parseISO(a.dryingDate), new Date()) : 999;
        matchesCategory = a.status === 'dry' || (daysToDry >= 0 && daysToDry <= 30);
      }
      else if (activeCategory === 'calving') {
        const daysToCalve = a.expectedCalving ? differenceInDays(parseISO(a.expectedCalving), new Date()) : 999;
        matchesCategory = (daysToCalve >= 0 && daysToCalve <= 30) || a.status === 'pre-calving';
      }

      return matchesSearch && matchesCategory;
    });
  }, [animals, searchTerm, activeCategory]);

  return (
    <motion.div 
      key="herd"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Meu Rebanho</h2>
        <Button variant="ghost" className="p-2" onClick={() => setIsAddingAnimal(true)}>
          <Plus size={20} />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: 'Todos', icon: '🐾' },
          { id: 'cow', label: 'Vacas', icon: '🐄' },
          { id: 'heifer', label: 'Novilhas', icon: '🐄' },
          { id: 'drying', label: 'Secagem', icon: '🍂' },
          { id: 'calving', label: 'Parimento', icon: '🍼' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
              activeCategory === cat.id 
                ? 'bg-agro-green-600 text-white shadow-md' 
                : 'bg-white text-slate-500 border border-agro-green-100'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome ou brinco..."
          className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-agro-green-100 focus:ring-2 focus:ring-agro-green-600 outline-none"
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

      <div className="space-y-3">
        {filteredAnimals.length > 0 ? filteredAnimals.map(animal => (
          <Card 
            key={animal.id} 
            className="flex items-center justify-between group active:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => setSelectedAnimalId(animal.id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-agro-green-100 flex items-center justify-center text-agro-green-600 font-bold">
                {animal.tag}
              </div>
              <div>
                <h3 className="font-bold">{animal.name}</h3>
                <p className="text-xs text-slate-500">{animal.breed} • {animal.category === 'cow' ? 'Vaca' : 'Novilha'}</p>
                <div className="flex gap-2 mt-1">
                  {animal.expectedCalving && (
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 rounded">
                      Parto: {format(parseISO(animal.expectedCalving), 'dd/MM')}
                    </span>
                  )}
                  {animal.lastCalving && (
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1 rounded">
                      DEL: {differenceInDays(new Date(), parseISO(animal.lastCalving))}d
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                animal.status === 'lactation' ? 'bg-green-100 text-green-700' :
                animal.status === 'pregnant' ? 'bg-blue-100 text-blue-700' :
                animal.status === 'dry' ? 'bg-slate-100 text-slate-700' :
                animal.status === 'pre-calving' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {animal.status === 'lactation' ? 'Lactação' :
                 animal.status === 'pregnant' ? 'Prenha' :
                 animal.status === 'dry' ? 'Seca' : 
                 animal.status === 'pre-calving' ? 'Pré-Parto' : 'Doente'}
              </span>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
          </Card>
        )) : (
          <div className="text-center py-12">
            <p className="text-slate-400 font-medium">Nenhum animal encontrado.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

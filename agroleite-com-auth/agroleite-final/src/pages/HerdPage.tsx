import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, X, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Animal } from '../types';

interface HerdPageProps {
  animals: Animal[];
  setIsAddingAnimal: (val: boolean) => void;
  setSelectedAnimalId: (id: string) => void;
  onEditAnimal?: (id: string) => void;
  onDeleteAnimal?: (id: string) => void;
}

export const HerdPage: React.FC<HerdPageProps> = ({
  animals,
  setIsAddingAnimal,
  setSelectedAnimalId,
  onEditAnimal,
  onDeleteAnimal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'cow' | 'heifer' | 'drying' | 'calving'>('all');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory]);

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

      const isNotDead = a.status !== 'dead';

      return matchesSearch && matchesCategory && isNotDead;
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
        <h2 className="text-2xl font-extrabold text-agro-green-700 tracking-tight">Meu Rebanho</h2>
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

      <div className="space-y-3">
        {filteredAnimals.length > 0 ? (
          filteredAnimals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(animal => (
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
                <StatusBadge status={animal.status} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditAnimal) onEditAnimal(animal.id);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={18} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteAnimal && window.confirm('Deseja excluir este animal?')) {
                      onDeleteAnimal(animal.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 font-medium">Nenhum animal encontrado.</p>
          </div>
        )}
        
        {/* Pagination Controls */}
        {filteredAnimals.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center space-x-4 mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-agro-green-600 text-white hover:bg-agro-green-700'}`}
            >
              Anterior
            </button>
            <span className="text-sm font-medium">
              Página {currentPage} de {Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE)}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE)))}
              disabled={currentPage >= Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE)}
              className={`px-4 py-2 rounded ${currentPage >= Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE) ? 'bg-gray-200 text-gray-400' : 'bg-agro-green-600 text-white hover:bg-agro-green-700'}`}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

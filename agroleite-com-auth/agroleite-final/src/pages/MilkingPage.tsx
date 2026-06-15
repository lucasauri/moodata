import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Plus, Milk } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Animal, MilkProduction } from '../types';

interface MilkingPageProps {
  productions: MilkProduction[];
  animals: Animal[];
  todayProduction: number;
  setIsAddingProduction: (val: boolean) => void;
}

export const MilkingPage: React.FC<MilkingPageProps> = ({
  productions,
  animals,
  todayProduction,
  setIsAddingProduction
}) => {
  // Compute production summary for lactating cows
  const lactatingAnimals = useMemo(() => {
    const today = new Date();
    const isToday = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toDateString() === today.toDateString();
    };
    return animals
      .filter(a => a.status === 'lactation')
      .map(animal => {
        const animalProds = productions.filter(p => p.animalId === animal.id && isToday(p.date));
        const morning = animalProds
          .filter(p => p.period === 'morning')
          .reduce((sum, p) => sum + p.amount, 0);
        const afternoon = animalProds
          .filter(p => p.period === 'afternoon')
          .reduce((sum, p) => sum + p.amount, 0);
        const total = morning + afternoon;
        return { animal, morning, afternoon, total };
      });
  }, [animals, productions]);

  // Compute totals and averages per period (morning/afternoon) across all productions
  const periodStats = useMemo(() => {
    const morningTotal = productions
      .filter(p => p.period === 'morning')
      .reduce((sum, p) => sum + p.amount, 0);
    const afternoonTotal = productions
      .filter(p => p.period === 'afternoon')
      .reduce((sum, p) => sum + p.amount, 0);
    const total = morningTotal + afternoonTotal;
    const lactatingCount = lactatingAnimals.length || 1;
    const morningAvg = morningTotal / lactatingCount;
    const afternoonAvg = afternoonTotal / lactatingCount;
    return { morningTotal, afternoonTotal, total, morningAvg, afternoonAvg };
  }, [productions, lactatingAnimals]);

  return (
    <motion.div 
      key="milking"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-extrabold text-agro-green-700 tracking-tight">Histórico de Ordenha</h2>
        <Button variant="ghost" className="p-2" onClick={() => setIsAddingProduction(true)}>
          <Plus size={20} />
        </Button>
      </div>

       {/* Stats Summary */}
       <div className="grid grid-cols-2 gap-3">
         <Card className="bg-blue-600 text-white border-none">
           <p className="text-[10px] font-bold opacity-80 uppercase">Média por Período</p>
           <p className="text-xl font-bold">
             Manhã: {periodStats.morningAvg.toFixed(1)}L<br />
             Tarde: {periodStats.afternoonAvg.toFixed(1)}L
           </p>
         </Card>
         <Card className="bg-agro-green-600 text-white border-none">
           <p className="text-[10px] font-bold opacity-80 uppercase">Produção Total</p>
           <p className="text-xl font-bold">
             Manhã: {periodStats.morningTotal.toFixed(1)}L<br />
             Tarde: {periodStats.afternoonTotal.toFixed(1)}L<br />
             Total: {periodStats.total.toFixed(1)}L
           </p>
         </Card>
       </div>

      {/* Lactating cows production summary */}
      <Card className="p-6 border border-agro-green-100">
        <h3 className="text-xl font-bold text-agro-green-700 mb-4">Vacas que podem ordenhar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lactatingAnimals.map(({ animal, morning, afternoon, total }) => (
            <Card key={animal.id} className="p-4 border border-agro-green-100 bg-white shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold">{animal.name} ({animal.tag})</div>
                <div className="text-sm text-slate-500">{animal.breed}</div>
              </div>
              <div className="flex space-x-4 text-sm">
                <div>Manhã: {morning.toFixed(1)}L</div>
                <div>Tarde: {afternoon.toFixed(1)}L</div>
                <div>Total: {total.toFixed(1)}L</div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        {productions.map(prod => {
          const animal = animals.find(a => a.id === prod.animalId);
          return (
            <Card key={prod.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Milk size={20} />
                </div>
                <div>
                  <h3 className="font-bold">{animal?.name}</h3>
                  <p className="text-xs text-slate-500">{format(new Date(prod.date), "dd/MM 'às' HH:mm", { locale: ptBR })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-agro-green-700">{prod.amount}L</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">{prod.period === 'morning' ? 'Manhã' : 'Tarde'}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
};

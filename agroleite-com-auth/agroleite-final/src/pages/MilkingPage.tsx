import React from 'react';
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
  return (
    <motion.div 
      key="milking"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Histórico de Ordenha</h2>
        <Button variant="ghost" className="p-2" onClick={() => setIsAddingProduction(true)}>
          <Plus size={20} />
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-600 text-white border-none">
          <p className="text-[10px] font-bold opacity-80 uppercase">Média por Tirada</p>
          <p className="text-xl font-bold">
            {productions.length > 0 
              ? (productions.reduce((acc, curr) => acc + curr.amount, 0) / productions.length).toFixed(1) 
              : '0.0'}L
          </p>
        </Card>
        <Card className="bg-agro-green-600 text-white border-none">
          <p className="text-[10px] font-bold opacity-80 uppercase">Total Hoje</p>
          <p className="text-xl font-bold">{todayProduction.toFixed(1)}L</p>
        </Card>
      </div>

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

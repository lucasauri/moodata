import React from 'react';
import { motion } from 'motion/react';
import { Plus, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Animal, HealthEvent } from '../types';

interface HealthPageProps {
  events: HealthEvent[];
  animals: Animal[];
  setIsAddingEvent: (val: boolean) => void;
}

export const HealthPage: React.FC<HealthPageProps> = ({
  events,
  animals,
  setIsAddingEvent
}) => {
  return (
    <motion.div 
      key="events"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-extrabold text-agro-green-700 tracking-tight">Eventos do Rebanho</h2>
        <Button variant="ghost" className="p-2" onClick={() => setIsAddingEvent(true)}>
          <Plus size={20} />
        </Button>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          {events
            .filter(e => e.type === 'medication' || e.type === 'calving')
            .map(event => {
            const animal = animals.find(a => a.id === event.animalId);
            return (
              <Card key={event.id} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  event.type === 'calving' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {event.type === 'calving' ? <Calendar size={24} /> : <Info size={24} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{event.description}</p>
                  <p className="text-xs text-slate-500">{animal?.name} (Brinco {animal?.tag})</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-agro-green-700">{format(new Date(event.date), 'dd/MM/yy')}</p>
                  {event.withdrawalDays && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">Carência</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

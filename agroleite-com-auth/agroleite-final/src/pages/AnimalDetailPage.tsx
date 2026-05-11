import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Milk, Activity, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Animal, MilkProduction, HealthEvent } from '../types';

interface AnimalDetailPageProps {
  animal: Animal;
  productions: MilkProduction[];
  events: HealthEvent[];
  chartData: { name: string; total: number }[];
  onAddProduction: () => void;
  onToggleStatus: () => void;
}

export const AnimalDetailPage: React.FC<AnimalDetailPageProps> = ({
  animal, productions, events, chartData, onAddProduction, onToggleStatus
}) => {
  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Animal Info Card */}
      <Card className="flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Categoria / Raça</p>
          <p className="font-bold text-lg">
            {animal.category === 'cow' ? '🐄 Vaca Leite' : '🐄 Vaca Novilha'}
            {' • '}{animal.breed}
          </p>
          <div className="space-y-1 mt-2">
            {animal.expectedCalving && (
              <p className="text-xs font-bold text-blue-600 flex items-center gap-1">
                <Calendar size={12} />
                Previsão Parto: {format(parseISO(animal.expectedCalving), 'dd/MM/yyyy')}
              </p>
            )}
            {animal.lastCalving && (
              <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Milk size={12} />
                Último Parto: {format(parseISO(animal.lastCalving), 'dd/MM/yyyy')}
              </p>
            )}
            {animal.dryingDate && (
              <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
                <Activity size={12} />
                Data Secagem: {format(parseISO(animal.dryingDate), 'dd/MM/yyyy')}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
          <StatusBadge status={animal.status} />
        </div>
      </Card>

      {/* Biometrics Card */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white">
          <p className="text-xs font-bold text-slate-400 uppercase">Peso Atual</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-2xl font-bold text-agro-green-700">{animal.weight || '--'}</p>
            <p className="text-xs font-bold text-slate-400">kg</p>
          </div>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-bold text-slate-400 uppercase">Escore (ECC)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-2xl font-bold text-agro-green-700">{animal.ecc || '--'}</p>
            <p className="text-xs font-bold text-slate-400">/ 5</p>
          </div>
        </Card>
      </div>

      {/* Individual Chart (Only for Dairy) */}
      {animal.category === 'cow' && (
        <Card className="p-4">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-agro-green-600" />
            Produção Individual (Litros)
          </h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#16a34a" fill="#dcfce7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        {animal.category === 'cow' && (
          <Button variant="outline" onClick={onAddProduction}>
            Lançar Leite
          </Button>
        )}
        <Button
          variant={animal.status === 'dry' ? 'primary' : 'secondary'}
          onClick={onToggleStatus}
          className={animal.category !== 'cow' ? 'col-span-2' : ''}
        >
          {animal.status === 'dry' ? 'Ativar' : 'Alterar Status'}
        </Button>
      </div>

      {/* History */}
      <section>
        <h3 className="text-lg font-bold mb-3">Histórico Recente</h3>
        <div className="space-y-3">
          {animal.category === 'cow' && productions.slice(0, 3).map(prod => (
            <Card key={prod.id} className="flex justify-between items-center py-3">
              <div className="flex items-center gap-3">
                <Milk size={18} className="text-blue-500" />
                <span className="text-sm font-medium">{format(new Date(prod.date), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
              </div>
              <span className="font-bold text-agro-green-700">{prod.amount}L</span>
            </Card>
          ))}
          {events.map(event => (
            <Card key={event.id} className="flex justify-between items-center py-3">
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-red-500" />
                <span className="text-sm font-medium">{event.description}</span>
              </div>
              <span className="text-xs font-bold text-slate-400">{format(new Date(event.date), 'dd/MM/yy')}</span>
            </Card>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

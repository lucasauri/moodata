import React from 'react';
import { motion } from 'motion/react';
import { Activity, Milk, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownLeft, ClipboardList, Check, TrendingUp, Info, Calendar, Plus } from 'lucide-react';
import { format, parseISO, isSameDay, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/ui/Card';
import { Animal, MilkProduction, HealthEvent, FarmConfig } from '../types';

interface HomePageProps {
  animals: Animal[];
  productions: MilkProduction[];
  events: HealthEvent[];
  config: FarmConfig;
  todayProduction: number;
  cowCount: number;
  heiferCount: number;
  lactationCount: number;
  alerts: { type: 'red' | 'amber' | 'green', icon: React.ReactNode, text: string }[];
  chartData: any[];
  setDetailModal: (modal: { title: string, animals: Animal[] } | null) => void;
  setIsAddingProduction: (val: boolean) => void;
  setIsAddingAnimal: (val: boolean) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  animals, productions, events, config,
  todayProduction, cowCount, heiferCount, lactationCount,
  alerts, chartData, setDetailModal,
  setIsAddingProduction, setIsAddingAnimal
}) => {
  return (
    <motion.div 
      key="home"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-agro-green-700 text-white border-none relative overflow-hidden col-span-2 shadow-lg">
          <div className="relative z-10">
            <p className="text-agro-green-50 text-sm font-semibold opacity-90">Total de Animais</p>
            <h2 className="text-4xl font-bold mt-1">{animals.length}</h2>
            <div className="flex gap-4 mt-3 text-xs font-bold text-white">
              <button 
                onClick={() => setDetailModal({ title: 'Vacas Leiteiras', animals: animals.filter(a => a.category === 'cow') })}
                className="bg-white/20 px-2 py-1 rounded-lg active:bg-white/40 transition-colors"
              >
                🐄 {cowCount} Vacas
              </button>
              <button 
                onClick={() => setDetailModal({ title: 'Novilhas', animals: animals.filter(a => a.category === 'heifer') })}
                className="bg-white/20 px-2 py-1 rounded-lg active:bg-white/40 transition-colors"
              >
                🐄 {heiferCount} Novilhas
              </button>
              <button 
                onClick={() => setDetailModal({ title: 'Animais em Lactação', animals: animals.filter(a => a.status === 'lactation') })}
                className="bg-white/20 px-2 py-1 rounded-lg active:bg-white/40 transition-colors"
              >
                🥛 {lactationCount} Em Lactação
              </button>
            </div>
          </div>
          <Activity className="absolute -right-4 -bottom-4 text-white/20" size={120} />
        </Card>
        
        <Card className="bg-blue-700 text-white border-none relative overflow-hidden shadow-md">
          <div className="relative z-10">
            <p className="text-blue-50 text-sm font-semibold opacity-90">Leite Hoje</p>
            <h2 className="text-2xl font-bold mt-1">{todayProduction.toFixed(1)}L</h2>
          </div>
          <Milk className="absolute -right-2 -bottom-2 text-white/20" size={70} />
        </Card>

        <Card className="bg-agro-earth text-white border-none relative overflow-hidden shadow-md">
          <div className="relative z-10">
            <p className="text-amber-50 text-sm font-semibold opacity-90">Alertas Ativos</p>
            <h2 className="text-2xl font-bold mt-1">{alerts.filter(a => a.type !== 'green').length}</h2>
          </div>
          <AlertTriangle className="absolute -right-2 -bottom-2 text-white/20" size={70} />
        </Card>

        {/* Cash Flow Summary */}
        <Card className="col-span-2 bg-white border-agro-green-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <DollarSign size={18} className="text-agro-green-600" />
              Fluxo de Caixa
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Este Mês</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <ArrowUpRight size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Receitas</p>
                <p className="font-bold text-green-600">R$ 12.450</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <ArrowDownLeft size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Despesas</p>
                <p className="font-bold text-red-600">R$ 8.200</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Tasks */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ClipboardList size={20} className="text-agro-green-600" />
            Tarefas de Hoje
          </h3>
          <span className="bg-agro-green-100 text-agro-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
            {events.filter(e => isSameDay(parseISO(e.date), new Date())).length} PENDENTES
          </span>
        </div>
        <div className="space-y-3">
          {events.filter(e => isSameDay(parseISO(e.date), new Date())).map(task => {
            const animal = animals.find(a => a.id === task.animalId);
            return (
              <Card key={task.id} className="flex items-center gap-4 border-l-4 border-l-agro-green-600">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  task.type === 'vaccine' ? 'bg-red-50 text-red-600' : 
                  task.type === 'insemination' ? 'bg-purple-50 text-purple-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {task.type === 'vaccine' ? <Activity size={20} /> : 
                   task.type === 'insemination' ? <Info size={20} /> :
                   <Calendar size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-800">{task.description}</p>
                  <p className="text-xs text-slate-500">{animal?.name} ({animal?.tag})</p>
                </div>
                <button className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300 hover:border-agro-green-600 hover:text-agro-green-600 transition-colors">
                  <Check size={16} />
                </button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Production Chart */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <TrendingUp size={18} className="text-agro-green-600" />
            Produção Semanal
          </h3>
          <span className="text-xs font-bold text-agro-green-600 bg-agro-green-50 px-2 py-1 rounded-lg">
            Últimos 7 dias
          </span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#16a34a' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#16a34a" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Alerts */}
      <section>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-agro-green-600" />
          Alertas
        </h3>
        <div className="space-y-2">
          {alerts.map((alert, idx) => {
            const isPVE = alert.text.includes('PVE');
            return (
              <div 
                key={idx} 
                onClick={() => {
                  if (isPVE) {
                    const pveAnimals = animals.filter(a => a.status === 'lactation' && a.lastCalving && differenceInDays(new Date(), parseISO(a.lastCalving)) >= config.pveDays);
                    setDetailModal({ title: 'Prontas para Inseminação (PVE)', animals: pveAnimals });
                  }
                }}
                className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${
                  alert.type === 'red' ? 'bg-red-50 border-red-500 text-red-700' :
                  alert.type === 'amber' ? 'bg-amber-50 border-amber-500 text-amber-700' :
                  'bg-agro-green-50 border-agro-green-500 text-agro-green-700'
                } ${isPVE ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
              >
                <div className="mt-0.5">{alert.icon}</div>
                <p className="text-sm font-medium">{alert.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Plus size={18} className="text-agro-green-600" />
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setIsAddingProduction(true)}
            className="p-4 bg-white rounded-2xl border border-agro-green-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Milk size={24} />
            </div>
            <span className="font-semibold text-sm">Lançar Leite</span>
          </button>
          <button 
            onClick={() => setIsAddingAnimal(true)}
            className="p-4 bg-white rounded-2xl border border-agro-green-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-agro-green-50 flex items-center justify-center text-agro-green-600">
              <Plus size={24} />
            </div>
            <span className="font-semibold text-sm">Novo Animal</span>
          </button>
        </div>
      </section>
    </motion.div>
  );
};

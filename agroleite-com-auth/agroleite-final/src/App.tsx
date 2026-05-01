/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  Milk, 
  ClipboardList, 
  Plus, 
  ChevronRight, 
  Calendar, 
  Activity,
  User,
  Search,
  ArrowLeft,
  Check,
  TrendingUp,
  X,
  Settings,
  AlertTriangle,
  Info,
  Wifi,
  Cloud,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  LogOut,
  Users,
  Crown,
  Shield
} from 'lucide-react';
import { AppUser } from './types';
import { userKey } from './auth';
import AdminPanel from './AdminPanel';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { useFarmAlerts } from './hooks/useFarmAlerts';
import { HomePage } from './pages/HomePage';
import { HerdPage } from './pages/HerdPage';
import { MilkingPage } from './pages/MilkingPage';
import { HealthPage } from './pages/HealthPage';
import { ConfigPage } from './pages/ConfigPage';
import { format, subDays, isSameDay, startOfDay, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Animal, MilkProduction, HealthEvent, FarmConfig } from './types';

// --- Mock Data ---
const INITIAL_ANIMALS: Animal[] = [
  { id: '1', name: 'Mimosa', tag: '001', breed: 'Holandesa', category: 'cow', status: 'lactation', dailyTarget: 25, weight: 550, ecc: 3.5, lastCalving: subDays(new Date(), 120).toISOString(), dryingDate: subDays(new Date(), -180).toISOString() },
  { id: '2', name: 'Estrela', tag: '002', breed: 'Jersey', category: 'cow', status: 'pregnant', dailyTarget: 15, weight: 420, ecc: 3.0, expectedCalving: subDays(new Date(), -45).toISOString() },
  { id: '3', name: 'Branca', tag: '003', breed: 'Girolando', category: 'cow', status: 'lactation', dailyTarget: 20, weight: 480, ecc: 3.2, lastCalving: subDays(new Date(), 30).toISOString() },
  { id: '4', name: 'Luna', tag: '004', breed: 'Holandesa', category: 'heifer', status: 'pregnant', dailyTarget: 0, weight: 380, ecc: 3.1, expectedCalving: subDays(new Date(), -15).toISOString() },
  { id: '5', name: 'Pérola', tag: '005', breed: 'Jersey', category: 'heifer', status: 'lactation', dailyTarget: 12, weight: 350, ecc: 2.9, lastCalving: subDays(new Date(), 10).toISOString() },
];

const INITIAL_PRODUCTION: MilkProduction[] = [
  { id: 'p1', animalId: '1', date: new Date().toISOString(), amount: 12.5, period: 'morning', quality: 'good', destination: 'tank' },
  { id: 'p2', animalId: '3', date: new Date().toISOString(), amount: 10.2, period: 'morning', quality: 'good', destination: 'tank' },
  { id: 'p4', animalId: '1', date: subDays(new Date(), 1).toISOString(), amount: 11.8, period: 'morning', quality: 'good', destination: 'tank' },
  { id: 'p5', animalId: '3', date: subDays(new Date(), 1).toISOString(), amount: 9.5, period: 'morning', quality: 'regular', destination: 'tank' },
];

const INITIAL_EVENTS: HealthEvent[] = [
  { id: 'e1', animalId: '2', date: format(new Date(), 'yyyy-MM-dd'), type: 'checkup', description: 'Acompanhamento de prenhez', responsible: 'Dr. Silva' },
  { id: 'e2', animalId: '4', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), type: 'vaccine', description: 'Vacina contra Febre Aftosa', nextDoseDate: format(subDays(new Date(), -180), 'yyyy-MM-dd'), responsible: 'Lucas' },
  { id: 'e3', animalId: '1', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), type: 'medication', description: 'Tratamento Mastite', withdrawalDays: 3, responsible: 'Lucas' },
];

const INITIAL_CONFIG: FarmConfig = {
  name: 'Fazenda Boa Vista',
  producer: 'Lucas Aurélio',
  location: 'Castro - PR',
  pveDays: 60,
  dryingPeriodDays: 60
};

// --- Components ---

// --- Main App ---

export default function App({ currentUser, onLogout }: { currentUser: AppUser; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'home' | 'herd' | 'milking' | 'health' | 'config'>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [productions, setProductions] = useState<MilkProduction[]>([]);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [config, setConfig] = useState<FarmConfig>({
    ...INITIAL_CONFIG,
    name: currentUser.farmName || INITIAL_CONFIG.name,
    producer: currentUser.name,
  });
  
  const [isAddingProduction, setIsAddingProduction] = useState(false);
  const [isAddingAnimal, setIsAddingAnimal] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [detailModal, setDetailModal] = useState<{ title: string, animals: Animal[] } | null>(null);

  // Form States
  const [newProdAnimalId, setNewProdAnimalId] = useState('');
  const [newProdAmount, setNewProdAmount] = useState('');
  const [newProdPeriod, setNewProdPeriod] = useState<MilkProduction['period']>('morning');
  const [newProdQuality, setNewProdQuality] = useState<MilkProduction['quality']>('good');
  const [newProdDestination, setNewProdDestination] = useState<MilkProduction['destination']>('tank');
  const [newProdObs, setNewProdObs] = useState('');

  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalTag, setNewAnimalTag] = useState('');
  const [newAnimalBreed, setNewAnimalBreed] = useState('');
  const [newAnimalCategory, setNewAnimalCategory] = useState<Animal['category']>('cow');
  const [newAnimalStatus, setNewAnimalStatus] = useState<Animal['status']>('lactation');
  const [newAnimalTarget, setNewAnimalTarget] = useState('');
  const [newAnimalWeight, setNewAnimalWeight] = useState('');
  const [newAnimalECC, setNewAnimalECC] = useState('');
  const [newAnimalLastCalving, setNewAnimalLastCalving] = useState('');
  const [newAnimalExpectedCalving, setNewAnimalExpectedCalving] = useState('');
  const [newAnimalDryingDate, setNewAnimalDryingDate] = useState('');

  const [newEventAnimalId, setNewEventAnimalId] = useState('');
  const [newEventType, setNewEventType] = useState<HealthEvent['type']>('vaccine');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newEventNextDate, setNewEventNextDate] = useState('');
  const [newEventResp, setNewEventResp] = useState('');
  const [newEventWithdrawal, setNewEventWithdrawal] = useState('');

  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  // Stats
  const todayProduction = useMemo(() => {
    return productions
      .filter(p => isSameDay(new Date(p.date), new Date()))
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [productions]);

  const cowCount = useMemo(() => animals.filter(a => a.category === 'cow').length, [animals]);
  const heiferCount = useMemo(() => animals.filter(a => a.category === 'heifer').length, [animals]);
  const lactationCount = useMemo(() => animals.filter(a => a.status === 'lactation').length, [animals]);

  const selectedAnimal = useMemo(() => 
    animals.find(a => a.id === selectedAnimalId), 
  [animals, selectedAnimalId]);

  const selectedAnimalProductions = useMemo(() => 
    productions.filter(p => p.animalId === selectedAnimalId),
  [productions, selectedAnimalId]);

  const selectedAnimalEvents = useMemo(() => 
    events.filter(e => e.animalId === selectedAnimalId),
  [events, selectedAnimalId]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    return last7Days.map(day => {
      const dayProd = productions
        .filter(p => isSameDay(new Date(p.date), day))
        .reduce((acc, curr) => acc + curr.amount, 0);
      return {
        name: format(day, 'dd/MM'),
        total: parseFloat(dayProd.toFixed(1))
      };
    });
  }, [productions]);

  const selectedAnimalChartData = useMemo(() => {
    if (!selectedAnimalId) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    return last7Days.map(day => {
      const dayProd = productions
        .filter(p => p.animalId === selectedAnimalId && isSameDay(new Date(p.date), day))
        .reduce((acc, curr) => acc + curr.amount, 0);
      return {
        name: format(day, 'dd/MM'),
        total: parseFloat(dayProd.toFixed(1))
      };
    });
  }, [productions, selectedAnimalId]);

  // Handlers
  const handleAddProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdAnimalId || !newProdAmount) return;

    const newProd: MilkProduction = {
      id: Math.random().toString(36).substr(2, 9),
      animalId: newProdAnimalId,
      amount: parseFloat(newProdAmount),
      date: new Date().toISOString(),
      period: newProdPeriod,
      quality: newProdQuality,
      destination: newProdDestination,
      observation: newProdObs
    };
    setProductions([newProd, ...productions]);
    setIsAddingProduction(false);
    setNewProdAnimalId('');
    setNewProdAmount('');
    setNewProdObs('');
    triggerToast();
  };

  const handleClearData = () => {
    if (confirm('Deseja apagar todos os dados?')) {
      localStorage.removeItem(userKey(currentUser.id, 'animals'));
      localStorage.removeItem(userKey(currentUser.id, 'productions'));
      localStorage.removeItem(userKey(currentUser.id, 'events'));
      localStorage.removeItem(userKey(currentUser.id, 'config'));
      setAnimals([]);
      setProductions([]);
      setEvents([]);
      setConfig({ ...INITIAL_CONFIG, name: currentUser.farmName || INITIAL_CONFIG.name, producer: currentUser.name });
      triggerToast();
    }
  };

  const handleAddAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimalName || !newAnimalTag) return;

    const newAnimal: Animal = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAnimalName,
      tag: newAnimalTag,
      breed: newAnimalBreed || 'Indefinida',
      category: newAnimalCategory,
      status: newAnimalStatus,
      dailyTarget: parseFloat(newAnimalTarget) || 0,
      weight: parseFloat(newAnimalWeight) || undefined,
      ecc: parseFloat(newAnimalECC) || undefined,
      lastCalving: newAnimalLastCalving || undefined,
      expectedCalving: newAnimalExpectedCalving || undefined,
      dryingDate: newAnimalDryingDate || undefined
    };
    setAnimals([...animals, newAnimal]);
    setIsAddingAnimal(false);
    setNewAnimalName('');
    setNewAnimalTag('');
    setNewAnimalBreed('');
    setNewAnimalTarget('');
    setNewAnimalWeight('');
    setNewAnimalECC('');
    setNewAnimalLastCalving('');
    setNewAnimalExpectedCalving('');
    setNewAnimalDryingDate('');
    triggerToast();
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventAnimalId || !newEventDesc) return;

    const newEvent: HealthEvent = {
      id: Math.random().toString(36).substr(2, 9),
      animalId: newEventAnimalId,
      type: newEventType,
      description: newEventDesc,
      date: newEventDate,
      nextDoseDate: newEventNextDate,
      responsible: newEventResp,
      withdrawalDays: parseFloat(newEventWithdrawal) || undefined
    };
    setEvents([newEvent, ...events]);
    setIsAddingEvent(false);
    setNewEventAnimalId('');
    setNewEventDesc('');
    setNewEventNextDate('');
    setNewEventResp('');
    setNewEventWithdrawal('');
    triggerToast();
  };

  const alerts = useFarmAlerts(animals, events, config);

  const toggleAnimalStatus = (id: string) => {
    setAnimals(animals.map(a => {
      if (a.id === id) {
        const nextStatus: Animal['status'] = a.status === 'lactation' ? 'dry' : 'lactation';
        return { ...a, status: nextStatus };
      }
      return a;
    }));
    triggerToast();
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Persistence
  useEffect(() => {
    try {
      const savedAnimals    = localStorage.getItem(userKey(currentUser.id, 'animals'));
      const savedProductions= localStorage.getItem(userKey(currentUser.id, 'productions'));
      const savedEvents     = localStorage.getItem(userKey(currentUser.id, 'events'));
      const savedConfig     = localStorage.getItem(userKey(currentUser.id, 'config'));

      if (savedAnimals)     setAnimals(JSON.parse(savedAnimals));
      if (savedProductions) setProductions(JSON.parse(savedProductions));
      if (savedEvents)      setEvents(JSON.parse(savedEvents));
      if (savedConfig)      setConfig(JSON.parse(savedConfig));
    } catch (error) {
      console.error("Erro ao carregar dados locais:", error);
    }
  }, [currentUser.id]);

  useEffect(() => {
    localStorage.setItem(userKey(currentUser.id, 'animals'), JSON.stringify(animals));
  }, [animals, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(userKey(currentUser.id, 'productions'), JSON.stringify(productions));
  }, [productions, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(userKey(currentUser.id, 'events'), JSON.stringify(events));
  }, [events, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(userKey(currentUser.id, 'config'), JSON.stringify(config));
  }, [config, currentUser.id]);

  useEffect(() => {
    if (isAddingProduction && animals.length > 0) {
      const firstLactation = animals.find(a => a.status === 'lactation');
      if (firstLactation) setNewProdAnimalId(firstLactation.id);
    }
  }, [isAddingProduction, animals]);

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 relative overflow-hidden bg-agro-green-50">
      {/* Header */}
      <header className="p-6 pt-8 bg-white border-b border-agro-green-100 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {selectedAnimalId && (
            <button onClick={() => setSelectedAnimalId(null)} className="text-slate-400 active:text-agro-green-600">
              <ArrowLeft size={24} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-agro-green-700 font-serif">
              {selectedAnimalId ? selectedAnimal?.name : config.name}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <span>{selectedAnimalId ? `Brinco ${selectedAnimal?.tag}` : format(new Date(), "EEEE, dd/MM/yyyy", { locale: ptBR })}</span>
              {!selectedAnimalId && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <div className="flex items-center gap-1 text-agro-green-600">
                    <Wifi size={12} />
                    <span className="font-bold">Online</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <div className="flex items-center gap-1 text-blue-500">
                    <Cloud size={12} />
                    <span>24°C</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {!selectedAnimalId && (
          <div className="w-10 h-10 rounded-full bg-agro-green-100 flex items-center justify-center text-agro-green-700">
            <User size={20} />
          </div>
        )}
      </header>

      {/* Content */}
      <main className="p-4">
        <AnimatePresence mode="wait">
          {selectedAnimalId ? (
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
                    {selectedAnimal?.category === 'cow' ? '🐄 Vaca Leite' : '🐄 Vaca Novilha'} 
                    {' • '}{selectedAnimal?.breed}
                  </p>
                  <div className="space-y-1 mt-2">
                    {selectedAnimal?.expectedCalving && (
                      <p className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        <Calendar size={12} />
                        Previsão Parto: {format(parseISO(selectedAnimal.expectedCalving), 'dd/MM/yyyy')}
                      </p>
                    )}
                    {selectedAnimal?.lastCalving && (
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Milk size={12} />
                        Último Parto: {format(parseISO(selectedAnimal.lastCalving), 'dd/MM/yyyy')}
                      </p>
                    )}
                    {selectedAnimal?.dryingDate && (
                      <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <Activity size={12} />
                        Data Secagem: {format(parseISO(selectedAnimal.dryingDate), 'dd/MM/yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    selectedAnimal?.status === 'lactation' ? 'bg-green-100 text-green-700' :
                    selectedAnimal?.status === 'pregnant' ? 'bg-blue-100 text-blue-700' :
                    selectedAnimal?.status === 'dry' ? 'bg-slate-100 text-slate-700' :
                    selectedAnimal?.status === 'pre-calving' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedAnimal?.status === 'lactation' ? 'Lactação' :
                     selectedAnimal?.status === 'pregnant' ? 'Prenha' :
                     selectedAnimal?.status === 'dry' ? 'Seca' : 
                     selectedAnimal?.status === 'pre-calving' ? 'Pré-Parto' : 'Doente'}
                  </span>
                </div>
              </Card>

              {/* Biometrics Card */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white">
                  <p className="text-xs font-bold text-slate-400 uppercase">Peso Atual</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-2xl font-bold text-agro-green-700">{selectedAnimal?.weight || '--'}</p>
                    <p className="text-xs font-bold text-slate-400">kg</p>
                  </div>
                </Card>
                <Card className="bg-white">
                  <p className="text-xs font-bold text-slate-400 uppercase">Escore (ECC)</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-2xl font-bold text-agro-green-700">{selectedAnimal?.ecc || '--'}</p>
                    <p className="text-xs font-bold text-slate-400">/ 5</p>
                  </div>
                </Card>
              </div>

              {/* Individual Chart (Only for Dairy) */}
              {selectedAnimal?.category === 'cow' && (
                <Card className="p-4">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-agro-green-600" />
                    Produção Individual (Litros)
                  </h3>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedAnimalChartData}>
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
                {selectedAnimal?.category === 'cow' && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewProdAnimalId(selectedAnimalId!);
                      setIsAddingProduction(true);
                    }}
                  >
                    Lançar Leite
                  </Button>
                )}
                <Button 
                  variant={selectedAnimal?.status === 'dry' ? 'primary' : 'secondary'}
                  onClick={() => toggleAnimalStatus(selectedAnimalId!)}
                  className={selectedAnimal?.category !== 'cow' ? 'col-span-2' : ''}
                >
                  {selectedAnimal?.status === 'dry' ? 'Ativar' : 'Alterar Status'}
                </Button>
              </div>

              {/* History */}
              <section>
                <h3 className="text-lg font-bold mb-3">Histórico Recente</h3>
                <div className="space-y-3">
                  {selectedAnimal?.category === 'cow' && selectedAnimalProductions.slice(0, 3).map(prod => (
                    <Card key={prod.id} className="flex justify-between items-center py-3">
                      <div className="flex items-center gap-3">
                        <Milk size={18} className="text-blue-500" />
                        <span className="text-sm font-medium">{format(new Date(prod.date), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                      </div>
                      <span className="font-bold text-agro-green-700">{prod.amount}L</span>
                    </Card>
                  ))}
                  {selectedAnimalEvents.map(event => (
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
          ) : activeTab === 'home' && (
            <HomePage
              animals={animals}
              productions={productions}
              events={events}
              config={config}
              todayProduction={todayProduction}
              cowCount={cowCount}
              heiferCount={heiferCount}
              lactationCount={lactationCount}
              alerts={alerts}
              chartData={chartData}
              setDetailModal={setDetailModal}
              setIsAddingProduction={setIsAddingProduction}
              setIsAddingAnimal={setIsAddingAnimal}
            />
          )}

          {activeTab === 'herd' && (
            <HerdPage
              animals={animals}
              setIsAddingAnimal={setIsAddingAnimal}
              setSelectedAnimalId={setSelectedAnimalId}
            />
          )}

          {activeTab === 'milking' && (
            <MilkingPage
              productions={productions}
              animals={animals}
              todayProduction={todayProduction}
              setIsAddingProduction={setIsAddingProduction}
            />
          )}

          {activeTab === 'health' && (
            <HealthPage
              events={events}
              animals={animals}
              setIsAddingEvent={setIsAddingEvent}
            />
          )}

          {activeTab === 'config' && (
            <ConfigPage
              config={config}
              setConfig={setConfig}
              animalsCount={animals.length}
              productionsCount={productions.length}
              currentUser={currentUser}
              onClearData={handleClearData}
              onShowAdmin={() => setShowAdmin(true)}
              onLogout={onLogout}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAddingProduction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.form 
              onSubmit={handleAddProduction}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Lançar Produção</h2>
                <button type="button" onClick={() => setIsAddingProduction(false)} className="text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Selecione o Animal (Leite)</label>
                  <select 
                    value={newProdAnimalId}
                    onChange={(e) => setNewProdAnimalId(e.target.value)}
                    className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold appearance-none"
                    required
                  >
                    <option value="">Selecione o animal...</option>
                    {animals.filter(a => a.status === 'lactation').map(animal => (
                      <option key={animal.id} value={animal.id}>{animal.name} ({animal.tag})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Quantidade (Litros)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newProdAmount}
                    onChange={(e) => setNewProdAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none text-2xl font-bold text-agro-green-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Turno</label>
                    <select 
                      value={newProdPeriod}
                      onChange={(e) => setNewProdPeriod(e.target.value as any)}
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold appearance-none"
                    >
                      <option value="morning">🌅 Manhã</option>
                      <option value="afternoon">☀️ Tarde</option>
                      <option value="night">🌙 Noite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Destino</label>
                    <select 
                      value={newProdDestination}
                      onChange={(e) => setNewProdDestination(e.target.value as any)}
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold appearance-none"
                    >
                      <option value="tank">🚛 Tanque</option>
                      <option value="calves">🍼 Bezerros</option>
                      <option value="internal">🏠 Consumo</option>
                      <option value="disposal">❌ Descarte</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Qualidade</label>
                  <select 
                    value={newProdQuality}
                    onChange={(e) => setNewProdQuality(e.target.value as any)}
                    className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold appearance-none"
                  >
                    <option value="good">✅ Boa</option>
                    <option value="regular">⚠️ Regular</option>
                    <option value="low">❌ Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Observação (opcional)</label>
                  <input 
                    type="text" 
                    value={newProdObs}
                    onChange={(e) => setNewProdObs(e.target.value)}
                    placeholder="Ex: animal agitado"
                    className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setIsAddingProduction(false)}>Cancelar</Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}

        {isAddingAnimal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.form 
              onSubmit={handleAddAnimal}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Cadastrar Novo Animal</h2>
                <button type="button" onClick={() => setIsAddingAnimal(false)} className="text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Categoria</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'cow', label: 'Vaca Leite' },
                      { id: 'heifer', label: 'Vaca Novilha' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewAnimalCategory(cat.id as any)}
                        className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          newAnimalCategory === cat.id 
                            ? 'border-agro-green-600 bg-agro-green-50 text-agro-green-700' 
                            : 'border-slate-100 text-slate-400'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Nome do Animal</label>
                  <input 
                    type="text" 
                    value={newAnimalName}
                    onChange={(e) => setNewAnimalName(e.target.value)}
                    placeholder="Ex: Mimosa"
                    className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Brinco</label>
                    <input 
                      type="text" 
                      value={newAnimalTag}
                      onChange={(e) => setNewAnimalTag(e.target.value)}
                      placeholder="000"
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Raça</label>
                    <input 
                      type="text" 
                      value={newAnimalBreed}
                      onChange={(e) => setNewAnimalBreed(e.target.value)}
                      placeholder="Ex: Holandesa"
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Status</label>
                    <select 
                      value={newAnimalStatus}
                      onChange={(e) => setNewAnimalStatus(e.target.value as any)}
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold appearance-none"
                    >
                      <option value="lactation">Em Lactação</option>
                      <option value="dry">Seca</option>
                      <option value="pregnant">Prenha</option>
                      <option value="pre-calving">Pré-Parto</option>
                      <option value="sick">Doente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Meta Diária (L)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={newAnimalTarget}
                      onChange={(e) => setNewAnimalTarget(e.target.value)}
                      placeholder="0.0"
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase">Datas Reprodutivas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Último Parto</label>
                      <input 
                        type="date" 
                        value={newAnimalLastCalving}
                        onChange={(e) => setNewAnimalLastCalving(e.target.value)}
                        className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Previsão Parto</label>
                      <input 
                        type="date" 
                        value={newAnimalExpectedCalving}
                        onChange={(e) => setNewAnimalExpectedCalving(e.target.value)}
                        className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none text-xs font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Data Prevista Secagem</label>
                    <input 
                      type="date" 
                      value={newAnimalDryingDate}
                      onChange={(e) => setNewAnimalDryingDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Peso (kg)</label>
                    <input 
                      type="number" 
                      value={newAnimalWeight}
                      onChange={(e) => setNewAnimalWeight(e.target.value)}
                      placeholder="0"
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">ECC (1-5)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="1"
                      max="5"
                      value={newAnimalECC}
                      onChange={(e) => setNewAnimalECC(e.target.value)}
                      placeholder="3.0"
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setIsAddingAnimal(false)}>Cancelar</Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}

        {isAddingEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.form 
              onSubmit={handleAddEvent}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Registrar Evento</h2>
                <button type="button" onClick={() => setIsAddingEvent(false)} className="text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Animal</label>
                  <select 
                    value={newEventAnimalId}
                    onChange={(e) => setNewEventAnimalId(e.target.value)}
                    className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold appearance-none"
                    required
                  >
                    <option value="">Selecione...</option>
                    {animals.map(animal => (
                      <option key={animal.id} value={animal.id}>{animal.name} ({animal.tag})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Tipo de Evento</label>
                  <select 
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold appearance-none"
                  >
                    <option value="vaccine">💉 Vacina</option>
                    <option value="medication">💊 Medicamento</option>
                    <option value="insemination">🧬 Inseminação</option>
                    <option value="checkup">🩺 Checkup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Descrição</label>
                  <input 
                    type="text" 
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                    placeholder="Ex: Febre Aftosa"
                    className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Data</label>
                    <input 
                      type="date" 
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Próxima Dose</label>
                    <input 
                      type="date" 
                      value={newEventNextDate}
                      onChange={(e) => setNewEventNextDate(e.target.value)}
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                    />
                  </div>
                </div>

                {newEventType === 'medication' && (
                  <div>
                    <label className="block text-sm font-bold mb-2">Dias de Carência (Leite/Carne)</label>
                    <input 
                      type="number" 
                      value={newEventWithdrawal}
                      onChange={(e) => setNewEventWithdrawal(e.target.value)}
                      placeholder="0"
                      className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none font-semibold"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setIsAddingEvent(false)}>Cancelar</Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center sticky top-0 bg-white pb-2 z-10">
                <h2 className="text-xl font-bold">{detailModal.title}</h2>
                <button type="button" onClick={() => setDetailModal(null)} className="text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-3">
                {detailModal.animals.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 font-medium">Nenhum animal nesta categoria.</p>
                ) : (
                  detailModal.animals.map(animal => (
                    <Card 
                      key={animal.id} 
                      className="flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
                      onClick={() => {
                        setSelectedAnimalId(animal.id);
                        setDetailModal(null);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-agro-green-50 flex items-center justify-center text-agro-green-600">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{animal.name}</p>
                          <p className="text-xs text-slate-500">Brinco: {animal.tag}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </Card>
                  ))
                )}
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => setDetailModal(null)}>Fechar</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-agro-green-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold">
              <Check size={18} />
              Salvo com sucesso!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel */}
      {showAdmin && currentUser.role === 'admin' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <AdminPanel currentUser={currentUser} onClose={() => setShowAdmin(false)} />
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-agro-green-100 px-6 py-3 flex justify-between items-center z-40 max-w-md mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-agro-green-700' : 'text-slate-500'}`}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Início</span>
        </button>
        <button 
          onClick={() => setActiveTab('herd')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'herd' ? 'text-agro-green-700' : 'text-slate-500'}`}
        >
          <ClipboardList size={24} strokeWidth={activeTab === 'herd' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Rebanho</span>
        </button>
        <button 
          onClick={() => setActiveTab('milking')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'milking' ? 'text-agro-green-700' : 'text-slate-500'}`}
        >
          <Milk size={24} strokeWidth={activeTab === 'milking' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Ordenha</span>
        </button>
        <button 
          onClick={() => setActiveTab('health')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'health' ? 'text-agro-green-700' : 'text-slate-500'}`}
        >
          <Calendar size={24} strokeWidth={activeTab === 'health' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Eventos</span>
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'config' ? 'text-agro-green-700' : 'text-slate-500'}`}
        >
          <Settings size={24} strokeWidth={activeTab === 'config' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Ajustes</span>
        </button>
      </nav>
    </div>
  );
}

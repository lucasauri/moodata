/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Home,
  Milk,
  ClipboardList,
  Calendar,
  User,
  ArrowLeft,
  Settings,
  Wifi,
} from 'lucide-react';
import { AppUser } from './types';
import AdminPanel from './AdminPanel';
import { AnimatePresence } from 'motion/react';
import { useFarmAlerts } from './hooks/useFarmAlerts';
import { useFarmData } from './hooks/useFarmData';
import { HomePage } from './pages/HomePage';
import { HerdPage } from './pages/HerdPage';
import { MilkingPage } from './pages/MilkingPage';
import { HealthPage } from './pages/HealthPage';
import { ConfigPage } from './pages/ConfigPage';
import { AnimalDetailPage } from './pages/AnimalDetailPage';
import { AddProductionModal } from './components/modals/AddProductionModal';
import { AddAnimalModal } from './components/modals/AddAnimalModal';
import { AddEventModal } from './components/modals/AddEventModal';
import { DetailModal } from './components/modals/DetailModal';
import { Toast } from './components/ui/Toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Animal } from './types';

export default function App({ currentUser, onLogout }: { currentUser: AppUser; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'home' | 'herd' | 'milking' | 'health' | 'config'>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  // Modals
  const [isAddingProduction, setIsAddingProduction] = useState(false);
  const [isAddingAnimal, setIsAddingAnimal] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [detailModal, setDetailModal] = useState<{ title: string; animals: Animal[] } | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Data hook
  const farm = useFarmData(currentUser.id, currentUser.name, currentUser.farmName);
  const alerts = useFarmAlerts(farm.animals, farm.events, farm.config);

  // Selected animal data
  const selectedAnimal = useMemo(() =>
    farm.animals.find(a => a.id === selectedAnimalId),
    [farm.animals, selectedAnimalId]
  );

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Modal save handlers with toast
  const handleSaveProduction = async (data: Parameters<typeof farm.addProduction>[0]) => {
    await farm.addProduction(data);
    triggerToast();
  };

  const handleSaveAnimal = async (data: Parameters<typeof farm.addAnimal>[0]) => {
    await farm.addAnimal(data);
    triggerToast();
  };

  const handleSaveEvent = async (data: Parameters<typeof farm.addEvent>[0]) => {
    await farm.addEvent(data);
    triggerToast();
  };

  const handleToggleStatus = async () => {
    if (!selectedAnimalId) return;
    await farm.toggleAnimalStatus(selectedAnimalId);
    triggerToast();
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 relative overflow-hidden bg-transparent">
      {/* Header */}
      <header className="p-6 pt-8 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          {selectedAnimalId ? (
            <button onClick={() => setSelectedAnimalId(null)} className="text-slate-400 hover:text-agro-green-600 active:scale-95 transition-all">
              <ArrowLeft size={24} />
            </button>
          ) : (
            <img src="/logo.png" alt="MooData" className="w-10 h-10 object-contain mix-blend-multiply" onError={(e) => { e.currentTarget.style.display='none'; }} />
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-agro-green-700 tracking-tight leading-none">
              {selectedAnimalId ? selectedAnimal?.name : farm.config.name}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-xs mt-1 font-medium">
              <span>{selectedAnimalId ? `Brinco ${selectedAnimal?.tag}` : format(new Date(), "EEEE, dd/MM/yyyy", { locale: ptBR })}</span>
              {!selectedAnimalId && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <div className="flex items-center gap-1 text-agro-green-500">
                    <Wifi size={12} strokeWidth={2.5} />
                    <span className="font-bold tracking-wide">ONLINE</span>
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
          {selectedAnimalId && selectedAnimal ? (
            <AnimalDetailPage
              animal={selectedAnimal}
              productions={farm.getAnimalProductions(selectedAnimalId)}
              events={farm.getAnimalEvents(selectedAnimalId)}
              chartData={farm.getAnimalChartData(selectedAnimalId)}
              onAddProduction={() => setIsAddingProduction(true)}
              onToggleStatus={handleToggleStatus}
            />
          ) : activeTab === 'home' ? (
            <HomePage
              animals={farm.animals}
              productions={farm.productions}
              events={farm.events}
              config={farm.config}
              todayProduction={farm.todayProduction}
              cowCount={farm.cowCount}
              heiferCount={farm.heiferCount}
              lactationCount={farm.lactationCount}
              alerts={alerts}
              chartData={farm.chartData}
              setDetailModal={setDetailModal}
              setIsAddingProduction={setIsAddingProduction}
              setIsAddingAnimal={setIsAddingAnimal}
            />
          ) : activeTab === 'herd' ? (
            <HerdPage
              animals={farm.animals}
              setIsAddingAnimal={setIsAddingAnimal}
              setSelectedAnimalId={setSelectedAnimalId}
            />
          ) : activeTab === 'milking' ? (
            <MilkingPage
              productions={farm.productions}
              animals={farm.animals}
              todayProduction={farm.todayProduction}
              setIsAddingProduction={setIsAddingProduction}
            />
          ) : activeTab === 'health' ? (
            <HealthPage
              events={farm.events}
              animals={farm.animals}
              setIsAddingEvent={setIsAddingEvent}
            />
          ) : activeTab === 'config' ? (
            <ConfigPage
              config={farm.config}
              setConfig={farm.setConfig}
              animalsCount={farm.animals.length}
              productionsCount={farm.productions.length}
              currentUser={currentUser}
              onClearData={() => {}}
              onShowAdmin={() => setShowAdmin(true)}
              onLogout={onLogout}
            />
          ) : null}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AddProductionModal
        isOpen={isAddingProduction}
        onClose={() => setIsAddingProduction(false)}
        animals={farm.animals}
        onSave={handleSaveProduction}
        preselectedAnimalId={selectedAnimalId || undefined}
      />

      <AddAnimalModal
        isOpen={isAddingAnimal}
        onClose={() => setIsAddingAnimal(false)}
        onSave={handleSaveAnimal}
      />

      <AddEventModal
        isOpen={isAddingEvent}
        onClose={() => setIsAddingEvent(false)}
        animals={farm.animals}
        onSave={handleSaveEvent}
      />

      <DetailModal
        data={detailModal}
        onClose={() => setDetailModal(null)}
        onSelectAnimal={(id) => setSelectedAnimalId(id)}
      />

      {/* Toast */}
      <Toast isVisible={showToast} />

      {/* Admin Panel */}
      {showAdmin && currentUser.role === 'admin' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <AdminPanel currentUser={currentUser} onClose={() => setShowAdmin(false)} />
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40 max-w-md mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        {([
          { id: 'home', icon: Home, label: 'Início' },
          { id: 'herd', icon: ClipboardList, label: 'Rebanho' },
          { id: 'milking', icon: Milk, label: 'Ordenha' },
          { id: 'health', icon: Calendar, label: 'Eventos' },
          { id: 'config', icon: Settings, label: 'Ajustes' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedAnimalId(null); }}
            className={`flex flex-col items-center gap-1.5 transition-colors ${
              activeTab === tab.id ? 'text-agro-green-700' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

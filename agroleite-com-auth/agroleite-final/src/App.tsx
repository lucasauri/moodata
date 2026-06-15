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
import { MovementsPage } from './pages/MovementsPage';
import { AnimalDetailPage } from './pages/AnimalDetailPage';
import { AddProductionModal } from './components/modals/AddProductionModal';
import { AddAnimalModal } from './components/modals/AddAnimalModal';
import { EditAnimalModal } from './components/modals/EditAnimalModal';
import { AddEventModal } from './components/modals/AddEventModal';
import { DetailModal } from './components/modals/DetailModal';
import { Toast } from './components/ui/Toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Animal } from './types';

export default function App({ currentUser, onLogout }: { currentUser: AppUser; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'home' | 'herd' | 'movements' | 'milking' | 'health' | 'config'>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);

  // Modals
  const [isAddingProduction, setIsAddingProduction] = useState(false);
  const [isAddingAnimal, setIsAddingAnimal] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState<Animal | null>(null);
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

  const handleSaveProduction = async (data: Parameters<typeof farm.addProduction>[0]) => {
    await farm.addProduction(data);
    triggerToast();
  };

  const handleSaveMultipleProductions = async (dataArray: Parameters<typeof farm.addProduction>[0][]) => {
    await farm.addMultipleProductions(dataArray);
    triggerToast();
  };

  const handleSaveAnimal = async (data: Parameters<typeof farm.addAnimal>[0]) => {
    await farm.addAnimal(data);
    triggerToast();
  };

  const handleUpdateAnimal = async (id: string, data: Partial<Animal>) => {
    await farm.updateAnimal(id, data);
    triggerToast();
  };

  const handleDeleteAnimal = async (id: string) => {
    await farm.deleteAnimal(id);
    if (selectedAnimalId === id) {
      setSelectedAnimalId(null);
    }
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MooData" className="w-8 h-8 object-contain mix-blend-multiply" onError={(e) => { e.currentTarget.style.display='none'; }} />
            <h1 className="text-xl font-extrabold text-agro-green-700 tracking-tight">MooData Web</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {([
            { id: 'home', icon: Home, label: 'Início' },
            { id: 'herd', icon: ClipboardList, label: 'Rebanho' },
            { id: 'movements', icon: ClipboardList, label: 'Movimentação', isSub: true },
            { id: 'milking', icon: Milk, label: 'Ordenha' },
            { id: 'health', icon: Calendar, label: 'Eventos' },
            { id: 'config', icon: Settings, label: 'Ajustes' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedAnimalId(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                'isSub' in tab && tab.isSub ? 'ml-6 text-sm py-2' : ''
              } ${
                activeTab === tab.id 
                  ? 'bg-agro-green-50 text-agro-green-700' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <tab.icon size={'isSub' in tab && tab.isSub ? 16 : 20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-agro-green-100 flex items-center justify-center text-agro-green-700">
              <User size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-700 truncate">{currentUser.name}</p>
              <p className="text-xs font-semibold text-slate-400 truncate">{currentUser.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-4">
            {selectedAnimalId && (
              <button onClick={() => setSelectedAnimalId(null)} className="text-slate-400 hover:text-agro-green-600 active:scale-95 transition-all bg-slate-50 p-2 rounded-full">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 leading-none">
                {selectedAnimalId ? selectedAnimal?.name : farm.config.name}
              </h2>
              <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 font-medium">
                <span>{selectedAnimalId ? `Brinco ${selectedAnimal?.tag}` : format(new Date(), "EEEE, dd/MM/yyyy", { locale: ptBR })}</span>
                {!selectedAnimalId && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <div className="flex items-center gap-1.5 text-agro-green-500">
                      <Wifi size={14} strokeWidth={2.5} />
                      <span className="font-bold tracking-wide">ONLINE</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <AnimatePresence mode="wait">
          {selectedAnimalId && selectedAnimal ? (
            <AnimalDetailPage
              animal={selectedAnimal}
              productions={farm.getAnimalProductions(selectedAnimalId)}
              events={farm.getAnimalEvents(selectedAnimalId)}
              chartData={farm.getAnimalChartData(selectedAnimalId)}
              onAddProduction={() => setIsAddingProduction(true)}
              onToggleStatus={handleToggleStatus}
              onEditAnimal={() => setAnimalToEdit(selectedAnimal)}
              onDeleteAnimal={() => {
                if (window.confirm('Deseja excluir este animal?')) {
                  handleDeleteAnimal(selectedAnimalId);
                }
              }}
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
              onEditAnimal={(id) => {
                const animal = farm.animals.find(a => a.id === id);
                if (animal) setAnimalToEdit(animal);
              }}
              onDeleteAnimal={handleDeleteAnimal}
            />
          ) : activeTab === 'movements' ? (
            <MovementsPage
              events={farm.events}
              animals={farm.animals}
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
              setConfig={farm.updateConfig}
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
        onSaveMultiple={handleSaveMultipleProductions}
        preselectedAnimalId={selectedAnimalId || undefined}
      />

      <AddAnimalModal
        isOpen={isAddingAnimal}
        onClose={() => setIsAddingAnimal(false)}
        onSave={handleSaveAnimal}
      />

      <EditAnimalModal
        isOpen={!!animalToEdit}
        onClose={() => setAnimalToEdit(null)}
        initialData={animalToEdit || undefined}
        onSave={handleUpdateAnimal}
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

      </div>
    </div>
  );
}

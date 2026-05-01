import React from 'react';
import { motion } from 'motion/react';
import { Users, LogOut } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FarmConfig, AppUser } from '../types';

interface ConfigPageProps {
  config: FarmConfig;
  setConfig: (config: FarmConfig) => void;
  animalsCount: number;
  productionsCount: number;
  currentUser: AppUser;
  onClearData: () => void;
  onShowAdmin: () => void;
  onLogout: () => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({
  config,
  setConfig,
  animalsCount,
  productionsCount,
  currentUser,
  onClearData,
  onShowAdmin,
  onLogout
}) => {
  return (
    <motion.div 
      key="config"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold">Configurações</h2>
      
      <Card className="space-y-4">
        <h3 className="font-bold text-agro-green-700 border-b border-agro-green-100 pb-2">Minha Fazenda</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Nome</p>
              <p className="font-medium">{config.name}</p>
            </div>
            <Button variant="ghost" className="text-xs h-8 px-2" onClick={() => {
              const val = prompt('Nome da Fazenda', config.name);
              if (val) setConfig({ ...config, name: val });
            }}>Editar</Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Produtor</p>
              <p className="font-medium">{config.producer}</p>
            </div>
            <Button variant="ghost" className="text-xs h-8 px-2" onClick={() => {
              const val = prompt('Nome do Produtor', config.producer);
              if (val) setConfig({ ...config, producer: val });
            }}>Editar</Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Localização</p>
              <p className="font-medium">{config.location}</p>
            </div>
            <Button variant="ghost" className="text-xs h-8 px-2" onClick={() => {
              const val = prompt('Localização', config.location);
              if (val) setConfig({ ...config, location: val });
            }}>Editar</Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-bold text-agro-green-700 border-b border-agro-green-100 pb-2">Ciclo Reprodutivo</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">PVE (Espera Pós-Parto)</p>
              <p className="font-medium">{config.pveDays} dias</p>
            </div>
            <Button variant="ghost" className="text-xs h-8 px-2" onClick={() => {
              const val = prompt('Dias de PVE (Período Voluntário de Espera)', config.pveDays.toString());
              if (val) setConfig({ ...config, pveDays: parseInt(val) || 60 });
            }}>Editar</Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Período de Secagem</p>
              <p className="font-medium">{config.dryingPeriodDays} dias</p>
            </div>
            <Button variant="ghost" className="text-xs h-8 px-2" onClick={() => {
              const val = prompt('Dias para Secagem (antes do parto)', config.dryingPeriodDays.toString());
              if (val) setConfig({ ...config, dryingPeriodDays: parseInt(val) || 60 });
            }}>Editar</Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-bold text-agro-green-700 border-b border-agro-green-100 pb-2">Dados do App</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase">Animais</p>
            <p className="text-xl font-bold">{animalsCount}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase">Registros</p>
            <p className="text-xl font-bold">{productionsCount}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={onClearData}>Limpar Dados</Button>
      </Card>

      <div className="text-center py-4">
        <p className="text-xs text-slate-400">AgroLeite v1.1 · {currentUser.name}</p>
        <p className="text-[10px] text-slate-300">{currentUser.email}</p>
      </div>

      {/* Admin — gerenciar usuários */}
      {currentUser.role === 'admin' && (
        <Button variant="outline" className="w-full" onClick={onShowAdmin}>
          <Users size={16} />
          Gerenciar Usuários
        </Button>
      )}

      {/* Sair */}
      <Button variant="ghost" className="w-full text-red-500" onClick={() => {
        if (confirm('Deseja sair da sua conta?')) onLogout();
      }}>
        <LogOut size={16} />
        Sair da conta
      </Button>
    </motion.div>
  );
};

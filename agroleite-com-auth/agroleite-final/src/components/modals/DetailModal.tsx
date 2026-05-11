import React from 'react';
import { ChevronRight, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Animal } from '../../types';

interface DetailModalProps {
  data: { title: string; animals: Animal[] } | null;
  onClose: () => void;
  onSelectAnimal: (id: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ data, onClose, onSelectAnimal }) => (
  <Modal isOpen={!!data} onClose={onClose} title={data?.title || ''}>
    <div className="space-y-3">
      {data?.animals.length === 0 ? (
        <p className="text-center py-8 text-slate-400 font-medium">Nenhum animal nesta categoria.</p>
      ) : (
        data?.animals.map(animal => (
          <Card
            key={animal.id}
            className="flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
            onClick={() => {
              onSelectAnimal(animal.id);
              onClose();
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
    <Button variant="outline" className="w-full" onClick={onClose}>Fechar</Button>
  </Modal>
);

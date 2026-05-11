import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Animal, MilkProduction } from '../../types';

interface AddProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onSave: (data: Omit<MilkProduction, 'id'>) => Promise<void>;
  preselectedAnimalId?: string;
}

export const AddProductionModal: React.FC<AddProductionModalProps> = ({
  isOpen, onClose, animals, onSave, preselectedAnimalId
}) => {
  const [animalId, setAnimalId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<MilkProduction['period']>('morning');
  const [quality, setQuality] = useState<MilkProduction['quality']>('good');
  const [destination, setDestination] = useState<MilkProduction['destination']>('tank');
  const [observation, setObservation] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (preselectedAnimalId) {
        setAnimalId(preselectedAnimalId);
      } else {
        const firstLactation = animals.find(a => a.status === 'lactation');
        if (firstLactation) setAnimalId(firstLactation.id);
      }
    }
  }, [isOpen, animals, preselectedAnimalId]);

  const resetForm = () => {
    setAnimalId('');
    setAmount('');
    setPeriod('morning');
    setQuality('good');
    setDestination('tank');
    setObservation('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalId || !amount) return;

    try {
      await onSave({
        animalId,
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        period,
        quality,
        destination,
        observation,
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar produção:', err);
      alert('Erro ao salvar produção no servidor.');
    }
  };

  const lactatingAnimals = animals
    .filter(a => a.status === 'lactation')
    .map(a => ({ value: a.id, label: `${a.name} (${a.tag})` }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lançar Produção">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Selecione o Animal (Leite)"
          options={lactatingAnimals}
          value={animalId}
          onChange={setAnimalId}
          placeholder="Selecione o animal..."
          required
        />

        <Input
          label="Quantidade (Litros)"
          type="number"
          step="0.1"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.0"
          className="text-2xl font-bold text-agro-green-700"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Turno"
            options={[
              { value: 'morning', label: '🌅 Manhã' },
              { value: 'afternoon', label: '☀️ Tarde' },
              { value: 'night', label: '🌙 Noite' },
            ]}
            value={period}
            onChange={v => setPeriod(v as MilkProduction['period'])}
          />
          <Select
            label="Destino"
            options={[
              { value: 'tank', label: '🚛 Tanque' },
              { value: 'calves', label: '🍼 Bezerros' },
              { value: 'internal', label: '🏠 Consumo' },
              { value: 'disposal', label: '❌ Descarte' },
            ]}
            value={destination}
            onChange={v => setDestination(v as MilkProduction['destination'])}
          />
        </div>

        <Select
          label="Qualidade"
          options={[
            { value: 'good', label: '✅ Boa' },
            { value: 'regular', label: '⚠️ Regular' },
            { value: 'low', label: '❌ Baixa' },
          ]}
          value={quality}
          onChange={v => setQuality(v as MilkProduction['quality'])}
        />

        <Input
          label="Observação (opcional)"
          type="text"
          value={observation}
          onChange={e => setObservation(e.target.value)}
          placeholder="Ex: animal agitado"
        />

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
};

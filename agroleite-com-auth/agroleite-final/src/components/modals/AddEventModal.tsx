import React, { useState } from 'react';
import { format } from 'date-fns';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Animal, HealthEvent } from '../../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onSave: (data: Omit<HealthEvent, 'id'>) => Promise<void>;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, animals, onSave }) => {
  const [animalId, setAnimalId] = useState('');
  const [type, setType] = useState<HealthEvent['type']>('vaccine');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [nextDoseDate, setNextDoseDate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [withdrawalDays, setWithdrawalDays] = useState('');

  const resetForm = () => {
    setAnimalId(''); setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setNextDoseDate(''); setResponsible(''); setWithdrawalDays('');
    setType('vaccine');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalId || !description) return;

    try {
      await onSave({
        animalId,
        type,
        description,
        date,
        nextDoseDate: nextDoseDate || undefined,
        responsible,
        withdrawalDays: parseFloat(withdrawalDays) || undefined,
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      alert('Erro ao salvar evento no servidor.');
    }
  };

  const animalOptions = animals.map(a => ({ value: a.id, label: `${a.name} (${a.tag})` }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Evento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Animal"
          options={animalOptions}
          value={animalId}
          onChange={setAnimalId}
          placeholder="Selecione..."
          required
        />

        <Select
          label="Tipo de Evento"
          options={[
            { value: 'vaccine', label: '💉 Vacina' },
            { value: 'medication', label: '💊 Medicamento' },
            { value: 'insemination', label: '🧬 Inseminação' },
            { value: 'checkup', label: '🩺 Checkup' },
          ]}
          value={type}
          onChange={v => setType(v as HealthEvent['type'])}
        />

        <Input
          label="Descrição"
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Febre Aftosa"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Data"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <Input
            label="Próxima Dose"
            type="date"
            value={nextDoseDate}
            onChange={e => setNextDoseDate(e.target.value)}
          />
        </div>

        {type === 'medication' && (
          <Input
            label="Dias de Carência (Leite/Carne)"
            type="number"
            value={withdrawalDays}
            onChange={e => setWithdrawalDays(e.target.value)}
            placeholder="0"
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
};

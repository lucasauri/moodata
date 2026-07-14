import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Animal } from '../../types';

interface EditAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Animal>) => Promise<void>;
  initialData?: Animal;
}

export const EditAnimalModal: React.FC<EditAnimalModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [breed, setBreed] = useState('');
  const [category, setCategory] = useState<Animal['category']>('cow');
  const [status, setStatus] = useState<Animal['status']>('lactation');
  const [dailyTarget, setDailyTarget] = useState('');
  const [weight, setWeight] = useState('');
  const [ecc, setEcc] = useState('');
  const [lastCalving, setLastCalving] = useState('');
  const [expectedCalving, setExpectedCalving] = useState('');
  const [dryingDate, setDryingDate] = useState('');

  React.useEffect(() => {
    if (initialData && isOpen) {
      setName(initialData.name || '');
      setTag(initialData.tag || '');
      setBreed(initialData.breed || '');
      setCategory(initialData.category || 'cow');
      setStatus(initialData.status || 'lactation');
      setDailyTarget(initialData.dailyTarget?.toString() || '');
      setWeight(initialData.weight?.toString() || '');
      setEcc(initialData.ecc?.toString() || '');
      setLastCalving(initialData.lastCalving ? initialData.lastCalving.split('T')[0] : '');
      setExpectedCalving(initialData.expectedCalving ? initialData.expectedCalving.split('T')[0] : '');
      setDryingDate(initialData.dryingDate ? initialData.dryingDate.split('T')[0] : '');
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setError(null);
    setName(''); setTag(''); setBreed('');
    setCategory('cow'); setStatus('lactation');
    setDailyTarget(''); setWeight(''); setEcc('');
    setLastCalving(''); setExpectedCalving(''); setDryingDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tag || !initialData) return;
    setError(null);

    try {
      await onSave(initialData.id, {
        name,
        tag,
        breed: breed || 'Indefinida',
        category,
        status,
        dailyTarget: parseFloat(dailyTarget) || 0,
        weight: parseFloat(weight) || undefined,
        ecc: parseFloat(ecc) || undefined,
        lastCalving: lastCalving || undefined,
        expectedCalving: expectedCalving || undefined,
        dryingDate: dryingDate || undefined,
      });
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Erro ao editar animal:', err);
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else if (typeof msg === 'string') {
        setError(msg);
      } else {
        setError('Erro ao salvar animal no servidor. Tente novamente.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Animal">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* Categoria */}
        <div>
          <label className="block text-sm font-bold mb-2">Categoria</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: 'cow', label: 'Vaca Leite' },
              { id: 'heifer', label: 'Vaca Novilha' }
            ] as const).map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  category === cat.id
                    ? 'border-agro-green-600 bg-agro-green-50 text-agro-green-700'
                    : 'border-slate-100 text-slate-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Nome do Animal"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Mimosa"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Brinco"
            type="text"
            value={tag}
            onChange={e => setTag(e.target.value)}
            placeholder="000"
            required
          />
          <Input
            label="Raça"
            type="text"
            value={breed}
            onChange={e => setBreed(e.target.value)}
            placeholder="Ex: Holandesa"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            options={[
              { value: 'lactation', label: 'Em Lactação' },
              { value: 'dry', label: 'Seca' },
              { value: 'pregnant', label: 'Prenha' },
              { value: 'pre-calving', label: 'Pré-Parto' },
              { value: 'sick', label: 'Doente' },
            ]}
            value={status}
            onChange={v => setStatus(v as Animal['status'])}
          />
          <Input
            label="Meta Diária (L)"
            type="number"
            step="0.1"
            value={dailyTarget}
            onChange={e => setDailyTarget(e.target.value)}
            placeholder="0.0"
          />
        </div>

        {/* Datas Reprodutivas */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-400 uppercase">Datas Reprodutivas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Último Parto"
              labelSize="xs"
              type="date"
              value={lastCalving}
              onChange={e => setLastCalving(e.target.value)}
            />
            <Input
              label="Previsão Parto"
              labelSize="xs"
              type="date"
              value={expectedCalving}
              onChange={e => setExpectedCalving(e.target.value)}
            />
          </div>
          <Input
            label="Data Prevista Secagem"
            labelSize="xs"
            type="date"
            value={dryingDate}
            onChange={e => setDryingDate(e.target.value)}
          />
        </div>

        {/* Peso e ECC */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Peso (kg)"
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="0"
          />
          <Input
            label="ECC (1-5)"
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={ecc}
            onChange={e => setEcc(e.target.value)}
            placeholder="3.0"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
};

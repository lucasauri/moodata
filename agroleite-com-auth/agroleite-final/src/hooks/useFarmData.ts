import { useState, useEffect, useMemo, useCallback } from 'react';
import { subDays, isSameDay, format } from 'date-fns';
import { Animal, MilkProduction, HealthEvent, FarmConfig } from '../types';
import { animalService } from '../services/animals.service';
import { productionService } from '../services/productions.service';
import { healthService } from '../services/health.service';
import { farmConfigService } from '../services/farmConfig.service';

const DEFAULT_CONFIG: FarmConfig = {
  name: 'Minha Fazenda',
  producer: '',
  location: '',
  pveDays: 60,
  dryingPeriodDays: 60,
};

export function useFarmData(userId: string, userName: string, farmName?: string) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [productions, setProductions] = useState<MilkProduction[]>([]);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [config, setConfig] = useState<FarmConfig>({
    ...DEFAULT_CONFIG,
    name: farmName || DEFAULT_CONFIG.name,
    producer: userName,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [animalsData, productionsData, eventsData, configData] = await Promise.all([
          animalService.getAnimals(),
          productionService.getProductions(),
          healthService.getEvents(),
          farmConfigService.getConfig(),
        ]);
        setAnimals(animalsData);
        setProductions(productionsData);
        setEvents(eventsData);
        setConfig(configData);
      } catch (error) {
        console.error('Erro ao carregar dados da API:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId]);

  // Computed values
  const todayProduction = useMemo(() => {
    return productions
      .filter(p => isSameDay(new Date(p.date), new Date()))
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [productions]);

  const cowCount = useMemo(() => animals.filter(a => a.category === 'cow' && a.status !== 'dead').length, [animals]);
  const heiferCount = useMemo(() => animals.filter(a => a.category === 'heifer' && a.status !== 'dead').length, [animals]);
  const lactationCount = useMemo(() => animals.filter(a => a.status === 'lactation').length, [animals]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    return last7Days.map(day => {
      const dayProd = productions
        .filter(p => isSameDay(new Date(p.date), day))
        .reduce((acc, curr) => acc + curr.amount, 0);
      return {
        name: format(day, 'dd/MM'),
        total: parseFloat(dayProd.toFixed(1)),
      };
    });
  }, [productions]);

  const getAnimalChartData = useCallback((animalId: string) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    return last7Days.map(day => {
      const dayProd = productions
        .filter(p => p.animalId === animalId && isSameDay(new Date(p.date), day))
        .reduce((acc, curr) => acc + curr.amount, 0);
      return {
        name: format(day, 'dd/MM'),
        total: parseFloat(dayProd.toFixed(1)),
      };
    });
  }, [productions]);

  const getAnimalProductions = useCallback((animalId: string) => {
    return productions.filter(p => p.animalId === animalId);
  }, [productions]);

  const getAnimalEvents = useCallback((animalId: string) => {
    return events.filter(e => e.animalId === animalId);
  }, [events]);

  // Actions
  const addAnimal = useCallback(async (data: Omit<Animal, 'id'>) => {
    const saved = await animalService.createAnimal(data);
    setAnimals(prev => [...prev, saved]);
  }, []);

  const addProduction = useCallback(async (data: Omit<MilkProduction, 'id'>) => {
    const saved = await productionService.createProduction(data);
    setProductions(prev => [saved, ...prev]);
  }, []);

  const addMultipleProductions = useCallback(async (dataArray: Omit<MilkProduction, 'id'>[]) => {
    const savedArray = await Promise.all(dataArray.map(data => productionService.createProduction(data)));
    setProductions(prev => [...savedArray, ...prev]);
  }, []);

  const addEvent = useCallback(async (data: Omit<HealthEvent, 'id'>) => {
    const saved = await healthService.createEvent(data);
    setEvents(prev => [saved, ...prev]);
    if (data.type === 'death') {
      setAnimals(prev => prev.map(a => a.id === data.animalId ? { ...a, status: 'dead' } : a));
    }
  }, []);

  const toggleAnimalStatus = useCallback(async (id: string) => {
    const animal = animals.find(a => a.id === id);
    if (!animal) return;
    const nextStatus: Animal['status'] = animal.status === 'lactation' ? 'dry' : 'lactation';
    const updated = await animalService.updateAnimal(id, { status: nextStatus });
    setAnimals(prev => prev.map(a => a.id === id ? updated : a));
  }, [animals]);

  const updateAnimal = useCallback(async (id: string, data: Partial<Animal>) => {
    const updated = await animalService.updateAnimal(id, data);
    setAnimals(prev => prev.map(a => a.id === id ? updated : a));
  }, []);

  const deleteAnimal = useCallback(async (id: string) => {
    await animalService.deleteAnimal(id);
    setAnimals(prev => prev.filter(a => a.id !== id));
  }, []);

  const updateConfig = useCallback(async (newConfig: FarmConfig) => {
    setConfig(newConfig);
    try {
      await farmConfigService.updateConfig(newConfig);
    } catch (error) {
      console.error('Erro ao salvar configurações na API:', error);
    }
  }, []);

  return {
    // Data
    animals,
    productions,
    events,
    config,
    isLoading,

    // Computed
    todayProduction,
    cowCount,
    heiferCount,
    lactationCount,
    chartData,

    // Getters
    getAnimalChartData,
    getAnimalProductions,
    getAnimalEvents,

    // Actions
    addAnimal,
    addProduction,
    addMultipleProductions,
    addEvent,
    toggleAnimalStatus,
    updateAnimal,
    deleteAnimal,
    updateConfig,
    setConfig,
  };}

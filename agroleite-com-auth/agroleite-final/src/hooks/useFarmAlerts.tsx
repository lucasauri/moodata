import React, { useMemo } from 'react';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { Calendar, Activity, AlertTriangle, TrendingUp, Check } from 'lucide-react';
import { Animal, HealthEvent, FarmConfig } from '../types';

export function useFarmAlerts(animals: Animal[], events: HealthEvent[], config: FarmConfig) {
  return useMemo(() => {
    const list: { type: 'red' | 'amber' | 'green', icon: React.ReactNode, text: string }[] = [];
    
    // 1. Group Calvings (Parto) - 7 days before
    const upcomingCalvings: Record<string, string[]> = {};
    animals.filter(a => a.expectedCalving).forEach(a => {
      const days = differenceInDays(parseISO(a.expectedCalving!), new Date());
      if (days >= 0 && days <= 7) {
        const dateStr = format(parseISO(a.expectedCalving!), 'dd/MM');
        if (!upcomingCalvings[dateStr]) upcomingCalvings[dateStr] = [];
        upcomingCalvings[dateStr].push(a.tag);
      }
    });

    Object.entries(upcomingCalvings).forEach(([date, tags]) => {
      list.push({ 
        type: 'red', 
        icon: <Calendar size={16} />, 
        text: `Dia ${date}: ${tags.length} animais vão parir (${tags.join(', ')})` 
      });
    });

    // 2. Group Drying (Secagem) - 15 days before
    const upcomingDrying: Record<string, string[]> = {};
    animals.filter(a => (a.status === 'lactation' || a.status === 'pregnant')).forEach(a => {
      let targetDryingDate = a.dryingDate;
      
      if (!targetDryingDate && a.expectedCalving) {
        // Calculate suggested drying date: expectedCalving - dryingPeriodDays
        const expectedDate = parseISO(a.expectedCalving);
        targetDryingDate = subDays(expectedDate, config.dryingPeriodDays).toISOString();
      }

      if (targetDryingDate) {
        const days = differenceInDays(parseISO(targetDryingDate), new Date());
        if (days >= 0 && days <= 15) {
          const dateStr = format(parseISO(targetDryingDate), 'dd/MM');
          if (!upcomingDrying[dateStr]) upcomingDrying[dateStr] = [];
          upcomingDrying[dateStr].push(a.tag);
        }
      }
    });

    Object.entries(upcomingDrying).forEach(([date, tags]) => {
      list.push({ 
        type: 'amber', 
        icon: <Activity size={16} />, 
        text: `Dia ${date}: ${tags.length} animais para secagem (${tags.join(', ')})` 
      });
    });

    // 3. Group Milk Withdrawal (Descarte de Leite)
    const withdrawalGroups: Record<string, string[]> = {};
    events.filter(e => e.type === 'medication' && e.withdrawalDays).forEach(e => {
      const eventDate = parseISO(e.date);
      const daysSince = differenceInDays(new Date(), eventDate);
      const remaining = (e.withdrawalDays || 0) - daysSince;
      
      if (remaining > 0) {
        const animal = animals.find(a => a.id === e.animalId);
        if (animal) {
          const endDate = format(subDays(new Date(), -remaining), 'dd/MM');
          if (!withdrawalGroups[endDate]) withdrawalGroups[endDate] = [];
          if (!withdrawalGroups[endDate].includes(animal.tag)) {
            withdrawalGroups[endDate].push(animal.tag);
          }
        }
      }
    });

    Object.entries(withdrawalGroups).forEach(([date, tags]) => {
      list.push({ 
        type: 'red', 
        icon: <AlertTriangle size={16} />, 
        text: `Descarte de leite de ${tags.length} animais até ${date} (${tags.join(', ')})` 
      });
    });

    // 4. Group PVE (Prontas para Inseminação)
    const readyForInsemination: string[] = [];
    animals.filter(a => a.status === 'lactation' && a.lastCalving).forEach(a => {
      const daysSinceCalving = differenceInDays(new Date(), parseISO(a.lastCalving!));
      if (daysSinceCalving >= config.pveDays) {
        readyForInsemination.push(a.tag);
      }
    });

    if (readyForInsemination.length > 0) {
      list.push({
        type: 'amber',
        icon: <TrendingUp size={16} />,
        text: `${readyForInsemination.length} animais prontos para inseminação (PVE de ${config.pveDays} dias concluído: ${readyForInsemination.join(', ')})`
      });
    }

    if (list.length === 0) {
      list.push({ type: 'green', icon: <Check size={16} />, text: 'Tudo em ordem por agora' });
    }

    return list;
  }, [events, animals, config]);
}

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Dimensions, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react-native';
import { animalsService } from '../services/animals.service';
import { productionsService } from '../services/productions.service';
import { healthService } from '../services/health.service';
import { Animal, MilkProduction, HealthEvent } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  route: any;
  navigation: any;
}

export default function AnimalDetailScreen({ route, navigation }: Props) {
  const { animalId } = route.params;
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [productions, setProductions] = useState<MilkProduction[]>([]);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [allAnimals, allProds, allEvents] = await Promise.all([
            animalsService.getAnimals(),
            productionsService.getProductions(),
            healthService.getEvents(),
          ]);
          setAnimal(allAnimals.find(a => a.id === animalId) || null);
          setProductions(allProds.filter(p => p.animalId === animalId));
          setEvents(allEvents.filter(e => e.animalId === animalId));
        } catch (err) {
          console.warn(err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [animalId])
  );

  // Chart data: last 7 days
  const chartData = useMemo(() => {
    const days: { label: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const total = productions
        .filter(p => p.date.slice(0, 10) === dateStr)
        .reduce((acc, p) => acc + p.amount, 0);
      days.push({ label, total });
    }
    return days;
  }, [productions]);

  const maxChart = Math.max(...chartData.map(d => d.total), 1);

  const handleChangeStatus = async () => {
    if (!animal) return;
    if (animal.status === 'dead') {
      Alert.alert('Aviso', 'Este animal foi baixado (morto) e seu status não pode ser alterado.');
      return;
    }

    // Monta opções de transição de acordo com o status atual
    const options: { label: string; status: Animal['status']; promoteToСow?: boolean }[] = [];

    if (animal.status !== 'lactation') options.push({ label: '🥛 Entrou em Lactação', status: 'lactation' });
    if (animal.status !== 'dry')       options.push({ label: '💤 Secar (Período Seco)', status: 'dry' });
    if (animal.status !== 'pregnant')  options.push({ label: '🤰 Prenha (Confirmada)', status: 'pregnant' });
    if (animal.status !== 'pre-calving') options.push({ label: '⏳ Pré-Parto', status: 'pre-calving' });
    if (animal.status !== 'sick')      options.push({ label: '🤒 Doente', status: 'sick' });

    // Opção especial de parto: muda status + promove novilha → vaca
    const calvingOption = {
      text: '🐄 Registrar Parto (→ Lactação)',
      onPress: async () => {
        try {
          const updates: Partial<Animal> = {
            status: 'lactation',
            lastCalving: new Date().toISOString(),
          };
          // Novilha que pariu vira vaca
          if (animal.category === 'heifer') updates.category = 'cow';
          const updated = await animalsService.updateAnimal(animal.id, updates);
          setAnimal(updated);
          Alert.alert('✅ Parto Registrado', animal.category === 'heifer'
            ? 'Animal promovida de Novilha para Vaca e colocada em Lactação.'
            : 'Animal colocada em Lactação com data de parto atualizada.');
        } catch {
          Alert.alert('Erro', 'Não foi possível registrar o parto.');
        }
      },
    };

    Alert.alert(
      'Alterar Status',
      `Status atual: ${statusLabel(animal.status)}`,
      [
        ...options.map(opt => ({
          text: opt.label,
          onPress: async () => {
            try {
              const updated = await animalsService.updateAnimal(animal.id, { status: opt.status });
              setAnimal(updated);
            } catch {
              Alert.alert('Erro', 'Não foi possível atualizar o status.');
            }
          },
        })),
        calvingOption,
        { text: 'Cancelar', style: 'cancel' as const },
      ]
    );
  };

  const handleDelete = () => {
    if (!animal) return;
    Alert.alert('Excluir Animal', `Tem certeza que deseja excluir ${animal.name || 'este animal'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await animalsService.deleteAnimal(animal.id);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Erro', 'Não foi possível excluir o animal.');
          }
        }
      },
    ]);
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'lactation': return 'Lactação';
      case 'dry': return 'Seca';
      case 'pregnant': return 'Prenha';
      case 'sick': return 'Doente';
      case 'pre-calving': return 'Pré-Parto';
      case 'dead': return 'Baixado/Morto';
      default: return s;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'lactation': return { bg: '#dcfce7', text: '#15803d' };
      case 'pregnant': return { bg: '#ede9fe', text: '#7c3aed' };
      case 'dry': return { bg: '#f1f5f9', text: '#64748b' };
      case 'sick': return { bg: '#fef2f2', text: '#dc2626' };
      case 'pre-calving': return { bg: '#fefce8', text: '#a16207' };
      case 'dead': return { bg: '#fee2e2', text: '#ef4444' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    const date = new Date(d);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  if (loading || !animal) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const color = statusColor(animal.status);

  // ── Indicadores Zootécnicos ──────────────────────────────────
  const today = new Date();
  const diffDays = (a: Date, b: Date) => Math.floor((b.getTime() - a.getTime()) / 86400000);

  // DEL – Dias em Lactação (desde o último parto até hoje)
  const del = animal.lastCalving ? diffDays(new Date(animal.lastCalving), today) : null;

  // DEA – Dias em Aberto (dias sem concepção desde o parto)
  // Se há inseminação registrada, DEA = inseminação - parto; senão DEA = hoje - parto
  const dea = animal.lastCalving
    ? animal.lastInsemination
      ? diffDays(new Date(animal.lastCalving), new Date(animal.lastInsemination))
      : diffDays(new Date(animal.lastCalving), today)
    : null;

  // IEPA – Intervalo Entre Partos (estimado: DEL + gestação padrão 283d = ciclo esperado)
  // Exibe como DEL + 283 dias se houver parto registrado (indica o ciclo atual projetado)
  const iepa = del !== null ? del + 283 : null;

  // Classificações de alerta
  const delStatus = del === null ? null : del < 150 ? 'ok' : del < 200 ? 'warn' : 'alert';
  const deaStatus = dea === null ? null : dea <= 110 ? 'ok' : dea <= 150 ? 'warn' : 'alert';
  const iepaStatus = iepa === null ? null : iepa <= 395 ? 'ok' : iepa <= 420 ? 'warn' : 'alert';

  const indColor = (s: string | null) => {
    if (s === 'ok') return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
    if (s === 'warn') return { bg: '#fef9c3', text: '#a16207', border: '#fde047' };
    if (s === 'alert') return { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' };
    return { bg: '#f1f5f9', text: '#94a3b8', border: '#e2e8f0' };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back button + Actions + Name */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#16a34a" />
          </TouchableOpacity>
          <View style={styles.actionBtns}>
            <TouchableOpacity onPress={() => navigation.navigate('AnimalForm', { animal })} style={styles.iconBtn}>
              <Pencil size={20} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.animalName}>{animal.name || 'Sem nome'}</Text>
        <Text style={styles.animalTag}>Brinco {animal.tag} • {animal.breed}</Text>
      </View>

      {/* Status + Toggle */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: color.bg }]}>
          <Text style={[styles.statusText, { color: color.text }]}>{statusLabel(animal.status)}</Text>
        </View>
        <TouchableOpacity onPress={handleChangeStatus} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>⇄ Alterar Status</Text>
        </TouchableOpacity>
      </View>

      {/* Biometrics */}
      <View style={styles.bioRow}>
        <View style={styles.bioItem}>
          <Text style={styles.bioLabel}>Peso</Text>
          <Text style={styles.bioValue}>{animal.weight ? `${animal.weight} kg` : '—'}</Text>
        </View>
        <View style={styles.bioItem}>
          <Text style={styles.bioLabel}>ECC</Text>
          <Text style={styles.bioValue}>{animal.ecc ?? '—'}</Text>
        </View>
        <View style={styles.bioItem}>
          <Text style={styles.bioLabel}>Categoria</Text>
          <Text style={styles.bioValue}>{animal.category === 'cow' ? 'Vaca' : 'Novilha'}</Text>
        </View>
      </View>

      {/* ── Indicadores Zootécnicos ────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Indicadores Zootécnicos</Text>
        <View style={styles.indRow}>

          {/* DEL */}
          <View style={[styles.indItem, { borderColor: indColor(delStatus).border, backgroundColor: indColor(delStatus).bg }]}>
            <Text style={styles.indLabel}>DEL</Text>
            <Text style={[styles.indValue, { color: indColor(delStatus).text }]}>
              {del !== null ? `${del}d` : '—'}
            </Text>
            <Text style={[styles.indSub, { color: indColor(delStatus).text }]}>
              {delStatus === 'ok' ? 'Pico ✓' : delStatus === 'warn' ? 'Atenção' : delStatus === 'alert' ? 'Longa!' : 'Sem parto'}
            </Text>
          </View>

          {/* DEA */}
          <View style={[styles.indItem, { borderColor: indColor(deaStatus).border, backgroundColor: indColor(deaStatus).bg }]}>
            <Text style={styles.indLabel}>DEA</Text>
            <Text style={[styles.indValue, { color: indColor(deaStatus).text }]}>
              {dea !== null ? `${dea}d` : '—'}
            </Text>
            <Text style={[styles.indSub, { color: indColor(deaStatus).text }]}>
              {deaStatus === 'ok' ? 'Ideal ✓' : deaStatus === 'warn' ? 'Atenção' : deaStatus === 'alert' ? 'Crítico!' : 'Sem dados'}
            </Text>
          </View>

          {/* IEPA */}
          <View style={[styles.indItem, { borderColor: indColor(iepaStatus).border, backgroundColor: indColor(iepaStatus).bg }]}>
            <Text style={styles.indLabel}>IEPA*</Text>
            <Text style={[styles.indValue, { color: indColor(iepaStatus).text }]}>
              {iepa !== null ? `${iepa}d` : '—'}
            </Text>
            <Text style={[styles.indSub, { color: indColor(iepaStatus).text }]}>
              {iepaStatus === 'ok' ? 'Bom ✓' : iepaStatus === 'warn' ? 'Longo' : iepaStatus === 'alert' ? 'Crítico!' : 'Sem parto'}
            </Text>
          </View>

        </View>
        <Text style={styles.indNote}>*IEPA projetado (DEL + gestação padrão 283d). Meta DEA: ≤110d | DEL curto: &lt;150d</Text>
      </View>

      {/* Reproductive dates */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Ciclo Reprodutivo</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Última IA</Text>
            <Text style={styles.dateValue}>{formatDate(animal.lastInsemination)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Último Parto</Text>
            <Text style={styles.dateValue}>{formatDate(animal.lastCalving)}</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Parto Previsto</Text>
            <Text style={styles.dateValue}>{formatDate(animal.expectedCalving)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Secagem</Text>
            <Text style={styles.dateValue}>{formatDate(animal.dryingDate)}</Text>
          </View>
        </View>
      </View>

      {/* Production Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🥛 Produção (7 dias)</Text>
        <View style={styles.chartContainer}>
          {chartData.map((day, i) => (
            <View key={i} style={styles.barWrapper}>
              <Text style={styles.barValue}>{day.total > 0 ? day.total.toFixed(0) : ''}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: `${Math.max((day.total / maxChart) * 100, 4)}%` as any }]} />
              </View>
              <Text style={styles.barLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Productions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Últimos Registros</Text>
        {productions.slice(0, 5).map(p => (
          <View key={p.id} style={styles.recordRow}>
            <Text style={styles.recordDate}>{formatDate(p.date)}</Text>
            <Text style={styles.recordAmount}>{p.amount}L</Text>
            <Text style={styles.recordPeriod}>
              {p.period === 'morning' ? 'Manhã' : p.period === 'afternoon' ? 'Tarde' : 'Noite'}
            </Text>
          </View>
        ))}
        {productions.length === 0 && (
          <Text style={styles.emptyRecord}>Nenhum registro de produção</Text>
        )}
      </View>

      {/* Recent Events */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏥 Eventos Sanitários</Text>
        {events.slice(0, 5).map(e => (
          <View key={e.id} style={styles.recordRow}>
            <Text style={styles.recordDate}>{formatDate(e.date)}</Text>
            <Text style={[styles.recordAmount, { color: '#334155' }]}>{e.description}</Text>
          </View>
        ))}
        {events.length === 0 && (
          <Text style={styles.emptyRecord}>Nenhum evento registrado</Text>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { marginBottom: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backBtn: {},
  backText: { color: '#16a34a', fontSize: 15, fontWeight: '600' },
  actionBtns: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  animalName: { fontSize: 28, fontWeight: '800', color: '#15803d' },
  animalTag: { fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: '600' },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  toggleBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12,
    borderWidth: 2, borderColor: '#16a34a',
  },
  toggleText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },

  bioRow: {
    flexDirection: 'row', gap: 8, marginBottom: 16,
  },
  bioItem: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  bioLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  bioValue: { fontSize: 16, fontWeight: '800', color: '#334155', marginTop: 4 },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 12 },

  // Indicators
  indRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  indItem: {
    flex: 1, borderRadius: 14, padding: 12, alignItems: 'center',
    borderWidth: 1.5,
  },
  indLabel: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  indValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  indSub: { fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  indNote: { fontSize: 10, color: '#94a3b8', marginTop: 4, lineHeight: 14 },

  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  dateItem: { flex: 1 },
  dateLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  dateValue: { fontSize: 14, fontWeight: '600', color: '#334155', marginTop: 2 },

  // Chart
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barWrapper: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 9, fontWeight: '700', color: '#16a34a', marginBottom: 4 },
  barTrack: { width: 18, height: 60, backgroundColor: '#f1f5f9', borderRadius: 9, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', backgroundColor: '#16a34a', borderRadius: 9, minHeight: 3 },
  barLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '600', marginTop: 4 },

  // Records
  recordRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  recordDate: { fontSize: 12, fontWeight: '600', color: '#94a3b8', width: 70 },
  recordAmount: { fontSize: 14, fontWeight: '700', color: '#16a34a', flex: 1 },
  recordPeriod: { fontSize: 11, fontWeight: '600', color: '#94a3b8' },
  emptyRecord: { color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingVertical: 16 },
});

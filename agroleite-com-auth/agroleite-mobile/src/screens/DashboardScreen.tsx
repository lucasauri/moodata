import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { animalsService } from '../services/animals.service';
import { productionsService } from '../services/productions.service';
import { healthService } from '../services/health.service';
import { farmConfigService } from '../services/farmConfig.service';
import { Animal, MilkProduction, HealthEvent, FarmConfig } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [productions, setProductions] = useState<MilkProduction[]>([]);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [config, setConfig] = useState<FarmConfig>({ name: 'Minha Fazenda', producer: '', location: '', pveDays: 60, dryingPeriodDays: 60 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [a, p, e, c] = await Promise.all([
        animalsService.getAnimals(),
        productionsService.getProductions(),
        healthService.getEvents(),
        farmConfigService.getConfig(),
      ]);
      setAnimals(a);
      setProductions(p);
      setEvents(e);
      setConfig(c);
    } catch (err) {
      console.warn('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recarrega sempre que a tela ganha foco (ex: ao voltar da criação de animal)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); loadData(); };

  // Computed values
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayProduction = useMemo(() =>
    productions
      .filter(p => p.date.slice(0, 10) === todayStr)
      .reduce((acc, p) => acc + p.amount, 0),
    [productions, todayStr]
  );

  const cowCount = useMemo(() => animals.filter(a => a.category === 'cow').length, [animals]);
  const heiferCount = useMemo(() => animals.filter(a => a.category === 'heifer').length, [animals]);
  const lactationCount = useMemo(() => animals.filter(a => a.status === 'lactation').length, [animals]);
  const alertCount = useMemo(() => {
    let count = 0;
    // Partos próximos (7 dias)
    animals.forEach(a => {
      if (a.expectedCalving) {
        const days = Math.ceil((new Date(a.expectedCalving).getTime() - Date.now()) / 86400000);
        if (days >= 0 && days <= 7) count++;
      }
    });
    // Eventos de hoje
    events.forEach(e => {
      if (e.date.slice(0, 10) === todayStr) count++;
    });
    return count;
  }, [animals, events, todayStr]);

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

  // Today's tasks
  const todayTasks = useMemo(() =>
    events.filter(e => e.date.slice(0, 10) === todayStr).map(e => {
      const animal = animals.find(a => a.id === e.animalId);
      return { ...e, animalName: animal?.name || 'Desconhecido', animalTag: animal?.tag || '—' };
    }),
    [events, animals, todayStr]
  );

  // ── Indicadores Médios do Rebanho ──────────────────────────────
  const herdIndicators = useMemo(() => {
    const today = new Date();
    const diffDays = (a: Date, b: Date) => Math.floor((b.getTime() - a.getTime()) / 86400000);

    const withCalving = animals.filter(a => a.lastCalving);

    const delValues = withCalving.map(a => diffDays(new Date(a.lastCalving!), today));
    const deaValues = withCalving.map(a =>
      a.lastInsemination
        ? diffDays(new Date(a.lastCalving!), new Date(a.lastInsemination))
        : diffDays(new Date(a.lastCalving!), today)
    );
    const iepaValues = delValues.map(d => d + 283);

    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : null;

    const avgDel = avg(delValues);
    const avgDea = avg(deaValues);
    const avgIepa = avg(iepaValues);

    const delStatus = avgDel === null ? null : avgDel < 150 ? 'ok' : avgDel < 200 ? 'warn' : 'alert';
    const deaStatus = avgDea === null ? null : avgDea <= 110 ? 'ok' : avgDea <= 150 ? 'warn' : 'alert';
    const iepaStatus = avgIepa === null ? null : avgIepa <= 395 ? 'ok' : avgIepa <= 420 ? 'warn' : 'alert';

    return { avgDel, avgDea, avgIepa, delStatus, deaStatus, iepaStatus, count: withCalving.length };
  }, [animals]);

  const indColor = (s: string | null) => {
    if (s === 'ok')    return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
    if (s === 'warn')  return { bg: '#fef9c3', text: '#a16207', border: '#fde047' };
    if (s === 'alert') return { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' };
    return { bg: '#f1f5f9', text: '#94a3b8', border: '#e2e8f0' };
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.farmName}>{config.name}</Text>
        <View style={styles.onlineRow}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>ONLINE</Text>
        </View>
      </View>

      {/* Main KPI Card */}
      <View style={styles.mainCard}>
        <Text style={styles.mainCardLabel}>Total de Animais</Text>
        <Text style={styles.mainCardValue}>{animals.length}</Text>
        <View style={styles.mainCardChips}>
          <TouchableOpacity
            style={styles.chip}
            onPress={() => navigation.navigate('Herd', { screen: 'HerdList', params: { filterCategory: 'cow' } })}
          >
            <Text style={styles.chipText}>🐄 {cowCount} Vacas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chip}
            onPress={() => navigation.navigate('Herd', { screen: 'HerdList', params: { filterCategory: 'heifer' } })}
          >
            <Text style={styles.chipText}>🐄 {heiferCount} Novilhas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chip}
            onPress={() => navigation.navigate('Herd', { screen: 'HerdList', params: { filterStatus: 'lactation' } })}
          >
            <Text style={styles.chipText}>🥛 {lactationCount} Lactação</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Small KPIs */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: '#1d4ed8' }]}>
          <Text style={styles.kpiLabel}>Leite Hoje</Text>
          <Text style={styles.kpiValue}>{todayProduction.toFixed(1)}L</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#b45309' }]}>
          <Text style={styles.kpiLabel}>Alertas</Text>
          <Text style={styles.kpiValue}>{alertCount}</Text>
        </View>
      </View>

      {/* Production Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>📈 Produção Semanal</Text>
          <View style={styles.chartBadge}>
            <Text style={styles.chartBadgeText}>7 dias</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          {chartData.map((day, i) => (
            <View key={i} style={styles.barWrapper}>
              <Text style={styles.barValue}>{day.total > 0 ? day.total.toFixed(0) : ''}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height: `${Math.max((day.total / maxChart) * 100, 4)}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Indicadores Médios do Rebanho ────────────────────── */}
      <View style={styles.indCard}>
        <View style={styles.indHeader}>
          <Text style={styles.indTitle}>📊 Média do Rebanho</Text>
          <View style={styles.indBadge}>
            <Text style={styles.indBadgeText}>{herdIndicators.count} animais</Text>
          </View>
        </View>
        <View style={styles.indRow}>

          <View style={[styles.indItem, { borderColor: indColor(herdIndicators.delStatus).border, backgroundColor: indColor(herdIndicators.delStatus).bg }]}>
            <Text style={styles.indLabel}>Méd. DEL</Text>
            <Text style={[styles.indValue, { color: indColor(herdIndicators.delStatus).text }]}>
              {herdIndicators.avgDel !== null ? `${herdIndicators.avgDel}d` : '—'}
            </Text>
            <Text style={[styles.indSub, { color: indColor(herdIndicators.delStatus).text }]}>
              {herdIndicators.delStatus === 'ok' ? 'Pico ✓' : herdIndicators.delStatus === 'warn' ? 'Atenção' : herdIndicators.delStatus === 'alert' ? 'Longa!' : 'Sem dados'}
            </Text>
          </View>

          <View style={[styles.indItem, { borderColor: indColor(herdIndicators.deaStatus).border, backgroundColor: indColor(herdIndicators.deaStatus).bg }]}>
            <Text style={styles.indLabel}>Méd. DEA</Text>
            <Text style={[styles.indValue, { color: indColor(herdIndicators.deaStatus).text }]}>
              {herdIndicators.avgDea !== null ? `${herdIndicators.avgDea}d` : '—'}
            </Text>
            <Text style={[styles.indSub, { color: indColor(herdIndicators.deaStatus).text }]}>
              {herdIndicators.deaStatus === 'ok' ? 'Ideal ✓' : herdIndicators.deaStatus === 'warn' ? 'Atenção' : herdIndicators.deaStatus === 'alert' ? 'Crítico!' : 'Sem dados'}
            </Text>
          </View>

          <View style={[styles.indItem, { borderColor: indColor(herdIndicators.iepaStatus).border, backgroundColor: indColor(herdIndicators.iepaStatus).bg }]}>
            <Text style={styles.indLabel}>Méd. IEPA</Text>
            <Text style={[styles.indValue, { color: indColor(herdIndicators.iepaStatus).text }]}>
              {herdIndicators.avgIepa !== null ? `${herdIndicators.avgIepa}d` : '—'}
            </Text>
            <Text style={[styles.indSub, { color: indColor(herdIndicators.iepaStatus).text }]}>
              {herdIndicators.iepaStatus === 'ok' ? 'Bom ✓' : herdIndicators.iepaStatus === 'warn' ? 'Longo' : herdIndicators.iepaStatus === 'alert' ? 'Crítico!' : 'Sem dados'}
            </Text>
          </View>

        </View>
        <Text style={styles.indNote}>DEA meta ≤110d • DEL curto &lt;150d • IEPA projetado (DEL+283d)</Text>
      </View>

      {/* Today's Tasks */}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Tarefas de Hoje</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{todayTasks.length} PENDENTES</Text>
          </View>
        </View>
        {todayTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma tarefa para hoje ✅</Text>
          </View>
        ) : (
          todayTasks.map(task => (
            <View key={task.id} style={styles.taskCard}>
              <View style={[styles.taskIcon, {
                backgroundColor: task.type === 'vaccine' ? '#fef2f2' :
                  task.type === 'insemination' ? '#faf5ff' : '#eff6ff',
              }]}>
                <Text style={styles.taskIconEmoji}>
                  {task.type === 'vaccine' ? '💉' :
                    task.type === 'insemination' ? '🧬' :
                      task.type === 'calving' ? '🐄' : '📅'}
                </Text>
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.description}</Text>
                <Text style={styles.taskSubtitle}>{task.animalName} ({task.animalTag})</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Bottom spacing for tab bar */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 },

  // Header
  header: { marginBottom: 20 },
  farmName: { fontSize: 26, fontWeight: '800', color: '#15803d', letterSpacing: -0.5 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a' },
  onlineText: { fontSize: 11, fontWeight: '700', color: '#16a34a', letterSpacing: 1 },

  // Main KPI
  mainCard: {
    backgroundColor: '#15803d', borderRadius: 20, padding: 20, marginBottom: 12,
    shadowColor: '#15803d', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  mainCardLabel: { color: '#bbf7d0', fontSize: 13, fontWeight: '600' },
  mainCardValue: { color: '#fff', fontSize: 40, fontWeight: '800', marginTop: 2 },
  mainCardChips: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  chip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Small KPIs
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  kpiCard: {
    flex: 1, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  kpiLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  kpiValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },

  // Chart
  chartCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle: { fontSize: 15, fontWeight: '700', color: '#334155' },
  chartBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  chartBadgeText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barWrapper: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 9, fontWeight: '700', color: '#16a34a', marginBottom: 4 },
  barTrack: { width: 20, height: 80, backgroundColor: '#f1f5f9', borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', backgroundColor: '#16a34a', borderRadius: 10, minHeight: 4 },
  barLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '600', marginTop: 6 },

  // Section
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
  sectionBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  sectionBadgeText: { fontSize: 9, fontWeight: '700', color: '#15803d' },

  // Tasks
  taskCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8,
    borderLeftWidth: 4, borderLeftColor: '#16a34a',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  taskIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  taskIconEmoji: { fontSize: 18 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 13, fontWeight: '700', color: '#334155' },
  taskSubtitle: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  // Empty
  emptyCard: {
    backgroundColor: '#f0fdf4', borderRadius: 16, padding: 20, alignItems: 'center',
  },
  emptyText: { color: '#16a34a', fontSize: 14, fontWeight: '600' },

  // Herd Indicators
  indCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  indHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  indTitle: { fontSize: 15, fontWeight: '700', color: '#334155' },
  indBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  indBadgeText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
  indRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  indItem: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1.5 },
  indLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 },
  indValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  indSub: { fontSize: 8, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  indNote: { fontSize: 10, color: '#94a3b8', lineHeight: 14 },
});

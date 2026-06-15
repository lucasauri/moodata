import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { healthService } from '../services/health.service';
import { animalsService } from '../services/animals.service';
import { Animal, HealthEvent } from '../types';

export default function MovementsScreen() {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'birth' | 'purchase' | 'death'>('all');

  const loadData = async () => {
    try {
      const [e, a] = await Promise.all([
        healthService.getEvents(),
        animalsService.getAnimals()
      ]);
      // Filter only movements: birth, purchase, death
      const movementEvents = e.filter(evt =>
        evt.type === 'birth' || evt.type === 'purchase' || evt.type === 'death'
      );
      setEvents(movementEvents);
      setAnimals(a);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredEvents = events.filter(e => {
    if (activeFilter === 'all') return true;
    return e.type === activeFilter;
  });

  const typeEmoji = (t: string) => {
    if (t === 'birth') return '🍼';
    if (t === 'purchase') return '💵';
    if (t === 'death') return '🪦';
    return '📋';
  };

  const typeLabel = (t: string) => {
    if (t === 'birth') return 'Nascimento';
    if (t === 'purchase') return 'Compra';
    if (t === 'death') return 'Morte';
    return t;
  };

  const typeBg = (t: string) => {
    if (t === 'birth') return '#f0fdf4';
    if (t === 'purchase') return '#ecfdf5';
    if (t === 'death') return '#fef2f2';
    return '#f1f5f9';
  };

  const typeColor = (t: string) => {
    if (t === 'birth') return '#16a34a';
    if (t === 'purchase') return '#059669';
    if (t === 'death') return '#dc2626';
    return '#475569';
  };

  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear()}`;
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={s.loadTxt}>Carregando movimentações...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Movimentação de Animais</Text>
        <Text style={s.subtitle}>Histórico de Entradas e Saídas</Text>
      </View>

      {/* Filter Chips */}
      <View style={s.filterContainer}>
        {[
          { id: 'all', label: 'Todos', emoji: '📋' },
          { id: 'birth', label: 'Nascimentos', emoji: '🍼' },
          { id: 'purchase', label: 'Compras', emoji: '💵' },
          { id: 'death', label: 'Mortes', emoji: '🪦' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setActiveFilter(filter.id as any)}
            style={[
              s.chip,
              activeFilter === filter.id && s.chipAct,
              activeFilter === filter.id && filter.id === 'death' && s.chipActDeath
            ]}
          >
            <Text style={[s.chipTxt, activeFilter === filter.id && s.chipTxtAct]}>
              {filter.emoji} {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Movements List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyTxt}>Nenhuma movimentação registrada para este filtro.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const an = animals.find(a => a.id === item.animalId);
          const color = typeColor(item.type);
          return (
            <View style={s.card}>
              <View style={[s.cardIcon, { backgroundColor: typeBg(item.type) }]}>
                <Text style={{ fontSize: 18 }}>{typeEmoji(item.type)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.cardType, { color }]}>{typeLabel(item.type).toUpperCase()}</Text>
                <Text style={s.cardDesc}>{item.description}</Text>
                <Text style={s.cardAnimal}>
                  {an?.name || 'Animal'} (Brinco {an?.tag || '—'})
                </Text>
                {item.responsible ? (
                  <Text style={s.cardResp}>Resp: {item.responsible}</Text>
                ) : null}
              </View>
              <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                <Text style={s.cardDate}>{fmtDate(item.date)}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadTxt: { marginTop: 12, color: '#64748b', fontWeight: '500' },
  
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  title: { fontSize: 24, fontWeight: '800', color: '#15803d' },
  subtitle: { fontSize: 13, color: '#94a3b8', marginTop: 2, fontWeight: '600' },

  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  chipAct: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a'
  },
  chipActDeath: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626'
  },
  chipTxt: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  chipTxtAct: { color: '#fff' },

  listContent: { padding: 16 },
  empty: { padding: 32, alignItems: 'center' },
  emptyTxt: { color: '#94a3b8', fontSize: 14, textAlign: 'center', fontWeight: '500' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardType: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cardDesc: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 2 },
  cardAnimal: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '500' },
  cardResp: { fontSize: 10, color: '#94a3b8', marginTop: 4, fontWeight: '500' },
  cardDate: { fontSize: 12, fontWeight: '700', color: '#64748b' },
});

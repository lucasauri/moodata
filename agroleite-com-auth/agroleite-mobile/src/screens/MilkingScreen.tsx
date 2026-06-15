import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Modal, TextInput, Alert, ScrollView,
} from 'react-native';
import { productionsService } from '../services/productions.service';
import { animalsService } from '../services/animals.service';
import { Animal, MilkProduction } from '../types';
import { useFocusEffect } from '@react-navigation/native';

export default function MilkingScreen() {
  const [productions, setProductions] = useState<MilkProduction[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formAnimalId, setFormAnimalId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPeriod, setFormPeriod] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [p, a] = await Promise.all([productionsService.getProductions(), animalsService.getAnimals()]);
      setProductions(p); setAnimals(a);
    } catch (err) { console.warn(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );
  const onRefresh = () => { setRefreshing(true); loadData(); };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayProds = useMemo(() => productions.filter(p => p.date.slice(0, 10) === todayStr), [productions, todayStr]);
  const todayProd = useMemo(() => todayProds.reduce((a, p) => a + p.amount, 0), [todayProds]);
  const morningProd = useMemo(() => todayProds.filter(p => p.period === 'morning').reduce((a, p) => a + p.amount, 0), [todayProds]);
  const afternoonProd = useMemo(() => todayProds.filter(p => p.period === 'afternoon').reduce((a, p) => a + p.amount, 0), [todayProds]);
  const nightProd = useMemo(() => todayProds.filter(p => p.period === 'night').reduce((a, p) => a + p.amount, 0), [todayProds]);
  const avg = useMemo(() => productions.length > 0 ? productions.reduce((a, p) => a + p.amount, 0) / productions.length : 0, [productions]);

  const handleSave = async () => {
    if (!formAnimalId) { Alert.alert('Erro', 'Selecione um animal.'); return; }
    if (!formAmount || parseFloat(formAmount) <= 0) { Alert.alert('Erro', 'Informe a quantidade.'); return; }
    setSaving(true);
    try {
      const np = await productionsService.createProduction({ animalId: formAnimalId, date: new Date().toISOString(), amount: parseFloat(formAmount), period: formPeriod, quality: 'good', destination: 'tank' });
      setProductions(prev => [np, ...prev]);
      setShowModal(false); setFormAnimalId(''); setFormAmount(''); setFormPeriod('morning');
    } catch { Alert.alert('Erro', 'Falha ao salvar.'); }
    finally { setSaving(false); }
  };

  const pLabel = (p: string) => p === 'morning' ? 'Manhã' : p === 'afternoon' ? 'Tarde' : 'Noite';
  const fmtDate = (d: string) => { const dt = new Date(d); return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`; };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#16a34a" /><Text style={s.loadTxt}>Carregando...</Text></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Ordenha</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={s.addBtn}><Text style={s.addTxt}>+ Novo</Text></TouchableOpacity>
      </View>
      <View style={s.statsRow}>
        <View style={[s.stat, { backgroundColor: '#1d4ed8' }]}><Text style={s.statL}>Média/Tirada</Text><Text style={s.statV}>{avg.toFixed(1)}L</Text></View>
        <View style={[s.stat, { backgroundColor: '#16a34a' }]}><Text style={s.statL}>Total Hoje</Text><Text style={s.statV}>{todayProd.toFixed(1)}L</Text></View>
      </View>
      <View style={s.periodRow}>
        <View style={[s.periodCard, { backgroundColor: '#fef3c7', borderColor: '#fbbf24' }]}>
          <Text style={s.periodIcon}>🌅</Text>
          <Text style={[s.periodLabel, { color: '#92400e' }]}>Manhã</Text>
          <Text style={[s.periodValue, { color: '#b45309' }]}>{morningProd.toFixed(1)}L</Text>
        </View>
        <View style={[s.periodCard, { backgroundColor: '#e0f2fe', borderColor: '#38bdf8' }]}>
          <Text style={s.periodIcon}>☀️</Text>
          <Text style={[s.periodLabel, { color: '#075985' }]}>Tarde</Text>
          <Text style={[s.periodValue, { color: '#0369a1' }]}>{afternoonProd.toFixed(1)}L</Text>
        </View>
        <View style={[s.periodCard, { backgroundColor: '#ede9fe', borderColor: '#a78bfa' }]}>
          <Text style={s.periodIcon}>🌙</Text>
          <Text style={[s.periodLabel, { color: '#4c1d95' }]}>Noite</Text>
          <Text style={[s.periodValue, { color: '#6d28d9' }]}>{nightProd.toFixed(1)}L</Text>
        </View>
      </View>
      <FlatList data={productions} keyExtractor={i => i.id} contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />}
        ListEmptyComponent={<View style={s.empty}><Text style={s.emptyTxt}>Nenhum registro.</Text></View>}
        renderItem={({ item }) => {
          const an = animals.find(a => a.id === item.animalId);
          return (
            <View style={s.card}>
              <View style={s.cardIcon}><Text style={{ fontSize: 18 }}>🥛</Text></View>
              <View style={{ flex: 1 }}><Text style={s.cardName}>{an?.name || 'Animal'}</Text><Text style={s.cardDate}>{fmtDate(item.date)}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={s.cardAmt}>{item.amount}L</Text><Text style={s.cardPer}>{pLabel(item.period)}</Text></View>
            </View>
          );
        }}
      />
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.mOverlay}>
          <View style={s.mContent}>
            <View style={s.mHeader}><Text style={s.mTitle}>🥛 Nova Produção</Text><TouchableOpacity onPress={() => setShowModal(false)}><Text style={s.mClose}>✕</Text></TouchableOpacity></View>
            <ScrollView>
              <Text style={s.fLabel}>ANIMAL</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {animals.filter(a => a.status === 'lactation').map(a => (
                  <TouchableOpacity key={a.id} onPress={() => setFormAnimalId(a.id)} style={[s.chip, formAnimalId === a.id && s.chipAct]}>
                    <Text style={[s.chipTxt, formAnimalId === a.id && s.chipTxtAct]}>{a.name || a.tag}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.fLabel}>LITROS</Text>
              <TextInput style={s.input} value={formAmount} onChangeText={setFormAmount} keyboardType="decimal-pad" placeholder="12.5" placeholderTextColor="#94a3b8" />
              <Text style={s.fLabel}>PERÍODO</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['morning', 'afternoon', 'night'] as const).map(p => (
                  <TouchableOpacity key={p} onPress={() => setFormPeriod(p)} style={[s.chip, formPeriod === p && s.chipAct]}>
                    <Text style={[s.chipTxt, formPeriod === p && s.chipTxtAct]}>{pLabel(p)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={handleSave} disabled={saving} style={[s.saveBtn, saving && { opacity: 0.6 }]}>
                <Text style={s.saveTxt}>{saving ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadTxt: { marginTop: 12, color: '#64748b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 24, fontWeight: '800', color: '#15803d' },
  addBtn: { backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  stat: { flex: 1, borderRadius: 16, padding: 16, elevation: 3 },
  statL: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statV: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  periodRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  periodCard: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1.5, elevation: 1 },
  periodIcon: { fontSize: 16, marginBottom: 2 },
  periodLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  periodValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, elevation: 1 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  cardName: { fontSize: 14, fontWeight: '700', color: '#334155' },
  cardDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  cardAmt: { fontSize: 16, fontWeight: '800', color: '#15803d' },
  cardPer: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 2, textTransform: 'uppercase' },
  empty: { padding: 32, alignItems: 'center' },
  emptyTxt: { color: '#94a3b8', fontSize: 14 },
  mOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  mContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  mHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mTitle: { fontSize: 20, fontWeight: '800', color: '#15803d' },
  mClose: { fontSize: 20, color: '#94a3b8', fontWeight: '700', padding: 4 },
  fLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', marginBottom: 8, marginTop: 16, letterSpacing: 0.5 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#334155' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f1f5f9', marginRight: 8, marginBottom: 4 },
  chipAct: { backgroundColor: '#16a34a' },
  chipTxt: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  chipTxtAct: { color: '#fff' },
  saveBtn: { backgroundColor: '#16a34a', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  saveTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

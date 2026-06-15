import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Modal, TextInput, Alert, ScrollView,
} from 'react-native';
import { healthService } from '../services/health.service';
import { animalsService } from '../services/animals.service';
import { Animal, HealthEvent } from '../types';
import { useFocusEffect } from '@react-navigation/native';

export default function HealthScreen() {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formAnimalId, setFormAnimalId] = useState('');
  const [formType, setFormType] = useState<HealthEvent['type']>('vaccine');
  const [formDesc, setFormDesc] = useState('');
  const [formResponsible, setFormResponsible] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [e, a] = await Promise.all([healthService.getEvents(), animalsService.getAnimals()]);
      setEvents(e); setAnimals(a);
    } catch (err) { console.warn(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );
  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleSave = async () => {
    if (!formAnimalId) { Alert.alert('Erro','Selecione um animal.'); return; }
    if (!formDesc.trim()) { Alert.alert('Erro','Informe a descrição.'); return; }
    setSaving(true);
    try {
      const ne = await healthService.createEvent({ animalId: formAnimalId, date: new Date().toISOString(), type: formType, description: formDesc.trim(), responsible: formResponsible.trim() || undefined });
      setEvents(prev => [ne, ...prev]);
      if (formType === 'death') {
        setAnimals(prev => prev.map(a => a.id === formAnimalId ? { ...a, status: 'dead' } : a));
      }
      setShowModal(false); setFormAnimalId(''); setFormDesc(''); setFormResponsible(''); setFormType('vaccine');
    } catch { Alert.alert('Erro','Falha ao salvar.'); }
    finally { setSaving(false); }
  };

  const typeEmoji = (t: string) => t==='vaccine'?'💉':t==='medication'?'💊':t==='insemination'?'🧬':t==='calving'?'🐄':t==='checkup'?'🩺':t==='birth'?'🍼':t==='purchase'?'💵':t==='death'?'🪦':'📋';
  const typeLabel = (t: string) => t==='vaccine'?'Vacina':t==='medication'?'Medicação':t==='insemination'?'Inseminação':t==='calving'?'Parto':t==='checkup'?'Check-up':t==='birth'?'Nascimento':t==='purchase'?'Compra':t==='death'?'Morte':'Outro';
  const typeBg = (t: string) => t==='vaccine'?'#fef2f2':t==='medication'?'#fffbeb':t==='insemination'?'#faf5ff':t==='calving'?'#eff6ff':t==='checkup'?'#f0fdf4':t==='birth'?'#f0fdf4':t==='purchase'?'#ecfdf5':t==='death'?'#fef2f2':'#f1f5f9';
  const fmtDate = (d: string) => { const dt=new Date(d); return `${dt.getDate().toString().padStart(2,'0')}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getFullYear()}`; };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#16a34a" /><Text style={s.loadTxt}>Carregando...</Text></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Eventos Sanitários</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={s.addBtn}><Text style={s.addTxt}>+ Novo</Text></TouchableOpacity>
      </View>
      <FlatList data={events} keyExtractor={i => i.id} contentContainerStyle={{padding:16}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />}
        ListEmptyComponent={<View style={s.empty}><Text style={s.emptyTxt}>Nenhum evento registrado.</Text></View>}
        renderItem={({item}) => {
          const an = animals.find(a => a.id === item.animalId);
          return (
            <View style={s.card}>
              <View style={[s.cardIcon,{backgroundColor:typeBg(item.type)}]}><Text style={{fontSize:18}}>{typeEmoji(item.type)}</Text></View>
              <View style={{flex:1}}>
                <Text style={s.cardName}>{item.description}</Text>
                <Text style={s.cardSub}>{an?.name||'Animal'} (Brinco {an?.tag||'—'})</Text>
              </View>
              <View style={{alignItems:'flex-end'}}>
                <Text style={s.cardDate}>{fmtDate(item.date)}</Text>
                {item.withdrawalDays ? <Text style={s.cardWarn}>CARÊNCIA</Text> : null}
              </View>
            </View>
          );
        }}
      />
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.mOverlay}>
          <View style={s.mContent}>
            <View style={s.mHeader}><Text style={s.mTitle}>🏥 Novo Evento</Text><TouchableOpacity onPress={() => setShowModal(false)}><Text style={s.mClose}>✕</Text></TouchableOpacity></View>
            <ScrollView>
              <Text style={s.fLabel}>ANIMAL</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {animals.filter(a => a.status !== 'dead').map(a => (
                  <TouchableOpacity key={a.id} onPress={() => setFormAnimalId(a.id)} style={[s.chip, formAnimalId===a.id && s.chipAct]}>
                    <Text style={[s.chipTxt, formAnimalId===a.id && s.chipTxtAct]}>{a.name||a.tag}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={s.fLabel}>TIPO</Text>
              <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
                {(['vaccine','medication','insemination','calving','checkup','birth','purchase','death'] as const).map(t => (
                  <TouchableOpacity key={t} onPress={() => setFormType(t)} style={[s.chip, formType===t && s.chipAct]}>
                    <Text style={[s.chipTxt, formType===t && s.chipTxtAct]}>{typeEmoji(t)} {typeLabel(t)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.fLabel}>DESCRIÇÃO</Text>
              <TextInput style={s.input} value={formDesc} onChangeText={setFormDesc} placeholder="Ex: Vacina contra Aftosa" placeholderTextColor="#94a3b8" />
              <Text style={s.fLabel}>RESPONSÁVEL</Text>
              <TextInput style={s.input} value={formResponsible} onChangeText={setFormResponsible} placeholder="Nome do veterinário" placeholderTextColor="#94a3b8" />
              <TouchableOpacity onPress={handleSave} disabled={saving} style={[s.saveBtn, saving&&{opacity:0.6}]}>
                <Text style={s.saveTxt}>{saving?'Salvando...':'Salvar Evento'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#f8fafc'},
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  loadTxt:{marginTop:12,color:'#64748b'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingTop:60,paddingBottom:12,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#f1f5f9'},
  title:{fontSize:24,fontWeight:'800',color:'#15803d'},
  addBtn:{backgroundColor:'#16a34a',paddingHorizontal:16,paddingVertical:8,borderRadius:12},
  addTxt:{color:'#fff',fontWeight:'700',fontSize:13},
  card:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#fff',borderRadius:16,padding:14,marginBottom:8,elevation:1},
  cardIcon:{width:44,height:44,borderRadius:14,justifyContent:'center',alignItems:'center'},
  cardName:{fontSize:13,fontWeight:'700',color:'#334155'},
  cardSub:{fontSize:11,color:'#94a3b8',marginTop:2},
  cardDate:{fontSize:11,fontWeight:'700',color:'#15803d'},
  cardWarn:{fontSize:9,fontWeight:'800',color:'#dc2626',marginTop:2,textTransform:'uppercase'},
  empty:{padding:32,alignItems:'center'},
  emptyTxt:{color:'#94a3b8',fontSize:14},
  mOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'},
  mContent:{backgroundColor:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,padding:20,maxHeight:'85%'},
  mHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},
  mTitle:{fontSize:20,fontWeight:'800',color:'#15803d'},
  mClose:{fontSize:20,color:'#94a3b8',fontWeight:'700',padding:4},
  fLabel:{fontSize:11,fontWeight:'700',color:'#94a3b8',marginBottom:8,marginTop:16,letterSpacing:0.5},
  input:{backgroundColor:'#f1f5f9',borderRadius:12,paddingHorizontal:16,paddingVertical:14,fontSize:16,color:'#334155'},
  chip:{paddingHorizontal:14,paddingVertical:8,borderRadius:12,backgroundColor:'#f1f5f9',marginRight:8,marginBottom:4},
  chipAct:{backgroundColor:'#16a34a'},
  chipTxt:{fontSize:13,fontWeight:'600',color:'#64748b'},
  chipTxtAct:{color:'#fff'},
  saveBtn:{backgroundColor:'#16a34a',borderRadius:14,padding:16,alignItems:'center',marginTop:24,marginBottom:20},
  saveTxt:{color:'#fff',fontWeight:'800',fontSize:15},
});

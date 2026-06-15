import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from '../services/api';
import { farmConfigService } from '../services/farmConfig.service';
import { animalsService } from '../services/animals.service';
import { productionsService } from '../services/productions.service';
import { FarmConfig } from '../types';

interface Props {
  onLogout: () => void;
}

export default function ConfigScreen({ onLogout }: Props) {
  const [config, setConfig] = useState<FarmConfig>({ name: 'Minha Fazenda', producer: '', location: '', pveDays: 60, dryingPeriodDays: 60 });
  const [animalsCount, setAnimalsCount] = useState(0);
  const [prodsCount, setProdsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // States para o modal de edição customizado
  const [editingField, setEditingField] = useState<keyof FarmConfig | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [editingValue, setEditingValue] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, a, p] = await Promise.all([
          farmConfigService.getConfig(),
          animalsService.getAnimals(),
          productionsService.getProductions(),
        ]);
        setConfig(c); setAnimalsCount(a.length); setProdsCount(p.length);
      } catch (err) { console.warn(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const editField = (field: keyof FarmConfig, label: string) => {
    setEditingField(field);
    setEditingLabel(label);
    setEditingValue(config[field]?.toString() || '');
  };

  const handleSaveField = async () => {
    if (editingField === null) return;
    setUpdating(true);
    try {
      const updatedConfig = { ...config };
      
      if (editingField === 'pveDays' || editingField === 'dryingPeriodDays') {
        const val = parseInt(editingValue) || 0;
        updatedConfig[editingField] = val;
      } else {
        updatedConfig[editingField] = editingValue;
      }
      
      const saved = await farmConfigService.updateConfig(updatedConfig);
      setConfig(saved);
      setEditingField(null);
    } catch (err) {
      console.warn('Erro ao salvar configuração:', err);
      Alert.alert('Erro', 'Não foi possível salvar as alterações no servidor.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem(TOKEN_KEY);
        onLogout();
      }},
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#16a34a" /></View>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Text style={s.title}>Configurações</Text>

        {/* Farm Info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🏠 Minha Fazenda</Text>
          <ConfigRow label="Nome" value={config.name} onPress={() => editField('name', 'Nome da Fazenda')} />
          <ConfigRow label="Produtor" value={config.producer} onPress={() => editField('producer', 'Nome do Produtor')} />
          <ConfigRow label="Localização" value={config.location} onPress={() => editField('location', 'Localização')} />
        </View>

        {/* Reproductive Cycle */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🔄 Ciclo Reprodutivo</Text>
          <ConfigRow label="PVE (Espera Pós-Parto)" value={`${config.pveDays} dias`} onPress={() => editField('pveDays', 'Dias de PVE')} />
          <ConfigRow label="Período de Secagem" value={`${config.dryingPeriodDays} dias`} onPress={() => editField('dryingPeriodDays', 'Dias para Secagem')} />
        </View>

        {/* App Stats */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📊 Dados do App</Text>
          <View style={s.statsRow}>
            <View style={s.statBox}><Text style={s.statLabel}>Animais</Text><Text style={s.statValue}>{animalsCount}</Text></View>
            <View style={s.statBox}><Text style={s.statLabel}>Registros</Text><Text style={s.statValue}>{prodsCount}</Text></View>
          </View>
        </View>

        {/* Version */}
        <View style={s.versionBlock}>
          <Text style={s.versionText}>MooData v1.1 · App Nativo</Text>
          <Text style={s.versionSub}>Dados sincronizados na nuvem ☁️</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
          <Text style={s.logoutTxt}>🚪 Sair da conta</Text>
        </TouchableOpacity>

        <View style={{height:40}} />
      </ScrollView>

      {/* Modal de Edição Customizado para iOS e Android */}
      <Modal
        visible={editingField !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingField(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{editingLabel}</Text>
            <TextInput
              style={s.modalInput}
              value={editingValue}
              onChangeText={setEditingValue}
              keyboardType={editingField === 'pveDays' || editingField === 'dryingPeriodDays' ? 'numeric' : 'default'}
              placeholder="Digite o novo valor"
              placeholderTextColor="#94a3b8"
              autoFocus
            />
            <View style={s.modalButtons}>
              <TouchableOpacity 
                onPress={() => setEditingField(null)} 
                style={[s.modalBtn, s.modalBtnCancel]}
                disabled={updating}
              >
                <Text style={s.modalBtnCancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveField} 
                style={[s.modalBtn, s.modalBtnSave]}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.modalBtnSaveTxt}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ConfigRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.row}>
      <View style={{flex:1}}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowValue}>{value || '—'}</Text>
      </View>
      <Text style={s.rowEdit}>Editar</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#f8fafc'},
  content:{padding:16,paddingTop:60},
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  title:{fontSize:24,fontWeight:'800',color:'#15803d',marginBottom:20},

  card:{backgroundColor:'#fff',borderRadius:18,padding:16,marginBottom:12,elevation:2,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:8},
  cardTitle:{fontSize:15,fontWeight:'700',color:'#15803d',borderBottomWidth:1,borderBottomColor:'#f0fdf4',paddingBottom:10,marginBottom:8},

  row:{flexDirection:'row',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#f8fafc'},
  rowLabel:{fontSize:10,fontWeight:'700',color:'#94a3b8',textTransform:'uppercase'},
  rowValue:{fontSize:14,fontWeight:'600',color:'#334155',marginTop:2},
  rowEdit:{fontSize:12,fontWeight:'700',color:'#16a34a'},

  statsRow:{flexDirection:'row',gap:12},
  statBox:{flex:1,backgroundColor:'#f8fafc',borderRadius:14,padding:14},
  statLabel:{fontSize:10,fontWeight:'700',color:'#94a3b8',textTransform:'uppercase'},
  statValue:{fontSize:22,fontWeight:'800',color:'#334155',marginTop:4},

  versionBlock:{alignItems:'center',paddingVertical:16},
  versionText:{fontSize:12,fontWeight:'700',color:'#94a3b8'},
  versionSub:{fontSize:11,color:'#94a3b8',marginTop:2},

  logoutBtn:{backgroundColor:'#fff',borderRadius:14,padding:16,alignItems:'center',borderWidth:2,borderColor:'#fecaca'},
  logoutTxt:{fontSize:15,fontWeight:'700',color:'#dc2626'},

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalBtnCancelTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  modalBtnSave: {
    backgroundColor: '#16a34a',
  },
  modalBtnSaveTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

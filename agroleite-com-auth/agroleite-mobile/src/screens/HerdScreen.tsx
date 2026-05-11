import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { animalsService } from '../services/animals.service';
import { Animal } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from '../services/api';

interface Props {
  onLogout: () => void;
}

export default function HerdScreen({ onLogout }: Props) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const loadAnimals = async () => {
    try {
      const data = await animalsService.getAnimals();
      // O animalsService cuida de tentar a API ou o Cache Offline
      setAnimals(data);
      // Aqui teríamos que deduzir se veio do cache ou da API. 
      // Por simplicidade, vamos assumir que não deu erro = online ou cache bem sucedido.
      setOfflineMode(false);
    } catch (error: any) {
      // Como o AsyncStorage funcionou, se der erro aqui, é porque não há nem internet nem cache!
      console.warn(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnimals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnimals();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    onLogout();
  };

  // Componente nativo de cada item da lista
  const renderAnimal = ({ item }: { item: Animal }) => {
    const isCow = item.category === 'cow';
    const isLactation = item.status === 'lactation';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.animalName}>{item.name || 'Sem nome'} • Brinco {item.tag}</Text>
            <Text style={styles.animalCategory}>
              {isCow ? '🐄 Vaca' : '🐄 Novilha'} • {item.breed}
            </Text>
          </View>
          <View style={[styles.statusBadge, isLactation ? styles.statusLactation : styles.statusDry]}>
            <Text style={[styles.statusText, isLactation ? styles.statusTextLactation : styles.statusTextDry]}>
              {isLactation ? 'LACTAÇÃO' : 'SECA'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Carregando rebanho...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meu Rebanho</Text>
          <Text style={styles.onlineText}>🟢 Sincronizado (App Nativo)</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={animals}
        keyExtractor={(item) => item.id}
        renderItem={renderAnimal}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum animal cadastrado no celular.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60, // Padding para a barra de status do celular
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#15803d', // agro-green-700
  },
  onlineText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  logoutText: {
    color: '#64748b',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2, // Sombra para Android
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  animalCategory: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusLactation: {
    backgroundColor: '#dcfce7',
  },
  statusDry: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusTextLactation: {
    color: '#15803d',
  },
  statusTextDry: {
    color: '#64748b',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Menu } from 'lucide-react-native';
import { animalsService } from '../services/animals.service';
import { Animal } from '../types';

interface Props {
  navigation: any;
  route: any;
}

export default function HerdScreen({ navigation, route }: Props) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Filtros vindos do Dashboard via params
  const [filterCategory, setFilterCategory] = useState<'cow' | 'heifer' | null>(null);
  const [filterStatus, setFilterStatus] = useState<Animal['status'] | null>(null);

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(10);

  // Aplica filtros recebidos via rota (ex: ao clicar no chip do Dashboard)
  useFocusEffect(
    useCallback(() => {
      const params = route?.params ?? {};
      if (params.filterCategory !== undefined) {
        setFilterCategory(params.filterCategory ?? null);
        setFilterStatus(null);
        setVisibleCount(10);
        navigation.setParams({ filterCategory: undefined });
      }
      if (params.filterStatus !== undefined) {
        setFilterStatus(params.filterStatus ?? null);
        setFilterCategory(null);
        setVisibleCount(10);
        navigation.setParams({ filterStatus: undefined });
      }
    }, [route?.params])
  );

  const loadAnimals = async () => {
    try {
      const data = await animalsService.getAnimals();
      setAnimals(data);
    } catch (error: any) {
      console.warn(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAnimals();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); loadAnimals(); };

  const clearFilter = () => {
    setFilterCategory(null);
    setFilterStatus(null);
    setVisibleCount(10);
  };

  const filtered = animals.filter(a => {
    // Filtro de busca textual
    const q = search.toLowerCase();
    const matchSearch = !q || (
      a.name?.toLowerCase().includes(q) ||
      a.tag.toLowerCase().includes(q) ||
      a.breed.toLowerCase().includes(q)
    );
    // Filtro de categoria (vaca/novilha)
    const matchCategory = !filterCategory || a.category === filterCategory;
    // Filtro de status (lactação, etc.)
    const matchStatus = !filterStatus || a.status === filterStatus;
    // Excluir animais mortos do rebanho ativo
    const matchNotDead = a.status !== 'dead';
    return matchSearch && matchCategory && matchStatus && matchNotDead;
  });

  const displayed = filtered.slice(0, visibleCount);
  const loadMore = () => { setVisibleCount(c => c + 10); };

  // Reseta o scroll sempre que a busca textual mudar
  useEffect(() => { setVisibleCount(10); }, [search]);

  const statusLabel = (s: Animal['status']) => {
    switch (s) {
      case 'lactation': return 'LACTAÇÃO';
      case 'dry': return 'SECA';
      case 'pregnant': return 'PRENHA';
      case 'sick': return 'DOENTE';
      case 'pre-calving': return 'PRÉ-PARTO';
    }
  };

  const statusColor = (s: Animal['status']) => {
    switch (s) {
      case 'lactation': return { bg: '#dcfce7', text: '#15803d' };
      case 'pregnant': return { bg: '#ede9fe', text: '#7c3aed' };
      case 'dry': return { bg: '#f1f5f9', text: '#64748b' };
      case 'sick': return { bg: '#fef2f2', text: '#dc2626' };
      case 'pre-calving': return { bg: '#fefce8', text: '#a16207' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const activeFilterLabel = () => {
    if (filterCategory === 'cow') return '🐄 Vacas';
    if (filterCategory === 'heifer') return '🐄 Novilhas';
    if (filterStatus === 'lactation') return '🥛 Em Lactação';
    if (filterStatus) return statusLabel(filterStatus);
    return null;
  };

  const renderAnimal = ({ item }: { item: Animal }) => {
    const isCow = item.category === 'cow';
    const color = statusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('AnimalDetail', { animalId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.animalName}>{item.name || 'Sem nome'} • Brinco {item.tag}</Text>
            <Text style={styles.animalCategory}>
              {isCow ? '🐄 Vaca' : '🐄 Novilha'} • {item.breed}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: color.bg }]}>
            <Text style={[styles.statusText, { color: color.text }]}>
              {statusLabel(item.status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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

  const filterLabel = activeFilterLabel();

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ padding: 4 }}>
              <Menu size={24} color="#15803d" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Meu Rebanho</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AnimalForm')}>
            <Text style={styles.addBtnText}>+ NOVO</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome, brinco ou raça..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Active filter badge */}
      {filterLabel && (
        <View style={styles.filterRow}>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{filterLabel}</Text>
            <TouchableOpacity onPress={clearFilter} style={styles.filterClear}>
              <Text style={styles.filterClearText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.filterCount}>{filtered.length} animais</Text>
        </View>
      )}

      {/* Count (sem filtro ativo) */}
      {!filterLabel && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>{filtered.length} animais</Text>
        </View>
      )}

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        renderItem={renderAnimal}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum animal encontrado.</Text>
          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748b' },

  // Search
  searchContainer: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#15803d' },
  addBtn: { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  searchInput: {
    backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: '#334155',
  },

  // Filter badge
  filterRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#f0fdf4', borderBottomWidth: 1, borderBottomColor: '#bbf7d0',
  },
  filterBadge: { flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#15803d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  filterBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  filterClear: { marginLeft: 4 },
  filterClearText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '700' },
  filterCount: { fontSize: 12, fontWeight: '700', color: '#15803d' },

  // Count
  countRow: { paddingHorizontal: 16, paddingVertical: 8 },
  countText: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },

  listContent: { padding: 16, paddingTop: 4 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  animalName: { fontSize: 15, fontWeight: '700', color: '#334155' },
  animalCategory: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  emptyContainer: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 16 },
});

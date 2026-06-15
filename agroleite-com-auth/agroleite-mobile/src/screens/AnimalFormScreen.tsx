import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { animalsService } from '../services/animals.service';
import { Animal } from '../types';
import { ArrowLeft } from 'lucide-react-native';

interface Props {
  route: any;
  navigation: any;
}

// Opções de categoria e status como chips visuais — evita bug do Picker invisível no Android
const CATEGORY_OPTIONS: { label: string; value: 'cow' | 'heifer'; emoji: string }[] = [
  { label: 'Vaca', value: 'cow', emoji: '🐄' },
  { label: 'Novilha', value: 'heifer', emoji: '🐮' },
];

const STATUS_OPTIONS: { label: string; value: Animal['status']; emoji: string }[] = [
  { label: 'Lactação', value: 'lactation', emoji: '🥛' },
  { label: 'Seca', value: 'dry', emoji: '⏸️' },
  { label: 'Prenha', value: 'pregnant', emoji: '🤰' },
  { label: 'Pré-Parto', value: 'pre-calving', emoji: '⏳' },
  { label: 'Doente', value: 'sick', emoji: '🏥' },
];

export default function AnimalFormScreen({ route, navigation }: Props) {
  const animal: Animal | undefined = route.params?.animal;
  const isEditing = !!animal;

  const [tag, setTag] = useState(animal?.tag || '');
  const [name, setName] = useState(animal?.name || '');
  const [breed, setBreed] = useState(animal?.breed || 'Holandesa');
  const [category, setCategory] = useState<'cow' | 'heifer'>(animal?.category || 'cow');
  const [status, setStatus] = useState<Animal['status']>(animal?.status || 'lactation');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!tag.trim()) {
      Alert.alert('Erro', 'O brinco é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const data = {
        tag: tag.trim(),
        name: name.trim(),
        breed: breed.trim() || 'Holandesa',
        category,
        status,
      };

      if (isEditing && animal) {
        await animalsService.updateAnimal(animal.id, data);
        Alert.alert('✅ Sucesso', 'Animal atualizado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await animalsService.createAnimal(data as any);
        Alert.alert('✅ Animal cadastrado!', `${name || tag} foi adicionado ao rebanho.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      const detail = Array.isArray(msg)
        ? msg.join('\n')
        : msg || 'Não foi possível salvar o animal.';
      Alert.alert('Erro ao salvar', detail);
      console.warn('Erro API:', error?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#16a34a" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? '✏️ Editar Animal' : '➕ Novo Animal'}</Text>
      </View>

      {/* Brinco */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Brinco *</Text>
        <TextInput
          style={styles.input}
          value={tag}
          onChangeText={setTag}
          placeholder="Ex: 1234"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
        />
      </View>

      {/* Nome */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Mimosa"
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Raça */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Raça</Text>
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="Ex: Holandesa"
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Categoria — chips visuais em vez de Picker */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.chipRow}>
          {CATEGORY_OPTIONS.map((opt) => {
            const selected = category === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setCategory(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipEmoji}>{opt.emoji}</Text>
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Status — chips visuais em vez de Picker */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.chipRow}>
          {STATUS_OPTIONS.map((opt) => {
            const selected = status === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setStatus(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipEmoji}>{opt.emoji}</Text>
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Resumo da seleção */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          📋 {category === 'cow' ? 'Vaca' : 'Novilha'} •{' '}
          {STATUS_OPTIONS.find((s) => s.value === status)?.label}
        </Text>
      </View>

      {/* Botão Salvar */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>
            {isEditing ? '💾 Salvar Alterações' : '✅ Cadastrar Animal'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 48 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#15803d', flex: 1 },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },

  // Chips de seleção — fix para o bug do Picker invisível
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  chipSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  chipTextSelected: { color: '#15803d', fontWeight: '700' },

  // Resumo
  summaryBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  summaryText: { fontSize: 13, fontWeight: '700', color: '#15803d', textAlign: 'center' },

  // Botão
  saveBtn: {
    backgroundColor: '#16a34a',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home, ClipboardList, Milk, Calendar, Settings, LogOut, History,
} from 'lucide-react-native';

const MENU_ITEMS = [
  { name: 'Dashboard', label: 'Início',       Icon: Home },
  { name: 'Herd',      label: 'Rebanho',      Icon: ClipboardList },
  { name: 'Movements', label: 'Movimentação', Icon: History, isSubItem: true },
  { name: 'Milking',   label: 'Ordenha',      Icon: Milk },
  { name: 'Health',    label: 'Eventos',      Icon: Calendar },
  { name: 'Config',    label: 'Ajustes',      Icon: Settings },
];

interface Props {
  navigation: any;
  state: any;
  onLogout: () => void;
}

export default function CustomDrawer({ navigation, state, onLogout }: Props) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state?.routes?.[state.index]?.name ?? 'Dashboard';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header verde com logo */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🐄</Text>
        </View>
        <Text style={styles.appName}>MooData</Text>
        <Text style={styles.appSub}>Gestão Inteligente de Rebanho</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Navigation items */}
      <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map(({ name, label, Icon, isSubItem }) => {
          const isActive = activeRouteName === name;
          return (
            <TouchableOpacity
              key={name}
              style={[
                styles.menuItem,
                isActive && styles.menuItemActive,
                isSubItem && { marginLeft: 24, paddingVertical: 8 }
              ]}
              onPress={() => navigation.navigate(name)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.menuIcon,
                isActive && styles.menuIconActive,
                isSubItem && { width: 30, height: 30, marginRight: 8 }
              ]}>
                <Icon
                  size={isSubItem ? 15 : 20}
                  color={isActive ? '#fff' : '#64748b'}
                />
              </View>
              <Text style={[
                styles.menuLabel,
                isActive && styles.menuLabelActive,
                isSubItem && { fontSize: 13, fontWeight: '600' }
              ]}>
                {label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer — Logout */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIcon}>
            <LogOut size={18} color="#dc2626" />
          </View>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>MooData v1.1 · Nativo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#15803d',
    alignItems: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoEmoji: { fontSize: 32 },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  appSub: {
    fontSize: 11,
    color: '#bbf7d0',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
    marginVertical: 8,
  },

  // Menu
  menuScroll: { flex: 1, paddingHorizontal: 10, paddingTop: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: '#f0fdf4',
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconActive: {
    backgroundColor: '#16a34a',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  menuLabelActive: {
    color: '#15803d',
    fontWeight: '800',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#16a34a',
  },

  // Footer
  footer: {
    paddingHorizontal: 10,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    marginBottom: 12,
  },
  logoutIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#dc2626',
  },
  version: {
    fontSize: 10,
    color: '#cbd5e1',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
});

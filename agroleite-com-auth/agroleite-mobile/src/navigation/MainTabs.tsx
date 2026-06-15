import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Menu } from 'lucide-react-native';

import DashboardScreen from '../screens/DashboardScreen';
import HerdScreen from '../screens/HerdScreen';
import AnimalDetailScreen from '../screens/AnimalDetailScreen';
import AnimalFormScreen from '../screens/AnimalFormScreen';
import MilkingScreen from '../screens/MilkingScreen';
import HealthScreen from '../screens/HealthScreen';
import ConfigScreen from '../screens/ConfigScreen';
import MovementsScreen from '../screens/MovementsScreen';
import CustomDrawer from './CustomDrawer';

const Drawer = createDrawerNavigator();
const HerdStack = createNativeStackNavigator();

interface Props {
  onLogout: () => void;
}

// Stack interno do Rebanho (lista → detalhe → formulário)
function HerdStackNavigator() {
  return (
    <HerdStack.Navigator screenOptions={{ headerShown: false }}>
      <HerdStack.Screen name="HerdList" component={HerdScreen} />
      <HerdStack.Screen name="AnimalDetail" component={AnimalDetailScreen} />
      <HerdStack.Screen name="AnimalForm" component={AnimalFormScreen} />
    </HerdStack.Navigator>
  );
}

// Botão hamburguer para abrir o Drawer — usado nas screens
function MenuButton({ navigation }: { navigation: any }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      style={{ padding: 8, marginLeft: 4 }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Menu size={24} color="#15803d" />
    </TouchableOpacity>
  );
}

export default function MainTabs({ onLogout }: Props) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawer {...props} onLogout={onLogout} />
      )}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '700',
          color: '#15803d',
        },
        headerLeft: () => <MenuButton navigation={navigation} />,
        drawerType: 'slide',
        drawerStyle: {
          backgroundColor: '#fff',
          width: 270,
        },
        overlayColor: 'rgba(0,0,0,0.35)',
        swipeEdgeWidth: 60,
      })}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: '🏠 Início' }}
      />
      <Drawer.Screen
        name="Herd"
        component={HerdStackNavigator}
        options={{ title: '🐄 Rebanho', headerShown: false }}
      />
      <Drawer.Screen
        name="Movements"
        component={MovementsScreen}
        options={{ title: '📊 Movimentação' }}
      />
      <Drawer.Screen
        name="Milking"
        component={MilkingScreen}
        options={{ title: '🥛 Ordenha' }}
      />
      <Drawer.Screen
        name="Health"
        component={HealthScreen}
        options={{ title: '📅 Eventos' }}
      />
      <Drawer.Screen
        name="Config"
        options={{ title: '⚙️ Ajustes' }}
      >
        {() => <ConfigScreen onLogout={onLogout} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

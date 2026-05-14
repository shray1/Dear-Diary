import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import TodayScreen from './src/screens/TodayScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import ScoringScreen from './src/screens/ScoringScreen';
import DataScreen from './src/screens/DataScreen';
import { colors } from './src/constants/theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Today: { icon: '✏️', label: 'Today' },
  History: { icon: '📚', label: 'History' },
  Reports: { icon: '📊', label: 'Reports' },
  Goals: { icon: '🌟', label: 'Goals' },
  Scoring: { icon: '⚖️', label: 'Scoring' },
  Data: { icon: '💾', label: 'Data' },
};

function TabIcon({ name, focused }) {
  const { icon } = TAB_ICONS[name] || {};
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
      {icon}
    </Text>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.card} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.soft,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.line,
              borderTopWidth: 1,
              paddingBottom: 4,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen name="Today" component={TodayScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="Reports" component={ReportsScreen} />
          <Tab.Screen name="Goals" component={GoalsScreen} />
          <Tab.Screen name="Scoring" component={ScoringScreen} />
          <Tab.Screen name="Data" component={DataScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

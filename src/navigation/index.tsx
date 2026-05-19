import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuthStore } from '../stores/auth.store';
import { setNavigationRef } from '../api/axios';
import { colors } from '../theme';

import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PropertiesScreen from '../screens/properties/PropertiesScreen';
import PropertyDetailScreen from '../screens/properties/PropertyDetailScreen';
import TeamScreen from '../screens/team/TeamScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import type { RootStackParamList, MainTabParamList, PropertiesStackParamList } from './types';
import { useUnreadCount } from '../hooks/useNotifications';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const PropertiesStack = createNativeStackNavigator<PropertiesStackParamList>();

function PropertiesNavigator() {
  return (
    <PropertiesStack.Navigator screenOptions={{ headerShown: false }}>
      <PropertiesStack.Screen name="PropertiesList" component={PropertiesScreen} />
      <PropertiesStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </PropertiesStack.Navigator>
  );
}

function NotificationBadge() {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;
  if (count === 0) return null;
  return (
    <View
      style={{
        position: 'absolute',
        right: -6,
        top: -3,
        backgroundColor: colors.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
      }}
    >
      <Text style={{ color: colors.textInverse, fontSize: 10, fontWeight: '700' }}>
        {count > 99 ? '99+' : String(count)}
      </Text>
    </View>
  );
}

function MainTabs() {
  const { user } = useAuthStore();
  const isDirector = user?.role === 'DIRECTOR';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Properties"
        component={PropertiesNavigator}
        options={{
          tabBarLabel: 'Properties',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-city" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{
          tabBarLabel: 'Team',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      {isDirector && (
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            tabBarLabel: 'Alerts',
            tabBarIcon: ({ color, size }) => (
              <View>
                <MaterialCommunityIcons name="bell" color={color} size={size} />
                <NotificationBadge />
              </View>
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/** Shown while SecureStore is being read on cold start — prevents login flash */
function SplashScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }}>
      <View style={{
        width: 64, height: 64, borderRadius: 16,
        backgroundColor: colors.gold,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <MaterialCommunityIcons name="home-city" size={36} color={colors.textInverse} />
      </View>
      <Text style={{ color: colors.textInverse, fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
        Sri Thangam
      </Text>
      <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 32 }}>
        Housing
      </Text>
      <ActivityIndicator color={colors.gold} />
    </View>
  );
}

export function RootNavigator() {
  const { user, isLoaded, loadFromStorage } = useAuthStore();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef({
        navigate: (screen: string) => {
          navigationRef.current?.navigate(screen as keyof RootStackParamList);
        },
      });
    }
  }, []);

  // Wait for SecureStore read before rendering navigation — prevents auth flash
  if (!isLoaded) return <SplashScreen />;

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

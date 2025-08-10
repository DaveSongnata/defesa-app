import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { AuthService } from '../services/authService';
import { initializeDatabase } from '../db';

// Screens
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PurchaseFormScreen } from '../screens/PurchaseFormScreen';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  PurchaseForm: { purchaseId?: string };
};

export function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<keyof RootStackParamList>('Auth');

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // Inicializar banco de dados
      await initializeDatabase();
      
      // Verificar autenticação
      const isAuth = await AuthService.isAuthenticated();
      setCurrentScreen(isAuth ? 'Home' : 'Auth');
    } catch (error) {
      console.error('Erro ao inicializar app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = (screen: keyof RootStackParamList, params?: any) => {
    setCurrentScreen(screen);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#17CB86" />
      </View>
    );
  }

  const navigationProps = {
    navigate,
    replace: navigate,
    goBack: () => setCurrentScreen('Home'),
  };

  switch (currentScreen) {
    case 'Auth':
      return <AuthScreen navigation={navigationProps} />;
    case 'Home':
      return <HomeScreen navigation={navigationProps} />;
    case 'PurchaseForm':
      return <PurchaseFormScreen navigation={navigationProps} route={{ params: {} }} />;
    default:
      return <AuthScreen navigation={navigationProps} />;
  }
}
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import "./src/theme/global.css";
import { Text } from 'react-native';

// Configurar Poppins como fonte padrão globalmente
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { fontFamily: 'Poppins_400Regular' };

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#141416" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

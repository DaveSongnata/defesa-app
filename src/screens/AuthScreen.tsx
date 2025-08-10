import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button } from '../components';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import type { RootStackParamList } from '../navigation/AppNavigator';

interface AuthFormData {
  name: string;
  login: string;
  password: string;
  confirmPassword: string;
}

interface Props {
  navigation: {
    replace: (screen: keyof RootStackParamList) => void;
  };
}

export function AuthScreen({ navigation }: Props) {
  const authViewModel = useAuthViewModel();
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    login: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async () => {
    if (authViewModel.isRegisterMode) {
      const success = await authViewModel.register({
        name: formData.name,
        login: formData.login,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      
      if (success) {
        navigation.replace('Home');
      }
    } else {
      const success = await authViewModel.login({
        login: formData.login,
        password: formData.password,
      });
      
      if (success) {
        navigation.replace('Home');
      }
    }
  };

  const updateField = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-8 py-12">
            <View className="bg-white rounded-2xl p-8 mx-4">
              <Text className="text-black text-2xl font-poppins-bold mb-8">
                {authViewModel.isRegisterMode ? 'Criar Conta' : 'Login'}
              </Text>

              {authViewModel.error && (
                <View className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                  <Text className="text-red-600 text-sm text-center font-poppins">
                    {authViewModel.error}
                  </Text>
                </View>
              )}

              {authViewModel.isRegisterMode && (
                <TextInput
                  label="Nome"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChangeText={(text) => updateField('name', text)}
                  error={authViewModel.validationErrors.name}
                  iconLeft="person-outline"
                />
              )}

              <TextInput
                label="Email"
                placeholder="Digite seu email"
                value={formData.login}
                onChangeText={(text) => updateField('login', text)}
                error={authViewModel.validationErrors.login}
                autoCapitalize="none"
                keyboardType="email-address"
                iconLeft="mail-outline"
              />

              <TextInput
                label="Senha"
                placeholder="Digite sua senha"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                error={authViewModel.validationErrors.password}
                secureTextEntry={!authViewModel.showPassword}
                iconLeft="lock-closed-outline"
                iconRight={authViewModel.showPassword ? 'eye-off-outline' : 'eye-outline'}
                onIconRightPress={authViewModel.togglePasswordVisibility}
              />

              {authViewModel.isRegisterMode && (
                <TextInput
                  label="Confirmar Senha"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField('confirmPassword', text)}
                  error={authViewModel.validationErrors.confirmPassword}
                  secureTextEntry={!authViewModel.showPassword}
                  iconLeft="lock-closed-outline"
                />
              )}

              <Button
                title={authViewModel.isRegisterMode ? 'Criar Conta' : 'Entrar'}
                onPress={handleSubmit}
                loading={authViewModel.isLoading}
                className="mt-2 mb-4"
              />

              {!authViewModel.isRegisterMode && (
                <View className="mt-4">
                  <Text className="text-gray-500 text-center font-poppins">
                    Não tem uma conta?
                  </Text>
                  <Button
                    title="Criar Conta"
                    variant="secondary"
                    onPress={authViewModel.toggleMode}
                    className="mt-2"
                  />
                </View>
              )}

              {authViewModel.isRegisterMode && (
                <View className="mt-4">
                  <Text className="text-gray-500 text-center font-poppins">
                    Já tem uma conta?
                  </Text>
                  <Button
                    title="Fazer Login"
                    variant="secondary"
                    onPress={authViewModel.toggleMode}
                    className="mt-2"
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
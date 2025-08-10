import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { 
  HeaderWithBack, 
  TextInput, 
  CurrencyInput, 
  DatePickerField,
  SegmentedControl,
  Button 
} from '../components';
import { usePurchaseFormViewModel } from '../viewmodels/usePurchaseFormViewModel';
import type { RootStackParamList } from '../navigation/AppNavigator';

interface Props {
  navigation: {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params?: { purchaseId?: string };
  };
}

export function PurchaseFormScreen({ navigation, route }: Props) {
  const purchaseId = route.params?.purchaseId;
  const viewModel = usePurchaseFormViewModel(purchaseId);

  const handleSave = async () => {
    const success = await viewModel.save();
    if (success) {
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta compra?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const success = await viewModel.deletePurchase();
            if (success) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  if (viewModel.isLoading) {
    return (
      <View className="flex-1 bg-background">
        <HeaderWithBack
          title={viewModel.isEditMode ? 'Editar Compra' : 'Nova Compra'}
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#17CB86" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <HeaderWithBack
        title={viewModel.isEditMode ? 'Editar Compra' : 'Nova Compra'}
        onBack={() => navigation.goBack()}
        rightAction={
          viewModel.isEditMode ? (
            <Button
              title="Excluir"
              variant="danger"
              onPress={handleDelete}
              className="px-4 py-2 min-h-0"
            />
          ) : undefined
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {viewModel.error && (
            <View className="bg-danger/20 p-3 rounded-lg mb-4">
              <Text className="text-danger text-sm">
                {viewModel.error}
              </Text>
            </View>
          )}

          <TextInput
            label="Nome do Produto"
            placeholder="Ex: Conta de Luz"
            value={viewModel.form.name}
            onChangeText={(text) => viewModel.updateField('name', text)}
            error={viewModel.validationErrors.name}
            iconLeft="pricetag-outline"
          />

          <TextInput
            label="Descrição (opcional)"
            placeholder="Adicione detalhes sobre a compra"
            value={viewModel.form.description}
            onChangeText={(text) => viewModel.updateField('description', text)}
            error={viewModel.validationErrors.description}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            iconLeft="document-text-outline"
          />

          <CurrencyInput
            label="Valor"
            placeholder="R$ 0,00"
            value={viewModel.form.priceCents}
            onChangeValue={(value) => viewModel.updateField('priceCents', value)}
            error={viewModel.validationErrors.priceCents}
          />

          <DatePickerField
            label="Data da Compra"
            value={viewModel.form.purchaseDate}
            onChange={(date) => viewModel.updateField('purchaseDate', date)}
            error={viewModel.validationErrors.purchaseDate}
            maxDate={new Date()}
          />

          <DatePickerField
            label="Data de Vencimento (opcional)"
            value={viewModel.form.dueDate || new Date()}
            onChange={(date) => viewModel.updateField('dueDate', date)}
            error={viewModel.validationErrors.dueDate}
            placeholder="Selecione a data de vencimento"
          />

          <View className="mb-4">
            <Text className="text-text text-sm font-medium mb-2">Status</Text>
            <SegmentedControl
              options={viewModel.getStatusOptions()}
              value={viewModel.form.status}
              onChange={(status) => viewModel.updateField('status', status)}
            />
            {viewModel.validationErrors.status && (
              <Text className="text-danger text-xs mt-1">
                {viewModel.validationErrors.status}
              </Text>
            )}
          </View>

          <View className="mt-6 gap-3">
            <Button
              title={viewModel.isEditMode ? 'Salvar Alterações' : 'Criar Compra'}
              onPress={handleSave}
              loading={viewModel.isSaving}
            />
            
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => navigation.goBack()}
              disabled={viewModel.isSaving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
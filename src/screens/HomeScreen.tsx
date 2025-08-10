import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';
import { usePurchasesListViewModel } from '../viewmodels/usePurchasesListViewModel';
import { CardPurchase, SegmentedControl, TextInput } from '../components';

interface StatCardProps {
  title: string;
  count: number;
  value: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function StatCard({ title, count, value, color, icon }: StatCardProps) {
  return (
    <View className={`${color} rounded-lg p-4 flex-1`}>
      <View className="flex-row items-center justify-between mb-2">
        <Ionicons name={icon} size={24} color="#FFFFFF" />
        <Text className="text-white text-2xl font-bold">{count}</Text>
      </View>
      <Text className="text-white text-lg font-semibold">{value}</Text>
      <Text className="text-white/80 text-sm mt-1">{title}</Text>
    </View>
  );
}

import type { RootStackParamList } from '../navigation/AppNavigator';

interface Props {
  navigation: {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
    replace: (screen: keyof RootStackParamList) => void;
  };
}

export function HomeScreen({ navigation }: Props) {
  const dashboardViewModel = useDashboardViewModel();
  const purchasesViewModel = usePurchasesListViewModel();

  const handleLogout = async () => {
    await dashboardViewModel.logout();
    navigation.replace('Auth');
  };

  const handlePayPurchase = async (purchaseId: string) => {
    const success = await purchasesViewModel.payPurchase(purchaseId);
    if (success) {
      dashboardViewModel.refresh();
    }
  };

  const handlePurchasePress = (purchaseId: string) => {
    navigation.navigate('PurchaseForm', { purchaseId });
  };

  const handleCreatePurchase = () => {
    navigation.navigate('PurchaseForm');
  };

  if (dashboardViewModel.isLoading || purchasesViewModel.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#17CB86" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dashboardViewModel.isRefreshing || purchasesViewModel.isRefreshing}
            onRefresh={() => {
              dashboardViewModel.refresh();
              purchasesViewModel.refresh();
            }}
            colors={['#17CB86']}
            tintColor="#17CB86"
          />
        }
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-muted text-sm">Olá,</Text>
              <Text className="text-text text-xl font-semibold">
                {dashboardViewModel.user?.name || 'Usuário'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="p-2 bg-surface rounded-lg"
            >
              <Ionicons name="log-out-outline" size={24} color="#A7A7A8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-6 py-4">
          <Text className="text-text text-lg font-semibold mb-4">
            Atualizações
          </Text>
          
          <View className="flex-row gap-3 mb-3">
            <StatCard
              title="Contas Pagas"
              count={dashboardViewModel.stats.paidCount}
              value={dashboardViewModel.formatCurrency(dashboardViewModel.stats.paidTotal)}
              color="bg-success"
              icon="checkmark-circle"
            />
            <StatCard
              title="Contas Pendentes"
              count={dashboardViewModel.stats.pendingCount}
              value={dashboardViewModel.formatCurrency(dashboardViewModel.stats.pendingTotal)}
              color="bg-danger"
              icon="time-outline"
            />
          </View>
        </View>

        {/* Lista de Compras */}
        <View className="px-6 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-text text-lg font-semibold">
              Lista de Compras
            </Text>
            <TouchableOpacity
              onPress={handleCreatePurchase}
              className="p-2 bg-primary rounded-lg"
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Filtros */}
          <SegmentedControl
            options={purchasesViewModel.getFilterOptions()}
            value={purchasesViewModel.activeFilter}
            onChange={purchasesViewModel.setActiveFilter}
            variant="tabs"
          />

          {/* Busca */}
          <View className="mt-4">
            <TextInput
              placeholder="Buscar compras..."
              value={purchasesViewModel.searchTerm}
              onChangeText={purchasesViewModel.setSearchTerm}
              iconLeft="search-outline"
            />
          </View>

          {/* Lista */}
          <View className="mt-4">
            {purchasesViewModel.filteredPurchases.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="cart-outline" size={48} color="#A7A7A8" />
                <Text className="text-muted text-center mt-2">
                  Nenhuma compra encontrada
                </Text>
              </View>
            ) : (
              purchasesViewModel.filteredPurchases.map((purchase) => (
                <CardPurchase
                  key={purchase.id}
                  purchase={purchase}
                  onPress={() => handlePurchasePress(purchase.id)}
                  onPay={() => handlePayPurchase(purchase.id)}
                  showHistory={purchasesViewModel.activeFilter === 'HISTORICO'}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
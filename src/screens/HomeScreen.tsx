import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';
import { usePurchasesListViewModel } from '../viewmodels/usePurchasesListViewModel';
import { CardPurchase, SegmentedControl, BottomCTA, Text } from '../components';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

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
        <Text weight="bold" className="text-white text-2xl">{count}</Text>
      </View>
      <Text weight="semibold" className="text-white text-lg">{value}</Text>
      <Text weight="regular" className="text-white/80 text-sm mt-1">{title}</Text>
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

  // Swipe gesture para mudar de aba
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      const filters = purchasesViewModel.getFilterOptions();
      const currentIndex = filters.findIndex(f => f.key === purchasesViewModel.activeFilter);
      if (currentIndex < filters.length - 1) {
        const nextFilter = filters[currentIndex + 1].key;
        purchasesViewModel.setActiveFilter(nextFilter as 'TODAS' | 'PAGO' | 'ATRASADO' | 'ANDAMENTO');
      }
    },
    onSwipeRight: () => {
      const filters = purchasesViewModel.getFilterOptions();
      const currentIndex = filters.findIndex(f => f.key === purchasesViewModel.activeFilter);
      if (currentIndex > 0) {
        const prevFilter = filters[currentIndex - 1].key;
        purchasesViewModel.setActiveFilter(prevFilter as 'TODAS' | 'PAGO' | 'ATRASADO' | 'ANDAMENTO');
      }
    },
  });

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
    <View className="flex-1 bg-background">
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
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="px-6 py-2 border-b border-border">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-muted text-sm" style={{ fontFamily: 'Poppins-Regular' }}>Olá,</Text>
              <Text className="text-text text-xl" style={{ fontFamily: 'Poppins-SemiBold' }}>
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
        <View className="px-6 py-3">
          <Text className="text-text text-lg mb-4" style={{ fontFamily: 'Poppins-SemiBold' }}>
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
          <Text className="text-text text-lg mb-4" style={{ fontFamily: 'Poppins-SemiBold' }}>Lista de Compras</Text>

          {/* Filtros */}
          <SegmentedControl
            options={purchasesViewModel.getFilterOptions()}
            value={purchasesViewModel.activeFilter}
            onChange={purchasesViewModel.setActiveFilter}
            variant="tabs"
          />

          {/* Lista com swipe */}
          <View className="mt-4" {...swipeHandlers}>
            {purchasesViewModel.groupedByDate.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="cart-outline" size={48} color="#A7A7A8" />
                <Text className="text-muted text-center mt-2" style={{ fontFamily: 'Poppins-Regular' }}>Nenhuma compra encontrada</Text>
              </View>
            ) : (
              purchasesViewModel.groupedByDate.map((group) => (
                <View key={group.date} className="mb-4">
                  <Text className="text-muted text-sm mb-2" style={{ fontFamily: 'Poppins-Regular' }}>Histórico do dia {group.label}</Text>
                  {group.items.map((purchase) => (
                    <CardPurchase
                      key={purchase.id}
                      purchase={purchase}
                      onPress={() => handlePurchasePress(purchase.id)}
                      onPay={() => handlePayPurchase(purchase.id)}
                      onEdit={() => handlePurchasePress(purchase.id)}
                    />
                  ))}
                </View>
              ))
            )}
          </View>

          {/* Espaço final para não cobrir cards pelo CTA fixo */}
          <View className="h-2" />
        </View>
      </ScrollView>

      {/* CTA fixo com safe-area */}
      <BottomCTA title="Compra nova" onPress={handleCreatePurchase} />
    </View>
  );
}
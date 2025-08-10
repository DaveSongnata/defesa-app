import { useState, useEffect, useCallback } from 'react';
import { PurchaseService } from '../services/purchaseService';
import { AuthService } from '../services/authService';
import type { DashboardStats, User } from '../models/types';
import { formatCurrency } from '../utils/format';

interface DashboardState {
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  stats: DashboardStats;
  user: User | null;
}

export function useDashboardViewModel() {
  const [state, setState] = useState<DashboardState>({
    isLoading: true,
    isRefreshing: false,
    error: null,
    stats: {
      paidCount: 0,
      paidTotal: 0,
      pendingCount: 0,
      pendingTotal: 0,
      overdueCount: 0,
      overdueTotal: 0,
    },
    user: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [user, stats] = await Promise.all([
        AuthService.getCurrentUser(),
        PurchaseService.getDashboardStats(),
      ]);

      setState(prev => ({
        ...prev,
        user,
        stats,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados',
        isLoading: false,
      }));
    }
  };

  const refresh = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true, error: null }));
      
      const stats = await PurchaseService.getDashboardStats();
      
      setState(prev => ({
        ...prev,
        stats,
        isRefreshing: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao atualizar dados',
        isRefreshing: false,
      }));
    }
  }, []);

  const logout = async () => {
    try {
      await AuthService.logout();
      // A navegação será tratada no componente
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao fazer logout',
      }));
    }
  };

  return {
    ...state,
    refresh,
    logout,
    formatCurrency,
  };
}
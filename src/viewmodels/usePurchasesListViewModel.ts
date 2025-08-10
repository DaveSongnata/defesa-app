import { useState, useEffect, useCallback } from 'react';
import { PurchaseService } from '../services/purchaseService';
import type { Purchase, PurchaseFilters, PurchaseStatus } from '../models/types';

interface PurchasesListState {
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  purchases: Purchase[];
  filteredPurchases: Purchase[];
  paymentHistory: Purchase[];
  activeFilter: 'TODAS' | PurchaseStatus | 'HISTORICO';
  searchTerm: string;
}

export function usePurchasesListViewModel() {
  const [state, setState] = useState<PurchasesListState>({
    isLoading: true,
    isRefreshing: false,
    error: null,
    purchases: [],
    filteredPurchases: [],
    paymentHistory: [],
    activeFilter: 'TODAS',
    searchTerm: '',
  });

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    filterPurchases();
  }, [state.purchases, state.activeFilter, state.searchTerm, state.paymentHistory]);

  const loadPurchases = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [purchases, history] = await Promise.all([
        PurchaseService.list(),
        PurchaseService.getPaymentHistory(),
      ]);

      setState(prev => ({
        ...prev,
        purchases,
        paymentHistory: history,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar compras',
        isLoading: false,
      }));
    }
  };

  const refresh = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRefreshing: true, error: null }));
      
      const [purchases, history] = await Promise.all([
        PurchaseService.list(),
        PurchaseService.getPaymentHistory(),
      ]);

      setState(prev => ({
        ...prev,
        purchases,
        paymentHistory: history,
        isRefreshing: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao atualizar compras',
        isRefreshing: false,
      }));
    }
  }, []);

  const filterPurchases = () => {
    let filtered: Purchase[] = [];

    if (state.activeFilter === 'PAGO') {
      filtered = state.paymentHistory;
    } else if (state.activeFilter === 'TODAS') {
      filtered = state.purchases;
    } else {
      filtered = state.purchases.filter(p => p.status === state.activeFilter);
    }

    // Aplicar busca por texto
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    setState(prev => ({ ...prev, filteredPurchases: filtered }));
  };

  const setActiveFilter = (filter: typeof state.activeFilter) => {
    setState(prev => ({ ...prev, activeFilter: filter }));
  };

  const setSearchTerm = (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  };

  const payPurchase = async (purchaseId: string) => {
    try {
      await PurchaseService.pay(purchaseId);
      await refresh();
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao pagar compra',
      }));
      return false;
    }
  };

  const deletePurchase = async (purchaseId: string) => {
    try {
      await PurchaseService.delete(purchaseId);
      await refresh();
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao deletar compra',
      }));
      return false;
    }
  };

  const getFilterOptions = () => [
    { key: 'TODAS' as const, label: 'Todas' },
    { key: 'PAGO' as const, label: 'Pagas' },
    { key: 'ATRASADO' as const, label: 'Atrasadas' },
    { key: 'ANDAMENTO' as const, label: 'Andamento' },
  ];

  const groupedByDate = (() => {
    const list = state.filteredPurchases;
    const groups: Record<string, Purchase[]> = {};
    for (const p of list) {
      const key = (p.purchaseDate || p.createdAt).split('T')[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    const order = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));
    return order.map((date) => ({
      date,
      label: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
      items: groups[date],
    }));
  })();

  return {
    ...state,
    refresh,
    setActiveFilter,
    setSearchTerm,
    payPurchase,
    deletePurchase,
    getFilterOptions,
    groupedByDate,
  };
}
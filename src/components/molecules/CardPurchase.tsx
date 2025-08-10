import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import type { Purchase } from '../../models/types';
import { formatDateDisplay, formatCurrency } from '../../utils/format';

interface CardPurchaseProps {
  purchase: Purchase;
  onPress: () => void;
  onPay?: () => void;
  onEdit?: () => void;
  showHistory?: boolean;
}

export function CardPurchase({
  purchase,
  onPress,
  onPay,
  onEdit,
  showHistory = false,
}: CardPurchaseProps) {

  const getStatusColor = () => {
    switch (purchase.status) {
      case 'PAGO':
        return showHistory ? 'bg-success' : 'bg-surface';
      case 'ATRASADO':
        return 'bg-danger';
      default:
        return 'bg-surface';
    }
  };

  const getStatusBadgeVariant = (): 'success' | 'danger' | 'neutral' => {
    switch (purchase.status) {
      case 'PAGO':
        return 'success';
      case 'ATRASADO':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = () => {
    switch (purchase.status) {
      case 'PAGO':
        return 'Pago';
      case 'ATRASADO':
        return 'Atrasado';
      default:
        return 'Em andamento';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-lg p-4 mb-3 border border-border ${getStatusColor()}`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-text font-semibold text-base" numberOfLines={1}>
            {purchase.name}
          </Text>
          {purchase.description && (
            <Text className="text-muted text-sm mt-1" numberOfLines={2}>
              {purchase.description}
            </Text>
          )}
        </View>
        
        <Badge count={0} variant={getStatusBadgeVariant()} label={getStatusLabel()} />
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-primary font-bold text-lg">
            {formatCurrency(purchase.priceCents)}
          </Text>
          <Text className="text-muted text-xs mt-1">
            Vencimento: {formatDateDisplay(purchase.dueDate)}
          </Text>
        </View>

        <View className="flex-row gap-2">
          {onEdit && purchase.status !== 'PAGO' && (
            <TouchableOpacity
              onPress={onEdit}
              className="p-2 bg-inputBg rounded-lg"
            >
              <Ionicons name="pencil" size={20} color="#A7A7A8" />
            </TouchableOpacity>
          )}
          
          {onPay && purchase.status !== 'PAGO' && (
            <Button
              title="Pagar"
              variant="primary"
              onPress={onPay}
              className="px-4 py-2 min-h-0"
            />
          )}
        </View>
      </View>

      {showHistory && purchase.paidAt && (
        <View className="mt-2 pt-2 border-t border-border">
          <Text className="text-success text-xs">
            Pago em {formatDateDisplay(purchase.paidAt)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
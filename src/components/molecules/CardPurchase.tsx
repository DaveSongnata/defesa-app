import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReceiptIcon from '../../assets/images/receipt.svg';
import type { Purchase } from '../../models/types';
import { formatDateDisplay, formatCurrencyNoSymbol, formatDayMonth } from '../../utils/format';
import { useBreakpoints } from '../../hooks/useBreakpoints';

interface CardPurchaseProps {
  purchase: Purchase;
  onPress: () => void;
  onPay?: () => void;
  onEdit?: () => void;
}

export function CardPurchase({
  purchase,
  onPress,
  onPay,
  onEdit,
}: CardPurchaseProps) {

  const getStatusColor = () => {
    switch (purchase.status) {
      case 'PAGO':
        return 'bg-success';
      case 'ATRASADO':
        return 'bg-danger';
      default:
        return 'bg-surface';
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

  const getActionColor = () => (purchase.status === 'ANDAMENTO' ? 'text-primary' : 'text-white');
  const getSecondaryTextClass = () =>
    purchase.status === 'ANDAMENTO' ? 'text-muted' : 'text-white';
  const getMetaTextClass = () =>
    purchase.status === 'ANDAMENTO' ? 'text-muted' : 'text-white';

  const { isSmallPhone, isTablet } = useBreakpoints();

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-2xl px-4 py-3 mb-3 h-[71px] overflow-hidden ${getStatusColor()}`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <View className="w-6 h-6 items-center justify-center">
            <ReceiptIcon width={24} height={24} />
          </View>
          <View className="flex-1">
            <Text
              className="text-text font-semibold text-[13px] leading-4"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {purchase.name}
            </Text>
          </View>
        </View>
        {purchase.status === 'PAGO' ? (
          <Text className="text-white font-semibold ml-2">Pago</Text>
        ) : (
          onPay && (
            <TouchableOpacity onPress={onPay} className="px-1 py-1 ml-2">
              <Text className={`${getActionColor()} font-bold`}>Pagar</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <View className="flex-row justify-between items-center mt-0.5">
        <View className="max-w-[75%]">
          <Text className="text-white font-bold text-[13px] leading-4" numberOfLines={1}>
            {formatCurrencyNoSymbol(purchase.priceCents)}
          </Text>
          {purchase.description && (
            <Text
              className={`${getSecondaryTextClass()} text-[11px] mt-0.5`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {purchase.description}
            </Text>
          )}
          {purchase.status === 'PAGO' ? null : purchase.status === 'ATRASADO' ? (
            <Text className={`${getMetaTextClass()} text-[10px] mt-0.5`} numberOfLines={1}>
              Atrasada
            </Text>
          ) : (
            <Text
              className={`${getMetaTextClass()} text-[10px] mt-0.5`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Vencimento: {formatDayMonth(purchase.dueDate)}
            </Text>
          )}
        </View>
      
      </View>
    </TouchableOpacity>
  );
}
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(cents: number): string {
  const reais = (cents ?? 0) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
}

export function formatCurrencyNoSymbol(cents: number): string {
  const reais = (cents ?? 0) / 100;
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
  // Remove tudo que não for dígito, vírgula, ponto ou sinal
  return formatted.replace(/[^\d.,-]/g, '').trim();
}

export function formatDateDisplay(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '-';
  }
}

export function formatDayMonth(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  } catch {
    return '-';
  }
}

export function toDateOnlyString(date?: Date): string | undefined {
  if (!date) return undefined;
  try {
    return date.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}



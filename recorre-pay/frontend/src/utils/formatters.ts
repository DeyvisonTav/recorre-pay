import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
}

export function getDaysUntilDue(dueDate: string | Date): number {
  const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return differenceInDays(dateObj, new Date());
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function formatDocument(document: string): string {
  const cleaned = document.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return document;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Ativo',
    PAUSED: 'Pausado',
    CANCELED: 'Cancelado',
    PAST_DUE: 'Inadimplente',
    PENDING: 'Pendente',
    PAID: 'Pago',
    OVERDUE: 'Atrasado',
    REFUNDED: 'Reembolsado',
  };
  return labels[status] || status;
}

export function getIntervalLabel(interval: string, count: number = 1): string {
  const labels: Record<string, string> = {
    WEEKLY: count === 1 ? 'Semanal' : `A cada ${count} semanas`,
    MONTHLY: count === 1 ? 'Mensal' : `A cada ${count} meses`,
    YEARLY: count === 1 ? 'Anual' : `A cada ${count} anos`,
  };
  return labels[interval] || interval;
}

import { Role } from '@/types';

export function canCheckout(role: Role): boolean {
  return role === 'ADMIN' || role === 'MANAGER';
}

export function canCancel(role: Role): boolean {
  return role === 'ADMIN' || role === 'MANAGER';
}

export function canUpdatePayment(role: Role): boolean {
  return role === 'ADMIN';
}

export function formatCurrency(amount: number, country?: string | null): string {
  if (country === 'INDIA') {
    return `₹${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(2)}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CHECKED_OUT':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'RWF') {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('RF', 'RWF')
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateOrderNumber() {
  return `IW${Date.now().toString().slice(-8)}`
}

export function getSubscriptionFeatures(plan: string) {
  const features: Record<string, string[]> = {
    free: ['Basic support', 'Limited analytics', 'Up to 10 products'],
    basic: ['Email support', 'Basic analytics', 'Up to 100 products', 'Product variants'],
    standard: ['Priority support', 'Advanced analytics', 'Up to 500 products', 'Bulk operations', 'Marketing tools'],
    premium: ['24/7 support', 'Full analytics', 'Unlimited products', 'Custom branding', 'API access', 'Priority listing']
  }
  return features[plan] || []
}

export function truncateText(text: string, length: number) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function getFileExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function isValidImageFile(file: File) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024 // 5MB limit
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Site configuration and URL utilities for Iwanyu Seller Platform
 */

export const siteConfig = {
  name: "Iwanyu Seller Platform",
  description: "Rwanda's Premier Multivendor Platform for Entrepreneurs",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://seller.iwanyu.store",
  domain: "seller.iwanyu.store",
  mainSite: "https://iwanyu.store",
  
  // Social links
  social: {
    twitter: "@iwanyu_rw",
    facebook: "iwanyu.rwanda",
    instagram: "iwanyu_rw"
  },

  // Contact information
  contact: {
    email: "support@iwanyu.store",
    phone: "+250 XXX XXX XXX",
    address: "Kigali, Rwanda"
  }
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Browser should use relative URL
    return ''
  }
  
  // SSR should use full URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Fallback to production domain
  return 'https://seller.iwanyu.store'
}

/**
 * Create absolute URL from relative path
 */
export function createAbsoluteUrl(path: string): string {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Get the current environment URL
 */
export function getCurrentUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return getBaseUrl()
}

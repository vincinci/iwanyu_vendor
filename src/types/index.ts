import { Database } from '@/types/database'

export type Vendor = Database['public']['Tables']['vendors']['Row']
export type VendorInsert = Database['public']['Tables']['vendors']['Insert']
export type VendorUpdate = Database['public']['Tables']['vendors']['Update']



export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type Payout = Database['public']['Tables']['payouts']['Row']
export type PayoutInsert = Database['public']['Tables']['payouts']['Insert']
export type PayoutUpdate = Database['public']['Tables']['payouts']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface VendorRegistrationData {
  fullName: string
  shopName: string
  shopAddress: string
  shopLogo?: File | null
  governmentId: File
  bankInfo: {
    accountNumber: string
    bankName: string
    accountHolder: string
  }
  mobileMoneyInfo?: {
    provider: string
    phoneNumber: string
    accountName: string
  }
}



export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface OrderData extends Omit<Order, 'order_items'> {
  order_items: OrderItem[]
}

import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client component Supabase client
export const createClientSupabaseClient = () => createClientComponentClient()

// Server component Supabase client
export const createServerSupabaseClient = () => createServerComponentClient({ cookies })

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          role: 'vendor' | 'admin'
          is_active: boolean
          full_name: string | null
          phone: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          role?: 'vendor' | 'admin'
          is_active?: boolean
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          role?: 'vendor' | 'admin'
          is_active?: boolean
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
        }
      }
      vendors: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          shop_name: string
          shop_address: string
          shop_logo_url: string | null
          government_id_url: string
          bank_info: any
          mobile_money_info: any | null
          status: 'pending' | 'approved' | 'rejected' | 'suspended'
          approved_at: string | null
          approved_by: string | null
          rejection_reason: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name: string
          shop_name: string
          shop_address: string
          shop_logo_url?: string | null
          government_id_url: string
          bank_info: any
          mobile_money_info?: any | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          shop_name?: string
          shop_address?: string
          shop_logo_url?: string | null
          government_id_url?: string
          bank_info?: any
          mobile_money_info?: any | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          user_id?: string
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number
          sale_price: number | null
          cost_price: number | null
          sku: string | null
          barcode: string | null
          category: string | null
          subcategory: string | null
          brand: string | null
          weight: number | null
          dimensions: any | null
          stock_quantity: number
          min_stock_level: number
          max_stock_level: number | null
          is_active: boolean
          is_featured: boolean
          vendor_id: string
          status: 'pending' | 'approved' | 'rejected' | 'suspended'
          approved_at: string | null
          approved_by: string | null
          rejection_reason: string | null
          images: any
          tags: string[] | null
          metadata: any | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price: number
          sale_price?: number | null
          cost_price?: number | null
          sku?: string | null
          barcode?: string | null
          category?: string | null
          subcategory?: string | null
          brand?: string | null
          weight?: number | null
          dimensions?: any | null
          stock_quantity?: number
          min_stock_level?: number
          max_stock_level?: number | null
          is_active?: boolean
          is_featured?: boolean
          vendor_id: string
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          images?: any
          tags?: string[] | null
          metadata?: any | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number
          sale_price?: number | null
          cost_price?: number | null
          sku?: string | null
          barcode?: string | null
          category?: string | null
          subcategory?: string | null
          brand?: string | null
          weight?: number | null
          dimensions?: any | null
          stock_quantity?: number
          min_stock_level?: number
          max_stock_level?: number | null
          is_active?: boolean
          is_featured?: boolean
          vendor_id?: string
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          images?: any
          tags?: string[] | null
          metadata?: any | null
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          order_number: string
          customer_name: string
          customer_email: string
          customer_phone: string
          delivery_address: string
          total_amount: number
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          vendor_id: string
          order_items: any
          notes: string | null
          tracking_number: string | null
          estimated_delivery: string | null
          actual_delivery: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          order_number: string
          customer_name: string
          customer_email: string
          customer_phone: string
          delivery_address: string
          total_amount: number
          subtotal: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          vendor_id: string
          order_items: any
          notes?: string | null
          tracking_number?: string | null
          estimated_delivery?: string | null
          actual_delivery?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          order_number?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          delivery_address?: string
          total_amount?: number
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          vendor_id?: string
          order_items?: any
          notes?: string | null
          tracking_number?: string | null
          estimated_delivery?: string | null
          actual_delivery?: string | null
        }
      }
      payouts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          vendor_id: string
          amount: number
          status: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_method: 'bank' | 'mobile_money'
          payment_details: any
          approved_at: string | null
          approved_by: string | null
          paid_at: string | null
          rejection_reason: string | null
          reference_number: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          vendor_id: string
          amount: number
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_method: 'bank' | 'mobile_money'
          payment_details: any
          approved_at?: string | null
          approved_by?: string | null
          paid_at?: string | null
          rejection_reason?: string | null
          reference_number?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          vendor_id?: string
          amount?: number
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_method?: 'bank' | 'mobile_money'
          payment_details?: any
          approved_at?: string | null
          approved_by?: string | null
          paid_at?: string | null
          rejection_reason?: string | null
          reference_number?: string | null
          notes?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          sender_id: string
          receiver_id: string
          message: string
          is_read: boolean
          sender_type: 'vendor' | 'admin'
          receiver_type: 'vendor' | 'admin'
          vendor_id: string | null
          thread_id: string | null
          is_announcement: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          sender_id: string
          receiver_id: string
          message: string
          is_read?: boolean
          sender_type: 'vendor' | 'admin'
          receiver_type: 'vendor' | 'admin'
          vendor_id?: string | null
          thread_id?: string | null
          is_announcement?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          sender_id?: string
          receiver_id?: string
          message?: string
          is_read?: boolean
          sender_type?: 'vendor' | 'admin'
          receiver_type?: 'vendor' | 'admin'
          vendor_id?: string | null
          thread_id?: string | null
          is_announcement?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          action_url: string | null
          metadata: any | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          action_url?: string | null
          metadata?: any | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          action_url?: string | null
          metadata?: any | null
        }
      }
    }
    Views: {
      vendor_dashboard_stats: {
        Row: {
          vendor_id: string | null
          shop_name: string | null
          total_products: number | null
          approved_products: number | null
          pending_products: number | null
          total_orders: number | null
          total_revenue: number | null
          pending_orders: number | null
          processing_orders: number | null
          shipped_orders: number | null
        }
      }
      admin_dashboard_stats: {
        Row: {
          total_vendors: number | null
          approved_vendors: number | null
          pending_vendors: number | null
          total_products: number | null
          approved_products: number | null
          total_orders: number | null
          total_revenue: number | null
          pending_orders: number | null
        }
      }
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_payout_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      user_role: 'vendor' | 'admin'
      vendor_status: 'pending' | 'approved' | 'rejected' | 'suspended'
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      payout_status: 'pending' | 'approved' | 'rejected' | 'paid'
      payment_method: 'bank' | 'mobile_money'
    }
  }
}

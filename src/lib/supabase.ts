import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'vendor' | 'admin'
          full_name: string
          company_name?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          country?: string
          postal_code?: string
          avatar_url?: string
          is_verified: boolean
          is_suspended: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'vendor' | 'admin'
          full_name: string
          company_name?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          country?: string
          postal_code?: string
          avatar_url?: string
          is_verified?: boolean
          is_suspended?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'vendor' | 'admin'
          full_name?: string
          company_name?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          country?: string
          postal_code?: string
          avatar_url?: string
          is_verified?: boolean
          is_suspended?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          vendor_id: string
          name: string
          description: string
          price: number
          compare_price?: number
          cost: number
          sku: string
          barcode?: string
          weight?: number
          dimensions?: string
          category: string
          tags: string[]
          images: string[]
          is_active: boolean
          is_approved: boolean
          stock_quantity: number
          low_stock_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          name: string
          description: string
          price: number
          compare_price?: number
          cost: number
          sku: string
          barcode?: string
          weight?: number
          dimensions?: string
          category: string
          tags?: string[]
          images?: string[]
          is_active?: boolean
          is_approved?: boolean
          stock_quantity: number
          low_stock_threshold: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          name?: string
          description?: string
          price?: number
          compare_price?: number
          cost?: number
          sku?: string
          barcode?: string
          weight?: number
          dimensions?: string
          category?: string
          tags?: string[]
          images?: string[]
          is_active?: boolean
          is_approved?: boolean
          stock_quantity?: number
          low_stock_threshold?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          vendor_id: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          total_amount: number
          shipping_address: string
          billing_address: string
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          shipping_method: string
          tracking_number?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          vendor_id: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          total_amount: number
          shipping_address: string
          billing_address: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          shipping_method: string
          tracking_number?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          vendor_id?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          total_amount?: number
          shipping_address?: string
          billing_address?: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          shipping_method?: string
          tracking_number?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      payouts: {
        Row: {
          id: string
          vendor_id: string
          amount: number
          status: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_method: string
          account_details: string
          notes?: string
          processed_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          amount: number
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_method: string
          account_details: string
          notes?: string
          processed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          amount?: number
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_method?: string
          account_details?: string
          notes?: string
          processed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          subject: string
          content: string
          is_read: boolean
          is_announcement: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          subject: string
          content: string
          is_read?: boolean
          is_announcement?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          subject?: string
          content?: string
          is_read?: boolean
          is_announcement?: boolean
          created_at?: string
        }
      }
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          bank_info: Json
          mobile_money_info: Json | null
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
          bank_info: Json
          mobile_money_info?: Json | null
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
          bank_info?: Json
          mobile_money_info?: Json | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          user_id?: string
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          customer_name: string
          customer_email: string
          customer_phone: string
          delivery_address: string
          total_amount: number
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          vendor_id: string
          order_items: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_name: string
          customer_email: string
          customer_phone: string
          delivery_address: string
          total_amount: number
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          vendor_id: string
          order_items: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          delivery_address?: string
          total_amount?: number
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          vendor_id?: string
          order_items?: Json
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
          payment_details: Json
          approved_at: string | null
          approved_by: string | null
          paid_at: string | null
          rejection_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          vendor_id: string
          amount: number
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_method: 'bank' | 'mobile_money'
          payment_details: Json
          approved_at?: string | null
          approved_by?: string | null
          paid_at?: string | null
          rejection_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          vendor_id?: string
          amount?: number
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          payment_method?: 'bank' | 'mobile_money'
          payment_details?: Json
          approved_at?: string | null
          approved_by?: string | null
          paid_at?: string | null
          rejection_reason?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          receiver_id: string
          message: string
          is_read: boolean
          sender_type: 'vendor' | 'admin'
          receiver_type: 'vendor' | 'admin'
          vendor_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          sender_id: string
          receiver_id: string
          message: string
          is_read?: boolean
          sender_type: 'vendor' | 'admin'
          receiver_type: 'vendor' | 'admin'
          vendor_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          sender_id?: string
          receiver_id?: string
          message?: string
          is_read?: boolean
          sender_type?: 'vendor' | 'admin'
          receiver_type?: 'vendor' | 'admin'
          vendor_id?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          role: 'vendor' | 'admin'
          is_active: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          role: 'vendor' | 'admin'
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          role?: 'vendor' | 'admin'
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

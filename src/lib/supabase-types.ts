export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string
          user_id: string
          full_name: string
          business_name: string
          business_address: string
          phone_number: string
          social_media_links: Record<string, string>
          identification_document_url: string | null
          status: 'pending' | 'approved' | 'suspended' | 'rejected'
          subscription_plan: 'free' | 'basic' | 'standard' | 'premium'
          subscription_expires_at: string | null
          total_sales: number
          total_orders: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          business_name: string
          business_address: string
          phone_number: string
          social_media_links?: Record<string, string>
          identification_document_url?: string | null
          status?: 'pending' | 'approved' | 'suspended' | 'rejected'
          subscription_plan?: 'free' | 'basic' | 'standard' | 'premium'
          subscription_expires_at?: string | null
          total_sales?: number
          total_orders?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          business_name?: string
          business_address?: string
          phone_number?: string
          social_media_links?: Record<string, string>
          identification_document_url?: string | null
          status?: 'pending' | 'approved' | 'suspended' | 'rejected'
          subscription_plan?: 'free' | 'basic' | 'standard' | 'premium'
          subscription_expires_at?: string | null
          total_sales?: number
          total_orders?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          vendor_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          compare_at_price: number | null
          sku: string | null
          barcode: string | null
          weight: number | null
          requires_shipping: boolean
          is_active: boolean
          is_featured: boolean
          inventory_tracking: boolean
          inventory_quantity: number
          low_stock_threshold: number
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          compare_at_price?: number | null
          sku?: string | null
          barcode?: string | null
          weight?: number | null
          requires_shipping?: boolean
          is_active?: boolean
          is_featured?: boolean
          inventory_tracking?: boolean
          inventory_quantity?: number
          low_stock_threshold?: number
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          compare_at_price?: number | null
          sku?: string | null
          barcode?: string | null
          weight?: number | null
          requires_shipping?: boolean
          is_active?: boolean
          is_featured?: boolean
          inventory_tracking?: boolean
          inventory_quantity?: number
          low_stock_threshold?: number
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
    }
  }
}

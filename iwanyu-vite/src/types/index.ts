export interface User {
  id: string;
  email: string;
  role: 'vendor' | 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'vendor' | 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  profile_id: string;
  business_name: string;
  business_type: string;
  business_registration: string;
  tax_id?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  website?: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  cost_price?: number;
  sku: string;
  category: string;
  subcategory?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level?: number;
  images: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
  featured: boolean;
  tags: string[];
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  shipping_address: Address;
  billing_address?: Address;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_id?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  vendor_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Payout {
  id: string;
  vendor_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  request_date: string;
  processed_date?: string;
  processed_by?: string;
  payment_method: 'bank_transfer' | 'paypal' | 'stripe';
  payment_details: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  subject: string;
  content: string;
  type: 'direct' | 'announcement' | 'system';
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DashboardStats {
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeVendors: number;
  monthlyGrowth: number;
}

export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  payoutBalance: number;
  monthlyRevenue: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: 'vendor' | 'admin';
}

export interface VendorRegistrationForm {
  businessName: string;
  businessType: string;
  businessRegistration: string;
  taxId?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  website?: string;
  description: string;
}

export interface ProductForm {
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  sku: string;
  category: string;
  subcategory?: string;
  brand?: string;
  weight?: number;
  dimensions?: string;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  images: File[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}
-- Iwanyu Multivendor Database Schema
-- This file contains all the database tables and relationships

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums for various status types
CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');
CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'standard', 'premium');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'declined', 'completed');
CREATE TYPE message_status AS ENUM ('unread', 'read', 'replied');

-- Vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_address TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    social_media_links JSONB DEFAULT '{}',
    identification_document_url TEXT,
    status vendor_status DEFAULT 'pending',
    subscription_plan subscription_plan DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans configuration
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name subscription_plan NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    max_products INTEGER,
    max_orders INTEGER,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, price, max_products, max_orders, features) VALUES
('free', 'Free Plan', 0.00, 10, 50, '["Basic support", "Limited analytics"]'),
('basic', 'Basic Plan', 29.99, 100, 500, '["Email support", "Basic analytics", "Product variants"]'),
('standard', 'Standard Plan', 59.99, 500, 2000, '["Priority support", "Advanced analytics", "Bulk operations", "Marketing tools"]'),
('premium', 'Premium Plan', 99.99, NULL, NULL, '["24/7 support", "Full analytics", "Custom branding", "API access", "Priority listing"]');

-- Product categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories'),
('Clothing', 'clothing', 'Fashion and apparel'),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies'),
('Health & Beauty', 'health-beauty', 'Health and beauty products'),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear');

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    weight DECIMAL(8,2),
    requires_shipping BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    inventory_tracking BOOLEAN DEFAULT true,
    inventory_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants (colors, sizes, etc.)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Color", "Size"
    value VARCHAR(100) NOT NULL, -- e.g., "Red", "Large"
    price_adjustment DECIMAL(10,2) DEFAULT 0.00,
    sku_suffix VARCHAR(50),
    inventory_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predefined variant options
CREATE TABLE variant_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- 'color', 'size', 'shoe_size'
    name VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL,
    hex_color VARCHAR(7), -- For colors
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert predefined variant options
INSERT INTO variant_options (type, name, value, hex_color) VALUES
-- Colors
('color', 'Green', 'green', '#22c55e'),
('color', 'Red', 'red', '#ef4444'),
('color', 'Black', 'black', '#000000'),
('color', 'White', 'white', '#ffffff'),
('color', 'Blue', 'blue', '#3b82f6'),
-- Sizes
('size', 'Small', 'S', NULL),
('size', 'Medium', 'M', NULL),
('size', 'Large', 'L', NULL),
('size', 'Extra Large', 'XL', NULL),
('size', 'Double Extra Large', 'XXL', NULL),
-- Shoe sizes (Euro)
('shoe_size', '39', '39', NULL),
('shoe_size', '40', '40', NULL),
('shoe_size', '41', '41', NULL),
('shoe_size', '42', '42', NULL),
('shoe_size', '43', '43', NULL),
('shoe_size', '44', '44', NULL),
('shoe_size', '45', '45', NULL);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) NOT NULL UNIQUE,
    vendor_id UUID REFERENCES vendors(id),
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    shipping_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_id VARCHAR(255),
    tracking_number VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payout requests
CREATE TABLE payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status payout_status DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL, -- 'bank_transfer', 'mobile_money'
    payment_details JSONB NOT NULL,
    admin_notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    payment_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages between vendors and admin
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status message_status DEFAULT 'unread',
    is_from_vendor BOOLEAN DEFAULT true,
    parent_message_id UUID REFERENCES messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor subscriptions history
CREATE TABLE vendor_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_id VARCHAR(255),
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics tracking
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'product_view', 'order_created', 'payout_requested'
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_subscription_plan ON vendors(subscription_plan);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_payout_requests_vendor_id ON payout_requests(vendor_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);
CREATE INDEX idx_messages_vendor_id ON messages(vendor_id);
CREATE INDEX idx_messages_status ON messages(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payout_requests_updated_at BEFORE UPDATE ON payout_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Vendors can only see/edit their own data
CREATE POLICY "Vendors can view own data" ON vendors
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Vendors can update own data" ON vendors
    FOR UPDATE USING (user_id = auth.uid());

-- Products policies
CREATE POLICY "Vendors can manage own products" ON products
    FOR ALL USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Orders policies
CREATE POLICY "Vendors can view own orders" ON orders
    FOR SELECT USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update own orders" ON orders
    FOR UPDATE USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Payout requests policies
CREATE POLICY "Vendors can manage own payouts" ON payout_requests
    FOR ALL USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Messages policies
CREATE POLICY "Vendors can manage own messages" ON messages
    FOR ALL USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Admin access (bypass RLS for admin users)
CREATE POLICY "Admin full access vendors" ON vendors
    FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Admin full access products" ON products
    FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Admin full access orders" ON orders
    FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Admin full access payouts" ON payout_requests
    FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Admin full access messages" ON messages
    FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

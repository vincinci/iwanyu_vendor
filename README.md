# Iwanyu Multivendor Marketplace

A comprehensive multivendor e-commerce platform built with Next.js 15, Supabase, and TypeScript, specifically designed for the Rwandan market with mobile money integration.

## 🚀 Features

### **Vendor Management**
- **Vendor Registration & Verification**: Comprehensive onboarding process with document verification
- **Multi-tier Subscription Plans**: Free, Basic, Standard, and Premium plans with different features
- **Vendor Dashboard**: Complete product management, order tracking, and analytics
- **Commission Management**: Automatic commission calculation and payout tracking

### **Admin Panel**
- **Real-time Dashboard**: Live statistics updated every 30 seconds
- **Vendor Management**: Approve/reject vendors, manage subscriptions
- **Product Oversight**: Monitor all products across vendors
- **Order Management**: Track and manage all marketplace orders
- **Analytics**: Comprehensive platform metrics and reporting

### **Product Management**
- **Multi-category Support**: Electronics, Clothing, Home & Garden, Health & Beauty, Sports & Outdoors
- **Advanced Product Features**: Variants, inventory tracking, SEO optimization
- **Image Management**: Multiple product images with optimization
- **Bulk Operations**: Import/export functionality

### **Payment Integration**
- **Flutterwave Integration**: Secure payment processing
- **Mobile Money Support**: MTN Mobile Money & Airtel Money (Rwanda)
- **Multi-currency Support**: RWF primary, USD supported
- **Commission Tracking**: Automatic vendor commission calculation

### **Real-time Features**
- **Live Dashboard Updates**: Auto-refresh every 30 seconds
- **Real-time Notifications**: Order status, vendor applications
- **Live Statistics**: Vendor counts, product listings, revenue tracking
- **Instant Status Updates**: Order processing, payment confirmations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS 4, Radix UI components
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/iwanyu_vendor.git
   cd iwanyu_vendor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Flutterwave
   NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
   FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
   
   # Email (Optional)
   BREVO_API_KEY=your_brevo_api_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Run the schema in your Supabase SQL editor
   cat supabase/schema.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Access the application at `http://localhost:3000`

## 🏗️ Project Structure

```
iwanyu_vendor/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── vendors/       # Vendor management
│   │   │   ├── products/      # Product oversight
│   │   │   ├── orders/        # Order management
│   │   │   └── analytics/     # Platform analytics
│   │   ├── vendor/            # Vendor dashboard
│   │   │   ├── products/      # Vendor product management
│   │   │   ├── orders/        # Vendor order tracking
│   │   │   └── settings/      # Vendor settings
│   │   └── auth/              # Authentication pages
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── auth/             # Authentication components
│   │   └── layouts/          # Layout components
│   └── lib/                  # Utilities and configurations
│       ├── supabase-client.ts # Supabase client
│       ├── categories.ts      # Product categories
│       └── utils.ts          # Helper functions
├── supabase/
│   └── schema.sql            # Database schema
└── public/                   # Static assets
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full platform access, vendor management, analytics
- **Vendor**: Product management, order tracking, earnings
- **Customer**: Browse products, place orders, track purchases

### Security Features
- Row Level Security (RLS) enabled
- Role-based access control
- Secure API routes
- Session management

## 📊 Database Schema

### Core Tables
- `vendors` - Vendor information and status
- `products` - Product listings and inventory
- `orders` - Order management and tracking
- `categories` - Product categorization
- `subscription_plans` - Vendor subscription tiers
- `admin_users` - Admin access control

## 🎨 Admin Dashboard Features

### Real-time Statistics
- **Vendor Analytics**: Total vendors, new registrations, approval status
- **Product Metrics**: Active products, new listings, category distribution
- **Order Tracking**: Pending orders, completed sales, revenue
- **Message Center**: Vendor communications, support tickets

### Live Updates
- Dashboard refreshes every 30 seconds automatically
- Manual refresh option available
- Real-time status indicators
- Live notification badges

### Management Tools
- **Vendor Approval**: One-click approve/reject
- **Product Moderation**: Review and manage listings
- **Order Processing**: Track and update order status
- **Analytics Export**: Download reports and metrics

## 💳 Payment Integration

### Supported Methods
- **Credit/Debit Cards**: Via Flutterwave
- **MTN Mobile Money**: Rwanda mobile payments
- **Airtel Money**: Rwanda mobile payments
- **Bank Transfers**: Local bank integration

### Commission System
- Automatic commission calculation
- Per-vendor commission rates
- Real-time payout tracking
- Monthly payout reports

## 🔄 Real-time Features Implementation

### Dashboard Updates
```typescript
// Auto-refresh every 30 seconds
useEffect(() => {
  fetchDashboardData()
  
  const interval = setInterval(() => {
    fetchDashboardData()
  }, 30000)
  
  return () => clearInterval(interval)
}, [])
```

### Live Statistics
- Vendor counts and status breakdown
- Product inventory levels
- Order status updates
- Revenue calculations
- Message notifications

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Production Checklist
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Payment gateway credentials set
- [ ] Email service configured
- [ ] Domain configured
- [ ] SSL certificate active

## 🌍 Rwanda-Specific Features

### Local Integration
- **Mobile Money**: MTN and Airtel integration
- **Currency**: Rwandan Franc (RWF) primary
- **Languages**: English interface (Kinyarwanda support ready)
- **Local Categories**: Rwanda-specific product categories

### Compliance
- Local business registration support
- Tax calculation for Rwanda
- Mobile money regulations compliance

## 📈 Analytics & Reporting

### Admin Analytics
- Vendor performance metrics
- Product sales analytics
- Revenue tracking and forecasting
- Geographic sales distribution

### Vendor Dashboard
- Sales performance
- Product analytics
- Customer insights
- Earnings reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@iwanyu.rw
- Documentation: [docs.iwanyu.rw](https://docs.iwanyu.rw)
- Issues: GitHub Issues page

## 🚀 Roadmap

### Phase 1 (Current)
- [x] Basic multivendor platform
- [x] Admin dashboard with real-time updates
- [x] Vendor management system
- [x] Product management
- [x] Order tracking

### Phase 2 (Next)
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] AI-powered product recommendations
- [ ] Inventory management automation
- [ ] Advanced payment options

### Phase 3 (Future)
- [ ] Multi-language support (Kinyarwanda)
- [ ] Advanced marketing tools
- [ ] Vendor training platform
- [ ] API for third-party integrations
- [ ] White-label solutions

---

**Built with ❤️ for Rwanda's growing e-commerce ecosystem**

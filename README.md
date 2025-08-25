# Multi-Vendor Marketplace Platform

A comprehensive Next.js-based multi-vendor marketplace with admin dashboard, vendor management, and Shopify integration.

## Features

### Admin Dashboard
- Complete vendor management system
- Product oversight and approval
- Order processing and tracking
- Analytics and reporting
- Shopify CSV export functionality

### Vendor Portal
- Vendor registration and onboarding
- Product management
- Order fulfillment
- Payout tracking
- Message system

### Technical Features
- Next.js 15 with TypeScript
- Supabase database integration
- Tailwind CSS styling
- Shopify-compatible CSV export
- Responsive design
- Authentication system

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd iwanyu_vendor
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Add your Supabase credentials to .env.local
```

4. Start development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Setup

1. Run the SQL schema in your Supabase project:
```bash
supabase/schema.sql
```

2. Configure row-level security policies as needed

## Routes

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/products` - Product management with export
- `/admin/vendors` - Vendor management
- `/admin/orders` - Order management

### Vendor Routes
- `/vendor` - Vendor dashboard
- `/vendor/products` - Product management
- `/vendor/orders` - Order fulfillment

### Auth Routes
- `/auth/vendor` - Vendor authentication
- `/test-login` - Login testing

## Export Functionality

The platform includes Shopify-compatible CSV export:
1. Navigate to Admin → Products
2. Click "Export to Shopify CSV"
3. Import the generated file into Shopify

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

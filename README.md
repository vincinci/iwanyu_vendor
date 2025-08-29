# Iwanyu - Multi-Vendor Marketplace

## 🌟 Overview

Iwanyu is a comprehensive multi-vendor marketplace platform built with Next.js 15, TypeScript, and Supabase. The platform enables businesses to register as vendors, undergo a thorough 5-step approval process, and start selling their products online.

## 🚀 Features

### ✅ **Core Features Implemented**
- **5-Step Vendor Registration**: Comprehensive onboarding process
- **Admin Approval System**: Complete vendor review and approval workflow
- **Authentication System**: Secure user registration and login with email verification
- **Real-time Messaging**: Vendor-admin communication using Supabase Realtime
- **Vendor Dashboard**: Complete business management portal
- **Role-based Access Control**: Granular permissions for vendors and admins
- **PWA Support**: Mobile-responsive progressive web app capabilities
- **Security**: Row Level Security (RLS) policies and JWT authentication

### 🔧 **Technical Stack**
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Authentication**: Supabase Auth with email verification
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API with Zustand
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom components with Radix UI primitives

## 📁 Project Structure

```
iwanyu_vendor/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── vendor/            # Vendor portal
│   │   └── vendor-register/   # Vendor registration
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── admin/            # Admin-specific components
│   │   └── vendor/           # Vendor-specific components
│   ├── lib/                  # Utility functions and configurations
│   ├── contexts/             # React contexts
│   └── types/                # TypeScript type definitions
├── supabase/                 # Database schema and migrations
└── public/                   # Static assets
```

## 🗄️ Database Schema

### Core Tables
- **profiles**: User account management and roles
- **vendors**: Vendor business information and status
- **messages**: Real-time communication system
- **payouts**: Vendor payment tracking

### Key Relationships
- Users → Profiles (1:1)
- Profiles → Vendors (1:1, for vendor users)
- Profiles → Messages (1:many)

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iwanyu_vendor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the schema file in your Supabase SQL editor:
   ```bash
   # Schema is available in: supabase/schema.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Homepage: http://localhost:3000
   - Vendor Registration: http://localhost:3000/vendor-register
   - Authentication: http://localhost:3000/auth
   - Admin Dashboard: http://localhost:3000/admin

## 🎯 User Workflows

### For Vendors
1. **Register Business**: Complete 5-step registration process
2. **Await Approval**: Admin reviews application
3. **Create Account**: Set up login credentials  
4. **Access Dashboard**: Manage business operations
5. **Start Messaging**: Communicate with admin team

### For Admins
1. **Login**: Access admin panel
2. **Review Applications**: Approve or reject vendor applications
3. **Monitor System**: Track vendor activities
4. **Manage Communication**: Respond to vendor messages

## 🔐 Authentication Flow

The platform uses Supabase Auth with the following flow:
1. User registration with email verification
2. JWT token-based session management
3. Role-based access control (vendor/admin/user)
4. Protected routes with authentication middleware
5. Automatic session refresh and persistence

## 💬 Real-time Features

### Messaging System
- Instant message delivery using Supabase Realtime
- PostgreSQL LISTEN/NOTIFY for real-time updates
- Message persistence and history
- Typing indicators and presence

## 📱 PWA Features

- Offline support
- Mobile-responsive design
- App-like experience on mobile devices
- Push notification support (infrastructure ready)

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
```

## 🧪 Testing

### Current Testing Status
- ✅ Authentication flow tested
- ✅ Vendor registration workflow tested
- ✅ Admin approval system tested
- ✅ Real-time messaging tested
- ✅ Database relationships verified

### Testing Commands
```bash
# Run comprehensive testing
./comprehensive-test.sh

# Check database state
node check-tables.mjs

# Test authentication flow
node test-authentication-flow.mjs
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based sessions
- **Email Verification**: Confirmed user identities
- **Role-based Permissions**: Granular access control
- **CSRF Protection**: Built-in Next.js security
- **Input Validation**: Zod schema validation

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] Email templates configured
- [ ] Domain and SSL configured

### Recommended Platforms
- **Frontend**: Vercel, Netlify
- **Database**: Supabase (already configured)
- **Storage**: Supabase Storage (already configured)

## 📊 Current Status

### ✅ Completed Features
- Multi-step vendor registration
- Admin approval workflow  
- User authentication system
- Real-time messaging platform
- Vendor dashboard portal
- Security & permissions
- Database relationships
- PWA capabilities
- Mobile-responsive design

### 🔄 Next Development Phase
1. **Product Management**: Vendor inventory system
2. **Order Processing**: Complete e-commerce workflow
3. **Payment Integration**: Stripe/PayPal implementation
4. **Email Notifications**: Automated status updates
5. **Mobile App**: React Native companion app

## 📚 Documentation

### Available Documentation Files
- `AUTHENTICATION_UPDATE.md`: Authentication system details
- `START_TESTING_HERE.md`: Testing instructions
- `COMPREHENSIVE_TESTING_PLAN.md`: Full testing strategy
- `DATABASE_FIXES_COMPLETE.md`: Database setup guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📞 Support

For questions or support:
- Check existing documentation files
- Review the testing guides
- Contact the development team

## 📄 License

This project is private and proprietary.

---

**Status**: 🟢 **FULLY OPERATIONAL** - Authentication & Messaging Systems Active!

Last Updated: December 2024

# Database Setup Instructions

## Quick Setup (Recommended)

### Option 1: Using Supabase Dashboard
1. Go to [your Supabase project](https://supabase.com/dashboard/project/nghtzhkfsobkpdsoyovn)
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy the entire content from `supabase/schema.sql`
5. Paste it into the SQL Editor
6. Click **"Run"** to execute

### Option 2: Using CLI
```bash
# Run the setup script
./setup-database.sh
```

## What Gets Created

The schema creates these essential tables:
- **vendors** - Vendor profiles and business info
- **products** - Product catalog with variants
- **orders** - Order management system
- **subscription_plans** - Subscription tiers
- **payout_requests** - Vendor payout system
- **messages** - Vendor-admin communication
- **categories** - Product categories
- **And more...**

## After Setup

Once the schema is deployed:
1. ✅ Vendor onboarding will work
2. ✅ Product management will be enabled
3. ✅ Order processing will function
4. ✅ Admin dashboard will have data

## Storage Buckets (Optional)

For file uploads, create these buckets in Supabase Storage:
- `vendor-documents` - For ID verification
- `product-images` - For product photos

## Environment Variables

Make sure your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL="https://nghtzhkfsobkpdsoyovn.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Troubleshooting

**Error: "Could not find the table 'public.vendors'"**
→ You need to run the schema first (see instructions above)

**Error: "Bucket not found"**
→ Create storage buckets or ignore for now (file upload is optional)

**Error: "relation does not exist"**
→ Double-check that all SQL commands in schema.sql executed successfully

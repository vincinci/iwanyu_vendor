# Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. **Deploy to Vercel**

#### Option A: Deploy via Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `vincinci/iwanyu_vendor`
4. Configure the project settings (see below)
5. Click "Deploy"

### 2. **Environment Variables Setup**

In your Vercel dashboard, add these environment variables:

#### Required Supabase Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Optional Payment Variables:
```
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
```

#### Optional Email Variables:
```
BREVO_API_KEY=your_brevo_api_key
NEXT_PUBLIC_SITE_URL=your_production_domain
```

### 3. **Project Configuration**

#### Build Settings:
- **Framework Preset**: Next.js
- **Node.js Version**: 18.x
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### Environment Variables in Vercel:
1. Go to your project dashboard
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add each variable with appropriate values

### 4. **Database Setup**

Ensure your Supabase database is properly configured:

1. **Run the schema** in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/schema.sql
   ```

2. **Enable Row Level Security (RLS)** on all tables

3. **Configure Authentication** settings in Supabase

### 5. **Domain Configuration (Optional)**

#### Custom Domain:
1. In Vercel dashboard, go to "Settings" > "Domains"
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

## 🔧 Troubleshooting

### Common Issues:

#### Build Failures:
- Check that all environment variables are set
- Ensure Node.js version is 18.x or higher
- Verify package.json dependencies are correct

#### Runtime Errors:
- Check Supabase connection settings
- Verify RLS policies are configured
- Ensure all required environment variables are set

#### Performance Issues:
- Enable Edge Runtime for API routes if needed
- Configure caching headers
- Optimize images and assets

## 📊 Post-Deployment Checklist

### ✅ Verify Functionality:
- [ ] Homepage loads correctly
- [ ] Admin dashboard accessible at `/admin`
- [ ] Vendor registration works
- [ ] Database connections functional
- [ ] Real-time updates working (30-second refresh)
- [ ] Payment integration functional (if configured)

### ✅ Performance:
- [ ] Page load times under 3 seconds
- [ ] Mobile responsiveness working
- [ ] SEO meta tags loading correctly

### ✅ Security:
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] RLS policies active
- [ ] Admin routes protected

## 🌟 Production URLs

Once deployed, your application will be available at:
- **Main Site**: `https://your-project.vercel.app`
- **Admin Dashboard**: `https://your-project.vercel.app/admin`
- **API Endpoints**: `https://your-project.vercel.app/api/*`

## 📈 Monitoring & Analytics

### Recommended Setup:
1. **Vercel Analytics**: Enable in project settings
2. **Supabase Metrics**: Monitor database performance
3. **Error Tracking**: Consider Sentry integration
4. **Uptime Monitoring**: Set up status checks

## 🔄 Continuous Deployment

Your project is now configured for automatic deployment:
- **Automatic**: Pushes to `main` branch trigger production deployment
- **Preview**: Pull requests create preview deployments
- **Rollback**: Easy rollback to previous versions in Vercel dashboard

---

**🎉 Your Iwanyu Multivendor platform is now ready for production!**

For support, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Production Guide](https://supabase.com/docs/guides/platform/going-into-prod)

# Vercel Deployment Guide

## Prerequisites

1. **Supabase Account & Project**: Set up your Supabase project with the database schema
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket

## Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready

### 2. Run Database Migrations
Execute these SQL files in your Supabase SQL Editor (in order):

1. `database/migrations/complete-schema-migration.sql`
2. `database/migrations/rls-policies-migration.sql`
3. `database/migrations/helper-functions-triggers.sql`
4. `database/migrations/seed-data.sql`

### 3. Set Up Storage Buckets
Create these private storage buckets in Supabase:
- `trial-documents`
- `training-materials`
- `study-protocols`
- `news-assets`
- `enrollment-docs`

## Vercel Deployment

### Method 1: Deploy from Git (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Set the root directory to: `Client-Backend-and-Mobile-App-master/admin-dashboard`

2. **Configure Environment Variables**:
   In Vercel dashboard → Project Settings → Environment Variables, add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   DEFAULT_ORGANIZATION_ID=your-org-id
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

3. **Deploy**: Vercel will automatically build and deploy

### Method 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd Client-Backend-and-Mobile-App-master/admin-dashboard
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add DEFAULT_ORGANIZATION_ID
vercel env add ALLOWED_ORIGINS
```

## Post-Deployment Configuration

### 1. Update ALLOWED_ORIGINS
After deployment, update the `ALLOWED_ORIGINS` environment variable with your Vercel domain:
```
ALLOWED_ORIGINS=https://your-app-name.vercel.app
```

### 2. Set Up Custom Domain (Optional)
- Go to Vercel project settings
- Add your custom domain
- Update DNS records as instructed
- Update `ALLOWED_ORIGINS` with your custom domain

### 3. Test the Application

Visit your deployed URL and test:
- ✅ Login page loads
- ✅ API health check: `https://your-app.vercel.app/api/health`
- ✅ Test endpoint: `https://your-app.vercel.app/api/test`

## Troubleshooting

### Common Issues

1. **API Routes Not Working**:
   - Check environment variables are set correctly
   - Verify Supabase credentials

2. **Database Connection Issues**:
   - Ensure RLS policies are applied
   - Check organization/user permissions

3. **CORS Errors**:
   - Verify `ALLOWED_ORIGINS` includes your domain
   - Check browser console for specific errors

4. **Build Failures**:
   - Ensure all dependencies are in `package.json`
   - Check for TypeScript errors

### Logs & Debugging

- **Vercel Logs**: Go to Vercel dashboard → Functions tab
- **Browser Console**: Check for network errors
- **Supabase Logs**: Check database query logs

## Security Considerations

1. **Environment Variables**: Never commit secrets to code
2. **RLS Policies**: Ensure Row Level Security is properly configured
3. **API Authentication**: All sensitive routes require authentication
4. **HTTPS**: Vercel automatically provides SSL certificates

## Performance Optimization

1. **API Route Optimization**: Vercel automatically optimizes API routes
2. **Image Optimization**: Next.js automatically optimizes images
3. **Caching**: Configure appropriate cache headers for static assets

## Next Steps

1. Test all functionality with real data
2. Set up monitoring and error tracking
3. Configure backup strategies for your database
4. Plan for scaling as your user base grows

---

🎉 **Congratulations!** Your client portal is now deployed on Vercel with a serverless backend.

# Deployment Guide - Workout Buddy

This guide will help you deploy the Workout Buddy app to production using Supabase and Vercel.

## Prerequisites

- GitHub account
- Supabase account (https://supabase.com)
- Vercel account (https://vercel.com)

## Part 1: Set Up Supabase Backend

### Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the details:
   - **Name**: `workout-buddy` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for MVP
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be provisioned

### Step 2: Run the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from this repository
4. Paste it into the SQL editor
5. Click "Run" to execute the schema
6. Verify that all tables were created successfully:
   - Go to **Table Editor** (left sidebar)
   - You should see: `users`, `partnerships`, `workout_requests`, `stone_progress`

### Step 3: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Project Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. Copy these two values (you'll need them for Vercel):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 4: Configure Authentication (Optional but Recommended)

1. Go to **Authentication** > **Providers** in Supabase dashboard
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize the "Confirm signup" and "Magic Link" templates

### Step 5: Test Your Supabase Setup

1. Go to **Table Editor** > `users`
2. Try inserting a test row manually
3. If successful, your database is ready!

## Part 2: Deploy to Vercel

### Step 1: Push Code to GitHub

1. Create a new repository on GitHub (e.g., `workout-buddy`)
2. In your local terminal, run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/workout-buddy.git
   git branch -M main
   git add .
   git commit -m "Initial commit - Workout Buddy MVP"
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New..." > "Project"
3. Import your GitHub repository (`workout-buddy`)
4. Configure the project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (leave as default)
   - **Output Directory**: `.next` (leave as default)

### Step 3: Add Environment Variables

1. Before clicking "Deploy", expand the **Environment Variables** section
2. Add the following variables:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: Your Supabase Project URL (from Step 3 above)
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value**: Your Supabase anon public key (from Step 3 above)
3. Click "Deploy"

### Step 4: Wait for Deployment

1. Vercel will build and deploy your app (takes 2-3 minutes)
2. Once complete, you'll get a deployment URL (e.g., `https://workout-buddy-xxxxx.vercel.app`)
3. Click "Visit" to see your live app!

## Part 3: Test Your Production App

### Test Authentication

1. Go to your Vercel deployment URL
2. Click "Get Started"
3. Sign up with a test email (use a real email to receive verification)
4. Check your email for the confirmation link
5. Click the link to verify your account
6. Try logging in

### Test Demo Mode

1. Click "🎮 Demo Mode" on the landing page
2. Verify that you can:
   - See the dashboard
   - View the calendar
   - See dual progress bars
   - Submit a workout request (demo data)
   - Switch calendar views (Week/Month/Quarter/Year)

### Test Real Features (after authentication)

1. Create a partnership with another test user
2. Submit a real workout request
3. Log in as the partner and approve the request
4. Verify that stone progress updates
5. Check that the calendar shows workout history

## Part 4: Post-Deployment Configuration

### Set Up Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Add your custom domain (e.g., `workoutbuddy.com`)
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

### Configure Supabase for Production

1. Go to Supabase **Authentication** > **URL Configuration**
2. Add your Vercel domain to **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (for local development)

### Enable Row Level Security Policies

The schema already includes RLS policies, but verify they're working:

1. Go to Supabase **Authentication** > **Policies**
2. Check that all tables have policies enabled
3. Test with a real user to ensure they can only access their own data

## Part 5: Monitoring and Maintenance

### Monitor Supabase Usage

1. Go to Supabase **Reports**
2. Check:
   - Database size
   - API requests
   - Active users
   - Storage usage

### Monitor Vercel Deployment

1. Go to Vercel project **Analytics**
2. Monitor:
   - Page views
   - Response times
   - Error rates
   - Deployment status

### Set Up Alerts (Optional)

1. In Vercel, go to **Settings** > **Notifications**
2. Enable:
   - Deployment succeeded/failed
   - Domain errors
   - Build errors

## Troubleshooting

### Issue: "supabaseUrl is required" Error

**Solution**: Make sure environment variables are set in Vercel:
1. Go to Vercel project **Settings** > **Environment Variables**
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Redeploy the app

### Issue: Authentication Not Working

**Solution**: Check Supabase URL configuration:
1. Verify **Site URL** in Supabase matches your Vercel domain
2. Add your domain to **Redirect URLs**
3. Check that email provider is enabled

### Issue: Database Queries Failing

**Solution**: Verify RLS policies:
1. Check that tables have RLS enabled
2. Verify policies allow the intended operations
3. Test with SQL Editor using the authenticated user's context

### Issue: Deployment Failed

**Solution**: Check build logs:
1. In Vercel, go to **Deployments**
2. Click on the failed deployment
3. Review the build logs
4. Common issues:
   - Missing dependencies (run `npm install` locally)
   - TypeScript errors (run `npm run lint` locally)
   - Environment variables not set

## Next Steps

### Recommended Enhancements

1. **Email Notifications**:
   - Set up Supabase Email templates
   - Add email notifications for workout approvals
   - Send reminders for missed workouts

2. **Analytics**:
   - Integrate Vercel Analytics
   - Add custom event tracking
   - Monitor user engagement

3. **Performance**:
   - Enable Vercel Edge Functions for faster API responses
   - Implement caching strategies
   - Optimize images with Next.js Image component

4. **Security**:
   - Implement rate limiting
   - Add CAPTCHA to signup
   - Enable Supabase Vault for sensitive data

5. **Features**:
   - Add profile pictures
   - Implement workout categories
   - Create leaderboards
   - Add social sharing

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## Cost Estimates

### Free Tier (Sufficient for MVP)

- **Supabase**: 
  - 500 MB database
  - 2 GB bandwidth
  - 50,000 monthly active users
  - Unlimited API requests

- **Vercel**:
  - 100 GB bandwidth
  - 100 deployments per day
  - Unlimited websites

### Paid Tiers (When Scaling)

- **Supabase Pro** ($25/month):
  - 8 GB database
  - 100 GB bandwidth
  - 100,000 monthly active users

- **Vercel Pro** ($20/month):
  - 1 TB bandwidth
  - Unlimited deployments
  - Team collaboration features

---

**Congratulations!** 🎉 Your Workout Buddy app is now live in production!


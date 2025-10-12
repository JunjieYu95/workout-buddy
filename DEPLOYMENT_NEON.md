# Deployment Guide - Workout Buddy with Neon Database

This guide will help you deploy the Workout Buddy app to production using Neon PostgreSQL database and Vercel.

## Prerequisites

- GitHub account
- Neon account (https://neon.tech)
- Vercel account (https://vercel.com)

## Part 1: Set Up Neon Database

### Step 1: Create a Neon Project

1. Go to https://neon.tech and sign up/login
2. Click "Create Project"
3. Fill in the details:
   - **Project Name**: `workout-buddy` (or your preferred name)
   - **Database Name**: `neondb` (default)
   - **Region**: Choose the closest region to your users
   - **Branch**: `main` (default)
4. Click "Create Project"
5. Wait for the project to be provisioned (usually takes 1-2 minutes)

### Step 2: Get Your Database Connection String

1. In your Neon project dashboard, go to the **Dashboard** tab
2. Look for the **Connection Details** section
3. Copy the **Connection String** (looks like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)
4. **Important**: Save this connection string securely - you'll need it for Vercel

### Step 3: Initialize Database Tables

Once your app is deployed, you'll need to initialize the database tables:

1. Visit your deployed app URL
2. Go to `/api/init-db` (e.g., `https://your-app.vercel.app/api/init-db`)
3. Send a POST request to initialize the tables
4. You can use curl or a tool like Postman:
   ```bash
   curl -X POST https://your-app.vercel.app/api/init-db
   ```

Alternatively, you can run the initialization from the Neon SQL Editor:
1. Go to your Neon project dashboard
2. Click on **SQL Editor**
3. Copy and paste the table creation SQL from `src/lib/db.ts` (the `createTables` query)

## Part 2: Deploy to Vercel

### Step 1: Push Code to GitHub

1. Create a new repository on GitHub (e.g., `workout-buddy`)
2. In your local terminal, run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/workout-buddy.git
   git branch -M main
   git add .
   git commit -m "Initial commit - Workout Buddy with Neon database"
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
   - **Name**: `DATABASE_URL`
     - **Value**: Your Neon connection string from Step 2
   - **Name**: `NEXTAUTH_URL`
     - **Value**: Your Vercel deployment URL (e.g., `https://workout-buddy-xxxxx.vercel.app`)
   - **Name**: `NEXTAUTH_SECRET`
     - **Value**: Generate a random secret (run `openssl rand -base64 32` in terminal)
3. Click "Deploy"

### Step 4: Wait for Deployment

1. Vercel will build and deploy your app (takes 2-3 minutes)
2. Once complete, you'll get a deployment URL
3. Click "Visit" to see your live app!

## Part 3: Initialize Database

### Method 1: API Endpoint (Recommended)

1. Visit your deployed app
2. Go to: `https://your-app.vercel.app/api/init-db`
3. Send a POST request (you can use the browser developer tools or curl)
4. You should see: `{"message":"Database initialized successfully"}`

### Method 2: Neon SQL Editor

1. Go to your Neon project dashboard
2. Click **SQL Editor**
3. Create a new query
4. Copy the table creation SQL from the `initializeDatabase` function in `src/lib/db.ts`
5. Run the query

## Part 4: Test Your Production App

### Test Authentication

1. Go to your Vercel deployment URL
2. Click "Get Started"
3. Sign up with a test email
4. Try logging in

### Test Demo Mode

1. Click "🎮 Demo Mode" on the landing page
2. Verify that you can:
   - See the dashboard
   - View the calendar
   - See dual progress bars
   - Submit a workout request (demo data)
   - Switch calendar views

### Test Real Features (after authentication)

1. Create a partnership with another test user
2. Submit a real workout request
3. Log in as the partner and approve the request
4. Verify that stone progress updates
5. Check that the calendar shows workout history

## Part 5: Post-Deployment Configuration

### Set Up Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable

### Configure Neon for Production

1. Go to your Neon project dashboard
2. Check **Settings** > **General** for any additional configuration
3. Monitor **Usage** to ensure you're within free tier limits

## Part 6: Monitoring and Maintenance

### Monitor Neon Usage

1. Go to Neon **Dashboard**
2. Check:
   - Database size
   - Connection count
   - Query performance
   - Storage usage

### Monitor Vercel Deployment

1. Go to Vercel project **Analytics**
2. Monitor:
   - Page views
   - Response times
   - Error rates
   - Deployment status

## Troubleshooting

### Issue: "Database connection failed"

**Solution**: Check your `DATABASE_URL` environment variable:
1. Verify the connection string is correct
2. Ensure the database is active (not paused)
3. Check that SSL mode is set to `require`

### Issue: "Tables don't exist"

**Solution**: Initialize the database:
1. Visit `/api/init-db` and send a POST request
2. Or manually run the SQL in Neon SQL Editor

### Issue: Authentication not working

**Solution**: Check NextAuth configuration:
1. Verify `NEXTAUTH_URL` matches your domain
2. Ensure `NEXTAUTH_SECRET` is set
3. Check that the database tables exist

### Issue: Deployment failed

**Solution**: Check build logs:
1. In Vercel, go to **Deployments**
2. Click on the failed deployment
3. Review the build logs
4. Common issues:
   - Missing environment variables
   - Database connection issues
   - TypeScript errors

## Environment Variables Summary

```bash
# Required for production
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-random-secret-key

# For local development
NEXTAUTH_URL=http://localhost:3000
```

## Cost Estimates

### Free Tier (Sufficient for MVP)

- **Neon**: 
  - 0.5 GB storage
  - 10 GB bandwidth
  - 1,000 hours compute time per month
  - Unlimited projects

- **Vercel**:
  - 100 GB bandwidth
  - 100 deployments per day
  - Unlimited websites

### Paid Tiers (When Scaling)

- **Neon Pro** ($19/month):
  - 10 GB storage
  - 100 GB bandwidth
  - 3,000 hours compute time per month

- **Vercel Pro** ($20/month):
  - 1 TB bandwidth
  - Unlimited deployments
  - Team collaboration features

## Next Steps

### Recommended Enhancements

1. **Database Optimization**:
   - Add more indexes for better performance
   - Implement connection pooling
   - Set up database backups

2. **Authentication Enhancements**:
   - Add email verification
   - Implement password reset
   - Add social login options

3. **Performance**:
   - Enable Vercel Edge Functions
   - Implement caching strategies
   - Optimize database queries

4. **Features**:
   - Add email notifications
   - Implement workout categories
   - Create leaderboards
   - Add social sharing

## Support Resources

- **Neon Docs**: https://neon.tech/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth.js Docs**: https://next-auth.js.org

---

**Congratulations!** 🎉 Your Workout Buddy app is now live with a robust PostgreSQL database!

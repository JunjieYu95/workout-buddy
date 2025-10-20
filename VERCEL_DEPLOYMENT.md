# Vercel Deployment Guide - Workout Buddy v1.0

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A PostgreSQL database (recommended: Neon, Supabase, or Railway)
3. Your GitHub repository connected to Vercel

## Step 1: Set Up PostgreSQL Database

### Option A: Neon (Recommended - Free tier available)

1. Go to https://neon.tech
2. Sign up and create a new project
3. Create a database named `workout_buddy_prod`
4. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/workout_buddy_prod?sslmode=require
   ```

### Option B: Supabase

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)

### Option C: Railway

1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string from the database settings

## Step 2: Deploy to Vercel

### Connect Repository

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository `JunjieYu95/workout-buddy`
4. Click "Import"

### Configure Environment Variables

In the Vercel project settings, add the following environment variables:

#### Required Variables:

1. **DATABASE_URL**
   - **Value**: Your PostgreSQL connection string from Step 1
   - **Example**: `postgresql://user:pass@host.region.provider.com:5432/workout_buddy_prod?sslmode=require`
   - **Important**: Make sure it includes `?sslmode=require` for secure connections

2. **NEXTAUTH_URL**
   - **Value**: Your Vercel deployment URL
   - **Example**: `https://workout-buddy.vercel.app`
   - **Note**: Leave this blank initially, Vercel will auto-assign a URL. Update after first deployment.

3. **NEXTAUTH_SECRET**
   - **Value**: A random 32+ character secret key
   - **Generate with**: `openssl rand -base64 32`
   - **Example**: `your-super-secret-key-here-make-it-long-and-random`

#### How to Add Variables in Vercel:

1. In your Vercel project dashboard
2. Go to "Settings" → "Environment Variables"
3. Add each variable:
   - Name: `DATABASE_URL`
   - Value: Your database connection string
   - Environment: Select "Production", "Preview", and "Development"
   - Click "Save"
4. Repeat for `NEXTAUTH_URL` and `NEXTAUTH_SECRET`

## Step 3: Configure Build Settings

Vercel should auto-detect Next.js settings, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Step 4: Deploy

1. Click "Deploy" button
2. Wait for build to complete (~2-3 minutes)
3. Once deployed, copy your production URL (e.g., `https://workout-buddy.vercel.app`)

## Step 5: Update NEXTAUTH_URL

1. Go back to Settings → Environment Variables
2. Update `NEXTAUTH_URL` with your actual Vercel URL
3. Redeploy:
   - Go to "Deployments" tab
   - Click "..." on the latest deployment
   - Click "Redeploy"

## Step 6: Initialize Database

After successful deployment, initialize your database:

1. Open your browser and navigate to:
   ```
   https://your-app.vercel.app/api/init-db
   ```
2. You should see: `{"message":"Database initialized successfully"}`

This creates all necessary tables:
- `users`
- `rooms`
- `room_members`
- `user_progress`
- `stone_progress`
- `workout_requests`
- `partnerships` (legacy, for compatibility)

## Step 7: Test Your Deployment

1. Go to your Vercel URL
2. Sign up with a new account (username + password)
3. Create a room
4. Open another browser/incognito window
5. Sign up with another account
6. Join the room
7. Test the push/pull functionality!

## Environment Variables Summary

Here's a quick reference of all required environment variables:

```bash
# Required for all environments
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-32-char-secret-key-here

# Optional (for development only)
NODE_ENV=production
```

## Troubleshooting

### Database Connection Issues

If you see database errors:

1. **Check SSL Mode**: Ensure `?sslmode=require` is in your connection string
2. **Verify Credentials**: Test connection string locally first
3. **Check Firewall**: Some providers require allowlist IPs (Vercel uses dynamic IPs, so enable "Allow all" if available)

### Authentication Not Working

1. **Verify NEXTAUTH_SECRET**: Must be set and at least 32 characters
2. **Check NEXTAUTH_URL**: Must match your actual domain exactly (no trailing slash)
3. **Redeploy**: After changing env vars, always redeploy

### Database Not Initializing

1. Visit `/api/init-db` endpoint directly in browser
2. Check Vercel logs: Deployments → Select deployment → Runtime Logs
3. Verify DATABASE_URL is correctly set

### Build Failures

1. Check Vercel build logs for specific errors
2. Ensure all dependencies are in `package.json`
3. Try building locally: `npm run build`

## Database Backups

**Important**: Set up regular backups!

- **Neon**: Automatic backups included
- **Supabase**: Automatic daily backups
- **Railway**: Enable backups in dashboard

## Monitoring

Monitor your deployment:

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Check Runtime Logs regularly
3. **Database Monitoring**: Use your provider's dashboard

## Scaling Considerations

For production with many users:

1. **Database**: Upgrade to paid tier for better performance
2. **Connection Pooling**: Consider PgBouncer or connection pooling
3. **Caching**: Add Redis for session management
4. **CDN**: Vercel handles this automatically

## Security Checklist

- ✅ NEXTAUTH_SECRET is strong and random
- ✅ DATABASE_URL uses SSL (sslmode=require)
- ✅ Environment variables are not exposed in code
- ✅ Database has regular backups enabled
- ✅ Password hashing is enabled (bcryptjs)

## Support

If you encounter issues:

1. Check Vercel Runtime Logs
2. Check database provider logs
3. Review this guide's troubleshooting section
4. Verify all environment variables are correct

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Enable analytics
5. ✅ Share with friends and start competing!

---

## Quick Deploy Checklist

- [ ] PostgreSQL database created
- [ ] Database connection string obtained
- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] DATABASE_URL configured
- [ ] NEXTAUTH_SECRET generated and set
- [ ] NEXTAUTH_URL set (after first deploy)
- [ ] First deployment successful
- [ ] /api/init-db called to create tables
- [ ] Test signup/login working
- [ ] Test room creation/joining
- [ ] Test push/pull functionality
- [ ] Backups enabled

**Congratulations! Your Workout Buddy app is now live! 🎉**


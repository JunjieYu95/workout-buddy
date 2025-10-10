# CLI Commands Reference - Workout Buddy

This document provides all the CLI commands you'll need to set up and deploy Workout Buddy.

## Prerequisites

Make sure you have these tools installed:

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Install Vercel CLI
npm install -g vercel

# Install Git (usually pre-installed)
# macOS: xcode-select --install
```

## Quick Setup (Automated)

Run the automated setup script:

```bash
./setup-production.sh
```

This script will guide you through the entire process automatically.

## Manual Setup (Step by Step)

### 1. Supabase Setup

```bash
# Login to Supabase
supabase login

# Create a new project (follow prompts)
supabase projects create

# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link

# Deploy the database schema
supabase db push

# Check status
supabase status
```

### 2. Git and GitHub Setup

```bash
# Initialize git (if not already done)
git init

# Add remote repository (replace with your GitHub repo)
git remote add origin https://github.com/YOUR_USERNAME/workout-buddy.git

# Add and commit all files
git add .
git commit -m "Initial commit - Workout Buddy MVP"

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Vercel Deployment

```bash
# Login to Vercel
vercel login

# Deploy to Vercel (follow prompts)
vercel --prod

# Add environment variables (you'll need to do this in Vercel dashboard)
# Then redeploy:
vercel --prod
```

## Environment Variables

You'll need these environment variables in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Useful Commands

### Supabase Commands

```bash
# Check project status
supabase status

# View database schema
supabase db diff

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts

# Reset local database
supabase db reset

# Start local development
supabase start

# Stop local development
supabase stop
```

### Vercel Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel remove

# Check project status
vercel status
```

### Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Create and switch to new branch
git checkout -b feature-branch

# Merge branch
git merge feature-branch

# Push specific branch
git push origin feature-branch
```

## Troubleshooting

### Supabase Issues

```bash
# Re-authenticate
supabase logout
supabase login

# Re-link project
supabase unlink
supabase link

# Check logs
supabase logs
```

### Vercel Issues

```bash
# Re-authenticate
vercel logout
vercel login

# Check build logs
vercel logs [deployment-url]

# Redeploy
vercel --prod --force
```

### Git Issues

```bash
# Reset to last commit
git reset --hard HEAD

# Force push (use with caution)
git push --force-with-lease origin main

# Remove large files from history
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch large-file' --prune-empty --tag-name-filter cat -- --all
```

## Development Workflow

### Local Development

```bash
# Start Next.js dev server
npm run dev

# Start Supabase locally (optional)
supabase start

# Run with both (in separate terminals)
npm run dev &
supabase start
```

### Making Changes

```bash
# Make your changes
# Then commit and push:
git add .
git commit -m "Description of changes"
git push origin main

# Deploy to Vercel
vercel --prod
```

### Database Changes

```bash
# Make changes to schema.sql
# Then push to Supabase:
supabase db push

# Generate new types
supabase gen types typescript --local > types/supabase.ts
```

## Monitoring

### Check App Status

```bash
# Vercel status
vercel status

# Supabase status
supabase status

# Git status
git status
```

### View Logs

```bash
# Vercel logs
vercel logs

# Supabase logs
supabase logs

# Local development logs
npm run dev
```

## Backup and Recovery

### Backup Database

```bash
# Export database schema
supabase db dump --schema-only > backup-schema.sql

# Export data
supabase db dump --data-only > backup-data.sql
```

### Restore Database

```bash
# Restore schema
supabase db reset

# Import data (if needed)
# Use Supabase dashboard SQL editor
```

## Security

### Environment Variables

```bash
# Never commit .env files
echo ".env*" >> .gitignore

# Use Vercel dashboard for production secrets
# Use .env.local for local development
```

### Database Security

```bash
# Check RLS policies
supabase db diff

# Validate policies in Supabase dashboard
# Go to Authentication > Policies
```

## Performance

### Optimization Commands

```bash
# Build optimization
npm run build
npm run start

# Check bundle size
npm run build -- --analyze

# Check dependencies
npm audit
npm audit fix
```

## Support

### Getting Help

```bash
# Supabase help
supabase --help
supabase projects --help

# Vercel help
vercel --help

# Git help
git --help
```

### Useful Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Git Documentation](https://git-scm.com/doc)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Pro Tip**: Use the automated script `./setup-production.sh` for the easiest setup experience!

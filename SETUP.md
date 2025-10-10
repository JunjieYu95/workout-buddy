# 🚀 Setup Guide for Workout Buddy

Follow these steps to get your Workout Buddy app running locally.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is fine)
- Git (optional)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

Expected output: All packages installed successfully.

### 2. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - **Name**: workout-buddy (or any name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait 2-3 minutes for setup to complete

### 3. Run Database Schema

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open `supabase/schema.sql` in your code editor
4. **Copy ALL the contents**
5. **Paste** into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
7. You should see: **"Success. No rows returned"**

### 4. Get Your API Credentials

1. In Supabase, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"**
3. You'll see two important values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (long string)

### 5. Configure Environment Variables

```bash
# Copy the example file
cp env.example .env.local

# Open .env.local in your editor
```

Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_long_anon_key_here
```

**Important**: Don't use quotes around the values!

### 6. Start the Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.5.4 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in 2.1s
```

### 7. Test Your Setup

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **"Get Started"**
3. Create an account with your email
4. Check your email inbox for verification link
5. Click the verification link
6. You should be redirected to the dashboard!

## 🎉 You're Ready!

Now you can:
1. **Connect with a partner** (they need to sign up too)
2. **Submit workout requests**
3. **Approve partner's workouts**
4. **Watch the Stone Game progress!**

---

## Troubleshooting

### "Invalid API key"
- Check that you copied the **anon/public** key, not the service_role key
- Make sure there are no spaces or quotes in `.env.local`
- Restart the dev server after changing `.env.local`

### "Relation does not exist"
- The SQL schema wasn't run properly
- Go back to Step 3 and make sure ALL the SQL was copied
- Check the SQL Editor for any error messages

### "Email not verified"
- Check your spam folder
- Wait a few minutes (emails can be delayed)
- Try resending from the Supabase Auth dashboard

### "Partner not found"
- Make sure your partner has signed up first
- Use the exact email they signed up with
- Email is case-sensitive!

### Server won't start
```bash
# Kill any hanging processes
killall node npm

# Clear cache and restart
rm -rf .next node_modules/.cache
npm run dev
```

---

## 📞 Need Help?

If you're still stuck:
1. Check the main [README.md](README.md) for more info
2. Review the [Supabase Docs](https://supabase.com/docs)
3. Make sure your Node.js version is 18 or higher: `node --version`

---

**Next Steps**: Check out [README.md](README.md) for feature documentation and usage guide!

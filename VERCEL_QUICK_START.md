# Vercel Deployment Quick Start

## 🚀 3-Step Deployment

### 1️⃣ Set Up Database (5 minutes)

**Recommended: Neon.tech (Free)**

```bash
# Go to https://neon.tech
# Create project → Create database
# Copy connection string
```

Your connection string looks like:
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/workout_buddy_prod?sslmode=require
```

### 2️⃣ Configure Vercel (2 minutes)

**Environment Variables to Add:**

| Variable | Value | How to Get |
|----------|-------|------------|
| `DATABASE_URL` | Your PostgreSQL connection string | From Neon dashboard |
| `NEXTAUTH_SECRET` | Random 32+ char string | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel URL | e.g., `https://workout-buddy.vercel.app` |

**Where to Add:**
- Vercel Dashboard → Your Project → Settings → Environment Variables

### 3️⃣ Deploy & Initialize (3 minutes)

1. **Deploy**: Click "Deploy" in Vercel
2. **Update NEXTAUTH_URL**: After first deploy, update with actual URL
3. **Initialize DB**: Visit `https://your-app.vercel.app/api/init-db`
4. **Test**: Sign up and create a room!

---

## 🔑 Generate NEXTAUTH_SECRET

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Online:**
https://generate-secret.vercel.app/32

---

## ✅ Verification Checklist

After deployment, test:

- [ ] Homepage loads
- [ ] Sign up works
- [ ] Login works
- [ ] Create room works
- [ ] Join room works (with 2nd account)
- [ ] Submit workout request
- [ ] Approve workout
- [ ] Push button works
- [ ] Pull button works
- [ ] Scores show decimals

---

## 🐛 Common Issues & Fixes

### "Database connection failed"
→ Check DATABASE_URL has `?sslmode=require` at the end

### "Invalid credentials"
→ Verify DATABASE_URL is copied correctly from Neon

### "Unauthorized" errors
→ Check NEXTAUTH_SECRET is set (at least 32 characters)

### "Redirect error"
→ Update NEXTAUTH_URL to match your actual Vercel domain

---

## 📞 Need Help?

1. Check detailed guide: `VERCEL_DEPLOYMENT.md`
2. View Vercel logs: Dashboard → Deployments → Runtime Logs
3. Check database logs in Neon dashboard

---

**That's it! Your app should be live in ~10 minutes! 🎉**


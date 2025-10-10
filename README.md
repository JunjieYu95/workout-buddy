# 🏋️‍♂️ Workout Buddy

A partner accountability app for fitness consistency. Gamify your fitness journey through mutual verification and visual progress tracking!

## 🌟 Features

- **👥 Partner Accountability**: Connect with a workout buddy who verifies your workouts
- **✅ Request-Approval System**: No self-reporting - partners must approve each workout
- **🪨 Stone Game**: Gamified progress with stochastic rewards and escalating penalties
- **📅 Calendar View**: Visual tracking of daily progress with intensity levels (coming soon)
- **🔥 Streak Tracking**: Build consecutive days and earn bonus rewards

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy your credentials
3. Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy the contents of supabase/schema.sql
# Paste and run it in your Supabase SQL Editor
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp env.example .env.local

# Edit .env.local and add your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 📖 How to Use

### Step 1: Sign Up
- Create an account with your email and password
- Verify your email (check spam folder)

### Step 2: Connect with Partner
- Go to Dashboard
- Enter your partner's email address
- They must also sign up first

### Step 3: Log Workouts
- Click "Request Workout Approval"
- Set intensity (1-5)
- Add optional notes
- Send request to partner

### Step 4: Approve Partner's Workouts
- Click "Approvals" in the header
- Review your partner's workout requests
- Approve or reject each request
- Watch the Stone Game progress!

## 🎮 Stone Game Mechanics

### Rewards
- **Base Reward**: 5-15 units (random)
- **Consistency Bonus**: +1 per consecutive day (max +10)
- **Momentum Multiplier**: Increases with progress (1.0x - 2.0x)

### Penalties
- **1 missed day**: -10 units
- **2 missed days**: -25 units  
- **3 missed days**: -50 units
- **4+ missed days**: -100 units

## 🗂️ Project Structure

```
push-stone/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page with auth
│   │   ├── dashboard/         # Main dashboard
│   │   └── approvals/         # Partner approval page
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   └── lib/
│       ├── supabase.ts        # Supabase client & types
│       └── stone-game.ts      # Game logic
├── supabase/
│   └── schema.sql             # Database schema
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel (recommended)

## 📝 Database Schema

### Tables
- `users` - User profiles
- `partnerships` - Partner connections
- `workout_requests` - Workout submission requests
- `stone_progress` - Game progress tracking

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Partners can view each other's requests

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

## 🔮 Roadmap

- [ ] Calendar view with dual-sided daily tracking
- [ ] Push notifications for pending approvals
- [ ] Workout history and analytics
- [ ] Multiple partnerships support
- [ ] Custom workout categories
- [ ] Achievement badges
- [ ] Social sharing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💬 Support

Having issues? Please check:
1. Your Supabase credentials are correct
2. The SQL schema has been run
3. Email verification is complete
4. Both partners have signed up

---

**Made with 💪 for fitness accountability**
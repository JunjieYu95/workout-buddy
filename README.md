# 🏋️‍♂️ Workout Buddy

**Partner accountability for fitness consistency**

A gamified workout tracking app where couples/partners encourage and monitor each other's fitness progress through mutual verification and visual progress tracking.

## ✨ Features

### 🎯 Core MVP Features
- **🤝 Partnership System**: Connect with a workout buddy for mutual accountability
- **📅 Visual Calendar**: Dual-sided daily view showing both partners' workout intensity
- **🪨 Stone Game**: Gamified progress with stochastic rewards and escalating penalties
- **✅ Request-Approval System**: Partners verify each other's workouts (no self-reporting)
- **🎮 Demo Mode**: Test all features without authentication setup
- **📊 Progress Tracking**: Visual comparison of both partners' consistency

### 🛠 Technical Features
- **⚡ Next.js 15**: Latest React framework with App Router
- **🎨 Tailwind CSS**: Modern, responsive UI design
- **🐘 Neon**: Serverless PostgreSQL database
- **🔐 NextAuth.js**: Authentication system
- **📱 Responsive**: Works on desktop, tablet, and mobile
- **🚀 Vercel Ready**: Optimized for production deployment

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
./setup-neon.sh
```
This script will guide you through the entire deployment process automatically.

### Option 2: Manual Setup
Follow the step-by-step guides:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [CLI_COMMANDS.md](CLI_COMMANDS.md) - CLI commands reference
- [SETUP.md](SETUP.md) - Local development setup

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- GitHub account
- Neon account
- Vercel account

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS |
| **Backend** | Neon (PostgreSQL) + NextAuth.js |
| **Deployment** | Vercel |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Date Handling** | date-fns |

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── dashboard/       # Main dashboard page
│   │   ├── approvals/       # Workout approval page
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   ├── components/          # React components
│   │   └── Calendar.tsx     # Calendar view component
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   └── lib/                 # Utilities
│       ├── supabase.ts      # Supabase client & types
│       └── stone-game.ts    # Game logic
├── supabase/
│   └── schema.sql           # Database schema
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── DEPLOYMENT.md            # Deployment guide
├── CLI_COMMANDS.md          # CLI commands reference
├── SETUP.md                 # Local setup guide
└── setup-production.sh      # Automated deployment script
```

## 🎮 Demo Mode

The app includes a comprehensive demo mode that works without any backend setup:

1. Visit the landing page
2. Click **"🎮 Demo Mode"**
3. Explore all features with sample data:
   - Dual progress bars
   - Calendar with multiple views (Week/Month/Quarter/Year)
   - Stone game mechanics
   - Workout request system
   - Partnership features

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📊 Database Schema

The app uses 4 main tables:

- **`users`**: User profiles and authentication
- **`partnerships`**: Partner relationships and status
- **`workout_requests`**: Workout submissions awaiting approval
- **`stone_progress`**: Game progress tracking

See [supabase/schema.sql](supabase/schema.sql) for the complete schema.

## 🎯 Game Mechanics

### Stone Game Logic
- **Base Push**: 5-15 random units per workout
- **Intensity Bonus**: +2 units per intensity level (1-5 scale)
- **Consistency Bonus**: +3 units per consecutive day
- **Momentum Multiplier**: 1.05x per consecutive day
- **Target**: 100 units to complete the challenge

### Workout Intensity Levels
- **1-2**: Light workout (yellow indicator)
- **3**: Moderate workout (green indicator)  
- **4-5**: Intense workout (blue indicator)

## 🚀 Deployment

### Quick Deploy
```bash
# Run the automated setup
./setup-production.sh
```

### Manual Deploy
1. Set up Supabase project and run schema
2. Push code to GitHub
3. Deploy to Vercel with environment variables
4. Configure authentication URLs

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📱 Features Overview

### Landing Page
- App introduction and benefits
- Demo mode access
- Authentication options
- Feature showcase

### Dashboard
- Partnership status and setup
- Dual progress bars (You vs Partner)
- Stone game progress
- Workout request submission
- Calendar view integration

### Calendar View
- **Week View**: Detailed daily breakdown
- **Month View**: Monthly overview with intensity indicators
- **Quarter View**: Progress bars for each month
- **Year View**: Annual summary

### Approval System
- Review partner's workout requests
- Approve/reject with one click
- Automatic stone progress updates
- Request history tracking

## 🔐 Security

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Supabase Auth with email verification
- **Partner Verification**: No self-reporting possible
- **Environment Variables**: Secure credential management

## 📈 Monitoring

### Built-in Analytics
- Supabase usage metrics
- Vercel performance analytics
- Real-time error tracking

### Recommended Monitoring
- Set up Vercel Analytics
- Monitor Supabase usage limits
- Track user engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [CLI_COMMANDS.md](CLI_COMMANDS.md) - CLI reference
- [SETUP.md](SETUP.md) - Local setup
- [MVP_COMPLETE.md](MVP_COMPLETE.md) - Feature overview

### Resources
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### Issues
- Check existing issues on GitHub
- Create a new issue with detailed description
- Include error logs and reproduction steps

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**Ready to get fit with your workout buddy? Start your journey today! 💪**
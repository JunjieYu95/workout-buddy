#!/bin/bash

echo "🧹 Cleaning up and starting fresh..."
echo ""

# Kill any processes on ports 3000 and 3001
echo "📍 Checking for processes on ports 3000 and 3001..."
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "  - Killing process on port 3000..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null
fi

if lsof -ti:3001 > /dev/null 2>&1; then
  echo "  - Killing process on port 3001..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null
fi

# Kill any lingering node/npm processes
echo "🔪 Terminating any lingering node/npm processes..."
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "npm run dev" 2>/dev/null || true

# Wait a moment for processes to fully terminate
echo "⏳ Waiting for cleanup to complete..."
sleep 2

# Clear Next.js cache if it exists
if [ -d ".next" ]; then
  echo "🗑️  Clearing Next.js cache..."
  rm -rf .next
fi

echo ""
echo "✅ Cleanup complete!"
echo "🚀 Starting development server on port 3000..."
echo ""

# Start the dev server
npm run dev

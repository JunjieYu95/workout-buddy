#!/bin/bash

# Check for --deep flag
DEEP_CLEAN=false
if [[ "$1" == "--deep" ]]; then
  DEEP_CLEAN=true
  echo "🔥 DEEP CLEAN MODE ACTIVATED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "This will:"
  echo "  • Remove node_modules/"
  echo "  • Remove package-lock.json"
  echo "  • Remove .next cache"
  echo "  • Reinstall all dependencies"
  echo "  • Restart the dev server"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
else
  echo "🧹 Cleaning up and starting fresh..."
  echo ""
fi

echo "📍 Checking for processes on ports 3000 and 3001..."

# Kill any processes on port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "  - Killing process on port 3000..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null
fi

# Kill any processes on port 3001
if lsof -ti:3001 > /dev/null 2>&1; then
  echo "  - Killing process on port 3001..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null
fi

# Kill any lingering node/npm processes
echo "🔪 Terminating any lingering node/npm processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "node.*next" 2>/dev/null

# Wait for cleanup
echo "⏳ Waiting for cleanup to complete..."
sleep 2

# Clear Next.js cache
echo "🗑️  Clearing Next.js cache..."
rm -rf .next

# Deep clean if flag is set
if [ "$DEEP_CLEAN" = true ]; then
  echo ""
  echo "💣 Starting deep clean..."
  echo ""
  
  # Remove node_modules
  if [ -d "node_modules" ]; then
    echo "🗑️  Removing node_modules/ ..."
    rm -rf node_modules
    echo "✅ node_modules/ removed"
  fi
  
  # Remove package-lock.json
  if [ -f "package-lock.json" ]; then
    echo "🗑️  Removing package-lock.json ..."
    rm -f package-lock.json
    echo "✅ package-lock.json removed"
  fi
  
  # Remove other cache directories
  echo "🗑️  Removing additional caches..."
  rm -rf .turbo 2>/dev/null
  rm -rf node_modules/.cache 2>/dev/null
  echo "✅ Additional caches cleared"
  
  echo ""
  echo "📦 Installing dependencies (this may take a while)..."
  echo ""
  npm install
  
  if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm install failed!"
    echo "Please check the error messages above and try again."
    exit 1
  fi
  
  echo ""
  echo "✅ Dependencies installed successfully!"
fi

echo ""
echo "✅ Cleanup complete!"
echo "🚀 Starting development server on port 3000..."
echo ""

# Start the dev server
npm run dev

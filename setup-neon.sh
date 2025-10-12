#!/bin/bash

echo "🚀 Workout Buddy - Neon Database Setup Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_tools() {
    print_status "Checking required tools..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git not found. Please install Git first."
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Please install it first:"
        echo "  npm install -g vercel"
        exit 1
    fi
    
    print_success "All required tools are installed!"
    echo ""
}

# Setup Neon Database
setup_neon() {
    print_status "Setting up Neon Database..."
    echo ""
    
    print_status "Please follow these steps to set up your Neon database:"
    echo ""
    echo "1. 🌐 Go to https://neon.tech and sign up/login"
    echo "2. 📦 Click 'Create Project'"
    echo "3. 📝 Fill in project details:"
    echo "   - Project Name: workout-buddy"
    echo "   - Database Name: neondb (default)"
    echo "   - Region: Choose closest to your users"
    echo "   - Branch: main (default)"
    echo "4. ⏳ Wait for project creation (1-2 minutes)"
    echo "5. 📋 Copy the Connection String from Dashboard"
    echo ""
    
    read -p "Press Enter when you have created your Neon project and copied the connection string..."
    
    echo ""
    print_status "Now let's set up your environment variables:"
    echo ""
    
    # Get DATABASE_URL
    read -p "Enter your Neon DATABASE_URL: " DATABASE_URL
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL is required"
        exit 1
    fi
    
    # Generate NEXTAUTH_SECRET
    print_status "Generating NextAuth secret..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "fallback-secret-$(date +%s)")
    
    # Create .env.local file
    print_status "Creating .env.local file..."
    cat > .env.local << EOF
# Neon Database
DATABASE_URL=$DATABASE_URL

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
EOF
    
    print_success "Environment variables configured!"
    echo ""
}

# Setup Git and GitHub
setup_git() {
    print_status "Setting up Git repository..."
    echo ""
    
    # Check if we're in a git repo
    if [ ! -d ".git" ]; then
        print_status "Initializing Git repository..."
        git init
    fi
    
    # Check if remote exists
    if ! git remote | grep -q origin; then
        print_status "Setting up GitHub repository..."
        echo ""
        echo "Please create a new repository on GitHub:"
        echo "1. Go to https://github.com/new"
        echo "2. Create a repository named 'workout-buddy' (or your preferred name)"
        echo "3. Don't initialize with README, .gitignore, or license"
        echo ""
        read -p "Enter your GitHub repository URL (e.g., https://github.com/username/workout-buddy.git): " REPO_URL
        
        if [ -n "$REPO_URL" ]; then
            git remote add origin "$REPO_URL"
            print_success "Git remote added: $REPO_URL"
        else
            print_warning "No repository URL provided. You can add it later with:"
            echo "  git remote add origin YOUR_REPO_URL"
        fi
    fi
    
    # Add and commit all files
    print_status "Adding and committing files..."
    git add .
    git commit -m "Initial commit - Workout Buddy with Neon database"
    
    # Push to GitHub
    if git remote | grep -q origin; then
        print_status "Pushing to GitHub..."
        git branch -M main
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            print_success "Successfully pushed to GitHub! 🎉"
        else
            print_warning "Failed to push to GitHub. You may need to set up authentication."
        fi
    fi
    
    echo ""
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Setting up Vercel deployment..."
    echo ""
    
    # Login to Vercel
    print_status "Please log in to Vercel:"
    vercel login
    
    if [ $? -eq 0 ]; then
        print_success "Successfully logged in to Vercel!"
    else
        print_error "Failed to log in to Vercel. Please try again."
        exit 1
    fi
    
    echo ""
    print_status "Deploying to Vercel..."
    echo "This will guide you through the deployment process."
    echo ""
    
    # Deploy to Vercel
    vercel --prod
    
    if [ $? -eq 0 ]; then
        print_success "Successfully deployed to Vercel! 🎉"
        echo ""
        print_warning "IMPORTANT: Don't forget to add environment variables in Vercel:"
        echo "1. Go to your Vercel project dashboard"
        echo "2. Go to Settings > Environment Variables"
        echo "3. Add these variables:"
        echo "   - DATABASE_URL: Your Neon connection string"
        echo "   - NEXTAUTH_URL: Your Vercel deployment URL"
        echo "   - NEXTAUTH_SECRET: Your generated secret"
        echo "4. Redeploy the project after adding environment variables"
        echo ""
        read -p "Press Enter when you have added the environment variables..."
        
        print_status "Redeploying with environment variables..."
        vercel --prod
        
        if [ $? -eq 0 ]; then
            print_success "Final deployment complete! 🚀"
        fi
    else
        print_error "Failed to deploy to Vercel."
        exit 1
    fi
    
    echo ""
}

# Initialize database
initialize_database() {
    print_status "Initializing database tables..."
    echo ""
    
    echo "To initialize your database tables, you have two options:"
    echo ""
    echo "Option 1: API Endpoint (Recommended)"
    echo "1. Visit your deployed app"
    echo "2. Go to: https://your-app.vercel.app/api/init-db"
    echo "3. Send a POST request using curl or browser dev tools"
    echo ""
    echo "Option 2: Neon SQL Editor"
    echo "1. Go to your Neon project dashboard"
    echo "2. Click 'SQL Editor'"
    echo "3. Copy the table creation SQL from src/lib/db.ts"
    echo "4. Run the query"
    echo ""
    
    read -p "Press Enter when you have initialized the database..."
    
    print_success "Database setup complete! 🎉"
    echo ""
}

# Final instructions
show_final_instructions() {
    echo "🎉 CONGRATULATIONS! Your Workout Buddy app is now live! 🎉"
    echo ""
    echo "Next steps:"
    echo "=========="
    echo ""
    echo "1. 🌐 Visit your live app at the Vercel URL shown above"
    echo ""
    echo "2. 🧪 Test the app:"
    echo "   - Try the 'Demo Mode' button"
    echo "   - Test user registration and login"
    echo "   - Create a partnership with a test user"
    echo "   - Submit and approve workout requests"
    echo ""
    echo "3. 🔧 Configure Neon (if needed):"
    echo "   - Go to https://neon.tech"
    echo "   - Monitor your database usage"
    echo "   - Set up backups if needed"
    echo ""
    echo "4. 📊 Monitor your app:"
    echo "   - Check Vercel Analytics"
    echo "   - Monitor Neon usage"
    echo "   - Set up error tracking"
    echo ""
    echo "5. 🚀 Future enhancements:"
    echo "   - Custom domain setup"
    echo "   - Email notifications"
    echo "   - Mobile app"
    echo "   - Advanced analytics"
    echo ""
    echo "Support resources:"
    echo "================="
    echo "- Neon Docs: https://neon.tech/docs"
    echo "- Vercel Docs: https://vercel.com/docs"
    echo "- Next.js Docs: https://nextjs.org/docs"
    echo ""
    echo "Happy coding! 💪"
}

# Main execution
main() {
    echo "This script will help you deploy Workout Buddy with Neon database."
    echo "Make sure you have accounts on:"
    echo "- Neon (https://neon.tech)"
    echo "- Vercel (https://vercel.com)"
    echo "- GitHub (https://github.com)"
    echo ""
    read -p "Press Enter to continue..."
    echo ""
    
    check_tools
    setup_neon
    setup_git
    deploy_vercel
    initialize_database
    show_final_instructions
}

# Run the main function
main

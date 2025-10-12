#!/bin/bash

echo "🚀 Workout Buddy - Production Setup Script"
echo "=========================================="
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
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found. Please install it first:"
        echo "  brew install supabase/tap/supabase"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Please install it first:"
        echo "  npm install -g vercel"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git not found. Please install Git first."
        exit 1
    fi
    
    print_success "All required tools are installed!"
    echo ""
}

# Initialize Supabase project
setup_supabase() {
    print_status "Setting up Supabase..."
    echo ""
    
    # Login to Supabase
    print_status "Please log in to Supabase:"
    supabase login
    
    if [ $? -eq 0 ]; then
        print_success "Successfully logged in to Supabase!"
    else
        print_error "Failed to log in to Supabase. Please try again."
        exit 1
    fi
    
    echo ""
    print_status "Creating new Supabase project..."
    echo "This will create a new project in your Supabase dashboard."
    echo ""
    
    # Create project (this will prompt for details)
    supabase projects create
    
    if [ $? -eq 0 ]; then
        print_success "Supabase project created successfully!"
    else
        print_error "Failed to create Supabase project."
        exit 1
    fi
    
    echo ""
    print_warning "IMPORTANT: Please save your project details:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your new project"
    echo "3. Go to Project Settings > API"
    echo "4. Copy the Project URL and anon public key"
    echo "5. You'll need these for Vercel deployment"
    echo ""
    read -p "Press Enter when you have saved your Supabase credentials..."
    
    # Initialize Supabase in the project
    print_status "Initializing Supabase in local project..."
    supabase init
    
    # Link to remote project
    print_status "Linking to your Supabase project..."
    supabase link
    
    if [ $? -eq 0 ]; then
        print_success "Successfully linked to Supabase project!"
    else
        print_error "Failed to link to Supabase project."
        exit 1
    fi
    
    # Deploy the schema
    print_status "Deploying database schema..."
    supabase db push
    
    if [ $? -eq 0 ]; then
        print_success "Database schema deployed successfully!"
    else
        print_error "Failed to deploy database schema."
        exit 1
    fi
    
    echo ""
    print_success "Supabase setup complete! 🎉"
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
    git commit -m "Initial commit - Workout Buddy MVP ready for deployment"
    
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
        echo "   - NEXT_PUBLIC_SUPABASE_URL: Your Supabase Project URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon public key"
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
    echo "3. 🔧 Configure Supabase (if needed):"
    echo "   - Go to https://supabase.com/dashboard"
    echo "   - Select your project"
    echo "   - Go to Authentication > URL Configuration"
    echo "   - Add your Vercel domain to Site URL and Redirect URLs"
    echo ""
    echo "4. 📊 Monitor your app:"
    echo "   - Check Vercel Analytics"
    echo "   - Monitor Supabase usage"
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
    echo "- Supabase Docs: https://supabase.com/docs"
    echo "- Vercel Docs: https://vercel.com/docs"
    echo "- Next.js Docs: https://nextjs.org/docs"
    echo ""
    echo "Happy coding! 💪"
}

# Main execution
main() {
    echo "This script will help you deploy Workout Buddy to production."
    echo "Make sure you have accounts on:"
    echo "- Supabase (https://supabase.com)"
    echo "- Vercel (https://vercel.com)"
    echo "- GitHub (https://github.com)"
    echo ""
    read -p "Press Enter to continue..."
    echo ""
    
    check_tools
    setup_supabase
    setup_git
    deploy_vercel
    show_final_instructions
}

# Run the main function
main


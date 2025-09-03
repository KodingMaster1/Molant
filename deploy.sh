#!/bin/bash

# MOLANT ICT System Deployment Script
# This script handles both local development setup and production deployment

set -e

echo "🚀 MOLANT ICT System Deployment Script"
echo "======================================"

# Check if running in production mode
if [ "$1" = "production" ]; then
    echo "📦 Production deployment mode"
    DEPLOY_MODE="production"
else
    echo "🔧 Local development setup mode"
    DEPLOY_MODE="local"
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command_exists git; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ "$DEPLOY_MODE" = "local" ]; then
    echo "🔧 Setting up local development environment..."
    
    # Check if Supabase CLI is installed
    if ! command_exists supabase; then
        echo "📥 Installing Supabase CLI..."
        npm install -g supabase
    fi
    
    # Initialize Supabase if not already initialized
    if [ ! -f "supabase/config.toml" ]; then
        echo "🔧 Initializing Supabase..."
        supabase init
    fi
    
    # Start local Supabase
    echo "🚀 Starting local Supabase..."
    supabase start
    
    # Apply database schema
    echo "🗄️ Applying database schema..."
    supabase db push
    
    # Generate TypeScript types
    echo "📝 Generating TypeScript types..."
    npm run db:generate
    
    echo "✅ Local development environment setup complete!"
    echo ""
    echo "🌐 Access your application at: http://localhost:3000"
    echo "🗄️ Supabase Studio at: http://localhost:54323"
    echo "📧 Email testing at: http://localhost:54324"
    echo ""
    echo "To start the development server, run: npm run dev"
    
else
    echo "📦 Production deployment mode..."
    
    # Check if environment variables are set
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo "❌ Environment variables not set. Please set:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        exit 1
    fi
    
    # Build the application
    echo "🔨 Building application..."
    npm run build
    
    # Run database migrations if DATABASE_URL is set
    if [ ! -z "$DATABASE_URL" ]; then
        echo "🗄️ Running production database migrations..."
        supabase db push --db-url "$DATABASE_URL"
    fi
    
    echo "✅ Production deployment complete!"
    echo ""
    echo "🚀 Your application is ready for deployment to Vercel or your preferred platform."
    echo "📋 Remember to:"
    echo "   1. Set environment variables in your deployment platform"
    echo "   2. Configure your Supabase project for production"
    echo "   3. Set up custom domains if needed"
fi

echo ""
echo "🎉 MOLANT ICT System setup complete!"
echo "📚 For more information, check the README.md file" 
#!/bin/bash
# Haunt Platform - Development Setup Script

set -e

echo "🎃 Haunt Platform - Development Setup"
echo "======================================"

# Check prerequisites
echo ""
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing..."
    npm install -g pnpm
fi

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Some features may not work."
fi

if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI is not installed. Installing..."
    pnpm add -g supabase
fi

echo "✅ Prerequisites checked"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Setup environment files
echo ""
echo "🔧 Setting up environment files..."

if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
else
    echo "ℹ️  .env.local already exists, skipping"
fi

# Start Docker services
echo ""
echo "🐳 Starting Docker services..."
if command -v docker &> /dev/null; then
    docker compose -f infrastructure/docker/docker-compose.yml up -d
    echo "✅ Redis started"
else
    echo "⚠️  Docker not available, skipping Redis"
fi

# Start Supabase
echo ""
echo "🗄️  Starting Supabase..."
if command -v supabase &> /dev/null; then
    supabase start
    echo "✅ Supabase started"
else
    echo "⚠️  Supabase CLI not available"
fi

echo ""
echo "======================================"
echo "🎃 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your Supabase credentials"
echo "  2. Run 'pnpm dev' to start all services"
echo ""

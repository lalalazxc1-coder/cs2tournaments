#!/bin/bash

# CS2 Tournament System - Deployment Script for aaPanel
# Run this script on your local machine before uploading to server

echo "🚀 Preparing CS2 Tournament System for deployment..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend dependencies installation failed"
    exit 1
fi

cd ..

# Create deployment archive
echo "📦 Creating deployment archive..."
DEPLOY_DIR="cs2-tournament-deploy"
mkdir -p "$DEPLOY_DIR"

# Copy backend files
echo "📁 Copying backend files..."
cp -r backend/* "$DEPLOY_DIR/backend/"

# Copy frontend dist
echo "📁 Copying frontend build..."
mkdir -p "$DEPLOY_DIR/frontend"
cp -r frontend/dist/* "$DEPLOY_DIR/frontend/"

# Copy environment example
cp .env.production.example "$DEPLOY_DIR/.env.production.example"

# Copy README
cp README.md "$DEPLOY_DIR/"

echo "📋 Deployment checklist:"
echo "✅ Frontend built and ready in frontend/dist/"
echo "✅ Backend dependencies installed"
echo "✅ All files prepared in $DEPLOY_DIR/"
echo ""
echo "📤 Next steps:"
echo "1. Upload contents of '$DEPLOY_DIR' to your aaPanel server"
echo "2. Rename .env.production.example to .env and configure"
echo "3. Follow README.md deployment instructions"
echo ""
echo "🎉 Ready for deployment!"

# Optional: Create tar archive
read -p "Create deployment tar archive? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    tar -czf "cs2-tournament-deploy.tar.gz" "$DEPLOY_DIR"
    echo "📦 Archive created: cs2-tournament-deploy.tar.gz"
fi

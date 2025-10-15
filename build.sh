#!/bin/bash

# Build script for deployment
echo "Starting build process..."

# Check if we're in the right directory
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Build the React frontend
echo "Building React frontend..."
npm run build

# Verify build files exist
echo "Verifying build files..."
if [ -f "dist/index.html" ]; then
    echo "✅ Frontend build successful - index.html found"
    echo "Contents of dist folder:"
    ls -la dist/
else
    echo "❌ Frontend build failed - index.html not found"
    echo "Contents of current directory:"
    ls -la
    echo "Contents of dist folder (if exists):"
    ls -la dist/ 2>/dev/null || echo "dist folder does not exist"
    exit 1
fi

if [ -d "dist/assets" ]; then
    echo "✅ Assets directory found"
    ls -la dist/assets/
else
    echo "❌ Assets directory not found"
    exit 1
fi

echo "Build process completed successfully!"

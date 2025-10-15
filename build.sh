#!/bin/bash
set -e

echo "Starting build process..."

# Build the React frontend
echo "Building React frontend..."
npm install
npm run build

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build completed successfully!"

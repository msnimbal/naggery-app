#!/bin/bash
set -e

echo "Starting build process..."
cd app
echo "Installing dependencies..."
npm install
echo "Building application..."
npm run build
echo "Build completed successfully!"

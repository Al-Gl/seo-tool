#!/bin/bash

echo "Starting SEO Crawler & AI Analysis Platform..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo

# Install dependencies if not present
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing root dependencies"
        exit 1
    fi
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing frontend dependencies"
        exit 1
    fi
    cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing backend dependencies"
        exit 1
    fi
    cd ..
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo
    echo "Please edit the .env file with your configuration:"
    echo "- Set your Gemini API key"
    echo "- Configure database connection"
    echo
    echo "Press Enter after you've configured the .env file..."
    read
fi

echo
echo "Starting development servers..."
echo
echo "Frontend will be available at: http://localhost:3000"
echo "Backend will be available at: http://localhost:3001"
echo
echo "Press Ctrl+C to stop the servers"
echo

# Start both frontend and backend
npm run dev
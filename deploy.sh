#!/bin/bash

# Primetrade Deployment Script
# This script automates the deployment process for the Primetrade application

set -e  # Exit on any error

echo "🚀 Starting Primetrade deployment..."

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
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ and try again."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git and try again."
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# Install project dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    print_success "Dependencies installed successfully"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend .env file..."
        cp backend/env.example backend/.env
        print_warning "Please update backend/.env with your actual values"
    else
        print_success "Backend .env already exists"
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env.local" ]; then
        print_status "Creating frontend .env.local file..."
        echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > frontend/.env.local
        print_success "Frontend .env.local created"
    else
        print_success "Frontend .env.local already exists"
    fi
}

# Build the application
build_application() {
    print_status "Building the application..."
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    print_success "Application built successfully"
}

# Start the application in development mode
start_development() {
    print_status "Starting application in development mode..."
    print_status "Frontend will be available at: http://localhost:3000"
    print_status "Backend API will be available at: http://localhost:5000"
    print_warning "Make sure MongoDB is running before starting the application"
    print_status "Press Ctrl+C to stop the application"
    
    npm run dev
}

# Start the application in production mode
start_production() {
    print_status "Starting application in production mode..."
    
    # Start backend
    print_status "Starting backend server..."
    cd backend
    NODE_ENV=production npm start &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend
    print_status "Starting frontend server..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    print_success "Application started in production mode"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:5000"
    print_status "PIDs - Backend: $BACKEND_PID, Frontend: $FRONTEND_PID"
    
    # Create PID file for easy stopping
    echo "$BACKEND_PID $FRONTEND_PID" > .pids
    print_status "Process IDs saved to .pids file"
}

# Stop the application
stop_application() {
    if [ -f ".pids" ]; then
        print_status "Stopping application..."
        PIDS=$(cat .pids)
        for pid in $PIDS; do
            if kill -0 $pid 2>/dev/null; then
                kill $pid
                print_success "Stopped process $pid"
            fi
        done
        rm .pids
        print_success "Application stopped"
    else
        print_warning "No PID file found. Application may not be running."
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    print_status "Running backend tests..."
    cd backend
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        npm test
    else
        print_warning "No backend tests configured"
    fi
    cd ..
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd frontend
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        npm test
    else
        print_warning "No frontend tests configured"
    fi
    cd ..
    
    print_success "Tests completed"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Check if backend is responding
    if curl -s http://localhost:5000/api/health > /dev/null; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Check if frontend is responding
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    print_success "All services are healthy"
}

# Docker deployment
deploy_docker() {
    print_status "Deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    
    # Create docker-compose.yml if it doesn't exist
    if [ ! -f "docker-compose.yml" ]; then
        print_status "Creating docker-compose.yml..."
        cat > docker-compose.yml << EOF
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGODB_URI=mongodb://mongo:27017/primetrade
      - JWT_SECRET=your-jwt-secret-change-in-production
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
EOF
        print_success "docker-compose.yml created"
    fi
    
    # Create Dockerfiles if they don't exist
    if [ ! -f "backend/Dockerfile" ]; then
        print_status "Creating backend Dockerfile..."
        cat > backend/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
EOF
    fi
    
    if [ ! -f "frontend/Dockerfile" ]; then
        print_status "Creating frontend Dockerfile..."
        cat > frontend/Dockerfile << EOF
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
EOF
    fi
    
    # Build and start containers
    print_status "Building and starting Docker containers..."
    docker-compose up -d --build
    
    print_success "Application deployed with Docker"
    print_status "Services:"
    print_status "  Frontend: http://localhost:3000"
    print_status "  Backend: http://localhost:5000"
    print_status "  MongoDB: localhost:27017"
}

# Show usage information
show_usage() {
    echo "Primetrade Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup       - Install dependencies and setup environment"
    echo "  dev         - Start application in development mode"
    echo "  build       - Build the application for production"
    echo "  start       - Start application in production mode"
    echo "  stop        - Stop the running application"
    echo "  test        - Run tests"
    echo "  health      - Perform health check"
    echo "  docker      - Deploy with Docker"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup     # First time setup"
    echo "  $0 dev       # Start development server"
    echo "  $0 docker    # Deploy with Docker"
}

# Main script logic
main() {
    case "${1:-help}" in
        setup)
            check_dependencies
            install_dependencies
            setup_environment
            print_success "Setup completed! Run '$0 dev' to start development server."
            ;;
        dev)
            check_dependencies
            start_development
            ;;
        build)
            check_dependencies
            build_application
            ;;
        start)
            check_dependencies
            build_application
            start_production
            ;;
        stop)
            stop_application
            ;;
        test)
            check_dependencies
            run_tests
            ;;
        health)
            health_check
            ;;
        docker)
            deploy_docker
            ;;
        help)
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"


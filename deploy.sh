#!/bin/bash

# Norman Invoicing Tool Deployment Script

set -e

echo "🚀 Starting Norman Invoicing Tool deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Set environment
ENVIRONMENT=${1:-production}

echo "📦 Environment: $ENVIRONMENT"

# Function to deploy development
deploy_dev() {
    echo "🔧 Building and starting development environment..."
    docker compose down --remove-orphans
    docker compose up --build -d
    echo "✅ Development environment is running on http://localhost:3000"
}

# Function to deploy production
deploy_prod() {
    echo "🏭 Building and starting production environment..."
    docker compose -f docker-compose.prod.yml down --remove-orphans
    docker compose -f docker-compose.prod.yml up --build -d
    echo "✅ Production environment is running on http://localhost:81"
}

# Function to show logs
show_logs() {
    if [ "$ENVIRONMENT" = "production" ]; then
        docker compose -f docker-compose.prod.yml logs -f norman-tools
    else
        docker compose logs -f norman-tools
    fi
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping services..."
    if [ "$ENVIRONMENT" = "production" ]; then
        docker compose -f docker-compose.prod.yml down
    else
        docker compose down
    fi
    echo "✅ Services stopped"
}

# Main deployment logic
case $ENVIRONMENT in
    "dev"|"development")
        deploy_dev
        ;;
    "prod"|"production")
        deploy_prod
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_services
        ;;
    *)
        echo "Usage: $0 [dev|prod|logs|stop]"
        echo "  dev/development  - Deploy development environment"
        echo "  prod/production  - Deploy production environment"
        echo "  logs            - Show application logs"
        echo "  stop            - Stop all services"
        exit 1
        ;;
esac

echo "🎉 Deployment complete!" 
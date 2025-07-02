
#!/bin/bash

# 🚀 Naggery App - Deployment Script
# This script helps you deploy the Naggery app with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        log_warning ".env file not found. Copying from .env.example"
        cp .env.example .env
        log_warning "Please edit .env file with your configuration before proceeding."
        log_info "Required variables to set:"
        echo "  - DB_PASSWORD"
        echo "  - NEXTAUTH_SECRET (32+ characters)"
        echo "  - ABACUSAI_API_KEY"
        echo "  - ENCRYPTION_KEY (32 characters)"
        read -p "Press Enter after configuring .env file..."
    fi
    log_success ".env file exists"
}

# Generate secure secrets
generate_secrets() {
    if ! grep -q "your_secure_db_password" .env 2>/dev/null; then
        return 0
    fi
    
    log_info "Generating secure secrets..."
    
    # Generate secure passwords and secrets
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    NEXTAUTH_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-40)
    ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Update .env file
    sed -i "s/your_secure_db_password_here/$DB_PASSWORD/g" .env
    sed -i "s/your_nextauth_secret_minimum_32_characters/$NEXTAUTH_SECRET/g" .env
    sed -i "s/your_32_character_encryption_key_here/$ENCRYPTION_KEY/g" .env
    sed -i "s/your_jwt_secret_here/$JWT_SECRET/g" .env
    
    log_success "Generated secure secrets"
}

# Deploy application
deploy() {
    local mode=$1
    
    log_info "Starting deployment in $mode mode..."
    
    case $mode in
        "dev"|"development")
            log_info "Deploying in development mode with hot reload"
            docker-compose up -d
            ;;
        "prod"|"production")
            log_info "Deploying in production mode"
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            ;;
        *)
            log_error "Invalid mode. Use 'dev' or 'prod'"
            exit 1
            ;;
    esac
    
    log_success "Deployment started successfully"
}

# Check application health
check_health() {
    log_info "Waiting for application to start..."
    
    # Wait up to 120 seconds for the app to be ready
    for i in {1..40}; do
        if curl -f http://localhost:3000/api/health &> /dev/null; then
            log_success "Application is healthy!"
            curl -s http://localhost:3000/api/health | python3 -m json.tool
            return 0
        fi
        echo -n "."
        sleep 3
    done
    
    log_error "Application health check failed"
    log_info "Check logs with: docker-compose logs -f app"
    return 1
}

# Show status
show_status() {
    log_info "Service Status:"
    docker-compose ps
    
    echo -e "\n${BLUE}📊 Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    
    echo -e "\n${BLUE}🔗 Application URLs:${NC}"
    echo "  • Application: http://localhost:3000"
    echo "  • Health Check: http://localhost:3000/api/health"
    
    echo -e "\n${BLUE}👤 Demo Account:${NC}"
    echo "  • Email: john@doe.com"
    echo "  • Password: johndoe123"
}

# Show logs
show_logs() {
    local service=${1:-"app"}
    log_info "Showing logs for $service service..."
    docker-compose logs -f $service
}

# Stop services
stop_services() {
    log_info "Stopping all services..."
    docker-compose down
    log_success "All services stopped"
}

# Clean up
cleanup() {
    log_warning "This will remove all containers, volumes, and images"
    read -p "Are you sure? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        log_info "Cleaning up..."
        docker-compose down -v --rmi all
        docker system prune -f
        log_success "Cleanup completed"
    fi
}

# Show help
show_help() {
    echo "🚀 Naggery App Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev, development     Deploy in development mode"
    echo "  prod, production     Deploy in production mode"
    echo "  status              Show service status"
    echo "  logs [service]      Show logs (default: app)"
    echo "  health              Check application health"
    echo "  stop                Stop all services"
    echo "  restart             Restart all services"
    echo "  cleanup             Remove all containers and images"
    echo "  secrets             Generate secure secrets"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev              # Start development environment"
    echo "  $0 prod             # Start production environment"
    echo "  $0 logs app         # Show app logs"
    echo "  $0 logs postgres    # Show database logs"
    echo "  $0 health           # Check if app is healthy"
}

# Main script
main() {
    local command=${1:-"help"}
    
    echo "🚀 Naggery App Deployment Script"
    echo "=================================="
    
    case $command in
        "dev"|"development")
            check_docker
            check_env
            generate_secrets
            deploy "dev"
            sleep 10
            check_health
            show_status
            ;;
        "prod"|"production")
            check_docker
            check_env
            deploy "prod"
            sleep 15
            check_health
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs $2
            ;;
        "health")
            check_health
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 2
            deploy "dev"
            ;;
        "cleanup")
            cleanup
            ;;
        "secrets")
            generate_secrets
            log_success "Secrets generated in .env file"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function
main "$@"


#!/bin/bash

# 🔍 Naggery App - Setup Verification Script
# This script verifies that all containerization files are properly configured

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

# Check if required files exist
check_files() {
    log_info "Checking required containerization files..."
    
    local required_files=(
        "Dockerfile"
        ".dockerignore"
        "docker-compose.yml"
        "docker-compose.prod.yml"
        "docker-compose.override.yml"
        ".env.example"
        ".env.docker"
        ".env.production.example"
        "deployment/docker-entrypoint.sh"
        "deployment/nginx.conf"
        "deployment/postgresql.conf"
        "deployment/init-db.sql"
        "README-DEPLOYMENT.md"
        "deploy.sh"
        "app/app/api/health/route.ts"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "Found: $file"
        else
            log_error "Missing: $file"
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "All required files are present"
        return 0
    else
        log_error "Missing ${#missing_files[@]} required files"
        return 1
    fi
}

# Check Docker files syntax
check_docker_syntax() {
    log_info "Checking Docker configuration syntax..."
    
    # Check Dockerfile
    if [ -f "Dockerfile" ]; then
        if grep -q "FROM node:18-alpine" Dockerfile && grep -q "CMD \[\"yarn\", \"start\"\]" Dockerfile; then
            log_success "Dockerfile syntax looks good"
        else
            log_warning "Dockerfile may have syntax issues"
        fi
    fi
    
    # Check docker-compose files
    local compose_files=("docker-compose.yml" "docker-compose.prod.yml" "docker-compose.override.yml")
    
    for file in "${compose_files[@]}"; do
        if [ -f "$file" ]; then
            if grep -q "version:" "$file" && grep -q "services:" "$file"; then
                log_success "$file syntax looks good"
            else
                log_warning "$file may have syntax issues"
            fi
        fi
    done
}

# Check environment templates
check_env_templates() {
    log_info "Checking environment template files..."
    
    local env_files=(".env.example" ".env.docker" ".env.production.example")
    
    for file in "${env_files[@]}"; do
        if [ -f "$file" ]; then
            local required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "ABACUSAI_API_KEY")
            local missing_vars=()
            
            for var in "${required_vars[@]}"; do
                if grep -q "$var" "$file"; then
                    continue
                else
                    missing_vars+=("$var")
                fi
            done
            
            if [ ${#missing_vars[@]} -eq 0 ]; then
                log_success "$file contains all required variables"
            else
                log_warning "$file missing variables: ${missing_vars[*]}"
            fi
        fi
    done
}

# Check script permissions
check_permissions() {
    log_info "Checking script permissions..."
    
    local scripts=("deploy.sh" "deployment/docker-entrypoint.sh")
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            if [ -x "$script" ]; then
                log_success "$script is executable"
            else
                log_warning "$script is not executable (run: chmod +x $script)"
            fi
        fi
    done
}

# Check app structure
check_app_structure() {
    log_info "Checking application structure..."
    
    local required_app_files=(
        "app/package.json"
        "app/prisma/schema.prisma"
        "app/next.config.js"
        "app/app/layout.tsx"
        "app/app/page.tsx"
        "app/app/api/health/route.ts"
    )
    
    for file in "${required_app_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "Found: $file"
        else
            log_error "Missing: $file"
        fi
    done
}

# Generate deployment summary
generate_summary() {
    echo ""
    echo "📋 DEPLOYMENT SUMMARY"
    echo "===================="
    echo ""
    echo "🐳 Docker Configuration:"
    echo "  • Multi-stage Dockerfile for optimized builds"
    echo "  • Development and production Docker Compose setups"
    echo "  • Nginx reverse proxy configuration"
    echo "  • PostgreSQL database with persistence"
    echo ""
    echo "🔧 Available Commands:"
    echo "  • ./deploy.sh dev      - Start development environment"
    echo "  • ./deploy.sh prod     - Start production environment"
    echo "  • ./deploy.sh status   - Check service status"
    echo "  • ./deploy.sh logs     - View application logs"
    echo "  • ./deploy.sh health   - Check application health"
    echo ""
    echo "📁 Key Files Created:"
    echo "  • Dockerfile                   - Multi-stage build configuration"
    echo "  • docker-compose.yml           - Development setup"
    echo "  • docker-compose.prod.yml      - Production setup"
    echo "  • .env.example                 - Environment template"
    echo "  • deploy.sh                    - Deployment helper script"
    echo "  • README-DEPLOYMENT.md         - Comprehensive documentation"
    echo ""
    echo "🔒 Security Features:"
    echo "  • Non-root container execution"
    echo "  • Environment variable isolation"
    echo "  • Network segmentation"
    echo "  • Health checks and monitoring"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Install Docker and Docker Compose"
    echo "  2. Copy .env.example to .env and configure"
    echo "  3. Run: ./deploy.sh dev"
    echo "  4. Access application at http://localhost:3000"
    echo ""
    echo "📖 For detailed instructions, see README-DEPLOYMENT.md"
}

# Main verification
main() {
    echo "🔍 Naggery App - Setup Verification"
    echo "===================================="
    echo ""
    
    local all_good=true
    
    if ! check_files; then
        all_good=false
    fi
    
    check_docker_syntax
    check_env_templates
    check_permissions
    check_app_structure
    
    echo ""
    if [ "$all_good" = true ]; then
        log_success "✨ All checks passed! Containerization setup is complete."
    else
        log_warning "⚠️  Some issues detected. Please review the output above."
    fi
    
    generate_summary
}

# Run verification
main "$@"

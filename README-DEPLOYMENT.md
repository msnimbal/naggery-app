
# 🚀 Naggery App - Docker Deployment Guide

This guide provides comprehensive instructions for deploying the Naggery app using Docker and Docker Compose.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Development Deployment](#development-deployment)
- [Production Deployment](#production-deployment)
- [Database Management](#database-management)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Backup & Recovery](#backup--recovery)

## 🎯 Overview

The Naggery app is a comprehensive journaling application with:
- **NextJS 14** frontend with server-side rendering
- **PostgreSQL 15** database with Prisma ORM
- **Two-Factor Authentication** with TOTP and backup codes
- **Voice Recording** capabilities with AI transcription
- **Email/SMS Verification** system
- **Mobile-first PWA** design
- **AI Processing** features via AbacusAI

## 📦 Prerequisites

### System Requirements
- **Docker Engine**: 20.10.0 or higher
- **Docker Compose**: 2.0.0 or higher
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 5GB available space
- **Network**: Internet connection for initial setup

### Installation Commands

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin

# CentOS/RHEL
sudo yum install docker docker-compose

# macOS (using Homebrew)
brew install docker docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd /home/ubuntu/naggery_app

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment

Edit the `.env` file with your settings:

```bash
# Required: Set a strong database password
DB_PASSWORD=your_secure_database_password

# Required: Set NextAuth secret (minimum 32 characters)
NEXTAUTH_SECRET=your_nextauth_secret_minimum_32_characters

# Required: Set your AbacusAI API key
ABACUSAI_API_KEY=your_abacusai_api_key

# Required: Set production URL (for production)
NEXTAUTH_URL=https://yourdomain.com

# Required: Set encryption key (32 characters)
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 3. Start the Application

```bash
# Development mode (with hot reload)
docker-compose up -d

# Production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Verify Installation

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f app

# Test health endpoint
curl http://localhost:3000/api/health
```

## ⚙️ Environment Configuration

### Environment Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `.env.example` | Template with all variables | Copy to create your `.env` |
| `.env.docker` | Docker development defaults | Development with Docker |
| `.env` | Your actual configuration | All deployments |

### Key Environment Variables

#### Database Configuration
```bash
DB_NAME=naggery                    # Database name
DB_USER=naggery_user              # Database username
DB_PASSWORD=secure_password       # Database password (CHANGE THIS!)
DB_HOST=postgres                  # Database host (use 'postgres' for Docker)
DB_PORT=5432                      # Database port
```

#### Security Configuration
```bash
NEXTAUTH_SECRET=your_secret       # NextAuth.js secret (32+ chars)
ENCRYPTION_KEY=your_key          # Encryption key (32 chars)
JWT_SECRET=your_jwt_secret       # JWT signing secret
```

#### API Configuration
```bash
ABACUSAI_API_KEY=your_api_key    # Required for AI features
NEXTAUTH_URL=http://localhost:3000 # Your app URL
```

#### Optional Services
```bash
# Email (leave as 'console' for development)
EMAIL_SERVICE=console            # console|sendgrid|aws
EMAIL_API_KEY=your_email_key     # For production email

# SMS (leave as 'console' for development)  
SMS_SERVICE=console              # console|twilio|aws
SMS_API_KEY=your_sms_key         # For production SMS
```

## 🔧 Development Deployment

### Standard Development Setup

```bash
# Start with development overrides
docker-compose up -d

# Follow logs
docker-compose logs -f

# Access the application
open http://localhost:3000
```

### Development with Hot Reload

The development setup includes:
- **Hot reload** for code changes
- **Database seeding** with demo data
- **Console logging** for email/SMS (no external services needed)
- **Source code mounting** for immediate updates

### Demo Account

Use these credentials to test:
- **Email**: `john@doe.com`
- **Password**: `johndoe123`

### Development Commands

```bash
# Restart just the app (after code changes)
docker-compose restart app

# Rebuild after package.json changes
docker-compose build app
docker-compose up -d app

# Access database
docker-compose exec postgres psql -U naggery_user -d naggery

# View app logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

## 🏭 Production Deployment

### 1. Environment Setup

```bash
# Copy production environment template
cp .env.example .env.production

# Edit with production values
nano .env.production
```

### 2. Production Configuration

Critical production settings:

```bash
# Security (REQUIRED)
NODE_ENV=production
NEXTAUTH_SECRET=your_production_secret_minimum_32_characters
ENCRYPTION_KEY=your_production_encryption_key_32_chars
JWT_SECRET=your_production_jwt_secret

# Database (REQUIRED)
DB_PASSWORD=very_secure_production_password
DATABASE_URL=postgresql://user:pass@postgres:5432/naggery

# Application (REQUIRED)
NEXTAUTH_URL=https://yourdomain.com
ABACUSAI_API_KEY=your_production_api_key

# Services (RECOMMENDED)
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_sendgrid_key
SMS_SERVICE=twilio
SMS_API_KEY=your_twilio_key

# Optimizations
SEED_DATABASE=false
NEXT_TELEMETRY_DISABLED=1
```

### 3. Deploy to Production

```bash
# Start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify deployment
curl -f https://yourdomain.com/api/health
```

### 4. SSL Setup (Optional)

For HTTPS with Nginx:

```bash
# Create SSL directory
mkdir -p deployment/ssl

# Add your SSL certificates
cp your_cert.pem deployment/ssl/cert.pem
cp your_key.pem deployment/ssl/key.pem

# Update docker-compose.prod.yml to include nginx service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx
```

## 🗄️ Database Management

### Prisma Commands

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

# Seed database
docker-compose exec app npx prisma db seed

# View database in Prisma Studio
docker-compose exec app npx prisma studio
```

### Database Access

```bash
# PostgreSQL CLI
docker-compose exec postgres psql -U naggery_user -d naggery

# Backup database
docker-compose exec postgres pg_dump -U naggery_user naggery > backup.sql

# Restore database
docker-compose exec -T postgres psql -U naggery_user -d naggery < backup.sql
```

### Schema Updates

```bash
# After modifying schema.prisma
docker-compose exec app npx prisma migrate dev --name your_migration_name

# For production
docker-compose exec app npx prisma migrate deploy
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

```bash
# Application health
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "app": "healthy"
  }
}
```

### Service Monitoring

```bash
# Check all services
docker-compose ps

# Check specific service health
docker-compose exec app curl -f http://localhost:3000/api/health

# View resource usage
docker stats

# Check logs
docker-compose logs --tail=100 app
docker-compose logs --tail=100 postgres
```

### Log Management

```bash
# View real-time logs
docker-compose logs -f

# Filter by service
docker-compose logs -f app

# Save logs to file
docker-compose logs > naggery_logs_$(date +%Y%m%d).log
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Symptoms**: App can't connect to database

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify database credentials
docker-compose exec postgres psql -U naggery_user -d naggery -c "SELECT 1;"
```

**Solutions**:
- Ensure `DATABASE_URL` is correctly formatted
- Check `DB_PASSWORD` matches between app and postgres services
- Wait for database to fully initialize (30-60 seconds)

#### 2. Application Won't Start

**Symptoms**: App container exits immediately

```bash
# Check app logs
docker-compose logs app

# Check for build errors
docker-compose build app
```

**Common Causes**:
- Missing environment variables
- Invalid `NEXTAUTH_SECRET` (must be 32+ characters)
- Port conflicts (check if port 3000 is available)

#### 3. Prisma Issues

**Symptoms**: Database schema errors

```bash
# Regenerate Prisma client
docker-compose exec app npx prisma generate

# Check database schema
docker-compose exec app npx prisma db pull

# Reset database (DESTRUCTIVE)
docker-compose exec app npx prisma migrate reset
```

#### 4. Build Failures

**Symptoms**: Docker build fails

```bash
# Clear Docker cache
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache

# Check for Node.js version compatibility
docker-compose exec app node --version
```

### Performance Issues

#### Memory Problems

```bash
# Check memory usage
docker stats

# Increase memory limits in docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
```

#### Slow Database Queries

```bash
# Enable query logging
docker-compose exec postgres psql -U naggery_user -d naggery -c "
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
"

# View slow queries in logs
docker-compose logs postgres | grep "duration:"
```

### Recovery Procedures

#### 1. Complete Reset

```bash
# Stop and remove all containers
docker-compose down -v

# Remove all images
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

#### 2. Database Reset

```bash
# Backup existing data
docker-compose exec postgres pg_dump -U naggery_user naggery > backup_$(date +%Y%m%d).sql

# Reset database
docker-compose down
docker volume rm naggery_postgres_data
docker-compose up -d
```

## 🔒 Security Considerations

### Environment Security

```bash
# Use strong passwords (16+ characters)
DB_PASSWORD=$(openssl rand -base64 32)

# Generate secure secrets
NEXTAUTH_SECRET=$(openssl rand -base64 48)
ENCRYPTION_KEY=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
```

### Network Security

- Use Docker networks (already configured)
- Don't expose database port in production
- Enable SSL/TLS for external access
- Use environment variables for secrets

### Container Security

- Containers run as non-root user
- Read-only filesystem where possible
- Limited capabilities
- Regular security updates

### Data Protection

- Database data is persisted in Docker volumes
- Sensitive environment variables are not logged
- API keys are encrypted in database
- User passwords are hashed with bcrypt

## 💾 Backup & Recovery

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T postgres pg_dump -U naggery_user naggery > $BACKUP_DIR/naggery_db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/naggery_db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "naggery_db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: naggery_db_$DATE.sql.gz"
```

### Cron Job Setup

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Recovery Process

```bash
# Stop application
docker-compose stop app

# Restore database
gunzip -c backup_file.sql.gz | docker-compose exec -T postgres psql -U naggery_user -d naggery

# Restart application
docker-compose start app
```

## 🎯 Next Steps

After successful deployment:

1. **Configure External Services**:
   - Set up email service (SendGrid, AWS SES)
   - Configure SMS service (Twilio)
   - Add domain and SSL certificate

2. **Monitoring Setup**:
   - Set up log aggregation
   - Configure health check monitoring
   - Set up alerts for failures

3. **Performance Optimization**:
   - Enable CDN for static assets
   - Configure database connection pooling
   - Set up caching layer

4. **Security Hardening**:
   - Regular security updates
   - Implement rate limiting
   - Set up intrusion detection

## 📞 Support

For issues and questions:

- Check the [Troubleshooting](#troubleshooting) section
- Review Docker and application logs
- Verify environment configuration
- Test health endpoints

---

**🎉 Congratulations!** Your Naggery app is now containerized and ready for deployment!

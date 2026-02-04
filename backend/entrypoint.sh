#!/bin/bash

set -e

# ============================================
# Due Diligence Backend - Docker Entrypoint
# ============================================
# This script validates environment configuration,
# performs database migrations, and starts the application.

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Logging Functions
# ============================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# Environment Validation
# ============================================
validate_environment() {
    log_info "Validating environment configuration..."
    
    local required_vars=(
        "OPENROUTER_API_KEY"
        "OPENROUTER_BASE_URL"
        "MODEL_NAME"
        "HOST"
        "PORT"
        "APP_NAME"
        "APP_VERSION"
        "DATABASE_URL"
        "REDIS_URL"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo -e "${RED}  - $var${NC}"
        done
        exit 1
    fi
    
    log_success "All required environment variables are set"
}

# ============================================
# Configuration Validation
# ============================================
validate_configuration() {
    log_info "Validating configuration values..."
    
    # Validate PORT is a number
    if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
        log_error "PORT must be a valid number, got: $PORT"
        exit 1
    fi
    
    # Validate PORT range
    if [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
        log_error "PORT must be between 1 and 65535, got: $PORT"
        exit 1
    fi
    
    # Validate DEBUG is boolean
    if [ -n "$DEBUG" ]; then
        DEBUG_LOWER=$(echo "$DEBUG" | tr '[:upper:]' '[:lower:]')
        if [[ ! "$DEBUG_LOWER" =~ ^(true|false)$ ]]; then
            log_error "DEBUG must be 'true' or 'false', got: $DEBUG"
            exit 1
        fi
    fi
    
    log_success "Configuration validation passed"
}

# ============================================
# Directory Setup
# ============================================
setup_directories() {
    log_info "Setting up required directories..."
    
    # Create uploads directory if it doesn't exist
    mkdir -p uploads
    log_success "Uploads directory ready"
    
    # Ensure data directory exists
    mkdir -p data
    log_success "Data directory ready"
}

# ============================================
# Database Connection Check
# ============================================
check_database_connection() {
    log_info "Checking database connection..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if python -c "
import os
from sqlalchemy import create_engine, text
try:
    engine = create_engine(os.getenv('DATABASE_URL'))
    with engine.connect() as conn:
        conn.execute(text('SELECT 1'))
    print('Database connection successful')
except Exception as e:
    print(f'Database connection failed: {e}')
    exit(1)
" 2>/dev/null; then
            log_success "Database connection established"
            return 0
        fi
        
        log_warning "Database connection attempt $attempt/$max_attempts failed, retrying in 2 seconds..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "Failed to connect to database after $max_attempts attempts"
    exit 1
}

# ============================================
# Redis Connection Check
# ============================================
check_redis_connection() {
    log_info "Checking Redis connection..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if python -c "
import os
import redis
try:
    redis_url = os.getenv('REDIS_URL')
    r = redis.from_url(redis_url)
    r.ping()
    print('Redis connection successful')
except Exception as e:
    print(f'Redis connection failed: {e}')
    exit(1)
" 2>/dev/null; then
            log_success "Redis connection established"
            return 0
        fi
        
        log_warning "Redis connection attempt $attempt/$max_attempts failed, retrying in 2 seconds..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "Failed to connect to Redis after $max_attempts attempts"
    exit 1
}

# ============================================
# Database Migration
# ============================================
run_database_migrations() {
    log_info "Running database migrations with Alembic..."
    
    if ! python -m alembic upgrade head; then
        log_error "Database migration failed"
        exit 1
    fi
    
    log_success "Database migrations completed successfully"
}

# ============================================
# Application Startup
# ============================================
start_application() {
    log_info "Starting Due Diligence Backend..."
    log_info "Configuration Summary:"
    echo -e "  ${BLUE}App Name:${NC} $APP_NAME"
    echo -e "  ${BLUE}App Version:${NC} $APP_VERSION"
    echo -e "  ${BLUE}Host:${NC} $HOST"
    echo -e "  ${BLUE}Port:${NC} $PORT"
    echo -e "  ${BLUE}Debug Mode:${NC} ${DEBUG:-false}"
    echo -e "  ${BLUE}Model:${NC} $MODEL_NAME"
    echo -e "  ${BLUE}Database:${NC} Connected"
    echo -e "  ${BLUE}Redis:${NC} Connected"
    
    echo ""
    log_success "Starting application..."
    
    # Start the application with uvicorn
    exec uvicorn main:app \
        --host "$HOST" \
        --port "$PORT" \
        --log-level "${LOG_LEVEL:-info}" \
        $([ "$DEBUG" = "true" ] && echo "--reload" || echo "")
}

# ============================================
# Graceful Shutdown Handler
# ============================================
trap 'log_info "Received shutdown signal"; exit 0' SIGTERM SIGINT

# ============================================
# Main Execution Flow
# ============================================
main() {
    log_info "=========================================="
    log_info "Due Diligence Backend - Docker Entrypoint"
    log_info "=========================================="
    echo ""
    
    # Step 1: Validate environment variables
    validate_environment
    echo ""
    
    # Step 2: Validate configuration values
    validate_configuration
    echo ""
    
    # Step 3: Setup directories
    setup_directories
    echo ""
    
    # Step 4: Check database connection
    check_database_connection
    echo ""
    
    # Step 5: Check Redis connection
    check_redis_connection
    echo ""
    
    # Step 6: Run database migrations
    run_database_migrations
    echo ""
    
    # Step 7: Start application
    start_application
}

# Run main function
main "$@"

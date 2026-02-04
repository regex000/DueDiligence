.PHONY: help up down down-volumes logs logs-backend logs-postgres logs-redis migrate migration shell-backend shell-postgres shell-redis clean rebuild health test

# Variables
DOCKER_COMPOSE := docker-compose
BACKEND_CONTAINER := due-diligence-backend
POSTGRES_CONTAINER := due-diligence-postgres
REDIS_CONTAINER := due-diligence-redis

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Due Diligence Backend - Makefile Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Docker Compose Commands:$(NC)"
	@echo "  $(YELLOW)make up$(NC)                 - Start all services (PostgreSQL, Redis, Backend)"
	@echo "  $(YELLOW)make down$(NC)               - Stop all services (keep data)"
	@echo "  $(YELLOW)make down-volumes$(NC)       - Stop all services and remove volumes (delete data)"
	@echo "  $(YELLOW)make rebuild$(NC)            - Rebuild backend image and start services"
	@echo ""
	@echo "$(GREEN)Database Migration Commands:$(NC)"
	@echo "  $(YELLOW)make migrate$(NC)            - Run pending migrations"
	@echo "  $(YELLOW)make migration msg=\"...\"$(NC) - Create new migration with message"
	@echo ""
	@echo "$(GREEN)Logging Commands:$(NC)"
	@echo "  $(YELLOW)make logs$(NC)               - View logs from all services"
	@echo "  $(YELLOW)make logs-backend$(NC)       - View backend logs"
	@echo "  $(YELLOW)make logs-postgres$(NC)      - View PostgreSQL logs"
	@echo "  $(YELLOW)make logs-redis$(NC)         - View Redis logs"
	@echo ""
	@echo "$(GREEN)Shell Access Commands:$(NC)"
	@echo "  $(YELLOW)make shell-backend$(NC)      - Access backend container shell"
	@echo "  $(YELLOW)make shell-postgres$(NC)     - Access PostgreSQL shell"
	@echo "  $(YELLOW)make shell-redis$(NC)        - Access Redis CLI"
	@echo ""
	@echo "$(GREEN)Utility Commands:$(NC)"
	@echo "  $(YELLOW)make health$(NC)             - Check health of all services"
	@echo "  $(YELLOW)make clean$(NC)              - Remove stopped containers and unused images"
	@echo "  $(YELLOW)make test$(NC)               - Test backend API"
	@echo ""

# Docker Compose Commands
up: ## Start all services
	@echo "$(BLUE)Starting all services...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo ""
	@echo "$(BLUE)Waiting for services to be ready...$(NC)"
	@sleep 5
	@make health

down: ## Stop all services (keep data)
	@echo "$(BLUE)Stopping all services...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Services stopped$(NC)"

down-volumes: ## Stop all services and remove volumes (delete data)
	@echo "$(RED)WARNING: This will delete all data!$(NC)"
	@echo "$(YELLOW)Stopping all services and removing volumes...$(NC)"
	$(DOCKER_COMPOSE) down -v
	@echo "$(GREEN)✓ Services stopped and volumes removed$(NC)"

rebuild: ## Rebuild backend image and start services
	@echo "$(BLUE)Rebuilding backend image...$(NC)"
	$(DOCKER_COMPOSE) build --no-cache backend
	@echo "$(GREEN)✓ Backend image rebuilt$(NC)"
	@echo ""
	@echo "$(BLUE)Starting services...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ Services started$(NC)"

# Database Migration Commands
migrate: ## Run pending migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	$(DOCKER_COMPOSE) exec backend python -m alembic upgrade head
	@echo "$(GREEN)✓ Migrations completed$(NC)"

migration: ## Create new migration (usage: make migration msg="description")
	@if [ -z "$(msg)" ]; then \
		echo "$(RED)Error: msg parameter is required$(NC)"; \
		echo "$(YELLOW)Usage: make migration msg=\"Your migration description\"$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Creating new migration: $(msg)$(NC)"
	$(DOCKER_COMPOSE) exec backend python -m alembic revision --autogenerate -m "$(msg)"
	@echo "$(GREEN)✓ Migration created$(NC)"

# Logging Commands
logs: ## View logs from all services
	$(DOCKER_COMPOSE) logs -f

logs-backend: ## View backend logs
	$(DOCKER_COMPOSE) logs -f $(BACKEND_CONTAINER)

logs-postgres: ## View PostgreSQL logs
	$(DOCKER_COMPOSE) logs -f $(POSTGRES_CONTAINER)

logs-redis: ## View Redis logs
	$(DOCKER_COMPOSE) logs -f $(REDIS_CONTAINER)

# Shell Access Commands
shell-backend: ## Access backend container shell
	@echo "$(BLUE)Accessing backend shell...$(NC)"
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) bash

shell-postgres: ## Access PostgreSQL shell
	@echo "$(BLUE)Accessing PostgreSQL shell...$(NC)"
	$(DOCKER_COMPOSE) exec $(POSTGRES_CONTAINER) psql -U diligence_user -d due_diligence

shell-redis: ## Access Redis CLI
	@echo "$(BLUE)Accessing Redis CLI...$(NC)"
	$(DOCKER_COMPOSE) exec $(REDIS_CONTAINER) redis-cli -a redis_password

# Utility Commands
health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker Compose Status:$(NC)"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "$(YELLOW)Backend Health:$(NC)"
	@curl -s http://localhost:8000/health | python -m json.tool || echo "$(RED)Backend not responding$(NC)"
	@echo ""
	@echo "$(YELLOW)Database Health:$(NC)"
	@$(DOCKER_COMPOSE) exec $(POSTGRES_CONTAINER) pg_isready -U diligence_user || echo "$(RED)Database not responding$(NC)"
	@echo ""
	@echo "$(YELLOW)Redis Health:$(NC)"
	@$(DOCKER_COMPOSE) exec $(REDIS_CONTAINER) redis-cli -a redis_password ping || echo "$(RED)Redis not responding$(NC)"
	@echo ""

clean: ## Remove stopped containers and unused images
	@echo "$(BLUE)Cleaning up Docker resources...$(NC)"
	docker container prune -f
	docker image prune -f
	@echo "$(GREEN)✓ Cleanup completed$(NC)"

test: ## Test backend API
	@echo "$(BLUE)Testing backend API...$(NC)"
	@echo ""
	@echo "$(YELLOW)Health Check:$(NC)"
	@curl -s http://localhost:8000/health | python -m json.tool
	@echo ""
	@echo "$(YELLOW)API Documentation:$(NC)"
	@echo "  Swagger UI: http://localhost:8000/docs"
	@echo "  ReDoc: http://localhost:8000/redoc"
	@echo ""

# Additional helpful commands
ps: ## Show running containers
	$(DOCKER_COMPOSE) ps

restart: ## Restart all services
	@echo "$(BLUE)Restarting all services...$(NC)"
	$(DOCKER_COMPOSE) restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

restart-backend: ## Restart backend service
	@echo "$(BLUE)Restarting backend...$(NC)"
	$(DOCKER_COMPOSE) restart $(BACKEND_CONTAINER)
	@echo "$(GREEN)✓ Backend restarted$(NC)"

restart-postgres: ## Restart PostgreSQL service
	@echo "$(BLUE)Restarting PostgreSQL...$(NC)"
	$(DOCKER_COMPOSE) restart $(POSTGRES_CONTAINER)
	@echo "$(GREEN)✓ PostgreSQL restarted$(NC)"

restart-redis: ## Restart Redis service
	@echo "$(BLUE)Restarting Redis...$(NC)"
	$(DOCKER_COMPOSE) restart $(REDIS_CONTAINER)
	@echo "$(GREEN)✓ Redis restarted$(NC)"

backup-db: ## Backup PostgreSQL database
	@echo "$(BLUE)Backing up PostgreSQL database...$(NC)"
	@mkdir -p backups
	@$(DOCKER_COMPOSE) exec $(POSTGRES_CONTAINER) pg_dump -U diligence_user due_diligence > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Database backed up$(NC)"

restore-db: ## Restore PostgreSQL database (usage: make restore-db FILE=backups/backup_*.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE parameter is required$(NC)"; \
		echo "$(YELLOW)Usage: make restore-db FILE=backups/backup_*.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Restoring PostgreSQL database from $(FILE)...$(NC)"
	@cat $(FILE) | $(DOCKER_COMPOSE) exec -T $(POSTGRES_CONTAINER) psql -U diligence_user due_diligence
	@echo "$(GREEN)✓ Database restored$(NC)"

migration-status: ## Show current migration status
	@echo "$(BLUE)Current Migration Status:$(NC)"
	@$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) python -m alembic current
	@echo ""
	@echo "$(BLUE)Migration History:$(NC)"
	@$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) python -m alembic history

migration-downgrade: ## Downgrade one migration (usage: make migration-downgrade)
	@echo "$(BLUE)Downgrading one migration...$(NC)"
	@$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) python -m alembic downgrade -1
	@echo "$(GREEN)✓ Migration downgraded$(NC)"

stats: ## Show container resource usage
	@echo "$(BLUE)Container Resource Usage:$(NC)"
	@docker stats --no-stream

env-check: ## Check environment variables
	@echo "$(BLUE)Environment Variables:$(NC)"
	@grep -v '^#' .env | grep -v '^$$'

.DEFAULT_GOAL := help

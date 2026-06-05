.PHONY: help install up down logs backend test seed clean clean-all
BACKEND_DIR = backend
FRONTEND_DIR = frontend

VENV = $(BACKEND_DIR)/.venv

BACKEND_PORT =
FRONTEND_PORT =
PREVIEW_PORT =
DOCKER_FRONTEND_PORT =

# Docker
DOCKER_NAME_BACKEND = invoice-guard-backend
DOCKER_NAME_FRONTEND = invoice-guard-frontend
COMPOSE_FILE = docker-compose.yml

GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
CYAN := \033[0;36m
RED := \033[0;31m
BOLD := \033[1m
NC := \033[0m

help: ## Показать справку
	@echo ""
	@echo "$(BOLD)$(BLUE)InvoiceGuard$(NC) — Payment Acceptance Service"
	@echo ""
	@echo "$(BOLD)🚀 Команды запуска:$(NC)"
	@echo "  $(GREEN)make install$(NC)    Установить все зависимости"
	@echo "  $(GREEN)make up$(NC)         Start infrastructure (Docker)"
	@echo "  $(GREEN)make down$(NC)       Stop infrastructure"
	@echo "  $(GREEN)make backend$(NC)    Run backend in dev mode"
	@echo "  $(GREEN)make test$(NC)       Run tests"
	@echo "  $(GREEN)make seed$(NC)       Seed database with initial merchant"
	@echo "  $(GREEN)make clean$(NC)      Remove dist and node_modules"



clean-ports: ## Очистить порты
	@echo "$(YELLOW)🧹 Очищаем порты...$(NC)"
	@-lsof -ti :$(BACKEND_PORT) | xargs kill -9 2>/dev/null || true
	@echo "$(GREEN)✅ Порты свободны$(NC)"

install:
	cd backend && npm install

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

backend:
	cd backend && npm run dev

test:
	cd backend && npm test

seed:
	cd backend && npx ts-node src/infrastructure/database/seed.ts

clean:
	rm -rf backend/dist

clean-all: clean
	rm -rf backend/node_modules

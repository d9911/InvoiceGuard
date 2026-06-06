.PHONY: help install up down logs backend test seed docker-seed clean clean-ports build

BACKEND_DIR = backend
BACKEND_PORT = 3000

GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
BOLD   := \033[1m
NC     := \033[0m

help: ## Показать справку
	@echo ""
	@echo "$(BOLD)$(BLUE)InvoiceGuard$(NC) — Payment Acceptance Service"
	@echo ""
	@echo "$(BOLD)🚀 Команды:$(NC)"
	@echo "  $(GREEN)make install$(NC)    Установить все зависимости локально"
	@echo "  $(GREEN)make build$(NC)      Собрать Docker образы"
	@echo "  $(GREEN)make up$(NC)         Запустить всё в Docker (App + DB)"
	@echo "  $(GREEN)make down$(NC)       Остановить всё"
	@echo "  $(GREEN)make backend$(NC)    Запустить backend локально в dev-режиме"
	@echo "  $(GREEN)make test$(NC)       Запустить тесты локально"
	@echo "  $(GREEN)make seed$(NC)       Заполнить БД тестовыми данными (локально)"
	@echo "  $(GREEN)make docker-seed$(NC) Заполнить БД тестовыми данными в Docker"
	@echo "  $(GREEN)make clean-ports$(NC) Освободить порты"

clean-ports: ## Очистить порты
	@echo "$(YELLOW)🧹 Очищаем порты...$(NC)"
	@-lsof -ti :$(BACKEND_PORT) | xargs kill -9 2>/dev/null || true
	@echo "$(GREEN)✅ Порты свободны$(NC)"

install:
	cd $(BACKEND_DIR) && npm install

build:
	docker-compose build --no-cache

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

backend:
	cd $(BACKEND_DIR) && npm run dev

test:
	cd $(BACKEND_DIR) && npm test

seed:
	cd $(BACKEND_DIR) && npx ts-node src/infrastructure/database/seed.ts

docker-seed:
	docker-compose exec backend node dist/src/infrastructure/database/seed.js

clean:
	rm -rf $(BACKEND_DIR)/dist

clean-all: clean
	rm -rf $(BACKEND_DIR)/node_modules

i: clean-all install test build docker-seed
.PHONY: help install up down logs backend test seed clean clean-all clean-ports

BACKEND_DIR = backend
BACKEND_PORT = 3000

GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
CYAN := \033[0;36m
RED := \033[0;31m
BOLD   := \033[1m
NC     := \033[0m

help: ## Показать справку
	@echo ""
	@echo "$(BOLD)$(BLUE)InvoiceGuard$(NC) — Payment Acceptance Service"
	@echo ""
	@echo "$(BOLD)🚀 Команды:$(NC)"
	@echo "  $(GREEN)make install$(NC)    Установить все зависимости"
	@echo "  $(GREEN)make up$(NC)         Запустить инфраструктуру (Docker)"
	@echo "  $(GREEN)make down$(NC)       Остановить инфраструктуру"
	@echo "  $(GREEN)make backend$(NC)    Запустить backend в dev-режиме"
	@echo "  $(GREEN)make test$(NC)       Запустить тесты"
	@echo "  $(GREEN)make seed$(NC)       Заполнить БД тестовыми данными"
	@echo "  $(GREEN)make clean$(NC)      Очистить временные файлы"
	@echo "  $(GREEN)make clean-ports$(NC) Свободить порты"

clean-ports: ## Очистить порты
	@echo "$(YELLOW)🧹 Очищаем порты...$(NC)"
	@-lsof -ti :$(BACKEND_PORT) | xargs kill -9 2>/dev/null || true
	@echo "$(GREEN)✅ Порты свободны$(NC)"

install:
	cd $(BACKEND_DIR) && npm install

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

clean:
	rm -rf $(BACKEND_DIR)/dist

clean-all: clean
	rm -rf $(BACKEND_DIR)/node_modules

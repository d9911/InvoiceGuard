.PHONY: help install up down logs backend frontend test seed docker-seed clean clean-ports build i infra dev local-start

BACKEND_DIR = backend
FRONTEND_DIR = frontend
BACKEND_PORT = 3000
FRONTEND_PORT = 5176

GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
BOLD   := \033[1m
NC     := \033[0m

help: ## Показать справку
	@echo ""
	@echo "$(BOLD)$(BLUE)InvoiceGuard$(NC) — Payment Acceptance Service"
	@echo ""
	@echo "$(BOLD)🚀 Команды (Docker):$(NC)"
	@echo "  $(GREEN)make i$(NC)           Полный цикл: Сборка + Запуск + Сид"
	@echo "  $(GREEN)make build$(NC)       Собрать Docker образы"
	@echo "  $(GREEN)make up$(NC)          Запустить всё в Docker"
	@echo "  $(GREEN)make down$(NC)        Остановить всё"
	@echo "  $(GREEN)make docker-seed$(NC) Заполнить БД внутри Docker"
	@echo ""
	@echo "$(BOLD)💻 Команды (Локальная разработка):$(NC)"
	@echo "  $(GREEN)make dev$(NC)         Всё для локального старта (Infra + Seed + Backend Dev)"
	@echo "  $(GREEN)make infra$(NC)       Запустить только MongoDB и Redis в Docker"
	@echo "  $(GREEN)make install$(NC)     Установить зависимости (Yarn)"
	@echo "  $(GREEN)make frontend$(NC)    Запустить Frontend (Next.js)"
	@echo "  $(GREEN)make backend$(NC)     Запустить backend локально (ts-node-dev)"
	@echo "  $(GREEN)make seed$(NC)        Заполнить локальную БД"
	@echo "  $(GREEN)make test$(NC)        Запустить тесты"
	@echo "  $(GREEN)make local-start$(NC) Собрать и запустить локально через PM2"
	@echo ""
	@echo "$(BOLD)🧹 Служебные:$(NC)"
	@echo "  $(GREEN)make clean-ports$(NC) Освободить порт 3000/5176"
	@echo "  $(GREEN)make logs$(NC)        Просмотр логов Docker"

clean-ports:
	@echo "$(YELLOW)🧹 Очищаем порты...$(NC)"
	@-lsof -ti :$(BACKEND_PORT) | xargs kill -9 2>/dev/null || true
	@-lsof -ti :$(FRONTEND_PORT) | xargs kill -9 2>/dev/null || true
	@echo "$(GREEN)✅ Порты свободны$(NC)"

install:
	cd $(BACKEND_DIR) && yarn install
	cd $(FRONTEND_DIR) && yarn install

build:
	docker-compose build --no-cache

up:
	docker-compose up -d

infra:
	docker-compose up -d mongodb redis prometheus grafana

down:
	docker-compose down

logs:
	docker-compose logs -f

backend:
	cd $(BACKEND_DIR) && yarn run dev

frontend: clean-ports
	cd $(FRONTEND_DIR) && yarn run dev

test:
	cd $(BACKEND_DIR) && yarn test

seed:
	cd $(BACKEND_DIR) && npx ts-node -r tsconfig-paths/register src/infrastructure/db/seed.ts

docker-seed:
	docker-compose exec backend node dist/src/infrastructure/db/seed.js

clean:
	rm -rf $(BACKEND_DIR)/dist $(FRONTEND_DIR)/.next

clean-all: clean
	rm -rf $(BACKEND_DIR)/node_modules $(FRONTEND_DIR)/node_modules

# Полный цикл для Docker
i: clean install test build
	$(MAKE) up
	@echo "$(YELLOW)Waiting for backend to start...$(NC)"
	@sleep 10
	$(MAKE) docker-seed
	@echo "$(GREEN)✅ System is ready!$(NC)"

dev: clean-ports infra install seed
	@echo "$(GREEN)Infrastructure started. Launching backend...$(NC)"
	cd $(BACKEND_DIR) && yarn run dev

local-start: clean-ports infra install
	cd $(BACKEND_DIR) && yarn run build
	cd $(BACKEND_DIR) && npx pm2 start ecosystem.config.js
	@echo "$(GREEN)✅ Started locally with PM2.$(NC)"

doc-front:
	docker-compose build --no-cache $(FRONTEND_DIR)
	docker-compose up -d $(FRONTEND_DIR)
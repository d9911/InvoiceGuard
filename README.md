# InvoiceGuard - Payment Acceptance Service (Strong Middle Implementation)

Полноценная реализация сервиса приёма платежей на Node.js, спроектированная с учетом требований безопасности OWASP, финансовой точности и масштабируемости архитектуры.

## Ключевые особенности (Strong Middle Implementation)

1.  **Архитектура Clean / Feature-Sliced**:
    - Разделение на `Entities`, `Features`, `Infrastructure` и `Shared`.
    - Инкапсуляция логики через **Репозитории** и **Use Cases**.
2.  **Эшелонированная Безопасность**:
    - **JWT Auth + 2FA**: Полноценная авторизация с поддержкой **TOTP (6-значные коды)** через Google Authenticator.
    - **Brute-force Protection**: В модель пользователя заложены поля для отслеживания попыток входа и блокировки аккаунта.
    - **Webhook Security**:
      - Проверка HMAC-SHA256 по **raw body**.
      - Анти-Replay: проверка **Nonce** в Redis и временного окна **Timestamp**.
    - **Validation**: Строгая типизация и защита от инъекций через **Zod**.
3.  **Финансовая точность**:
    - Использование `Money` lib для работы с **minor units** (integers).
    - Защита от ошибок плавающей запятой (IEEE 754).
    - Атомарные операции в MongoDB для гарантии идемпотентности.

## Технологический стек

- **Backend**: Node.js, Express, TypeScript.
- **Database**: MongoDB (Mongoose) — основной источник истины.
- **Cache**: Redis — защита от replay-атак (nonce) и кеширование.
- **Testing**: Jest, Supertest, MongoDB Memory Server.
- **Tools**: Docker, Swagger UI, Zod, tsc-alias.

---

## Скриншоты

<div style="display: flex; flex-direction: column; gap: 24px; margin: 24px 0; align-items: center;">
  <div style="text-align: center; width: 100%;">
    <img src="./screenshots/1350.jpg" alt="Desktop preview" style="width: 65%; max-width: 900px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.06);" />
    <p style="margin-top: 12px; font-size: 13px; color: #6c6e63; font-weight: 600;">Desktop</p>
  </div>
  <div style="display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;">
    <div style="text-align: center; flex: 0 0 auto;">
      <img src="./screenshots/440.jpg" alt="Mobile preview" style="width: 280px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.06);" />
      <p style="margin-top: 10px; font-size: 12px; color: #6c6e63; font-weight: 600;">Mobile</p>
    </div>
  </div>
</div>

## Быстрый запуск

Самый быстрый способ запустить проект со всеми зависимостями и базой данных:

```bash
make i
```

_Эта команда выполнит: очистку -> установку -> тесты -> сборку Docker -> запуск -> наполнение БД._

## API Эндпоинты

### Публичные (Auth)

- `POST /api/auth/register` — Регистрация нового пользователя.
- `POST /api/auth/login` — Вход и получение JWT Bearer токена.

### Защищенные (Требуют Header: Authorization: Bearer <token>)

- `POST /api/invoice` — Создание счета (расчет комиссии, сохранение в БД).
- `GET  /api/invoice/:id` — Получение статуса счета.

### Технические

- `POST /api/webhook` — Прием статуса от платежной системы (защищен HMAC).
- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Разработка

Запуск в режиме разработки с hot-reload:

```bash
make up       # Поднять БД и Redis
make backend  # Запустить Node.js локально
```

## Тестирование

```bash
make test
```

_Проект включает Unit-тесты для логики расчетов/криптографии и Интеграционные тесты для проверки идемпотентности вебхуков._

## Что сделано сверх ТЗ

- Добавлена полноценная система регистрации и логина (JWT).
- Внедрена строгая валидация схем запросов через Zod.
- Настроены Alias-пути (`@/`) для чистоты импортов.
- Подготовлен Docker-setup для всей инфраструктуры.

## License

MIT License. See [LICENSE](LICENSE) for details.


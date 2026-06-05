# InvoiceGuard - Payment Acceptance Service

Сервис приёма платежей на Node.js (Express + MongoDB + Redis) с использованием Clean Architecture / DDD-lite.

## Особенности реализации

- **Clean Architecture**: Четкое разделение на слои:
  - `domain`: Модели данных и бизнес-правила.
  - `application`: Сервисы (use cases).
  - `interfaces`: HTTP контроллеры, роуты и middleware.
  - `infrastructure`: Работа с БД, Redis и внешними API.
  - `shared`: Общие утилиты (деньги, криптография).
- **Безопасность**:
  - Проверка подписи HMAC-SHA256 по raw body запроса.
  - Защита от Replay-атак через `X-Nonce` (хранится в Redis) и `X-Timestamp`.
- **Надежность и Идемпотентность**:
  - Все денежные расчеты производятся в минимальных единицах валюты (целые числа) для избежания проблем с floating point.
  - Идемпотентность обработки webhook реализована через атомарные обновления MongoDB (`findOneAndUpdate` с проверкой текущего статуса).
  - Версионирование записей (Optimistic concurrency control).

## Стек

- Node.js 18+
- MongoDB
- Redis
- Docker

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

## Запуск проекта

1. Установите зависимости:
   ```bash
   make install
   ```
2. Поднимите инфраструктуру (Mongo + Redis):
   ```bash
   make up
   ```
3. Выполните сидирование базы данных (создаст тестового мерчанта):
   ```bash
   make seed
   ```
4. Запустите сервер в режиме разработки:
   ```bash
   make backend
   ```

Сервер будет доступен по адресу `http://localhost:3000`.

## API Эндпоинты

### 1. Создание счета

`POST /api/invoice`
Тело:

```json
{
  "amount": 10000,
  "currency": "USD",
  "merchantId": "merchant_123"
}
```

### 2. Получение статуса

`GET /api/invoice/:id`

### 3. Webhook (Прием статуса оплаты)

`POST /api/webhook`
Заголовки:

- `X-Signature`: HMAC-SHA256 от тела.
- `X-Timestamp`: Текущий timestamp (seconds).
- `X-Nonce`: Уникальная строка.

## Тестирование

Запуск всех тестов:

```bash
make test
```

## Допущения и упрощения

1. **Мерчанты**: В рамках задания реализован упрощенный механизм хранения мерчантов. Секретный ключ для подписи (`webhookSecret`) хранится в БД у мерчанта.
2. **Валюты**: Предполагается, что `amount` передается в минорных единицах (копейки/центы).
3. **Nonce**: Nonce хранится в Redis с TTL 5 минут (соответствует окну проверки timestamp).
4. **Ошибки**: Реализован базовый глобальный обработчик ошибок в контроллерах.

## Что можно улучшить

1. **Логирование**: Добавить Winston/Pino для структурированного логирования.
2. **Валидация**: Использовать `Zod` или `Joi` для более строгой валидации входящих схем.
3. **DI**: Использовать InversifyJS или Awilix для Dependency Injection.
4. **Queue**: При масштабировании обработку вебхуков лучше вынести в фоновые очереди (BullMQ).

## License

MIT License. See [LICENSE](LICENSE) for details.

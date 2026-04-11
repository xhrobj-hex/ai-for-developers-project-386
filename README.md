# Календарь звонков

Учебный проект курса Hexlet AI for Developers: упрощённый сервис бронирования временных слотов по мотивам Cal.com. Проект развивается по подходу Design First: сначала контракт в TypeSpec и OpenAPI, затем технический каркас, backend и frontend.

## Структура репозитория

- `backend/` — backend на Go с in-memory хранением и реализацией MVP endpoint'ов по контракту.
- `frontend/` — минимальный frontend на React + TypeScript + Vite.
- `contracts/typespec/` — контракт API в TypeSpec.
- `contracts/openapi/` — сгенерированная OpenAPI-спека.
- `docs/` — зафиксированные решения по MVP, домену и этапам проекта.

## Запуск backend

```bash
cd backend
go run ./cmd/api
```

По умолчанию backend стартует на `http://localhost:8080`. Порт можно переопределить переменной `PORT`:

```bash
cd backend
PORT=8090 go run ./cmd/api
```

Health-check: `GET http://localhost:8080/health`

Реализованные backend endpoint'ы:

- `GET /health`
- `GET /event-types`
- `GET /event-types/{eventTypeId}/slots`
- `POST /bookings`
- `POST /admin/event-types`
- `GET /admin/bookings/upcoming`

Данные backend хранятся только in-memory и сбрасываются после рестарта процесса.

Текущие backend MVP-допущения, которые используются в реализации, но не являются частью контракта:

- слоты генерируются только на ближайшие 14 дней;
- рабочее окно: каждый день с `09:00` до `18:00`;
- шаг сетки слотов: `30 минут`;
- все расчёты времени выполняются в `UTC`.

## Запуск frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

После запуска открой `http://127.0.0.1:5173/`.

В dev-режиме frontend обращается к backend через Vite proxy `/api`, поэтому для локальной проверки backend должен быть запущен на `http://localhost:8080`.

Для frontend подготовлен локальный пример переменных: `frontend/.env.example`. Сейчас в нём только `VITE_API_BASE_URL=http://localhost:8080`; это значение нужно для build/production-конфига, а не для локального dev proxy.

## E2E Playwright

Локальная последовательность для e2e:

```bash
npm run test:e2e:setup
npm run test:e2e
```

`npm run test:e2e:setup` нужен только для одноразовой локальной установки Chromium. После этого обычно достаточно:

```bash
npm run test:e2e
```

Команда `npm run test:e2e` поднимает отдельный backend на `http://127.0.0.1:18080`, запускает отдельный frontend dev server на `http://127.0.0.1:14173` и прогоняет e2e против реального UI и backend. Это не конфликтует с обычным локальным запуском на `8080` и `5173`.

## CI

Для проекта добавлен отдельный workflow `ci.yml`, который запускается автоматически на `push` и `pull_request`.

В CI выполняются:

- проверка TypeSpec/OpenAPI на актуальность;
- backend-проверки через `go test ./...`;
- frontend build через `npm ci --prefix frontend` и `npm run build`;
- Playwright e2e через `npm run test:e2e`.

`hexlet-check.yml` остаётся отдельным служебным workflow Hexlet и не заменяется этим CI.

## Что уже готово

- собрана верхнеуровневая структура репозитория;
- контракт хранится в `contracts/`;
- backend MVP реализует основной API-сценарий на Go с in-memory хранением;
- frontend MVP на React + TypeScript + Vite подключён к backend API;
- публичный сценарий работает через `/` -> `/book/:eventTypeId` -> `/book/:eventTypeId/confirm`;
- owner-часть работает через `/admin`: создание event type и просмотр upcoming bookings.
- Playwright e2e покрывает happy path, duplicate booking и invalid owner form submit.

## Что пока не реализовано

- полноценный CI;
- авторизация и защита `/admin`;
- редактирование и удаление event type;
- БД, Docker и деплой.

---

### Hexlet tests and linter status

[![Actions Status](https://github.com/xhrobj-hex/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/xhrobj-hex/ai-for-developers-project-386/actions)

### SonarQube Cloud

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=xhrobj-hex_ai-for-developers-project-386)

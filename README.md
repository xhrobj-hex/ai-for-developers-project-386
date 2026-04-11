# Календарь звонков

Учебный проект курса Hexlet AI for Developers: упрощённый сервис бронирования временных слотов по мотивам Cal.com. Проект развивается по подходу Design First: сначала контракт в TypeSpec и OpenAPI, затем технический каркас, backend и frontend.

## Структура репозитория

- `backend/` — минимальный backend на Go. Сейчас содержит только HTTP-сервер и `GET /health`.
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

## Запуск frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

После запуска открой `http://127.0.0.1:5173/`.

Для frontend подготовлен локальный пример переменных: `frontend/.env.example`. Сейчас в нём только `VITE_API_BASE_URL=http://localhost:8080`.

## Что уже готово на этапе 2

- собрана верхнеуровневая структура репозитория;
- контракт хранится в `contracts/`;
- backend-каркас на Go поднимает сервер и отвечает на `GET /health`;
- frontend-каркас на React + TypeScript + Vite показывает простую страницу-заглушку проекта.

## Что пока не реализовано

- booking API и любая бизнес-логика;
- in-memory хранилище данных;
- интеграция frontend с backend;
- формы бронирования и административные экраны;
- авторизация, БД, Docker и деплой.

---

### Hexlet tests and linter status

[![Actions Status](https://github.com/xhrobj-hex/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/xhrobj-hex/ai-for-developers-project-386/actions)

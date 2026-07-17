---
tags: [tolk, engineering, deployment, devops]
status: ready
updated: 2026-07-16
audience: [developer, ai-agent]
---
# Руководство по деплою Tolk (Фронтенд и Бэкенд)

Это руководство предназначено для ИИ-агента или разработчика. Оно описывает шаги по развертыванию бэкенда (`tolk-back`) и фронтенда (`tolk`) на продакшн-сервер.

---

## 1. Архитектура и стек

Проект разделен на два независимых репозитория:
1. **`tolk-back` (Бэкенд):**
   * **Стек:** Node.js (TypeScript, Fastify, tsx, tsc).
   * **База данных:** PostgreSQL 16+ (миграции запускаются автоматически при старте бэкенда).
   * **Кэш / PubSub:** Redis 7+.
   * **Хранилище медиа:** Любое S3-совместимое облако (AWS S3, MinIO, Yandex Object Storage).
   * **Реалтайм:** WebSockets (`@fastify/websocket`).

2. **`tolk` (Фронтенд):**
   * **Стек:** React 19, Vite, TS, Zustand.
   * **Сборка:** Компилируется в статическую папку `dist` (SPA).
   * **Роутинг:** React Router (требуется веб-сервер с поддержкой fallback на `index.html`).

---

## 2. Подготовка сервера

Рекомендуется использовать Linux-сервер (например, Ubuntu 22.04 LTS / 24.04 LTS) с установленными:
* **Docker & Docker Compose** (для СУБД, Redis и S3/MinIO, либо для всего стека целиком).
* **Node.js 20+ & npm** (если деплой бэкенда или фронтенда выполняется на хосте, а не в Docker).
* **Nginx** или **Caddy** (в качестве веб-сервера, SSL-терминатора и обратного прокси).

---

## 3. Развертывание бэкенда (`tolk-back`)

Бэкенд находится в папке `apps/api` репозитория `tolk-back`.

### 3.1. Переменные окружения (Environment Variables)
Создайте `.env` файл в папке `apps/api` или передайте переменные в окружение Docker-контейнера:

```env
# Общие настройки
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Безопасность (ОБЯЗАТЕЛЬНО измените в продакшене!)
# В режиме NODE_ENV=production бэкенд не запустится с дефолтным секретом.
JWT_SECRET=your_long_secure_random_jwt_secret_here_2026

# Базы данных
DATABASE_URL=postgresql://postgres:secure_password@postgres_host:5432/tolk
REDIS_URL=redis://redis_host:6379

# Хранилище медиа (S3-совместимое)
S3_ENDPOINT=https://s3.your-provider.com  # Или локальный MinIO
S3_BUCKET=tolk-media
S3_REGION=us-east-1
S3_ACCESS_KEY=your_s3_access_key
S3_SECRET_KEY=your_s3_secret_key
```

### 3.2. Настройка S3 / MinIO хранилища
1. В S3-провайдере создайте бакет с именем, указанным в `S3_BUCKET` (по умолчанию `tolk-media`).
2. Настройте политику доступа к бакету (Bucket Policy), чтобы файлы были доступны публично на чтение по прямым ссылкам, но запись была разрешена только авторизованному клиенту S3:
   * **Анонимный доступ:** Разрешить действие `s3:GetObject` для путей `arn:aws:s3:::tolk-media/*`.
   * Бэкенд генерирует presigned-ссылки для загрузки файлов через метод `PutObjectCommand`.

### 3.3. Локальная сборка и запуск на хосте (без Docker)
Если вы запускаете бэкенд прямо на сервере с Node.js:

```bash
cd apps/api
npm install

# Компиляция TypeScript в JavaScript (вывод в ./dist)
npm run build

# ВНИМАНИЕ: tsc не копирует .sql файлы миграций.
# Нам необходимо вручную скопировать папку migrations в dist, иначе бэкенд упадет при старте!
cp -r src/db/migrations dist/src/db/

# Запуск приложения
node dist/src/index.js
```

### 3.4. Сборка через Docker (Dockerfile)
Для контейнеризации бэкенда используйте следующий production-ready `Dockerfile` (создайте его в корне `tolk-back` или в `apps/api`):

```dockerfile
# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем package файлы бэкенда
COPY apps/api/package*.json ./
RUN npm ci

# Копируем исходники бэкенда
COPY apps/api/tsconfig.json ./
COPY apps/api/src ./src

# Сборка TS -> JS
RUN npm run build

# Копируем SQL миграции в dist
RUN cp -r src/db/migrations dist/src/db/

# --- Stage 2: Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Копируем только то, что нужно для запуска
COPY apps/api/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/index.js"]
```

---

## 4. Развертывание фронтенда (`tolk`)

Фронтенд находится в папке `apps/web` репозитория `tolk`.

### 4.1. Сборка приложения
Фронтенд компилируется в статические файлы. Во время сборки нужно указать адрес бэкенда:
* **Вариант 1 (Рекомендуемый):** Если фронтенд и бэкенд будут крутиться на одном домене (например, `tolk.example.com` и проксироваться через Nginx/Caddy), переменные окружения задавать **не нужно**. Код использует `window.location.origin` и `window.location.host` по умолчанию для API и WebSocket.
* **Вариант 2 (Разные домены):** Если фронтенд хостится на `tolk.com`, а бэкенд на `api.tolk.com`, создайте файл `apps/web/.env.production` или передайте переменные сборки:
  ```env
  VITE_API_URL=https://api.tolk.com
  VITE_WS_URL=wss://api.tolk.com/ws
  ```

Сборка на хосте:
```bash
cd apps/web
npm install
npm run build
```
Результатом сборки будет папка `apps/web/dist`, содержащая `index.html`, `assets/` и другие файлы. Эту папку нужно передать на веб-сервер.

---

## 5. Настройка веб-сервера / обратного прокси

Веб-сервер должен решать три задачи:
1. Раздавать статические файлы фронтенда из папки `dist`.
2. Маршрутизировать запросы к API (`/auth`, `/chats`, `/posts`, `/me`, `/media`, `/users`, `/wall`, `/blocks`, `/reports`, `/sessions`) на порт бэкенда (например, `localhost:3000`).
3. Маршрутизировать WebSocket-соединения (`/ws`) на порт бэкенда с обязательным пробросом заголовков `Upgrade` и `Connection`.
4. Для роутинга React Router возвращать `index.html` для любых неизвестных путей (SPA Fallback).

### 5.1. Пример конфигурации Nginx (`nginx.conf`)
Замените `tolk.example.com` на ваш домен, а `/var/www/tolk/dist` на путь к собранному фронтенду.

```nginx
server {
    listen 80;
    server_name tolk.example.com;

    # SSL конфигурация (рекомендуется certbot)
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/tolk.example.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/tolk.example.com/privkey.pem;

    # Корневая папка фронтенда
    root /var/www/tolk/dist;
    index index.html;

    # Обработка SPA роутинга фронтенда
    location / {
        try_files $uri $uri/ /index.html;
    }

    # WebSocket проксирование
    location /ws {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400; # Не закрывать соединение по таймауту
    }

    # API проксирование (список эндпоинтов из бэкенда)
    location ~ ^/(auth|chats|posts|me|media|users|wall|blocks|reports|sessions) {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.2. Пример конфигурации Caddy (`Caddyfile`)
Caddy автоматически получает SSL-сертификаты от Let's Encrypt.

```caddyfile
tolk.example.com {
    # Раздача фронтенда (SPA fallback)
    root * /var/www/tolk/dist
    file_server
    try_files {path} /index.html

    # WebSocket маршрут
    @websockets {
        path /ws*
    }
    reverse_proxy @websockets 127.0.0.1:3000

    # API маршруты
    @api {
        path /auth* /chats* /posts* /me* /media* /users* /wall* /blocks* /reports* /sessions*
    }
    reverse_proxy @api 127.0.0.1:3000
}
```

---

## 6. Продакшн-сборка через Docker Compose (Рекомендуется)

Вы можете запустить всё окружение в Docker. Создайте `docker-compose.prod.yml` в любой папке на сервере:

```yaml
version: '3.8'

services:
  # 1. База данных
  postgres:
    image: postgres:16-alpine
    container_name: tolk-postgres-prod
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_database_password_2026
      POSTGRES_DB: tolk
    volumes:
      - pgdata_prod:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d tolk"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 2. Redis для WS/PubSub/Кэша
  redis:
    image: redis:7-alpine
    container_name: tolk-redis-prod
    restart: always
    volumes:
      - redisdata_prod:/data

  # 3. Локальный S3 MinIO (если не используется внешнее облако)
  minio:
    image: minio/minio
    container_name: tolk-minio-prod
    restart: always
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: secure_minio_password_2026
    command: server /data --console-address ":9001"
    volumes:
      - miniodata_prod:/data

  # Автоматическое создание бакета в MinIO при старте
  createbuckets:
    image: minio/mc
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      until (/usr/bin/mc alias set myminio http://minio:9000 minioadmin secure_minio_password_2026) do echo 'Waiting for MinIO...' && sleep 1; done;
      /usr/bin/mc mb --ignore-existing myminio/tolk-media;
      /usr/bin/mc anonymous set download myminio/tolk-media;
      exit 0;
      "

  # 4. Бэкенд API
  api:
    build:
      context: ./tolk-back
      dockerfile: apps/api/Dockerfile
    container_name: tolk-api-prod
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      NODE_ENV: production
      PORT: 3000
      JWT_SECRET: your_production_jwt_secret_string_here_2026
      DATABASE_URL: postgresql://postgres:secure_database_password_2026@postgres:5432/tolk
      REDIS_URL: redis://redis:6379
      S3_ENDPOINT: http://minio:9000
      S3_BUCKET: tolk-media
      S3_ACCESS_KEY: minioadmin
      S3_SECRET_KEY: secure_minio_password_2026
    ports:
      - "3000:3000"

volumes:
  pgdata_prod:
  redisdata_prod:
  miniodata_prod:
```

---

## 7. Чек-лист для ИИ-агента друга (AI Agent Playbook)

Если ты ИИ-агент, выполняющий деплой проекта:
1. `[ ]` **Проверь доступность баз:** Убедись, что Docker запущен, и контейнеры `postgres` и `redis` работают.
2. `[ ]` **Пропиши Production секрет:** Не оставляй дефолтный `JWT_SECRET` на бэкенде. Сгенерируй длинный случайный ключ.
3. `[ ]` **Проверь сборку бэкенда:** При сборке бэкенда на хосте ОБЯЗАТЕЛЬНО скопируй папку `src/db/migrations` в `dist/src/db/migrations`, иначе миграции базы данных не применятся и сервер упадет.
4. `[ ]` **Проверь S3 бакет:** Убедись, что бакет `tolk-media` создан и его анонимный статус установлен в `download` (публичный доступ), чтобы пользователи могли видеть загруженные картинки.
5. `[ ]` **Собери фронтенд:** Убедись, что фронтенд собран с актуальным хостом в `VITE_API_URL` (если они работают на разных доменах) либо без переменных (если проксируются на одном домене).
6. `[ ]` **Настрой веб-сервер:** Обязательно настрой проброс заголовков `Upgrade` и `Connection` для `/ws`, иначе WebSocket-соединение для отправки сообщений в реальном времени не установится.
7. `[ ]` **Запусти дымовой тест (Smoke Test):** Выполни POST-запрос на `/auth/otp/request` и убедись, что бэкенд возвращает статус `200` или валидный JSON-ответ, что подтверждает работоспособность API и связи с БД.

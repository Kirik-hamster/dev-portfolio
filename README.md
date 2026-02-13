# 🚀 Dev Portfolio (Laravel + React)

Персональное портфолио с блогом, построенное на архитектуре **SOLID**. Включает в себя продвинутый редактор **TipTap** и полноценный **REST API**.

## 🛠 Технологический стек

* **Backend:** Laravel 11 (PHP 8.3)
* **Frontend:** React + Tailwind CSS
* **Editor:** TipTap Rich Text Editor
* **Infrastructure:** Laravel Sail (Docker)

---

## 💻 Быстрый старт (WSL / Linux)

### 1. Подготовка окружения

* **Windows:** Установите **WSL2** и **Docker Desktop**. В настройках Docker включите интеграцию с вашим дистрибутивом WSL.
* **Linux:** Установите **Docker** и **Docker Compose**.

### 2. Клонирование и настройка

Откройте терминал WSL или Linux и выполните:

```bash
# Клонирование репозитория
git clone https://github.com/Kirik-hamster/dev-portfolio
cd dev-portfolio

# Настройка переменных окружения
cp .env.example .env

```

### 3. Установка и запуск (Sail)

Если на хосте не установлен PHP/Composer, используйте временный контейнер для установки зависимостей:

```bash
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php83-composer:latest \
    composer install --ignore-platform-reqs

```

**Запуск проекта:**

```bash
./vendor/bin/sail up -d

```

### 4. Финальная настройка бэкенда

```bash
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail artisan storage:link
./vendor/bin/sail artisan install:api

```

### 5. Запуск фронтенда

```bash
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev

```

Проект будет доступен по адресу: **http://localhost**

---

## 🛠 Основные команды (Cheat Sheet)

| Команда | Описание |
| --- | --- |
| `./vendor/bin/sail up -d` | Запуск всех контейнеров в фоне |
| `./vendor/bin/sail stop` | Остановка контейнеров |
| `./vendor/bin/sail artisan ...` | Выполнение команд Artisan внутри Docker |
| `./vendor/bin/sail npm run dev` | Запуск Vite для разработки |
| `./vendor/bin/sail route:list` | Просмотр всех роутов (включая API) |

---

## 📖 Архитектурные особенности

* **Service Layer**: Вся бизнес-логика вынесена в `ArticleService`.
* **API First**: Взаимодействие фронтенда и бэкенда идет через `ArticleApiService`.
* **Strict Routing**: Роуты разделены на `web.php` (для фронта) и `api.php` (для данных).


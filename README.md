# CS2 Tournament System

Комплексная веб-платформа для организации и управления турнирами по Counter-Strike 2. Система предоставляет полный набор инструментов для регистрации команд, создания турнирных сеток, планирования матчей и отслеживания статистики в реальном времени.

## 🚀 Основные Возможности

### 👤 Пользователи и Профиль
*   **Авторизация через Steam:** Безопасный вход с использованием Steam OpenID.
*   **Профиль Игрока:** Подробная статистика, история матчей, список друзей.
*   **Социальные функции:** Стена профиля, комментарии, лайки, система друзей.
*   **Уведомления:** Система оповещений о приглашениях, матчах и турнирах.

### 🛡️ Команды
*   **Управление Составом:** Создание команд, приглашение игроков, управление ролями (капитан, участник).
*   **Профиль Команды:** Статистика команды, история турниров, логотипы.

### 🏆 Турниры и Матчи
*   **Турнирные Сетки:** Автоматическая генерация и визуализация турнирных сеток.
*   **Лобби:** Система игровых лобби для сбора игроков перед матчем.
*   **Планирование:** Расписание матчей, автоматическое обновление статусов.
*   **Live-статусы:** Обновление информации о матчах в реальном времени через WebSocket.

### 🔧 Администрирование
*   **Панель Управления:** Инструменты для администраторов для управления турнирами и матчами.
*   **Загрузка Файлов:** Система загрузки аватарок и логотипов.

## 🛠 Технологический Стек

### Frontend (Клиентская часть)
*   **Framework:** React 18 (Vite)
*   **Styling:** Tailwind CSS (современный дизайн, анимации)
*   **Animations:** Framer Motion
*   **State Management:** React Context API / Hooks
*   **Routing:** React Router DOM
*   **Real-time:** Socket.io Client
*   **HTTP Client:** Axios

### Backend (Серверная часть)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MySQL (Sequelize ORM)
*   **Caching/Session:** Redis
*   **Real-time:** Socket.io
*   **Authentication:** Passport.js (Steam Strategy), JWT
*   **Validation:** Express Validator
*   **Documentation:** Swagger UI (доступен в режиме разработки)

## 📋 Предварительные Требования

Перед началом работы убедитесь, что у вас установлены:
*   [Node.js](https://nodejs.org/) (версия 18 или выше)
*   [MySQL](https://www.mysql.com/) (версия 8.0 рекомендована)
*   [Redis](https://redis.io/) (для сессий и кэширования)
*   [Git](https://git-scm.com/)

## ⚙️ Установка и Запуск

### 1. Клонирование репозитория

```bash
git clone <url-вашего-репозитория>
cd cs2-tournament-system
```

### 2. Настройка Базы Данных

В корне проекта находится скрипт `database_setup.sql`. Выполните его в вашей MySQL консоли или клиенте (например, Workbench, DBeaver), чтобы создать базу данных и пользователя.

**Важно:** Скрипт создает пользователя `bot` с паролем `123_Kulan`. Если вы используете другие данные, обновите их в файле `.env` позже.

### 3. Настройка Backend

Перейдите в папку backend и установите зависимости:

```bash
cd backend
npm install
```

Создайте файл `.env` в папке `backend` (или в корне, если настроено общее чтение) на основе примера ниже.

**Пример `.env`:**
```env
NODE_ENV=development
PORT=5000

# База Данных
DB_HOST=localhost
DB_USER=bot
DB_PASSWORD=123_Kulan
DB_NAME=bot
DB_PORT=3306

# Redis
REDIS_URL=redis://localhost:6379

# Аутентификация Steam
# Получить ключ: https://steamcommunity.com/dev/apikey
STEAM_API_KEY=ваш_steam_api_key
STEAM_RETURN_URL=http://localhost:5000/api/auth/steam/return
STEAM_REALM=http://localhost:5000/

# Безопасность
JWT_SECRET_KEY=ваш_очень_сложный_секретный_ключ
SESSION_SECRET=секрет_для_сессий_redis

# URL Фронтенда (для CORS)
FRONTEND_URL=http://localhost:5173
```

Запустите миграции для создания таблиц:

```bash
npm run migrate
```

Запустите сервер в режиме разработки:

```bash
npm run dev
```
Сервер запустится на порту `5000`. Документация API будет доступна по адресу `http://localhost:5000/api-docs`.

### 4. Настройка Frontend

Откройте новый терминал, перейдите в папку frontend и установите зависимости:

```bash
cd frontend
npm install
```

Запустите сервер разработки:

```bash
npm run dev
```
Приложение будет доступно по адресу `http://localhost:5173`.

## 📂 Структура Проекта

```
cs2-tournament-system/
├── backend/                # Серверная часть (Node.js/Express)
│   ├── config/             # Конфигурация (БД, Passport, Swagger)
│   ├── controllers/        # Логика обработки запросов
│   ├── middleware/         # Middleware (Auth, Upload, Error)
│   ├── migrations/         # Миграции базы данных Sequelize
│   ├── models/             # Модели данных Sequelize
│   ├── routes/             # Маршруты API
│   ├── utils/              # Вспомогательные функции
│   └── server.js           # Точка входа
│
├── frontend/               # Клиентская часть (React)
│   ├── src/
│   │   ├── components/     # Переиспользуемые UI компоненты
│   │   ├── context/        # Глобальное состояние (AuthContext)
│   │   ├── pages/          # Страницы приложения
│   │   └── App.jsx         # Основной компонент с роутингом
│   └── vite.config.js      # Конфигурация Vite
│
├── database_setup.sql      # SQL скрипт инициализации БД
└── README.md               # Документация проекта
```

## 🤝 Вклад в проект (Contributing)

1.  Форкните репозиторий.
2.  Создайте ветку для вашей функции (`git checkout -b feature/AmazingFeature`).
3.  Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`).
4.  Запушьте ветку (`git push origin feature/AmazingFeature`).
5.  Откройте Pull Request.

## 📄 Лицензия

Этот проект распространяется под лицензией ISC.

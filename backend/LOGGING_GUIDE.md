# Руководство по системе логирования

## Что записывается в `backend/logs`

Ваш проект использует библиотеку **Winston** для логирования. В директорию `logs/` записываются два файла:

### 📄 Файлы логов:

1. **`logs/all.log`** - ВСЕ логи (debug, info, http, warn, error)
2. **`logs/error.log`** - ТОЛЬКО ошибки (error level)

---

## Уровни логирования

```javascript
error: 0,   // ❌ Критические ошибки
warn: 1,    // ⚠️  Предупреждения
info: 2,    // ℹ️  Информационные сообщения
http: 3,    // 🌐 HTTP запросы (от Morgan middleware)
debug: 4,   // 🔍 Отладочная информация
```

### Уровень логирования по окружению:

- **Development** (`NODE_ENV=development`): записывается всё до уровня `debug` (все логи)
- **Production** (`NODE_ENV=production`): записывается только `warn` и `error` (важные логи)

Это настроено в `utils/logger.js` на строке 63:
```javascript
level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
```

---

## Что именно логируется?

### 1. **HTTP Запросы** (Morgan middleware)
В `server.js` (строки 52-65) настроен Morgan для логирования всех HTTP запросов:

```javascript
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }
);
```

**Пример логов:**
```
GET /api/dashboard 200 1234 - 45.2 ms
POST /api/auth/login 401 89 - 12.5 ms
```

### 2. **Ошибки приложения**
Любые ошибки, которые вы логируете через `logger.error()`:

```javascript
const logger = require('./utils/logger');

try {
  // ... код
} catch (error) {
  logger.error('Failed to process request:', error);
}
```

### 3. **Информационные сообщения**
Например, при старте сервера:
```javascript
logger.info('Server started on port 5000');
```

---

## Зависимости

### ✅ Уже установлено в `package.json`:

```json
"dependencies": {
  "morgan": "^1.10.1",      // HTTP request logger
  "winston": "^3.19.0"      // Logging library
}
```

### На сервере нужно:

**Ничего дополнительно устанавливать НЕ нужно!** 

При выполнении `npm install` на сервере, все зависимости (включая `winston` и `morgan`) уже будут установлены.

---

## Проверка логов на боевом сервере

### 1. Проверить, создаётся ли директория `logs/`:

```bash
cd /www/wwwroot/cs2tournaments.asia/user_site/backend
ls -la logs/
```

Если директория не существует, она будет **создана автоматически** при первом запуске сервера.

### 2. Посмотреть логи в реальном времени:

```bash
# Все логи
tail -f logs/all.log

# Только ошибки
tail -f logs/error.log
```

### 3. Посмотреть последние N строк:

```bash
# Последние 50 строк всех логов
tail -n 50 logs/all.log

# Последние 20 ошибок
tail -n 20 logs/error.log
```

### 4. Поиск по логам:

```bash
# Найти все ошибки за сегодня
grep "2025-12-16" logs/error.log

# Найти все 500 ошибки
grep "500" logs/all.log

# Найти логи связанные с базой данных
grep -i "database" logs/all.log
```

---

## Формат логов

### В консоли (Development):
```
2025-12-16 02:26:15:ms info: ✅ Database connection established successfully.
2025-12-16 02:26:15:ms http: GET /api/health 200 - 45.2 ms
2025-12-16 02:26:16:ms error: ❌ Unable to connect
```

### В файлах (JSON формат):
```json
{
  "level": "error",
  "message": "Unable to connect to database",
  "timestamp": "2025-12-16 02:26:15:123",
  "stack": "Error: connect ECONNREFUSED...\n    at TCPConnectWrap.afterConnect..."
}
```

---

## Ротация логов (рекомендация)

⚠️ **Важно!** Логи могут занимать много места. Рекомендуется настроить ротацию логов.

### Установить winston-daily-rotate-file:

```bash
npm install winston-daily-rotate-file
```

### Обновить `utils/logger.js`:

```javascript
const DailyRotateFile = require('winston-daily-rotate-file');

const transports = [
    new winston.transports.Console(),
    
    // Ротация для ошибок
    new DailyRotateFile({
        filename: path.join(__dirname, '../logs/error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d', // Хранить 14 дней
        format: winston.format.combine(
            winston.format.uncolorize(),
            winston.format.json()
        )
    }),
    
    // Ротация для всех логов
    new DailyRotateFile({
        filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
            winston.format.uncolorize(),
            winston.format.json()
        )
    })
];
```

---

## Текущее состояние

### ✅ Что работает СЕЙЧАС:

1. ✅ Winston установлен (`"winston": "^3.19.0"`)
2. ✅ Morgan установлен (`"morgan": "^1.10.1"`)
3. ✅ Logger настроен (`utils/logger.js`)
4. ✅ Логируются HTTP запросы (Morgan middleware)
5. ✅ Записываются в файлы:
   - `logs/all.log` (785 KB на вашем тестовом сервере)
   - `logs/error.log`

### ⚠️ Что можно улучшить:

1. ⚠️ Настроить ротацию логов (чтобы не росли бесконечно)
2. ⚠️ Добавить больше логирования в критичных местах бизнес-логики
3. ⚠️ Настроить отправку критичных ошибок в систему мониторинга (Sentry, LogRocket и т.д.)

---

## Быстрые команды

```bash
# Проверить размер логов
du -sh logs/

# Очистить старые логи
> logs/all.log
> logs/error.log

# Или удалить логи старше 7 дней
find logs/ -name "*.log" -mtime +7 -delete
```

---

## Пример использования в коде

```javascript
const logger = require('./utils/logger');

// Info
logger.info('User logged in', { userId: 123 });

// Warning
logger.warn('High memory usage detected');

// Error
logger.error('Database query failed', { 
  query: 'SELECT * FROM users',
  error: error.message 
});

// Debug (только в development)
logger.debug('Processing payment', { amount: 100 });
```

---

## Итог

✅ **Все зависимости уже установлены**  
✅ **Логи автоматически записываются в `backend/logs/`**  
✅ **На сервере ничего дополнительно устанавливать НЕ нужно**  

Просто выполните `npm install` после деплоя кода, и система логирования будет работать автоматически!

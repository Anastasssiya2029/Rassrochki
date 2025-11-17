# Backend API для Системы Управления Рассрочками

## Быстрый старт

### 1. Установка зависимостей

```bash
cd backend-example
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

⚠️ **ВАЖНО**: Измените `JWT_SECRET` на случайную строку!

```bash
# Для генерации безопасного секрета:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Инициализация базы данных

Создайте таблицы в PostgreSQL:

```bash
npm run init-db
```

### 4. Запуск сервера

```bash
# Продакшен
npm start

# Разработка (с автоперезагрузкой)
npm run dev
```

Сервер запустится на `http://localhost:3001`

## Структура базы данных

### Таблицы:
- `schools` - Школы
- `users` - Пользователи
- `clients` - Клиенты
- `payments` - Платежи
- `overdue_history` - История переносов платежей

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход

### Школы
- `GET /api/schools` - Список школ (Архитектор)
- `GET /api/schools/:id` - Информация о школе

### Клиенты
- `GET /api/schools/:schoolId/clients` - Список клиентов
- `POST /api/schools/:schoolId/clients` - Создать клиента
- `PUT /api/schools/:schoolId/clients/:id` - Обновить клиента
- `PATCH /api/schools/:schoolId/clients/:id/payments/:index` - Обновить платеж
- `POST /api/schools/:schoolId/clients/:id/payments/:index/postpone` - Перенести платеж

## Подключение фронтенда

В фронтенд проекте создайте файл `.env`:

```
REACT_APP_API_URL=http://localhost:3001/api
```

Для продакшена замените на адрес вашего сервера:

```
REACT_APP_API_URL=https://yourdomain.com/api
```

## Безопасность

✅ **Реализовано:**
- JWT токены для аутентификации
- Bcrypt для хеширования паролей
- Проверка прав доступа на уровне API
- CORS настроен

⚠️ **Для продакшена добавьте:**
- HTTPS (SSL/TLS)
- Rate limiting (например, express-rate-limit)
- Helmet.js для безопасности headers
- Валидация входных данных (например, joi)
- Логирование (например, winston)
- Мониторинг ошибок (например, Sentry)

## Деплой

### Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### VPS (Ubuntu)
```bash
# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Клонируйте проект
git clone your-repo
cd backend-example
npm install

# Используйте PM2 для запуска
npm install -g pm2
pm2 start server.js --name vrassrochki-api
pm2 startup
pm2 save
```

## Тестирование API

Используйте Postman, Insomnia или curl:

```bash
# Регистрация
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "name": "Test Admin",
    "schoolName": "Test School"
  }'

# Вход
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'

# Получить клиентов (с токеном)
curl http://localhost:3001/api/schools/SCHOOL_ID/clients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Помощь и поддержка

При возникновении проблем:
1. Проверьте подключение к PostgreSQL
2. Убедитесь, что все таблицы созданы (`npm run init-db`)
3. Проверьте логи сервера
4. Убедитесь, что порт 3001 не занят

## Лицензия

Proprietary

# 🚀 Руководство по Развертыванию

## Ваша PostgreSQL база данных

```
Host: 194.87.215.84
Port: 5432
User: gen_user
Password: XHz-?+<i9P3;wI
Database: data_vrassrochki
```

---

## Вариант 1: Быстрый запуск (5 минут)

### Шаг 1: Установите Node.js
```bash
# Проверьте установлен ли Node.js
node --version

# Если нет, скачайте с https://nodejs.org/ (версия 18 или выше)
```

### Шаг 2: Инициализируйте бэкенд
```bash
# Перейдите в папку с бэкендом
cd backend-example

# Установите зависимости
npm install

# Создайте файл .env
cp .env.example .env

# Отредактируйте .env и измените JWT_SECRET
# Можете сгенерировать его командой:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Шаг 3: Создайте таблицы в базе данных
```bash
npm run init-db
```

Вы увидите:
```
✅ Таблица schools создана
✅ Таблица users создана
✅ Таблица clients создана
✅ Таблица payments создана
✅ Таблица overdue_history создана
```

### Шаг 4: Запустите API сервер
```bash
npm run dev
```

Сервер запустится на `http://localhost:3001` 🎉

### Шаг 5: Подключите фронтенд
В корне фронтенд-проекта создайте файл `.env.local`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

Перезапустите фронтенд - теперь он работает с реальной базой данных!

---

## Вариант 2: Деплой на VPS (Ubuntu)

### 1. Подключитесь к серверу
```bash
ssh user@your-server.com
```

### 2. Установите Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Клонируйте проект
```bash
git clone your-repository-url
cd your-project/backend-example
```

### 4. Установите зависимости и настройте
```bash
npm install
cp .env.example .env
nano .env  # Отредактируйте настройки
```

### 5. Инициализируйте базу
```bash
npm run init-db
```

### 6. Установите PM2 для управления процессом
```bash
sudo npm install -g pm2
pm2 start server.js --name vrassrochki-api
pm2 startup
pm2 save
```

### 7. Настройте Nginx (опционально)
```bash
sudo apt install nginx

# Создайте конфиг
sudo nano /etc/nginx/sites-available/vrassrochki
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vrassrochki /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Настройте SSL с Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Вариант 3: Деплой на Heroku

### 1. Установите Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Войдите и создайте приложение
```bash
heroku login
cd backend-example
heroku create vrassrochki-api
```

### 3. Не нужно добавлять PostgreSQL от Heroku - у вас уже есть!
Просто установите переменные окружения:

```bash
heroku config:set POSTGRESQL_HOST=194.87.215.84
heroku config:set POSTGRESQL_PORT=5432
heroku config:set POSTGRESQL_USER=gen_user
heroku config:set POSTGRESQL_PASSWORD="XHz-?+<i9P3;wI"
heroku config:set POSTGRESQL_DBNAME=data_vrassrochki
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

### 4. Деплой
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### 5. Инициализируйте базу
```bash
heroku run npm run init-db
```

### 6. Откройте приложение
```bash
heroku open
```

URL вашего API: `https://vrassrochki-api.herokuapp.com/api`

---

## Вариант 4: Деплой с Docker

### 1. Создайте Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend-example/package*.json ./
RUN npm ci --production
COPY backend-example/ .
EXPOSE 3001
CMD ["npm", "start"]
```

### 2. Соберите образ
```bash
docker build -t vrassrochki-api .
```

### 3. Запустите контейнер
```bash
docker run -d \
  -p 3001:3001 \
  -e POSTGRESQL_HOST=194.87.215.84 \
  -e POSTGRESQL_PORT=5432 \
  -e POSTGRESQL_USER=gen_user \
  -e POSTGRESQL_PASSWORD="XHz-?+<i9P3;wI" \
  -e POSTGRESQL_DBNAME=data_vrassrochki \
  -e JWT_SECRET=your-secret-here \
  --name vrassrochki-api \
  vrassrochki-api
```

---

## Проверка работы API

### Тест с curl:

```bash
# Регистрация
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "schoolName": "Test School"
  }'

# Вход
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## Подключение фронтенда к API

### Локальная разработка
Создайте `.env.local` в корне фронтенда:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Продакшен
```env
REACT_APP_API_URL=https://yourdomain.com/api
```

Перезапустите фронтенд:
```bash
npm start
```

---

## Миграция данных из моков в БД

Если у вас уже есть данные в моках, создайте скрипт миграции:

```javascript
// migrate-data.js
const { Pool } = require('pg');
const MOCK_CLIENTS = require('./mock-data.json');

async function migrate() {
  const pool = new Pool({ /* ваши настройки */ });
  
  for (const client of MOCK_CLIENTS) {
    await pool.query(
      'INSERT INTO clients (...) VALUES (...)',
      [/* данные клиента */]
    );
  }
  
  console.log('Миграция завершена!');
}

migrate();
```

---

## Мониторинг и логи

### PM2 (VPS)
```bash
pm2 logs vrassrochki-api
pm2 status
pm2 restart vrassrochki-api
```

### Heroku
```bash
heroku logs --tail -a vrassrochki-api
```

### Docker
```bash
docker logs -f vrassrochki-api
```

---

## Безопасность

✅ **Обязательно:**
1. Измените JWT_SECRET на случайную строку
2. Используйте HTTPS в продакшене
3. Настройте firewall на сервере
4. Регулярно обновляйте зависимости
5. Делайте бэкапы базы данных

⚠️ **Рекомендуется:**
1. Добавьте rate limiting
2. Настройте мониторинг (Sentry, Datadog)
3. Используйте переменные окружения для всех секретов
4. Настройте автоматические бэкапы PostgreSQL

---

## Помощь

### Частые проблемы:

**"Connection refused" к PostgreSQL**
- Проверьте firewall: `sudo ufw allow 5432`
- Убедитесь что PostgreSQL принимает внешние соединения
- Проверьте `pg_hba.conf`

**"JWT malformed"**
- Очистите localStorage в браузере
- Перезапустите API сервер

**Таблицы не создаются**
- Проверьте права пользователя в PostgreSQL
- Запустите `npm run init-db` еще раз

---

## Готово! 🎉

Теперь ваше приложение работает с реальной PostgreSQL базой данных!

Следующие шаги:
1. Создайте первого пользователя через регистрацию
2. Добавьте клиентов
3. Настройте бэкапы
4. Настройте мониторинг

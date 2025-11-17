# 🔌 Подключение к Вашей PostgreSQL Базе Данных

## ✅ Ваши данные уже готовы!

```
📊 PostgreSQL Database
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Host:     194.87.215.84
Port:     5432
User:     gen_user
Password: XHz-?+<i9P3;wI
Database: data_vrassrochki
```

---

## 🚀 Вариант 1: Локальный запуск (5 минут)

### Шаг 1: Установите Node.js
Скачайте с https://nodejs.org/ (версия 18 или выше)

Проверьте установку:
```bash
node --version
npm --version
```

### Шаг 2: Настройте бэкенд
```bash
# Перейдите в папку backend
cd backend-example

# Установите зависимости
npm install
```

### Шаг 3: Создайте файл .env
```bash
# Скопируйте пример
cp .env.example .env
```

Откройте `.env` и установите:
```env
POSTGRESQL_HOST=194.87.215.84
POSTGRESQL_PORT=5432
POSTGRESQL_USER=gen_user
POSTGRESQL_PASSWORD=XHz-?+<i9P3;wI
POSTGRESQL_DBNAME=data_vrassrochki

# Сгенерируйте новый JWT секрет
JWT_SECRET=ВСТАВЬТЕ_СЮДА_СЛУЧАЙНУЮ_СТРОКУ

PORT=3001
```

**Сгенерируйте JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Шаг 4: Создайте таблицы в базе
```bash
npm run init-db
```

Вы увидите:
```
🔧 Создание таблиц...
✅ Таблица schools создана
✅ Таблица users создана
✅ Таблица clients создана
✅ Таблица payments создана
✅ Таблица overdue_history создана

✅ База данных успешно инициализирована!
```

### Шаг 5: Запустите API сервер
```bash
npm run dev
```

Вы увидите:
```
🚀 Server is running on port 3001
📊 Connected to PostgreSQL database: data_vrassrochki
```

### Шаг 6: Подключите фронтенд
В **корневой папке проекта** (не в backend-example) создайте файл `.env.local`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Шаг 7: Перезапустите фронтенд
```bash
npm start
```

### ✅ Готово!
Откройте http://localhost:3000

Badge "Demo Mode" исчезнет - вы работаете с реальной базой данных! 🎉

---

## 🌐 Вариант 2: Деплой на VPS/Сервер

### Подготовка сервера (Ubuntu/Debian)
```bash
# Подключитесь к серверу
ssh user@your-server.com

# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверьте версию
node --version  # должно быть v18 или выше
```

### Установка приложения
```bash
# Клонируйте ваш репозиторий
git clone your-repository-url
cd your-project

# Установите зависимости бэкенда
cd backend-example
npm install

# Создайте .env
cp .env.example .env
nano .env  # вставьте ваши настройки PostgreSQL
```

### Инициализируйте базу данных
```bash
npm run init-db
```

### Запустите с PM2
```bash
# Установите PM2 глобально
sudo npm install -g pm2

# Запустите сервер
pm2 start server.js --name vrassrochki-api

# Настройте автозапуск
pm2 startup
pm2 save

# Проверьте статус
pm2 status
pm2 logs vrassrochki-api
```

### Настройте Nginx (для доступа через домен)
```bash
sudo apt install nginx

# Создайте конфигурацию
sudo nano /etc/nginx/sites-available/vrassrochki
```

Вставьте:
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

    # Для фронтенда (если деплоите на том же сервере)
    location / {
        root /path/to/your/frontend/build;
        try_files $uri /index.html;
    }
}
```

Активируйте:
```bash
sudo ln -s /etc/nginx/sites-available/vrassrochki /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Добавьте SSL (HTTPS)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run  # проверка автообновления
```

### Настройка фронтенда для продакшена
Создайте `.env.production`:
```env
REACT_APP_API_URL=https://yourdomain.com/api
```

Соберите фронтенд:
```bash
npm run build
```

---

## ☁️ Вариант 3: Деплой на Heroku

### Установка Heroku CLI
```bash
# macOS
brew install heroku/brew/heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Скачайте установщик с https://devcenter.heroku.com/articles/heroku-cli
```

### Деплой бэкенда
```bash
cd backend-example

# Войдите в Heroku
heroku login

# Создайте приложение
heroku create vrassrochki-api

# Установите переменные окружения
heroku config:set POSTGRESQL_HOST=194.87.215.84
heroku config:set POSTGRESQL_PORT=5432
heroku config:set POSTGRESQL_USER=gen_user
heroku config:set POSTGRESQL_PASSWORD="XHz-?+<i9P3;wI"
heroku config:set POSTGRESQL_DBNAME=data_vrassrochki
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Деплой
git init
git add .
git commit -m "Initial backend deploy"
heroku git:remote -a vrassrochki-api
git push heroku main

# Инициализируйте базу данных
heroku run npm run init-db

# Проверьте логи
heroku logs --tail
```

URL вашего API: `https://vrassrochki-api.herokuapp.com/api`

### Деплой фронтенда на Vercel/Netlify
```bash
# Установите Vercel CLI
npm install -g vercel

# Деплой
vercel

# При деплое добавьте переменную окружения:
# REACT_APP_API_URL = https://vrassrochki-api.herokuapp.com/api
```

---

## 🧪 Проверка подключения

### Тест 1: Проверка API
```bash
curl http://localhost:3001/api/auth/login
```

Должны увидеть JSON ответ от сервера.

### Тест 2: Регистрация
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "schoolName": "Test School"
  }'
```

Должны получить токен и данные пользователя.

### Тест 3: Вход через фронтенд
1. Откройте приложение
2. Нажмите "Зарегистрироваться"
3. Заполните форму
4. После успешной регистрации - вы увидите dashboard
5. Badge "Demo Mode" должен исчезнуть

---

## 📊 Проверка таблиц в базе данных

Подключитесь к PostgreSQL:
```bash
psql -h 194.87.215.84 -p 5432 -U gen_user -d data_vrassrochki
```

Проверьте таблицы:
```sql
-- Список таблиц
\dt

-- Должны увидеть:
-- schools
-- users
-- clients
-- payments
-- overdue_history

-- Проверьте структуру
\d users
\d schools
\d clients

-- Посмотрите данные
SELECT * FROM schools;
SELECT * FROM users;
SELECT * FROM clients;
```

---

## 🔧 Устранение проблем

### ❌ "Connection refused" к PostgreSQL

**Проблема:** Не удается подключиться к базе

**Решение:**
1. Проверьте firewall на сервере БД:
```bash
sudo ufw status
sudo ufw allow 5432/tcp
```

2. Проверьте что PostgreSQL слушает внешние подключения:
```bash
# В postgresql.conf
listen_addresses = '*'

# В pg_hba.conf добавьте
host all all 0.0.0.0/0 md5
```

3. Перезапустите PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### ❌ "Permission denied" при создании таблиц

**Проблема:** Пользователь не может создавать таблицы

**Решение:**
```sql
-- Подключитесь как суперпользователь
GRANT ALL PRIVILEGES ON DATABASE data_vrassrochki TO gen_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO gen_user;
```

### ❌ Фронтенд показывает "Demo Mode"

**Проблема:** Не подключается к API

**Решение:**
1. Проверьте что `.env.local` создан в корне проекта
2. Проверьте что в нём есть `REACT_APP_API_URL`
3. Перезапустите фронтенд: `npm start`
4. Очистите кеш браузера

### ❌ "JWT malformed" ошибка

**Проблема:** Проблемы с токеном

**Решение:**
1. Очистите localStorage в браузере:
```javascript
// В консоли браузера (F12)
localStorage.clear()
```
2. Перезапустите API сервер
3. Перелогиньтесь

### ❌ "Cannot find module" при запуске

**Проблема:** Не установлены зависимости

**Решение:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 Мониторинг

### Логи PM2
```bash
pm2 logs vrassrochki-api
pm2 monit
```

### Логи Heroku
```bash
heroku logs --tail -a vrassrochki-api
```

### Проверка подключений к PostgreSQL
```sql
-- В psql
SELECT * FROM pg_stat_activity WHERE datname = 'data_vrassrochki';
```

---

## 🔐 Безопасность

### ✅ Чек-лист
- [ ] JWT_SECRET изменен на случайную строку
- [ ] HTTPS настроен (SSL сертификат)
- [ ] Firewall настроен
- [ ] PostgreSQL доступен только с нужных IP
- [ ] Пароли не в git репозитории (.env в .gitignore)
- [ ] Регулярные бэкапы базы данных
- [ ] Rate limiting добавлен
- [ ] Логирование настроено

### Бэкапы базы данных
```bash
# Создать бэкап
pg_dump -h 194.87.215.84 -U gen_user -d data_vrassrochki > backup.sql

# Восстановить из бэкапа
psql -h 194.87.215.84 -U gen_user -d data_vrassrochki < backup.sql

# Автоматический бэкап (cron)
0 2 * * * pg_dump -h 194.87.215.84 -U gen_user -d data_vrassrochki > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## 📞 Помощь

### Полезные команды

**Проверка подключения к PostgreSQL:**
```bash
nc -zv 194.87.215.84 5432
telnet 194.87.215.84 5432
```

**Проверка работы API:**
```bash
curl http://localhost:3001/health
```

**Перезапуск всего:**
```bash
# PM2
pm2 restart vrassrochki-api

# Heroku
heroku restart -a vrassrochki-api

# Docker
docker restart vrassrochki-api
```

### Документация
- [QUICKSTART.md](./QUICKSTART.md) - Быстрый старт
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Подробный деплой
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API документация
- [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) - Архитектура системы

---

## ✅ Готово!

После выполнения этих шагов:
1. ✅ Бэкенд подключен к вашей PostgreSQL
2. ✅ Таблицы созданы
3. ✅ API работает
4. ✅ Фронтенд использует реальную БД
5. ✅ Badge "Demo Mode" исчез

**Начните использовать:**
1. Зарегистрируйте первую школу
2. Создайте менеджеров
3. Добавьте клиентов
4. Управляйте рассрочками

🎉 Успехов с вашей системой управления рассрочками!

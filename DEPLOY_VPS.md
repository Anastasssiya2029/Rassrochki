# Руководство по развёртыванию на VPS

Данный документ содержит пошаговую инструкцию по развёртыванию приложения на VPS-сервере с доменом vn-rassrochki.ru.

## Требования

- VPS с Ubuntu 20.04+ или Debian 11+
- Минимум 1GB RAM, 20GB диск
- Node.js 18+ 
- Nginx
- SSL-сертификат (Let's Encrypt)
- Домен vn-rassrochki.ru с настроенными DNS-записями

## 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Установка Nginx
sudo apt install -y nginx

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Установка Certbot для SSL
sudo apt install -y certbot python3-certbot-nginx
```

## 2. Клонирование репозитория

```bash
# Создание директории для приложения
sudo mkdir -p /var/www/rassrochki
sudo chown $USER:$USER /var/www/rassrochki

# Клонирование репозитория
cd /var/www/rassrochki
git clone https://github.com/Anastasssiya2029/Rassrochki.git .
```

## 3. Настройка переменных окружения

Создайте файл `/var/www/rassrochki/.env`:

```bash
# Скопируйте пример
cp .env.example .env

# Отредактируйте переменные
nano .env
```

Содержимое `.env`:

```env
# PostgreSQL - ваша внешняя база данных
POSTGRESQL_HOST=194.87.215.84
POSTGRESQL_PORT=5432
POSTGRESQL_USER=gen_user
POSTGRESQL_PASSWORD=ваш_пароль
POSTGRESQL_DBNAME=data_vrassrochki
POSTGRESQL_SCHEMA=payment_tracking

# JWT (сгенерируйте уникальный секрет)
JWT_SECRET=ваш_уникальный_секретный_ключ_минимум_32_символа

# Порт для backend
PORT=3001

# URL для production (после настройки домена)
VITE_API_URL=https://vn-rassrochki.ru/api
```

Генерация JWT секрета:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Установка зависимостей и сборка

```bash
cd /var/www/rassrochki

# Установка зависимостей frontend
npm ci

# Сборка frontend для production (с переменными окружения)
# Убедитесь, что .env содержит VITE_API_URL
npm run build

# Установка зависимостей backend
cd src/backend-example
npm ci
```

**Важно**: JWT_SECRET обязателен для запуска. Без него backend не запустится.

## 5. Настройка PM2

Создайте файл `ecosystem.config.js`:

```bash
nano /var/www/rassrochki/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'rassrochki-backend',
      script: 'src/backend-example/server.js',
      cwd: '/var/www/rassrochki',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
```

Запуск приложения:
```bash
cd /var/www/rassrochki
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # следуйте инструкциям для автозапуска
```

## 6. Настройка Nginx

Создайте конфигурацию Nginx:

```bash
sudo nano /etc/nginx/sites-available/rassrochki
```

```nginx
server {
    listen 80;
    server_name vn-rassrochki.ru www.vn-rassrochki.ru;
    
    # Перенаправление на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vn-rassrochki.ru www.vn-rassrochki.ru;

    # SSL настройки (будут автоматически добавлены Certbot)
    
    # Путь к frontend build
    root /var/www/rassrochki/dist;
    index index.html;

    # Отключение кэширования для SPA
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";

    # API прокси
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";
}
```

Активация конфигурации:
```bash
sudo ln -s /etc/nginx/sites-available/rassrochki /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Получение SSL-сертификата

```bash
# Убедитесь, что DNS A-запись указывает на IP вашего VPS
sudo certbot --nginx -d vn-rassrochki.ru -d www.vn-rassrochki.ru

# Автоматическое обновление сертификатов
sudo certbot renew --dry-run
```

## 8. Настройка Firewall

```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

## 9. Инициализация базы данных

Если база данных ещё не инициализирована:

```bash
cd /var/www/rassrochki/src/backend-example
node init-database.js
node create-architect.js  # создание первого пользователя
```

## 10. Проверка работоспособности

```bash
# Проверка PM2
pm2 status

# Логи backend
pm2 logs rassrochki-backend

# Проверка Nginx
sudo nginx -t
sudo systemctl status nginx

# Тестовый запрос к API
curl https://vn-rassrochki.ru/api/health
```

## Обновление приложения

```bash
cd /var/www/rassrochki
git pull origin main
npm install
npm run build
pm2 restart rassrochki-backend
```

## Полезные команды

```bash
# Перезапуск backend
pm2 restart rassrochki-backend

# Логи в реальном времени
pm2 logs

# Перезапуск Nginx
sudo systemctl restart nginx

# Проверка SSL
sudo certbot certificates
```

## Резервное копирование

Рекомендуется настроить автоматическое резервное копирование базы данных:

```bash
# Создать скрипт backup.sh
pg_dump -h 194.87.215.84 -U gen_user -d data_vrassrochki > /backups/rassrochki_$(date +%Y%m%d).sql
```

## Мониторинг

Для мониторинга рекомендуется:
- PM2 Plus (веб-интерфейс PM2)
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`

## Troubleshooting

### API возвращает 502 Bad Gateway
```bash
pm2 status                    # проверить что backend запущен
pm2 logs rassrochki-backend   # проверить логи на ошибки
```

### Ошибка подключения к PostgreSQL
```bash
# Проверить подключение из VPS к базе
psql -h 194.87.215.84 -U gen_user -d data_vrassrochki
```

### SSL сертификат истёк
```bash
sudo certbot renew
```

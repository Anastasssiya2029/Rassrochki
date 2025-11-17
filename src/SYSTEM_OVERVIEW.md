# 🏗️ Архитектура Системы Управления Рассрочками

## 📊 Общая структура

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Login/Signup │  │  Dashboard   │  │  Role-based UI  │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                          ↕                                   │
│                    API Service Layer                         │
└──────────────────────────│──────────────────────────────────┘
                           │
                           ↕ HTTPS/REST API
                           │
┌──────────────────────────│──────────────────────────────────┐
│                    BACKEND (Node.js + Express)               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Auth (JWT)   │  │ Authorization│  │  Business Logic │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                          ↕                                   │
└──────────────────────────│──────────────────────────────────┘
                           │
                           ↕ SQL Queries
                           │
┌──────────────────────────│──────────────────────────────────┐
│               POSTGRESQL DATABASE                            │
│  194.87.215.84:5432 / data_vrassrochki                      │
│                                                              │
│  ┌────────┐  ┌────────┐  ┌─────────┐  ┌──────────────┐    │
│  │ users  │  │schools │  │ clients │  │   payments   │    │
│  └────────┘  └────────┘  └─────────┘  └──────────────┘    │
│                                                              │
│  ┌────────────────────┐                                     │
│  │  overdue_history   │                                     │
│  └────────────────────┘                                     │
└──────────────────────────────────────────────────────────────┘
```

## 🎭 Система ролей

### 🏛️ Архитектор (Architect)
**Супер-администратор всей системы**

✅ Может:
- Видеть все школы
- Выбирать любую школу для работы
- Полный доступ ко всем данным
- Управлять всеми школами

❌ Не привязан к конкретной школе

**Use case:** Владелец SaaS платформы

---

### 👑 Администратор (Admin)
**Владелец школы**

✅ Может:
- Видеть только свою школу
- Добавлять/редактировать всех клиентов
- Управлять менеджерами
- Просматривать все данные школы
- Добавлять пользователей в свою школу

❌ Не видит другие школы

**Use case:** Владелец онлайн-школы

---

### 👤 Менеджер (Manager)
**Менеджер по продажам**

✅ Может:
- Видеть только своих клиентов
- Добавлять новых клиентов (автоматически закрепляются за ним)
- Редактировать своих клиентов
- Управлять платежами своих клиентов
- Переносить платежи

❌ Не видит клиентов других менеджеров

**Use case:** Менеджер по продажам школы

---

### 🤝 Помощник администратора (Assistant)
**Ассистент/бухгалтер**

✅ Может:
- Просматривать всех клиентов школы
- Редактировать данные клиентов
- Управлять платежами
- Переносить платежи

❌ Не может добавлять новых клиентов

**Use case:** Бухгалтер или помощник владельца

---

## 🔐 Система безопасности

### Аутентификация
- **JWT токены** с 7-дневным сроком действия
- **Bcrypt** для хеширования паролей (10 раундов)
- **HttpOnly cookies** (опционально, сейчас localStorage)

### Авторизация
- Проверка роли на каждом endpoint
- Проверка принадлежности данных к школе пользователя
- Row-level security через SQL запросы

### Мультитенантность
- Каждая школа изолирована через `school_id`
- Менеджеры видят только своих клиентов через фильтрацию

---

## 📁 Структура базы данных

### 🏫 schools
```sql
id          UUID PRIMARY KEY
name        VARCHAR(255)
created_at  TIMESTAMP
```

### 👥 users
```sql
id             UUID PRIMARY KEY
email          VARCHAR(255) UNIQUE
password_hash  VARCHAR(255)
name           VARCHAR(255)
role           VARCHAR(50) -- architect/admin/manager/assistant
school_id      UUID → schools(id)
created_at     TIMESTAMP
```

### 🎯 clients
```sql
id                  UUID PRIMARY KEY
school_id           UUID → schools(id)
name                VARCHAR(255)
username            VARCHAR(255)
tariff              VARCHAR(255)
total_amount        DECIMAL(10,2)
prepayment          DECIMAL(10,2)
prepayment_date     DATE
installment_start   DATE
installment_end     DATE
manager             VARCHAR(255)
status              VARCHAR(50) -- reliable/unreliable
created_at          TIMESTAMP
```

### 💰 payments
```sql
id               UUID PRIMARY KEY
client_id        UUID → clients(id)
date             DATE
amount           DECIMAL(10,2)
paid             BOOLEAN
original_date    DATE (если был перенос)
postpone_reason  TEXT
created_at       TIMESTAMP
```

### 📋 overdue_history
```sql
id              UUID PRIMARY KEY
client_id       UUID → clients(id)
original_date   DATE
postponed_date  DATE
reason          TEXT
amount          DECIMAL(10,2)
created_at      TIMESTAMP
```

---

## 🔄 Поток данных

### Регистрация новой школы
```
User → Frontend → POST /api/auth/register
                 ↓
              Backend создает:
              1. schools record
              2. users record (role: admin)
              3. JWT token
                 ↓
              Frontend сохраняет:
              - user в localStorage
              - school в localStorage
              - token в localStorage
```

### Добавление клиента менеджером
```
Manager → Frontend → POST /api/schools/:id/clients
                    ↓
                 Backend проверяет:
                 1. JWT token валиден?
                 2. Пользователь = manager?
                 3. school_id совпадает?
                    ↓
                 Backend создает:
                 1. clients record (manager = current_user)
                 2. payments records
                    ↓
                 Frontend обновляет UI
```

### Фильтрация клиентов
```
Frontend определяет роль:
├─ Architect → видит всех клиентов выбранной школы
├─ Admin     → видит всех клиентов своей школы
├─ Manager   → видит только client.manager = user.name
└─ Assistant → видит всех клиентов своей школы
```

---

## 🎨 UI/UX Особенности

### 3D дизайн
- Объемные карточки с тенями (`shadow-3d`)
- Градиентные кнопки
- Плавные анимации
- Минималистичный стиль Apple

### Адаптивность ролей
- Менеджеры не видят фильтр менеджеров
- Помощники не видят кнопку "Добавить клиента"
- Архитектор видит селектор школ

### Индикаторы
- **Demo Mode** badge - показывает что используются моки
- Бейджи ролей с иконками и цветами
- Статусы клиентов: 💗 (надежный) / 💔 (ненадежный)

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register    - Регистрация
POST   /api/auth/login       - Вход
POST   /api/auth/logout      - Выход
```

### Schools
```
GET    /api/schools                    - Все школы (Архитектор)
GET    /api/schools/:schoolId          - Одна школа
```

### Clients
```
GET    /api/schools/:id/clients                          - Список клиентов
POST   /api/schools/:id/clients                          - Создать
PUT    /api/schools/:id/clients/:clientId                - Обновить
PATCH  /api/schools/:id/clients/:clientId/payments/:idx  - Оплатить
POST   /api/schools/:id/clients/:clientId/payments/:idx/postpone - Перенести
```

---

## 🚀 Режимы работы

### Demo Mode (без бэкенда)
```javascript
USE_MOCK_API = !process.env.REACT_APP_API_URL
```

**Когда включен:**
- Демо-пользователи (architect/admin/manager)
- 3 моковые школы
- 8 тестовых клиентов
- Данные в localStorage
- Badge "Demo Mode"

**Для включения:** не создавайте `.env.local` или оставьте `REACT_APP_API_URL` пустым

### Production Mode (с бэкендом)
**Когда включен:**
- Реальная PostgreSQL база
- JWT аутентификация
- Данные персистентны между сессиями
- Мультитенантность

**Для включения:** создайте `.env.local`:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

---

## 📦 Технологический стек

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Tailwind CSS 4** - стилизация
- **Shadcn/ui** - компоненты
- **Lucide React** - иконки
- **Recharts** - графики

### Backend
- **Node.js 18+** - runtime
- **Express** - веб-фреймворк
- **pg** - PostgreSQL клиент
- **bcrypt** - хеширование паролей
- **jsonwebtoken** - JWT токены
- **cors** - CORS middleware

### Database
- **PostgreSQL 14+** - реляционная БД
- **UUID** - primary keys
- **Cascade deletes** - целостность данных
- **Indexes** - оптимизация запросов

---

## 🎯 Бизнес-логика

### Статус надежности клиента
```
reliable (💗) = нет просроченных платежей
unreliable (💔) = есть хотя бы один перенос платежа
```

### Расчет рассрочки
```
Общая сумма = Предоплата + Сумма рассрочки
Ежемесячный платеж = (Общая сумма - Предоплата) / Кол-во месяцев
Последний платеж = корректируется с учетом округления
```

### Перенос платежа
```
1. Обновляется дата платежа
2. Сохраняется original_date
3. Добавляется причина переноса
4. Создается запись в overdue_history
5. Статус клиента → unreliable
```

---

## 🔧 Конфигурация

### Environment Variables

**Frontend (.env.local):**
```env
REACT_APP_API_URL=http://localhost:3001/api
```

**Backend (.env):**
```env
POSTGRESQL_HOST=194.87.215.84
POSTGRESQL_PORT=5432
POSTGRESQL_USER=gen_user
POSTGRESQL_PASSWORD=XHz-?+<i9P3;wI
POSTGRESQL_DBNAME=data_vrassrochki
JWT_SECRET=your-random-secret-64-chars
PORT=3001
```

---

## 📈 Масштабирование

### Горизонтальное
- Несколько инстансов Node.js за load balancer
- Stateless API (JWT токены)
- PostgreSQL connection pooling

### Вертикальное
- Индексы в БД для быстрых запросов
- Кеширование через Redis (опционально)
- CDN для статики

### Оптимизация
- Lazy loading компонентов
- Пагинация списка клиентов (для больших школ)
- Debounce для поиска
- Batch API requests

---

## 🧪 Тестирование

### Ручное тестирование
1. Зарегистрируйте школу
2. Создайте менеджера
3. Добавьте клиента как менеджер
4. Войдите как админ - увидите всех клиентов
5. Войдите как Архитектор - выберите школу

### Тестовые данные
- Architect: `architect@example.com` / `architect123`
- Admin: `admin@progress.com` / `admin123`
- Manager: `galina@progress.com` / `manager123`

---

## 🛠️ Разработка

### Добавление новой роли
1. Добавить в `types/auth.ts`: `UserRole`
2. Добавить в `Header.tsx`: `ROLE_LABELS`
3. Добавить проверки в backend: `authenticateToken`
4. Обновить SQL constraint в `users.role`

### Добавление нового поля клиента
1. Добавить в `types/index.ts`: `Client`
2. Обновить `AddClientDialog.tsx`
3. Обновить `EditClientDialog.tsx`
4. Добавить колонку в `clients` таблицу
5. Обновить API endpoints

---

## 📚 Документация

- `/QUICKSTART.md` - Быстрый старт за 5 минут
- `/DEPLOYMENT_GUIDE.md` - Деплой на сервер
- `/API_INTEGRATION.md` - API документация
- `/backend-example/README.md` - Backend документация
- `/SYSTEM_OVERVIEW.md` - Этот файл

---

## 🎉 Готовая к продакшену функциональность

✅ Аутентификация и авторизация
✅ Мультитенантность (изоляция школ)
✅ Система ролей (4 уровня доступа)
✅ CRUD операции для клиентов
✅ Управление платежами
✅ История переносов
✅ Календарь платежей
✅ Годовой обзор
✅ 3D дизайн интерфейса
✅ Адаптивность по ролям
✅ Безопасность (JWT, bcrypt)

---

Система готова к использованию! 🚀

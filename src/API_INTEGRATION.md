# API Integration Guide

## Описание

Это руководство описывает API-интерфейсы для интеграции фронтенда с вашей базой данных.

## Endpoints

### Аутентификация

#### POST /api/auth/login
Вход пользователя в систему

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "architect" | "admin" | "manager" | "assistant",
    "schoolId": "string | null"
  },
  "token": "string"
}
```

#### POST /api/auth/register
Регистрация новой школы и администратора

**Request:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "schoolName": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "admin",
    "schoolId": "string"
  },
  "school": {
    "id": "string",
    "name": "string",
    "createdAt": "ISO 8601"
  },
  "token": "string"
}
```

#### POST /api/auth/logout
Выход из системы

**Headers:**
```
Authorization: Bearer <token>
```

### Школы

#### GET /api/schools
Получить список всех школ (только для Архитектора)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "schools": [
    {
      "id": "string",
      "name": "string",
      "createdAt": "ISO 8601"
    }
  ]
}
```

#### GET /api/schools/:schoolId
Получить информацию о конкретной школе

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "createdAt": "ISO 8601"
}
```

### Клиенты

#### GET /api/schools/:schoolId/clients
Получить список клиентов школы

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `managerId` (optional): фильтр по ID менеджера

**Response:**
```json
{
  "clients": [
    {
      "id": "string",
      "name": "string",
      "username": "string",
      "tariff": "string",
      "totalAmount": "number",
      "prepayment": "number",
      "prepaymentDate": "ISO 8601",
      "installmentStart": "ISO 8601",
      "installmentEnd": "ISO 8601",
      "manager": "string",
      "status": "reliable" | "unreliable",
      "overdueHistory": [
        {
          "originalDate": "ISO 8601",
          "postponedDate": "ISO 8601",
          "reason": "string",
          "amount": "number"
        }
      ],
      "payments": [
        {
          "date": "ISO 8601",
          "amount": "number",
          "paid": "boolean",
          "originalDate": "ISO 8601 | null",
          "postponeReason": "string | null"
        }
      ]
    }
  ]
}
```

#### POST /api/schools/:schoolId/clients
Создать нового клиента

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "string",
  "username": "string",
  "tariff": "string",
  "totalAmount": "number",
  "prepayment": "number",
  "prepaymentDate": "ISO 8601",
  "installmentStart": "ISO 8601",
  "installmentEnd": "ISO 8601",
  "manager": "string",
  "status": "reliable" | "unreliable",
  "payments": [...]
}
```

**Response:**
```json
{
  "client": { /* полный объект клиента */ }
}
```

#### PUT /api/schools/:schoolId/clients/:clientId
Обновить данные клиента

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  /* Обновляемые поля клиента */
}
```

#### PATCH /api/schools/:schoolId/clients/:clientId/payments/:paymentIndex
Обновить статус платежа

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "paid": "boolean"
}
```

#### POST /api/schools/:schoolId/clients/:clientId/payments/:paymentIndex/postpone
Перенести платеж

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "newDate": "ISO 8601",
  "reason": "string"
}
```

## Права доступа

### Архитектор (architect)
- Доступ ко всем школам
- Просмотр всех данных
- Выбор школы для работы

### Администратор (admin)
- Доступ только к своей школе
- Полный CRUD клиентов
- Управление менеджерами
- Просмотр всех данных школы

### Менеджер (manager)
- Доступ только к своим клиентам
- Добавление новых клиентов (автоматически закрепляются за ним)
- Редактирование своих клиентов
- Управление платежами своих клиентов

### Помощник администратора (assistant)
- Просмотр данных школы
- Управление платежами
- Редактирование клиентов
- Не может добавлять новых клиентов

## Структура базы данных

### Таблица `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'architect', 'admin', 'manager', 'assistant'
  school_id UUID REFERENCES schools(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица `schools`
```sql
CREATE TABLE schools (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица `clients`
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  tariff VARCHAR(255),
  total_amount DECIMAL(10, 2),
  prepayment DECIMAL(10, 2),
  prepayment_date DATE,
  installment_start DATE,
  installment_end DATE,
  manager VARCHAR(255),
  status VARCHAR(50), -- 'reliable', 'unreliable'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица `payments`
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id) NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  original_date DATE,
  postpone_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица `overdue_history`
```sql
CREATE TABLE overdue_history (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id) NOT NULL,
  original_date DATE NOT NULL,
  postponed_date DATE NOT NULL,
  reason TEXT,
  amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Замена мокового API на реальный

В файле `/contexts/AuthContext.tsx` замените функции `login` и `register`:

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Неверный email или пароль');
  }
  
  const data = await response.json();
  setUser(data.user);
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('token', data.token);
  
  // Загрузить школу если это не архитектор
  if (data.user.schoolId) {
    const schoolResponse = await fetch(`/api/schools/${data.user.schoolId}`, {
      headers: { 'Authorization': `Bearer ${data.token}` }
    });
    const schoolData = await schoolResponse.json();
    setSchool(schoolData);
    localStorage.setItem('school', JSON.stringify(schoolData));
  }
};
```

Аналогично для других API вызовов в компонентах.

## Безопасность

1. Все запросы должны проверять JWT токен
2. Проверять принадлежность данных к школе пользователя
3. Менеджеры могут видеть только своих клиентов
4. Архитектор имеет доступ ко всем школам
5. Хешировать пароли (bcrypt, argon2)
6. Использовать HTTPS
7. Rate limiting для API endpoints

## Переменные окружения

Создайте `.env` файл:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/school_payments
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

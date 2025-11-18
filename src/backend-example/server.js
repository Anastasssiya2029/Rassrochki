// Пример Node.js Express сервера для подключения к вашей PostgreSQL базе
// Установите зависимости: npm install express pg bcrypt jsonwebtoken cors dotenv

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  host: process.env.POSTGRESQL_HOST || process.env.PGHOST,
  port: process.env.POSTGRESQL_PORT || process.env.PGPORT,
  user: process.env.POSTGRESQL_USER || process.env.PGUSER,
  password: process.env.POSTGRESQL_PASSWORD || process.env.PGPASSWORD,
  database: process.env.POSTGRESQL_DBNAME || process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false // Для продакшена настройте SSL правильно
  }
});

// Схема для изоляции данных проекта
const SCHEMA = process.env.POSTGRESQL_SCHEMA || 'public';

// Функция для добавления схемы к имени таблицы
const table = (name) => `${SCHEMA}.${name}`;

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Требует��я аутентификация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Неверный токен' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ENDPOINTS ====================

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, schoolName } = req.body;

  try {
    // Проверяем, существует ли пользователь
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем школу
    const schoolResult = await pool.query(
      'INSERT INTO schools (name) VALUES ($1) RETURNING *',
      [schoolName]
    );
    const school = schoolResult.rows[0];

    // Создаем пользователя-администратора
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, name, role, school_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, school_id',
      [email, hashedPassword, name, 'admin', school.id]
    );
    const user = userResult.rows[0];

    // Генерируем токен
    const token = jwt.sign(
      { userId: user.id, role: user.role, schoolId: user.school_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.school_id
      },
      school: {
        id: school.id,
        name: school.name,
        createdAt: school.created_at
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Находим пользователя
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const user = result.rows[0];

    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Генерируем токен
    const token = jwt.sign(
      { userId: user.id, role: user.role, schoolId: user.school_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Получаем школу если есть
    let school = null;
    if (user.school_id) {
      const schoolResult = await pool.query(
        'SELECT * FROM schools WHERE id = $1',
        [user.school_id]
      );
      if (schoolResult.rows.length > 0) {
        school = schoolResult.rows[0];
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.school_id
      },
      school: school ? {
        id: school.id,
        name: school.name,
        createdAt: school.created_at
      } : null,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка входа' });
  }
});

// Выход
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Успешный выход' });
});

// ==================== SCHOOLS ENDPOINTS ====================

// Получить все школы (только для Архитектора)
app.get('/api/schools', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'architect') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Получаем все школы с информацией об администраторах
    const result = await pool.query(`
      SELECT 
        s.id, 
        s.name, 
        s.created_at,
        u.name as admin_name,
        u.email as admin_email
      FROM schools s
      LEFT JOIN users u ON s.id = u.school_id AND u.role = 'admin'
      ORDER BY s.created_at DESC
    `);
    
    res.json({ 
      schools: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
        adminName: row.admin_name,
        adminEmail: row.admin_email
      }))
    });
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ message: 'Ошибка получения школ' });
  }
});

// Получить школу по ID
app.get('/api/schools/:schoolId', authenticateToken, async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Проверка прав доступа
    if (req.user.role !== 'architect' && req.user.schoolId !== schoolId) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const result = await pool.query('SELECT * FROM schools WHERE id = $1', [schoolId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Школа не найдена' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ message: 'Ошибка получения школы' });
  }
});

// Создать новую школу с администратором (только для Архитектора)
app.post('/api/schools', authenticateToken, async (req, res) => {
  try {
    const { schoolName, adminName, adminEmail, adminPassword } = req.body;

    // Только Архитектор может создавать школы
    if (req.user.role !== 'architect') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Проверяем, существует ли администратор с таким email
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    await pool.query('BEGIN');

    try {
      // Создаем школу
      const schoolResult = await pool.query(
        'INSERT INTO schools (name) VALUES ($1) RETURNING *',
        [schoolName]
      );
      const school = schoolResult.rows[0];

      // Хешируем пароль администратора
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Создаем администратора школы
      const adminResult = await pool.query(
        'INSERT INTO users (email, password_hash, name, role, school_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, school_id',
        [adminEmail, hashedPassword, adminName, 'admin', school.id]
      );
      const admin = adminResult.rows[0];

      await pool.query('COMMIT');

      res.json({
        school: {
          id: school.id,
          name: school.name,
          createdAt: school.created_at,
          adminName: admin.name,
          adminEmail: admin.email
        },
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          schoolId: admin.school_id
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({ message: 'Ошибка создания школы' });
  }
});

// Обновить данные владельца школы (только для Архитектора)
app.put('/api/schools/:schoolId', authenticateToken, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { adminName, adminEmail, adminPassword } = req.body;

    // Только Архитектор может обновлять школы
    if (req.user.role !== 'architect') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Проверяем, существует ли школа
    const schoolResult = await pool.query(
      'SELECT * FROM schools WHERE id = $1',
      [schoolId]
    );

    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ message: 'Школа не найдена' });
    }

    // Находим администратора школы
    const adminResult = await pool.query(
      'SELECT * FROM users WHERE school_id = $1 AND role = $2',
      [schoolId, 'admin']
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({ message: 'Администратор школы не найден' });
    }

    const admin = adminResult.rows[0];

    // Если email изменился, проверяем что новый email не занят
    if (adminEmail && adminEmail !== admin.email) {
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND id != $2',
        [adminEmail, admin.id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      }
    }

    // Обновляем данные администратора
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (adminName) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(adminName);
    }

    if (adminEmail) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(adminEmail);
    }

    if (adminPassword) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      updateFields.push(`password_hash = $${paramIndex++}`);
      updateValues.push(hashedPassword);
    }

    if (updateFields.length > 0) {
      updateValues.push(admin.id);
      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, role, school_id`;
      
      const updatedAdminResult = await pool.query(updateQuery, updateValues);
      const updatedAdmin = updatedAdminResult.rows[0];

      res.json({
        school: {
          id: schoolResult.rows[0].id,
          name: schoolResult.rows[0].name,
          createdAt: schoolResult.rows[0].created_at,
          adminName: updatedAdmin.name,
          adminEmail: updatedAdmin.email
        },
        admin: {
          id: updatedAdmin.id,
          email: updatedAdmin.email,
          name: updatedAdmin.name,
          role: updatedAdmin.role,
          schoolId: updatedAdmin.school_id
        }
      });
    } else {
      res.status(400).json({ message: 'Нет данных для обновления' });
    }
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ message: 'Ошибка обновления школы' });
  }
});

// Удалить школу (только для Архитектора)
app.delete('/api/schools/:schoolId', authenticateToken, async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Только Архитектор может удалять школы
    if (req.user.role !== 'architect') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Проверяем, существует ли школа
    const schoolResult = await pool.query(
      'SELECT * FROM schools WHERE id = $1',
      [schoolId]
    );

    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ message: 'Школа не найдена' });
    }

    await pool.query('BEGIN');

    try {
      // Удаляем всех клиентов школы (каскадное удаление платежей и истории просрочек)
      await pool.query('DELETE FROM clients WHERE school_id = $1', [schoolId]);

      // Удаляем всех пользователей школы
      await pool.query('DELETE FROM users WHERE school_id = $1', [schoolId]);

      // Удаляем школу
      await pool.query('DELETE FROM schools WHERE id = $1', [schoolId]);

      await pool.query('COMMIT');

      res.json({ message: 'Школа успешно удалена' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({ message: 'Ошибка удаления школы' });
  }
});

// ==================== CLIENTS ENDPOINTS ====================

// Получить клиентов
app.get('/api/schools/:schoolId/clients', authenticateToken, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { managerId } = req.query;

    // Проверка прав доступа
    if (req.user.role !== 'architect' && req.user.schoolId !== schoolId) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    let query = 'SELECT * FROM clients WHERE school_id = $1';
    const params = [schoolId];

    // Фильтр по менеджеру
    if (managerId) {
      query += ' AND manager = $2';
      params.push(managerId);
    }

    query += ' ORDER BY created_at DESC';

    const clientsResult = await pool.query(query, params);
    const clients = clientsResult.rows;

    // Загружаем платежи и историю для каждого клиента
    for (let client of clients) {
      const paymentsResult = await pool.query(
        'SELECT * FROM payments WHERE client_id = $1 ORDER BY date ASC',
        [client.id]
      );
      client.payments = paymentsResult.rows;

      const historyResult = await pool.query(
        'SELECT * FROM overdue_history WHERE client_id = $1 ORDER BY created_at DESC',
        [client.id]
      );
      client.overdueHistory = historyResult.rows;
    }

    res.json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Ошибка получения клиентов' });
  }
});

// Создать клиента
app.post('/api/schools/:schoolId/clients', authenticateToken, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const clientData = req.body;

    // Проверка прав доступа
    if (req.user.role !== 'architect' && req.user.schoolId !== schoolId) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Помощники не могут добавлять клиентов
    if (req.user.role === 'assistant') {
      return res.status(403).json({ message: 'У вас нет прав на добавление клиентов' });
    }

    const client = await pool.query('BEGIN');

    try {
      // Создаем клиента
      const clientResult = await pool.query(
        `INSERT INTO clients 
        (school_id, name, username, tariff, total_amount, prepayment, prepayment_date, 
         installment_start, installment_end, manager, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
        [
          schoolId,
          clientData.name,
          clientData.username,
          clientData.tariff,
          clientData.totalAmount,
          clientData.prepayment,
          clientData.prepaymentDate,
          clientData.installmentStart,
          clientData.installmentEnd,
          clientData.manager,
          clientData.status
        ]
      );

      const newClient = clientResult.rows[0];

      // Создаем платежи
      for (let payment of clientData.payments) {
        await pool.query(
          `INSERT INTO payments (client_id, date, amount, paid, original_date, postpone_reason)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            newClient.id,
            payment.date,
            payment.amount,
            payment.paid || false,
            payment.originalDate || null,
            payment.postponeReason || null
          ]
        );
      }

      await pool.query('COMMIT');

      // Загружаем полные данные клиента с платежами
      const paymentsResult = await pool.query(
        'SELECT * FROM payments WHERE client_id = $1 ORDER BY date ASC',
        [newClient.id]
      );
      newClient.payments = paymentsResult.rows;
      newClient.overdueHistory = [];

      res.json({ client: newClient });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Ошибка создания клиента' });
  }
});

// Обновить клиента
app.put('/api/schools/:schoolId/clients/:clientId', authenticateToken, async (req, res) => {
  try {
    const { schoolId, clientId } = req.params;
    const updates = req.body;

    // Проверка прав доступа
    if (req.user.role !== 'architect' && req.user.schoolId !== schoolId) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // Обновляем клиента
    const result = await pool.query(
      `UPDATE clients SET 
        name = $1, username = $2, tariff = $3, total_amount = $4, 
        prepayment = $5, prepayment_date = $6, installment_start = $7, 
        installment_end = $8, manager = $9, status = $10
       WHERE id = $11 AND school_id = $12
       RETURNING *`,
      [
        updates.name,
        updates.username,
        updates.tariff,
        updates.totalAmount,
        updates.prepayment,
        updates.prepaymentDate,
        updates.installmentStart,
        updates.installmentEnd,
        updates.manager,
        updates.status,
        clientId,
        schoolId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Клиент не найден' });
    }

    res.json({ client: result.rows[0] });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Ошибка обновления клиента' });
  }
});

// Обновить статус платежа
app.patch('/api/schools/:schoolId/clients/:clientId/payments/:paymentIndex', 
  authenticateToken, 
  async (req, res) => {
    try {
      const { schoolId, clientId, paymentIndex } = req.params;
      const { paid } = req.body;

      // Проверка прав доступа
      if (req.user.role !== 'architect' && req.user.schoolId !== schoolId) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }

      // Получаем платежи клиента
      const paymentsResult = await pool.query(
        'SELECT * FROM payments WHERE client_id = $1 ORDER BY date ASC',
        [clientId]
      );

      const payment = paymentsResult.rows[parseInt(paymentIndex)];
      if (!payment) {
        return res.status(404).json({ message: 'Платеж не найден' });
      }

      // Обновляем статус
      await pool.query(
        'UPDATE payments SET paid = $1 WHERE id = $2',
        [paid, payment.id]
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Update payment error:', error);
      res.status(500).json({ message: 'Ошибка обновления платежа' });
    }
  }
);

// Перенести платеж
app.post('/api/schools/:schoolId/clients/:clientId/payments/:paymentIndex/postpone',
  authenticateToken,
  async (req, res) => {
    try {
      const { schoolId, clientId, paymentIndex } = req.params;
      const { newDate, reason } = req.body;

      // Проверка прав доступа
      if (req.user.role !== 'architect' && req.user.schoolId !== schoolId) {
        return res.status(403).json({ message: 'Доступ запрещен' });
      }

      // Получаем платежи клиента
      const paymentsResult = await pool.query(
        'SELECT * FROM payments WHERE client_id = $1 ORDER BY date ASC',
        [clientId]
      );

      const payment = paymentsResult.rows[parseInt(paymentIndex)];
      if (!payment) {
        return res.status(404).json({ message: 'Платеж не найден' });
      }

      await pool.query('BEGIN');

      try {
        // Обновляем платеж
        await pool.query(
          `UPDATE payments 
           SET date = $1, original_date = COALESCE(original_date, $2), postpone_reason = $3
           WHERE id = $4`,
          [newDate, payment.date, reason, payment.id]
        );

        // Добавляем запись в историю переносов
        await pool.query(
          `INSERT INTO overdue_history (client_id, original_date, postponed_date, reason, amount)
           VALUES ($1, $2, $3, $4, $5)`,
          [clientId, payment.date, newDate, reason, payment.amount]
        );

        // Обновляем статус клиента на "ненадежный"
        await pool.query(
          `UPDATE clients SET status = 'unreliable' WHERE id = $1`,
          [clientId]
        );

        await pool.query('COMMIT');
        res.json({ success: true });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Postpone payment error:', error);
      res.status(500).json({ message: 'Ошибка переноса платежа' });
    }
  }
);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Connected to PostgreSQL database: ${process.env.POSTGRESQL_DBNAME}`);
});

// Обработка ошибок подключения к БД
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});
// Скрипт для инициализации базы данных
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRESQL_HOST || process.env.PGHOST,
  port: process.env.POSTGRESQL_PORT || process.env.PGPORT,
  user: process.env.POSTGRESQL_USER || process.env.PGUSER,
  password: process.env.POSTGRESQL_PASSWORD || process.env.PGPASSWORD,
  database: process.env.POSTGRESQL_DBNAME || process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});

const SCHEMA = process.env.POSTGRESQL_SCHEMA || 'public';

async function initDatabase() {
  const client = await pool.connect();

  try {
    console.log(`🔧 Создание схемы ${SCHEMA}...`);
    
    // Создаем схему для изоляции данных проекта
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA};`);
    console.log(`✅ Схема ${SCHEMA} создана`);
    
    console.log('🔧 Создание таблиц...');

    // Создаем таблицу schools
    await client.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица schools создана');

    // Создаем таблицу users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('architect', 'admin', 'manager', 'assistant')),
        school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица users создана');

    // Создаем индекс на email
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Создаем таблицу clients
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        tariff VARCHAR(255),
        total_amount DECIMAL(10, 2),
        prepayment DECIMAL(10, 2),
        prepayment_date DATE,
        installment_start DATE,
        installment_end DATE,
        manager VARCHAR(255),
        status VARCHAR(50) CHECK (status IN ('reliable', 'unreliable')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица clients создана');

    // Создаем индекс на school_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_school_id ON clients(school_id);
    `);

    // Создаем таблицу payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
        date DATE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        paid BOOLEAN DEFAULT FALSE,
        original_date DATE,
        postpone_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица payments создана');

    // Создаем индекс на client_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
    `);

    // Создаем таблицу overdue_history
    await client.query(`
      CREATE TABLE IF NOT EXISTS overdue_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
        original_date DATE NOT NULL,
        postponed_date DATE NOT NULL,
        reason TEXT,
        amount DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица overdue_history создана');

    // Создаем индекс на client_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_overdue_client_id ON overdue_history(client_id);
    `);

    console.log('\n✅ База данных успешно инициализирована!');
    console.log('\n📝 Следующие шаги:');
    console.log('1. Создайте первого пользователя через регистрацию');
    console.log('2. Или используйте SQL для создания Архитектора:');
    console.log(`
      INSERT INTO users (email, password_hash, name, role, school_id)
      VALUES (
        'architect@example.com',
        '$2b$10$...',  -- хеш пароля (используйте bcrypt)
        'Главный Архитектор',
        'architect',
        NULL
      );
    `);

  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();

-- =============================================
-- SQL скрипт для создания чистой БД
-- CS2 Tournament System
-- =============================================

-- 1. Создание базы данных
DROP DATABASE IF EXISTS `bot`;
CREATE DATABASE `bot` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 2. Создание пользователя (если не существует)
-- ВАЖНО: Измените пароль в production!
CREATE USER IF NOT EXISTS 'bot'@'localhost' IDENTIFIED BY '123_Kulan';
CREATE USER IF NOT EXISTS 'bot'@'%' IDENTIFIED BY '123_Kulan';

-- 3. Выдача прав доступа
GRANT ALL PRIVILEGES ON `bot`.* TO 'bot'@'localhost';
GRANT ALL PRIVILEGES ON `bot`.* TO 'bot'@'%';

-- 4. Применение изменений
FLUSH PRIVILEGES;

-- 5. Использование созданной БД
USE `bot`;

-- =============================================
-- ТАБЛИЦЫ СОЗДАВАТЬ НЕ НУЖНО!
-- Они будут созданы через миграции командой:
-- npm run migrate
-- =============================================

-- Проверка создания БД
SELECT 
  'База данных успешно создана' as status,
  DATABASE() as current_database,
  @@character_set_database as charset,
  @@collation_database as collation;

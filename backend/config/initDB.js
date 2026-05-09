require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

/* ================= HELPERS ================= */

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SHOW COLUMNS FROM \`${table}\` LIKE ?`,
    [column]
  );
  return rows.length > 0;
}

async function addColumn(conn, table, column, definition) {
  try {
    const exists = await columnExists(conn, table, column);
    if (!exists) {
      await conn.query(
        `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`
      );
      console.log(`✅ Added ${table}.${column}`);
    }
  } catch (err) {
    console.error(`❌ Failed adding ${table}.${column}:`, err.message);
  }
}

async function safeQuery(conn, sql, label) {
  try {
    await conn.query(sql);
    if (label) console.log(`✅ ${label}`);
  } catch (err) {
    console.error(`❌ ${label || 'Query failed'}:`, err.message);
  }
}

/* ================= MAIN ================= */

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'quizuser',
    password: process.env.DB_PASSWORD || 'QuizPass@123',
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  console.log('🔧 Initializing database...');

  const dbName = process.env.DB_NAME || 'quiz_platform';

  await safeQuery(
    connection,
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    'Database ready'
  );

  await connection.query(`USE \`${dbName}\``);

  console.log('📦 Creating base tables...');

  /* USERS */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(150) UNIQUE,
      password VARCHAR(255),
      role VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'users table');

  /* GAMES */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS games (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      company_name VARCHAR(255),
      category VARCHAR(50),
      game_logo_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, 'games table');

  /* QUIZ SETTINGS */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS quiz_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT,
      primary_color VARCHAR(20),
      bg_color VARCHAR(20),
      intro_text TEXT,
      outro_text TEXT,
      show_progress TINYINT(1) DEFAULT 1,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'quiz_settings table');

  /* QUESTIONS */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      question_text TEXT NOT NULL,
      question_image_url VARCHAR(500),
      question_type ENUM('right_wrong','opinion') DEFAULT 'right_wrong',
      question_color VARCHAR(20) DEFAULT '#1a1a2e',
      question_order INT DEFAULT 0,
      num_options INT DEFAULT 4,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'questions table');

  /* OPTIONS */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS options (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id INT NOT NULL,
      option_text VARCHAR(500),
      option_image_url VARCHAR(500),
      is_correct TINYINT(1) DEFAULT 0,
      option_order INT DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `, 'options table');

  console.log('🚀 Running migrations...');

  /* CLIENTS */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255),
      email VARCHAR(150),
      phone VARCHAR(50),
      address TEXT,
      notes TEXT,
      slug VARCHAR(255) UNIQUE,
      logo_url VARCHAR(500),
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `, 'clients table');

  /* SOUNDS */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS sounds (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      sound_type VARCHAR(50),
      file_url VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'sounds table');

  /* QUESTIONS MIGRATIONS */
  await addColumn(connection, 'questions', 'question_bg_image_url', 'VARCHAR(500)');
  await addColumn(connection, 'questions', 'sound_correct_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'questions', 'sound_wrong_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'questions', 'sound_neutral_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'questions', 'overlay_duration', 'INT DEFAULT 3');
  await addColumn(connection, 'questions', 'overlay_idle_time', 'INT DEFAULT 3');
  await addColumn(connection, 'questions', 'overlay_animation_in', "VARCHAR(50) DEFAULT 'flyFromBottom'");
  await addColumn(connection, 'questions', 'overlay_animation_out', "VARCHAR(50) DEFAULT 'flyToTop'");
  await addColumn(connection, 'questions', 'question_image_animation', "VARCHAR(50) DEFAULT 'float'");

  /* OPTIONS MIGRATIONS */
  await addColumn(connection, 'options', 'option_overlay_image_url', 'VARCHAR(500)');
  await addColumn(connection, 'options', 'option_text_color', "VARCHAR(20) DEFAULT '#ffffff'");

  /* QUIZ SETTINGS MIGRATIONS */
  await addColumn(connection, 'quiz_settings', 'bg_image_url', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'thankyou_bg_image_url', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'terms_enabled', 'TINYINT(1) DEFAULT 0');
  await addColumn(connection, 'quiz_settings', 'terms_text', 'TEXT');
  await addColumn(connection, 'quiz_settings', 'terms_url', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'send_email', 'TINYINT(1) DEFAULT 1');
  await addColumn(connection, 'quiz_settings', 'win_sound_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'quiz_settings', 'lose_sound_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'quiz_settings', 'sound_correct_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'quiz_settings', 'sound_wrong_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'quiz_settings', 'game_logo_url', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'font_family', "VARCHAR(100) DEFAULT 'DM Sans'");
  await addColumn(connection, 'quiz_settings', 'submit_confirm_gif_url', 'VARCHAR(500)');
  /* GAMES MIGRATIONS */
  await addColumn(connection, 'games', 'client_id', 'INT');

  console.log('👤 Creating admin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    const [existingAdmin] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existingAdmin.length === 0) {
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin', adminEmail, hashedPassword, 'admin']
      );
      console.log(`✅ Admin created: ${adminEmail}`);
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (err) {
    console.error('❌ Admin creation failed:', err.message);
  }

  await connection.end();

  console.log('✅ Migration completed successfully!');
}

/* ================= RUN ================= */

initDB().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

/* ================= HELPERS ================= */

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
  return rows.length > 0;
}

async function addColumn(conn, table, column, definition) {
  try {
    const exists = await columnExists(conn, table, column);
    if (!exists) {
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
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

  await safeQuery(connection, `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, 'Database ready');
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
      category VARCHAR(50) DEFAULT 'quiz',
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

  /* FORM FIELDS */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS form_fields (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      field_label VARCHAR(255),
      field_type VARCHAR(50) DEFAULT 'text',
      field_options JSON,
      is_required TINYINT(1) DEFAULT 0,
      field_order INT DEFAULT 0,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'form_fields table');

  /* EMAIL TEMPLATES */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS email_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      sender_name VARCHAR(255),
      sender_email VARCHAR(255),
      subject VARCHAR(500),
      header_color VARCHAR(20) DEFAULT '#6366f1',
      header_text VARCHAR(500),
      body_html TEXT,
      footer_text TEXT,
      is_enabled TINYINT(1) DEFAULT 1,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'email_templates table');

  /* PLAYER SESSIONS */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS player_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      session_token VARCHAR(255) UNIQUE,
      player_data JSON,
      score INT DEFAULT 0,
      total_scoreable INT DEFAULT 0,
      completed TINYINT(1) DEFAULT 0,
      email_sent TINYINT(1) DEFAULT 0,
      source_type VARCHAR(20) DEFAULT 'direct',
      completed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'player_sessions table');

  /* PLAYER ANSWERS */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS player_answers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NOT NULL,
      question_id INT DEFAULT NULL,
      crossword_word_id INT DEFAULT NULL,
      option_id INT DEFAULT NULL,
      answer_text VARCHAR(500),
      is_correct TINYINT(1) DEFAULT 0,
      question_type VARCHAR(50),
      answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES player_sessions(id) ON DELETE CASCADE
    )
  `, 'player_answers table');

  /* ── NEW: CROSSWORD TABLES ── */
  console.log('🔤 Creating crossword tables...');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS crossword_words (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      word_text VARCHAR(255) NOT NULL,
      clue_text TEXT,
      start_row INT DEFAULT 0,
      start_col INT DEFAULT 0,
      direction ENUM('across','down') DEFAULT 'across',
      word_order INT DEFAULT 0,
      word_color VARCHAR(20) DEFAULT '#7c6ff7',
      overlay_image_url VARCHAR(500),
      sound_correct_id INT DEFAULT NULL,
      sound_wrong_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'crossword_words table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS crossword_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      grid_rows INT DEFAULT 10,
      grid_cols INT DEFAULT 10,
      cell_size INT DEFAULT 40,
      show_timer TINYINT(1) DEFAULT 1,
      time_limit_seconds INT DEFAULT 0,
      allow_hints TINYINT(1) DEFAULT 1,
      heading_1 VARCHAR(500),
      heading_2 VARCHAR(500),
      heading_3 VARCHAR(500),
      description_text TEXT,
      bg_color VARCHAR(20) DEFAULT '#f8f8ff',
      primary_color VARCHAR(20) DEFAULT '#7c6ff7',
      bg_image_url VARCHAR(500),
      thankyou_bg_image_url VARCHAR(500),
      game_logo_url VARCHAR(500),
      font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_correct_id INT DEFAULT NULL,
      sound_wrong_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'crossword_settings table');

  /* ── MEMORY MATCH TABLES ── */
  console.log('🧩 Creating memory match tables...');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS memory_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      card_shape VARCHAR(50) DEFAULT 'rounded',
      card_radius INT DEFAULT 8,
      grid_cols INT DEFAULT 4,
      grid_rows INT DEFAULT 4,
      show_timer TINYINT(1) DEFAULT 1,
      time_limit_seconds INT DEFAULT 0,
      timer_position VARCHAR(20) DEFAULT 'top_center',
      heading_1 VARCHAR(500),
      heading_2 VARCHAR(500),
      heading_3 VARCHAR(500),
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e',
      heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777',
      description_text TEXT,
      description_color VARCHAR(20) DEFAULT '#888888',
      intro_text TEXT,
      outro_text TEXT,
      bg_color VARCHAR(20) DEFAULT '#f8f8ff',
      primary_color VARCHAR(20) DEFAULT '#7c6ff7',
      bg_image_url VARCHAR(500),
      thankyou_bg_image_url VARCHAR(500),
      game_logo_url VARCHAR(500),
      card_cover_image_url VARCHAR(500),
      overlay_image_url VARCHAR(500),
      overlay_animation_in VARCHAR(50) DEFAULT 'flyFromBottom',
      overlay_animation_out VARCHAR(50) DEFAULT 'flyToTop',
      overlay_idle_time INT DEFAULT 3,
      overlay_duration INT DEFAULT 3,
      submit_confirm_gif_url VARCHAR(500),
      gif_url VARCHAR(500),
      thankyou_subtitle VARCHAR(500),
      font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_flip_id INT DEFAULT NULL,
      sound_match_id INT DEFAULT NULL,
      sound_nomatch_id INT DEFAULT NULL,
      submit_button_text VARCHAR(500),
      start_button_text VARCHAR(500),
      start_button_text_color VARCHAR(20) DEFAULT '#ffffff',
      start_button_bg_color VARCHAR(20),
      continue_button_text VARCHAR(100) DEFAULT 'Continue Now →',
      continue_button_text_color VARCHAR(20) DEFAULT '#ffffff',
      continue_button_bg_color VARCHAR(20),
      next_button_text VARCHAR(100) DEFAULT 'Next',
      next_button_text_color VARCHAR(20) DEFAULT '#ffffff',
      next_button_bg_color VARCHAR(20),
      terms_enabled TINYINT(1) DEFAULT 0,
      terms_text TEXT,
      terms_url VARCHAR(500),
      meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'memory_settings table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS memory_tiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      tile_label VARCHAR(255),
      pair_id INT DEFAULT NULL,
      tile_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'memory_tiles table');

  /* ── MATH TABLES ── */
  console.log('🔢 Creating math tables...');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS math_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      total_levels INT DEFAULT 100,
      questions_per_level INT DEFAULT 5,
      operations VARCHAR(100) DEFAULT '+,-,×',
      number_range_start INT DEFAULT 1,
      number_range_end INT DEFAULT 100,
      allow_negative TINYINT(1) DEFAULT 0,
      show_timer TINYINT(1) DEFAULT 1,
      time_per_question INT DEFAULT 0,
      pass_threshold INT DEFAULT 5,
      heading_1 VARCHAR(500),
      heading_2 VARCHAR(500),
      heading_3 VARCHAR(500),
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e',
      heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777',
      description_text TEXT,
      description_color VARCHAR(20) DEFAULT '#888888',
      intro_text TEXT,
      outro_text TEXT,
      bg_color VARCHAR(20) DEFAULT '#f0fdf4',
      primary_color VARCHAR(20) DEFAULT '#22c55e',
      font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_correct_id INT DEFAULT NULL,
      sound_wrong_id INT DEFAULT NULL,
      overlay_animation_in VARCHAR(50) DEFAULT 'flyFromBottom',
      overlay_animation_out VARCHAR(50) DEFAULT 'flyToTop',
      submit_button_text VARCHAR(500),
      start_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue →',
      terms_enabled TINYINT(1) DEFAULT 0,
      terms_text TEXT,
      terms_url VARCHAR(500),
      meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'math_settings table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS math_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      session_token VARCHAR(255) NOT NULL,
      current_level INT DEFAULT 1,
      current_question INT DEFAULT 0,
      total_correct INT DEFAULT 0,
      completed_levels JSON,
      last_played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      UNIQUE KEY unique_game_session (game_id, session_token)
    )
  `, 'math_progress table');

  /* ── MAZE TABLES ── */
  console.log('🗺️ Creating maze tables...');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS maze_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      total_levels INT DEFAULT 50,
      grid_size_min INT DEFAULT 5,
      grid_size_max INT DEFAULT 20,
      show_timer TINYINT(1) DEFAULT 1,
      time_limit_seconds INT DEFAULT 0,
      collectible_count INT DEFAULT 3,
      collectible_label VARCHAR(100) DEFAULT '★',
      collectible_images JSON,
      heading_1 VARCHAR(500),
      heading_2 VARCHAR(500),
      heading_3 VARCHAR(500),
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e',
      heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777',
      description_text TEXT,
      description_color VARCHAR(20) DEFAULT '#888888',
      intro_text TEXT,
      outro_text TEXT,
      bg_color VARCHAR(20) DEFAULT '#0f172a',
      primary_color VARCHAR(20) DEFAULT '#6366f1',
      wall_color VARCHAR(20) DEFAULT '#1e293b',
      path_color VARCHAR(20) DEFAULT '#ffffff',
      font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_collect_id INT DEFAULT NULL,
      sound_complete_id INT DEFAULT NULL,
      overlay_animation_in VARCHAR(50) DEFAULT 'flyFromBottom',
      overlay_animation_out VARCHAR(50) DEFAULT 'flyToTop',
      submit_button_text VARCHAR(500),
      start_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue →',
      terms_enabled TINYINT(1) DEFAULT 0,
      terms_text TEXT,
      terms_url VARCHAR(500),
      meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'maze_settings table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS maze_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      session_token VARCHAR(255) NOT NULL,
      current_level INT DEFAULT 1,
      completed_levels JSON,
      total_collectibles INT DEFAULT 0,
      best_time INT DEFAULT NULL,
      last_played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      UNIQUE KEY unique_game_session (game_id, session_token)
    )
  `, 'maze_progress table');

  /* ── MEMORY SETTINGS COLUMN MIGRATIONS (ensure ALL columns exist) ── */
  const memCols = [
    ['grid_rows', 'INT DEFAULT 4'],
    ['heading_1_color', "VARCHAR(20) DEFAULT '#1a1a2e'"],
    ['heading_2_color', "VARCHAR(20) DEFAULT '#666666'"],
    ['heading_3_color', "VARCHAR(20) DEFAULT '#777777'"],
    ['description_color', "VARCHAR(20) DEFAULT '#888888'"],
    ['start_button_text_color', "VARCHAR(20) DEFAULT '#ffffff'"],
    ['start_button_bg_color', 'VARCHAR(20)'],
    ['submit_confirm_gif_url', 'VARCHAR(500)'],
    ['continue_button_text', "VARCHAR(100) DEFAULT 'Continue Now →'"],
    ['continue_button_text_color', "VARCHAR(20) DEFAULT '#ffffff'"],
    ['continue_button_bg_color', 'VARCHAR(20)'],
    ['next_button_text', "VARCHAR(100) DEFAULT 'Next'"],
    ['next_button_text_color', "VARCHAR(20) DEFAULT '#ffffff'"],
    ['next_button_bg_color', 'VARCHAR(20)'],
    ['heading_3', 'VARCHAR(500)'],
    ['overlay_duration', 'INT DEFAULT 3'],
    ['intro_text', 'TEXT'],
    ['outro_text', 'TEXT'],
    ['submit_button_text', 'VARCHAR(500)'],
    ['start_button_text', 'VARCHAR(500)'],
    ['meta_description', 'TEXT'],
    ['terms_enabled', 'TINYINT(1) DEFAULT 0'],
    ['terms_text', 'TEXT'],
    ['terms_url', 'VARCHAR(500)'],
  ];
  for (const [col, def] of memCols) {
    await addColumn(connection, 'memory_settings', col, def);
  }

  /* ── JIGSAW PUZZLE TABLES ── */
  console.log('🧩 Creating jigsaw puzzle tables...');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS jigsaw_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      grid_cols INT DEFAULT 4,
      grid_rows INT DEFAULT 4,
      show_timer TINYINT(1) DEFAULT 1,
      time_limit_seconds INT DEFAULT 0,
      heading_1 VARCHAR(500),
      heading_2 VARCHAR(500),
      heading_3 VARCHAR(500),
      description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e',
      heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777',
      description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#f8f8ff',
      primary_color VARCHAR(20) DEFAULT '#6366f1',
      bg_image_url VARCHAR(500),
      thankyou_bg_image_url VARCHAR(500),
      game_logo_url VARCHAR(500),
      puzzle_image_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500),
      font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_correct_id INT DEFAULT NULL,
      sound_wrong_id INT DEFAULT NULL,
      intro_text TEXT,
      outro_text TEXT,
      submit_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue Now →',
      start_button_text VARCHAR(500),
      terms_enabled TINYINT(1) DEFAULT 0,
      terms_text TEXT,
      terms_url VARCHAR(500),
      meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'jigsaw_settings table');

  /* ── WORD SEARCH TABLES ── */
  console.log('🔍 Creating word search tables...');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS wordsearch_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      grid_rows INT DEFAULT 12,
      grid_cols INT DEFAULT 12,
      show_timer TINYINT(1) DEFAULT 1,
      time_limit_seconds INT DEFAULT 0,
      allow_hints TINYINT(1) DEFAULT 1,
      heading_1 VARCHAR(500),
      heading_2 VARCHAR(500),
      heading_3 VARCHAR(500),
      description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e',
      heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777',
      description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#f8f8ff',
      primary_color VARCHAR(20) DEFAULT '#6366f1',
      bg_image_url VARCHAR(500),
      thankyou_bg_image_url VARCHAR(500),
      game_logo_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500),
      font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_correct_id INT DEFAULT NULL,
      sound_wrong_id INT DEFAULT NULL,
      intro_text TEXT,
      outro_text TEXT,
      submit_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue Now →',
      start_button_text VARCHAR(500),
      terms_enabled TINYINT(1) DEFAULT 0,
      terms_text TEXT,
      terms_url VARCHAR(500),
      meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'wordsearch_settings table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS wordsearch_words (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      word_text VARCHAR(255) NOT NULL,
      clue_text TEXT,
      word_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'wordsearch_words table');

  /* ── POURING WATER TABLES ── */
  console.log('💧 Creating pouring water tables...');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS pouring_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      target_ml INT DEFAULT 50,
      tolerance_ml INT DEFAULT 5,
      max_ml INT DEFAULT 200,
      pour_speed DECIMAL(3,2) DEFAULT 1.00,
      viscosity DECIMAL(3,2) DEFAULT 1.00,
      water_color VARCHAR(20) DEFAULT '#4da6ff',
      show_timer TINYINT(1) DEFAULT 1,
      time_limit_seconds INT DEFAULT 0,
      allow_retries TINYINT(1) DEFAULT 1,
      max_retries INT DEFAULT 3,
      heading_1 VARCHAR(500),
      heading_2 VARCHAR(500),
      heading_3 VARCHAR(500),
      description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e',
      heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777',
      description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#f0f4ff',
      primary_color VARCHAR(20) DEFAULT '#6366f1',
      bg_image_url VARCHAR(500),
      thankyou_bg_image_url VARCHAR(500),
      game_logo_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500),
      font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_correct_id INT DEFAULT NULL,
      sound_wrong_id INT DEFAULT NULL,
      sound_pour_id INT DEFAULT NULL,
      intro_text TEXT,
      outro_text TEXT,
      submit_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue Now →',
      start_button_text VARCHAR(500),
      terms_enabled TINYINT(1) DEFAULT 0,
      terms_text TEXT,
      terms_url VARCHAR(500),
      meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'pouring_settings table');

  /* ── SPEED TYPER TABLES ── */
  console.log('⌨️ Creating speed typer tables...');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS typer_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      fall_speed INT DEFAULT 2,
      max_simultaneous INT DEFAULT 3,
      difficulty_mode VARCHAR(20) DEFAULT 'progressive',
      time_limit_seconds INT DEFAULT 60,
      max_misses INT DEFAULT 5,
      target_words INT DEFAULT 0,
      word_category VARCHAR(50) DEFAULT 'mixed',
      show_timer TINYINT(1) DEFAULT 1,
      heading_1 VARCHAR(500),
      heading_2 VARCHAR(500),
      heading_3 VARCHAR(500),
      description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e',
      heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777',
      description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#0f172a',
      primary_color VARCHAR(20) DEFAULT '#6366f1',
      bg_image_url VARCHAR(500),
      thankyou_bg_image_url VARCHAR(500),
      game_logo_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500),
      font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_correct_id INT DEFAULT NULL,
      sound_wrong_id INT DEFAULT NULL,
      sound_combo_id INT DEFAULT NULL,
      sound_gameover_id INT DEFAULT NULL,
      intro_text TEXT,
      outro_text TEXT,
      submit_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue Now →',
      start_button_text VARCHAR(500),
      terms_enabled TINYINT(1) DEFAULT 0,
      terms_text TEXT,
      terms_url VARCHAR(500),
      meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'typer_settings table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS typer_words (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      word_text VARCHAR(255) NOT NULL,
      difficulty VARCHAR(20) DEFAULT 'medium',
      word_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'typer_words table');

  /* ── SCREW & REVEAL TABLES ── */
  console.log('🔩 Creating screw & reveal tables...');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS screw_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      board_rows INT DEFAULT 6,
      board_cols INT DEFAULT 6,
      block_colors VARCHAR(500) DEFAULT '#c0392b,#2980b9,#27ae60,#f39c12,#8e44ad',
      screws_per_block INT DEFAULT 2,
      empty_holes INT DEFAULT 3,
      difficulty VARCHAR(20) DEFAULT 'medium',
      show_timer TINYINT(1) DEFAULT 1,
      time_limit_seconds INT DEFAULT 120,
      heading_1 VARCHAR(500),
      heading_2 VARCHAR(500),
      heading_3 VARCHAR(500),
      description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e',
      heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777',
      description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#f0e6d3',
      primary_color VARCHAR(20) DEFAULT '#8B4513',
      bg_image_url VARCHAR(500),
      thankyou_bg_image_url VARCHAR(500),
      game_logo_url VARCHAR(500),
      reveal_image_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500),
      font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_screw_id INT DEFAULT NULL,
      sound_fall_id INT DEFAULT NULL,
      sound_reveal_id INT DEFAULT NULL,
      intro_text TEXT,
      outro_text TEXT,
      submit_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue Now →',
      start_button_text VARCHAR(500),
      reveal_text VARCHAR(500),
      terms_enabled TINYINT(1) DEFAULT 0,
      terms_text TEXT,
      terms_url VARCHAR(500),
      meta_description TEXT,
      start_button_text_color VARCHAR(20) DEFAULT NULL,
      start_button_bg_color VARCHAR(20) DEFAULT NULL,
      submit_button_text_color VARCHAR(20) DEFAULT NULL,
      submit_button_bg_color VARCHAR(20) DEFAULT NULL,
      continue_button_text_color VARCHAR(20) DEFAULT NULL,
      continue_button_bg_color VARCHAR(20) DEFAULT NULL,
      thankyou_subtitle VARCHAR(500) DEFAULT NULL,
      thankyou_subtitle_color VARCHAR(20) DEFAULT NULL,
      outro_text_color VARCHAR(20) DEFAULT NULL,
      intro_text_color VARCHAR(20) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'screw_settings table');

  /* ── SNAKE TABLES ── */
  console.log('🐍 Creating snake tables...');
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS snake_settings (
      id INT AUTO_INCREMENT PRIMARY KEY, game_id INT UNIQUE,
      board_width INT DEFAULT 20, board_height INT DEFAULT 20, speed INT DEFAULT 5,
      snake_color VARCHAR(20) DEFAULT '#22c55e', food_color VARCHAR(20) DEFAULT '#ef4444',
      wall_mode VARCHAR(20) DEFAULT 'wall', show_timer TINYINT(1) DEFAULT 1, time_limit_seconds INT DEFAULT 0,
      heading_1 VARCHAR(500), heading_2 VARCHAR(500), heading_3 VARCHAR(500), description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e', heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777', description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#0f172a', primary_color VARCHAR(20) DEFAULT '#22c55e',
      bg_image_url VARCHAR(500), thankyou_bg_image_url VARCHAR(500), game_logo_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500), font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_eat_id INT DEFAULT NULL, sound_gameover_id INT DEFAULT NULL,
      intro_text TEXT, outro_text TEXT, submit_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue Now →', start_button_text VARCHAR(500),
      reveal_text VARCHAR(500), terms_enabled TINYINT(1) DEFAULT 0, terms_text TEXT,
      terms_url VARCHAR(500), meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'snake_settings table');

  /* ── CATCH FALLING OBJECTS TABLES ── */
  console.log('🧺 Creating catch tables...');
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS catch_settings (
      id INT AUTO_INCREMENT PRIMARY KEY, game_id INT UNIQUE,
      spawn_rate INT DEFAULT 1000, fall_speed INT DEFAULT 2, max_misses INT DEFAULT 5,
      time_limit_seconds INT DEFAULT 60, item_type VARCHAR(50) DEFAULT 'emoji',
      basket_color VARCHAR(20) DEFAULT '#8B5CF6',
      show_timer TINYINT(1) DEFAULT 1,
      heading_1 VARCHAR(500), heading_2 VARCHAR(500), heading_3 VARCHAR(500), description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e', heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777', description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#f8f8ff', primary_color VARCHAR(20) DEFAULT '#8B5CF6',
      bg_image_url VARCHAR(500), thankyou_bg_image_url VARCHAR(500), game_logo_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500), font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_catch_id INT DEFAULT NULL, sound_miss_id INT DEFAULT NULL, sound_gameover_id INT DEFAULT NULL,
      intro_text TEXT, outro_text TEXT, submit_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue Now →', start_button_text VARCHAR(500),
      terms_enabled TINYINT(1) DEFAULT 0, terms_text TEXT,
      terms_url VARCHAR(500), meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'catch_settings table');

  /* ── REACTION TIME TABLES ── */
  console.log('⚡ Creating reaction tables...');
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS reaction_settings (
      id INT AUTO_INCREMENT PRIMARY KEY, game_id INT UNIQUE,
      rounds INT DEFAULT 5, color_change_delay INT DEFAULT 2000,
      target_color VARCHAR(20) DEFAULT '#22c55e', show_leaderboard TINYINT(1) DEFAULT 1,
      show_timer TINYINT(1) DEFAULT 1,
      heading_1 VARCHAR(500), heading_2 VARCHAR(500), heading_3 VARCHAR(500), description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e', heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777', description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#0f172a', primary_color VARCHAR(20) DEFAULT '#ef4444',
      bg_image_url VARCHAR(500), thankyou_bg_image_url VARCHAR(500), game_logo_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500), font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_correct_id INT DEFAULT NULL, sound_wrong_id INT DEFAULT NULL,
      intro_text TEXT, outro_text TEXT, submit_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue Now →', start_button_text VARCHAR(500),
      terms_enabled TINYINT(1) DEFAULT 0, terms_text TEXT,
      terms_url VARCHAR(500), meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'reaction_settings table');

  /* ── SIMON SAYS TABLES ── */
  console.log('🎯 Creating simon tables...');
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS simon_settings (
      id INT AUTO_INCREMENT PRIMARY KEY, game_id INT UNIQUE,
      num_rounds INT DEFAULT 8, num_colors INT DEFAULT 4, speed VARCHAR(20) DEFAULT 'medium',
      color_1 VARCHAR(20) DEFAULT '#ef4444', color_2 VARCHAR(20) DEFAULT '#3b82f6',
      color_3 VARCHAR(20) DEFAULT '#22c55e', color_4 VARCHAR(20) DEFAULT '#f59e0b',
      color_5 VARCHAR(20) DEFAULT '#8b5cf6', color_6 VARCHAR(20) DEFAULT '#ec4899',
      show_timer TINYINT(1) DEFAULT 0, time_limit_seconds INT DEFAULT 0,
      heading_1 VARCHAR(500), heading_2 VARCHAR(500), heading_3 VARCHAR(500), description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e', heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777', description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#1a1a2e', primary_color VARCHAR(20) DEFAULT '#6366f1',
      bg_image_url VARCHAR(500), thankyou_bg_image_url VARCHAR(500), game_logo_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500), font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_correct_id INT DEFAULT NULL, sound_wrong_id INT DEFAULT NULL, sound_gameover_id INT DEFAULT NULL,
      intro_text TEXT, outro_text TEXT, submit_button_text VARCHAR(500),
      continue_button_text VARCHAR(100) DEFAULT 'Continue Now →', start_button_text VARCHAR(500),
      terms_enabled TINYINT(1) DEFAULT 0, terms_text TEXT,
      terms_url VARCHAR(500), meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'simon_settings table');

  /* ── CONNECT 4 TABLES ── */
  console.log('🔴 Creating connect 4 tables...');
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS connect4_settings (
      id INT AUTO_INCREMENT PRIMARY KEY, game_id INT UNIQUE,
      board_rows INT DEFAULT 6, board_cols INT DEFAULT 7, win_count INT DEFAULT 4,
      player_color VARCHAR(20) DEFAULT '#ef4444', ai_color VARCHAR(20) DEFAULT '#fbbf24',
      board_color VARCHAR(20) DEFAULT '#3b82f6', difficulty VARCHAR(20) DEFAULT 'medium',
      show_timer TINYINT(1) DEFAULT 1, time_limit_seconds INT DEFAULT 0,
      heading_1 VARCHAR(500), heading_2 VARCHAR(500), heading_3 VARCHAR(500), description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e', heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777', description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#0f172a', primary_color VARCHAR(20) DEFAULT '#3b82f6',
      bg_image_url VARCHAR(500), thankyou_bg_image_url VARCHAR(500), game_logo_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500), font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_drop_id INT DEFAULT NULL, sound_win_id INT DEFAULT NULL, sound_draw_id INT DEFAULT NULL,
      intro_text TEXT, intro_text_color VARCHAR(20) DEFAULT NULL,
      outro_text TEXT, outro_text_color VARCHAR(20) DEFAULT NULL,
      submit_button_text VARCHAR(500), continue_button_text VARCHAR(100) DEFAULT 'Continue →',
      start_button_text VARCHAR(500),
      start_button_text_color VARCHAR(20) DEFAULT NULL, start_button_bg_color VARCHAR(20) DEFAULT NULL,
      submit_button_text_color VARCHAR(20) DEFAULT NULL, submit_button_bg_color VARCHAR(20) DEFAULT NULL,
      continue_button_text_color VARCHAR(20) DEFAULT NULL, continue_button_bg_color VARCHAR(20) DEFAULT NULL,
      thankyou_subtitle VARCHAR(500) DEFAULT NULL, thankyou_subtitle_color VARCHAR(20) DEFAULT NULL,
      terms_enabled TINYINT(1) DEFAULT 0, terms_text TEXT, terms_url VARCHAR(500), meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'connect4_settings table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS flappy_settings (
      id INT AUTO_INCREMENT PRIMARY KEY, game_id INT UNIQUE,
      gravity DECIMAL(3,2) DEFAULT 0.50, flap_strength DECIMAL(4,2) DEFAULT -8.00,
      pipe_speed INT DEFAULT 3, pipe_gap INT DEFAULT 150, pipe_width INT DEFAULT 60,
      bird_color VARCHAR(20) DEFAULT '#f59e0b', pipe_color VARCHAR(20) DEFAULT '#22c55e',
      ground_color VARCHAR(20) DEFAULT '#8B4513', sky_color VARCHAR(20) DEFAULT '#87CEEB',
      show_timer TINYINT(1) DEFAULT 1, time_limit_seconds INT DEFAULT 0,
      heading_1 VARCHAR(500), heading_2 VARCHAR(500), heading_3 VARCHAR(500), description_text TEXT,
      heading_1_color VARCHAR(20) DEFAULT '#1a1a2e', heading_2_color VARCHAR(20) DEFAULT '#666666',
      heading_3_color VARCHAR(20) DEFAULT '#777777', description_color VARCHAR(20) DEFAULT '#888888',
      bg_color VARCHAR(20) DEFAULT '#87CEEB', primary_color VARCHAR(20) DEFAULT '#f59e0b',
      bg_image_url VARCHAR(500), thankyou_bg_image_url VARCHAR(500), game_logo_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500), font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_flap_id INT DEFAULT NULL, sound_score_id INT DEFAULT NULL, sound_gameover_id INT DEFAULT NULL,
      intro_text TEXT, intro_text_color VARCHAR(20) DEFAULT NULL,
      outro_text TEXT, outro_text_color VARCHAR(20) DEFAULT NULL,
      submit_button_text VARCHAR(500), continue_button_text VARCHAR(100) DEFAULT 'Continue →',
      start_button_text VARCHAR(500),
      start_button_text_color VARCHAR(20) DEFAULT NULL, start_button_bg_color VARCHAR(20) DEFAULT NULL,
      submit_button_text_color VARCHAR(20) DEFAULT NULL, submit_button_bg_color VARCHAR(20) DEFAULT NULL,
      continue_button_text_color VARCHAR(20) DEFAULT NULL, continue_button_bg_color VARCHAR(20) DEFAULT NULL,
      thankyou_subtitle VARCHAR(500) DEFAULT NULL, thankyou_subtitle_color VARCHAR(20) DEFAULT NULL,
      terms_enabled TINYINT(1) DEFAULT 0, terms_text TEXT, terms_url VARCHAR(500), meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'flappy_settings table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS game2048_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT UNIQUE,
      grid_size INT DEFAULT 4,
      target_number INT DEFAULT 2048,
      tile_colors JSON,
      show_timer TINYINT(1) DEFAULT 0,
      time_limit_seconds INT DEFAULT 0,
      heading_1 VARCHAR(500),
      heading_2 VARCHAR(500),
      heading_3 VARCHAR(500),
      heading_1_color VARCHAR(20) DEFAULT '#776e65',
      heading_2_color VARCHAR(20) DEFAULT '#776e65',
      heading_3_color VARCHAR(20) DEFAULT '#776e65',
      description_text TEXT,
      description_color VARCHAR(20) DEFAULT '#776e65',
      bg_color VARCHAR(20) DEFAULT '#faf8ef',
      primary_color VARCHAR(20) DEFAULT '#8f7a66',
      bg_image_url VARCHAR(500),
      thankyou_bg_image_url VARCHAR(500),
      game_logo_url VARCHAR(500),
      submit_confirm_gif_url VARCHAR(500),
      font_family VARCHAR(100) DEFAULT 'DM Sans',
      sound_slide_id INT DEFAULT NULL,
      sound_merge_id INT DEFAULT NULL,
      sound_win_id INT DEFAULT NULL,
      sound_lose_id INT DEFAULT NULL,
      intro_text TEXT,
      intro_text_color VARCHAR(20) DEFAULT '#776e65',
      outro_text TEXT,
      outro_text_color VARCHAR(20) DEFAULT '#776e65',
      thankyou_subtitle TEXT,
      thankyou_subtitle_color VARCHAR(20) DEFAULT '#444444',
      submit_button_text VARCHAR(500),
      submit_button_text_color VARCHAR(20) DEFAULT '#ffffff',
      submit_button_bg_color VARCHAR(20),
      continue_button_text VARCHAR(100) DEFAULT 'Continue →',
      continue_button_text_color VARCHAR(20) DEFAULT '#ffffff',
      continue_button_bg_color VARCHAR(20),
      start_button_text VARCHAR(500),
      start_button_text_color VARCHAR(20) DEFAULT '#ffffff',
      start_button_bg_color VARCHAR(20),
      terms_enabled TINYINT(1) DEFAULT 0,
      terms_text TEXT,
      terms_url VARCHAR(500),
      meta_description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'game2048_settings table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS game2048_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT,
      session_token VARCHAR(255),
      score INT DEFAULT 0,
      best_score INT DEFAULT 0,
      moves INT DEFAULT 0,
      grid_state JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY (game_id, session_token)
    )
  `, 'game2048_scores table');

  /* ── CROSSWORD SETTINGS COLOR MIGRATIONS ── */
  await addColumn(connection, 'crossword_settings', 'heading_1_color', "VARCHAR(20) DEFAULT '#1a1a2e'");
  await addColumn(connection, 'crossword_settings', 'heading_2_color', "VARCHAR(20) DEFAULT '#666666'");
  await addColumn(connection, 'crossword_settings', 'heading_3_color', "VARCHAR(20) DEFAULT '#777777'");
  await addColumn(connection, 'crossword_settings', 'description_color', "VARCHAR(20) DEFAULT '#888888'");
  await addColumn(connection, 'crossword_settings', 'blank_cell_image_url', 'VARCHAR(500)');
  await addColumn(connection, 'crossword_settings', 'submit_confirm_gif_url', 'VARCHAR(500)');

  /* ── EXISTING COLUMN MIGRATIONS (all from your original, unchanged) ── */
  console.log('🔄 Running column migrations...');

  /* QUESTIONS */
  await addColumn(connection, 'questions', 'question_bg_image_url', 'VARCHAR(500)');
  await addColumn(connection, 'questions', 'sound_correct', 'VARCHAR(500)');
  await addColumn(connection, 'questions', 'sound_wrong', 'VARCHAR(500)');
  await addColumn(connection, 'questions', 'sound_neutral', 'VARCHAR(500)');
  await addColumn(connection, 'questions', 'sound_correct_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'questions', 'sound_wrong_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'questions', 'sound_neutral_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'questions', 'overlay_duration', 'INT DEFAULT 3');
  await addColumn(connection, 'questions', 'overlay_idle_time', 'INT DEFAULT 3');
  await addColumn(connection, 'questions', 'overlay_animation_in', "VARCHAR(50) DEFAULT 'flyFromBottom'");
  await addColumn(connection, 'questions', 'overlay_animation_out', "VARCHAR(50) DEFAULT 'flyToTop'");
  await addColumn(connection, 'questions', 'question_image_animation', "VARCHAR(50) DEFAULT 'float'");

  /* OPTIONS */
  await addColumn(connection, 'options', 'option_overlay_image_url', 'VARCHAR(500)');
  await addColumn(connection, 'options', 'option_text_color', "VARCHAR(20) DEFAULT '#ffffff'");

  /* QUIZ SETTINGS */
  await addColumn(connection, 'quiz_settings', 'bg_image_url', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'thankyou_bg_image_url', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'terms_enabled', 'TINYINT(1) DEFAULT 0');
  await addColumn(connection, 'quiz_settings', 'terms_text', 'TEXT');
  await addColumn(connection, 'quiz_settings', 'terms_url', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'send_email', 'TINYINT(1) DEFAULT 1');
  await addColumn(connection, 'quiz_settings', 'win_sound_url', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'win_sound_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'quiz_settings', 'lose_sound_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'quiz_settings', 'sound_correct_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'quiz_settings', 'sound_wrong_id', 'INT DEFAULT NULL');
  await addColumn(connection, 'quiz_settings', 'game_logo_url', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'font_family', "VARCHAR(100) DEFAULT 'DM Sans'");
  await addColumn(connection, 'quiz_settings', 'submit_confirm_gif_url', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'allow_back', 'TINYINT(1) DEFAULT 0');
  await addColumn(connection, 'quiz_settings', 'time_per_question', 'INT DEFAULT 0');
  await addColumn(connection, 'quiz_settings', 'heading_1', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'heading_2', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'heading_1_color', "VARCHAR(20) DEFAULT '#1a1a2e'");
  await addColumn(connection, 'quiz_settings', 'heading_2_color', "VARCHAR(20) DEFAULT '#1a1a2e'");
  await addColumn(connection, 'quiz_settings', 'intro_text_color', "VARCHAR(20) DEFAULT '#444444'");
  await addColumn(connection, 'quiz_settings', 'thankyou_subtitle', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'outro_text_color', "VARCHAR(20) DEFAULT '#1a1a2e'");
  await addColumn(connection, 'quiz_settings', 'thankyou_subtitle_color', "VARCHAR(20) DEFAULT '#444444'");
  await addColumn(connection, 'quiz_settings', 'start_button_text_color', "VARCHAR(20) DEFAULT '#ffffff'");
  await addColumn(connection, 'quiz_settings', 'start_button_bg_color', 'VARCHAR(20)');
  await addColumn(connection, 'quiz_settings', 'submit_button_text_color', "VARCHAR(20) DEFAULT '#ffffff'");
  await addColumn(connection, 'quiz_settings', 'submit_button_bg_color', 'VARCHAR(20)');
  await addColumn(connection, 'quiz_settings', 'continue_button_text_color', "VARCHAR(20) DEFAULT '#ffffff'");
  await addColumn(connection, 'quiz_settings', 'continue_button_bg_color', 'VARCHAR(20)');
  await addColumn(connection, 'quiz_settings', 'next_button_text', "VARCHAR(100) DEFAULT 'Next →'");
  await addColumn(connection, 'quiz_settings', 'next_button_text_color', "VARCHAR(20) DEFAULT '#ffffff'");
  await addColumn(connection, 'quiz_settings', 'next_button_bg_color', 'VARCHAR(20)');
  await addColumn(connection, 'quiz_settings', 'start_button_text', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'submit_button_text', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'continue_button_text', 'VARCHAR(500)');
  await addColumn(connection, 'quiz_settings', 'randomize_questions', 'TINYINT(1) DEFAULT 0');

  /* GAMES */
  await safeQuery(connection,
    `ALTER TABLE games MODIFY COLUMN category ENUM('quiz','survey','poll','crossword','spin','memory','jigsaw','wordsearch','pouring','typer','math','maze','screw','2048','snake','catch','reaction','simon','flappy','bounce','space','connect4') DEFAULT 'quiz'`,
    'games.category ENUM includes connect4'
  );
  await addColumn(connection, 'games', 'client_id', 'INT');
  await addColumn(connection, 'games', 'slug', 'VARCHAR(255)');
  await addColumn(connection, 'games', 'description', 'TEXT');
  await addColumn(connection, 'games', 'redirect_url', 'VARCHAR(500)');
  await addColumn(connection, 'games', 'is_active', 'TINYINT(1) DEFAULT 1');
  await addColumn(connection, 'games', 'game_logo_url', 'VARCHAR(500)');
  await addColumn(connection, 'games', 'show_in_play_page', 'TINYINT(1) DEFAULT 0');
  await addColumn(connection, 'games', 'show_in_hero_page', 'TINYINT(1) DEFAULT 0');
  await addColumn(connection, 'games', 'created_by', 'INT');
  await addColumn(connection, 'games', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await addColumn(connection, 'games', 'updated_by', 'INT DEFAULT NULL');

  /* PLAYER SESSIONS */
  await addColumn(connection, 'player_sessions', 'source_type', "VARCHAR(20) DEFAULT 'direct'");
  await addColumn(connection, 'player_sessions', 'completed_at', 'TIMESTAMP NULL');
  await addColumn(connection, 'player_sessions', 'email_sent', 'TINYINT(1) DEFAULT 0');
  await addColumn(connection, 'player_sessions', 'utm_source', 'VARCHAR(255)');
  await addColumn(connection, 'player_sessions', 'utm_medium', 'VARCHAR(255)');
  await addColumn(connection, 'player_sessions', 'utm_campaign', 'VARCHAR(255)');
  await addColumn(connection, 'player_sessions', 'utm_term', 'VARCHAR(255)');
  await addColumn(connection, 'player_sessions', 'utm_content', 'VARCHAR(255)');
  await addColumn(connection, 'player_sessions', 'promo_player_id', 'INT');

  /* SOUNDS — url column used by sounds.js route */
  await addColumn(connection, 'sounds', 'url', 'VARCHAR(500)');

  /* SCREW SETTINGS — missing fields */
  await addColumn(connection, 'screw_settings', 'start_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'screw_settings', 'start_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'screw_settings', 'submit_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'screw_settings', 'submit_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'screw_settings', 'continue_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'screw_settings', 'continue_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'screw_settings', 'thankyou_subtitle', "VARCHAR(500) DEFAULT NULL");
  await addColumn(connection, 'screw_settings', 'thankyou_subtitle_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'screw_settings', 'outro_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'screw_settings', 'intro_text_color', "VARCHAR(20) DEFAULT NULL");

  /* ── SIMON SETTINGS — missing button/thankyou color fields ── */
  await addColumn(connection, 'simon_settings', 'intro_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'simon_settings', 'outro_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'simon_settings', 'thankyou_subtitle', "VARCHAR(500) DEFAULT NULL");
  await addColumn(connection, 'simon_settings', 'thankyou_subtitle_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'simon_settings', 'submit_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'simon_settings', 'submit_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'simon_settings', 'continue_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'simon_settings', 'continue_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'simon_settings', 'start_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'simon_settings', 'start_button_bg_color', "VARCHAR(20) DEFAULT NULL");

  /* ── SNAKE SETTINGS — missing button/thankyou color fields + reveal_image_url ── */
  await addColumn(connection, 'snake_settings', 'intro_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'snake_settings', 'outro_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'snake_settings', 'thankyou_subtitle', "VARCHAR(500) DEFAULT NULL");
  await addColumn(connection, 'snake_settings', 'thankyou_subtitle_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'snake_settings', 'submit_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'snake_settings', 'submit_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'snake_settings', 'continue_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'snake_settings', 'continue_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'snake_settings', 'start_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'snake_settings', 'start_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'snake_settings', 'reveal_image_url', "VARCHAR(500) DEFAULT NULL");

  /* ── CATCH SETTINGS — missing button/thankyou color fields ── */
  await addColumn(connection, 'catch_settings', 'intro_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'catch_settings', 'outro_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'catch_settings', 'thankyou_subtitle', "VARCHAR(500) DEFAULT NULL");
  await addColumn(connection, 'catch_settings', 'thankyou_subtitle_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'catch_settings', 'submit_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'catch_settings', 'submit_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'catch_settings', 'continue_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'catch_settings', 'continue_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'catch_settings', 'start_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'catch_settings', 'start_button_bg_color', "VARCHAR(20) DEFAULT NULL");

  /* ── REACTION SETTINGS — missing button/thankyou color fields + time_limit_seconds ── */
  await addColumn(connection, 'reaction_settings', 'intro_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'reaction_settings', 'outro_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'reaction_settings', 'thankyou_subtitle', "VARCHAR(500) DEFAULT NULL");
  await addColumn(connection, 'reaction_settings', 'thankyou_subtitle_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'reaction_settings', 'submit_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'reaction_settings', 'submit_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'reaction_settings', 'continue_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'reaction_settings', 'continue_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'reaction_settings', 'start_button_text_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'reaction_settings', 'start_button_bg_color', "VARCHAR(20) DEFAULT NULL");
  await addColumn(connection, 'reaction_settings', 'time_limit_seconds', "INT DEFAULT 0");

  /* ── GAME2048 SETTINGS — missing fields read by player ── */
  await addColumn(connection, 'game2048_settings', 'overlay_animation_in', "VARCHAR(50) DEFAULT 'flyFromBottom'");
  await addColumn(connection, 'game2048_settings', 'keep_going_button_text', "VARCHAR(100) DEFAULT 'Keep Going'");
  await addColumn(connection, 'game2048_settings', 'claim_prize_button_text', "VARCHAR(100) DEFAULT 'Claim Prize →'");
  await addColumn(connection, 'game2048_settings', 'new_game_button_text', "VARCHAR(100) DEFAULT '↻ New Game'");

  /* ── QUESTIONS — short answer support ── */
  await addColumn(connection, 'questions', 'answer_text', "VARCHAR(500) DEFAULT NULL");
  await addColumn(connection, 'questions', 'answer_is_number', "TINYINT(1) DEFAULT 0");
  // Change question_type from ENUM to VARCHAR so it can hold 'short_answer'
  await safeQuery(connection, `ALTER TABLE questions MODIFY COLUMN question_type VARCHAR(50) DEFAULT 'right_wrong'`, 'questions.question_type → VARCHAR(50)');

  /* ── BOUNCE GAME TABLES ── */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS bounce_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      primary_color VARCHAR(20) DEFAULT '#e53935',
      bg_color VARCHAR(20) DEFAULT '#f5f5f5',
      bg_image_url VARCHAR(500),
      ball_image_url VARCHAR(500),
      ball_color VARCHAR(20) DEFAULT '#e53935',
      ball_size INT DEFAULT 24,
      gravity FLOAT DEFAULT 0.5,
      jump_force FLOAT DEFAULT -12,
      friction FLOAT DEFAULT 0.85,
      max_speed FLOAT DEFAULT 8,
      intro_text TEXT,
      intro_text_color VARCHAR(20) DEFAULT '#1a1a2e',
      outro_text TEXT,
      outro_text_color VARCHAR(20) DEFAULT '#1a1a2e',
      time_limit_seconds INT DEFAULT 0,
      show_timer TINYINT(1) DEFAULT 1,
      sound_jump_id INT DEFAULT NULL,
      sound_coin_id INT DEFAULT NULL,
      sound_hit_id INT DEFAULT NULL,
      sound_win_id INT DEFAULT NULL,
      sound_lose_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'bounce_settings table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS bounce_levels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      level_order INT DEFAULT 0,
      level_name VARCHAR(100) DEFAULT 'Level',
      width INT DEFAULT 3000,
      height INT DEFAULT 600,
      bg_color VARCHAR(20),
      bg_image_url VARCHAR(500),
      parallax_bg_url VARCHAR(500),
      time_limit_seconds INT DEFAULT 0,
      target_score INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'bounce_levels table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS bounce_objects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      level_id INT NOT NULL,
      type ENUM('platform','moving_platform','spike','spring','coin','goal','wall','death_zone') DEFAULT 'platform',
      x INT DEFAULT 0,
      y INT DEFAULT 0,
      width INT DEFAULT 100,
      height INT DEFAULT 20,
      color VARCHAR(20) DEFAULT '#333',
      image_url VARCHAR(500),
      -- Moving platform properties
      move_type ENUM('horizontal','vertical','none') DEFAULT 'none',
      move_distance INT DEFAULT 200,
      move_speed FLOAT DEFAULT 1,
      move_start_offset INT DEFAULT 0,
      -- Spring properties
      spring_force FLOAT DEFAULT -18,
      -- Coin properties
      coin_value INT DEFAULT 10,
      -- Goal properties
      goal_text VARCHAR(50) DEFAULT 'FINISH',
      -- Z-index for rendering order
      z_index INT DEFAULT 0,
      object_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (level_id) REFERENCES bounce_levels(id) ON DELETE CASCADE
    )
  `, 'bounce_objects table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS bounce_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NOT NULL,
      level_id INT NOT NULL,
      score INT DEFAULT 0,
      coins_collected INT DEFAULT 0,
      time_elapsed INT DEFAULT 0,
      completed TINYINT(1) DEFAULT 0,
      deaths INT DEFAULT 0,
      best_time INT DEFAULT NULL,
      best_score INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES player_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (level_id) REFERENCES bounce_levels(id) ON DELETE CASCADE,
      UNIQUE KEY unique_session_level (session_id, level_id)
    )
  `, 'bounce_progress table');

  /* ── SPACE SHOOTER GAME TABLES ── */
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS space_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      primary_color VARCHAR(20) DEFAULT '#3b82f6',
      secondary_color VARCHAR(20) DEFAULT '#1e40af',
      accent_color VARCHAR(20) DEFAULT '#fbbf24',
      bg_color VARCHAR(20) DEFAULT '#0f172a',
      bg_image_url VARCHAR(500),
      star_density INT DEFAULT 50,
      enemy_speed INT DEFAULT 2,
      player_speed INT DEFAULT 4,
      laser_speed INT DEFAULT 6,
      intro_text TEXT,
      intro_text_color VARCHAR(20) DEFAULT '#e2e8f0',
      outro_text TEXT,
      outro_text_color VARCHAR(20) DEFAULT '#e2e8f0',
      time_limit_seconds INT DEFAULT 0,
      show_timer TINYINT(1) DEFAULT 1,
      sound_laser_id INT DEFAULT NULL,
      sound_explosion_id INT DEFAULT NULL,
      sound_hit_id INT DEFAULT NULL,
      sound_powerup_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'space_settings table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS space_ships (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      ship_name VARCHAR(100) NOT NULL,
      image_url VARCHAR(500),
      width INT DEFAULT 40,
      height INT DEFAULT 40,
      color VARCHAR(20) DEFAULT '#3b82f6',
      speed INT DEFAULT 4,
      laser_speed INT DEFAULT 6,
      laser_width INT DEFAULT 4,
      laser_damage INT DEFAULT 1,
      shield_points INT DEFAULT 100,
      is_default TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'space_ships table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS space_weapons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      weapon_name VARCHAR(100) NOT NULL,
      image_url VARCHAR(500),
      laser_speed INT DEFAULT 6,
      laser_width INT DEFAULT 4,
      laser_damage INT DEFAULT 1,
      fire_rate INT DEFAULT 200,
      cost INT DEFAULT 0,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'space_weapons table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS space_enemies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      enemy_name VARCHAR(100) NOT NULL,
      image_url VARCHAR(500),
      width INT DEFAULT 30,
      height INT DEFAULT 30,
      color VARCHAR(20) DEFAULT '#ef4444',
      speed INT DEFAULT 2,
      hp INT DEFAULT 1,
      points_value INT DEFAULT 10,
      attack_damage INT DEFAULT 1,
      move_pattern ENUM('straight','zigzag','circle','sine','random') DEFAULT 'straight',
      shoot_pattern ENUM('none','single','double','spread') DEFAULT 'none',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'space_enemies table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS space_levels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      level_order INT DEFAULT 0,
      level_name VARCHAR(100) DEFAULT 'Level',
      width INT DEFAULT 800,
      height INT DEFAULT 600,
      bg_color VARCHAR(20),
      bg_image_url VARCHAR(500),
      time_limit_seconds INT DEFAULT 0,
      target_score INT DEFAULT 0,
      enemy_spawn_rate INT DEFAULT 1000,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'space_levels table');

  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS space_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NOT NULL,
      level_id INT NOT NULL,
      score INT DEFAULT 0,
      kills INT DEFAULT 0,
      time_elapsed INT DEFAULT 0,
      completed TINYINT(1) DEFAULT 0,
      deaths INT DEFAULT 0,
      best_time INT DEFAULT NULL,
      best_score INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES player_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (level_id) REFERENCES space_levels(id) ON DELETE CASCADE,
      UNIQUE KEY unique_session_level (session_id, level_id)
    )
  `, 'space_progress table');

  /* ── BRICK IMAGES TABLE ── */
  console.log('🧱 Creating brick images table...');
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS brick_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image_url VARCHAR(500) NOT NULL,
      name VARCHAR(255) DEFAULT 'Brick Image',
      is_active TINYINT(1) DEFAULT 1,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `, 'brick_images table');

  console.log('👤 Creating admin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  try {
    const [existingAdmin] = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
    if (existingAdmin.length === 0) {
      await connection.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', adminEmail, hashedPassword, 'admin']);
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

/* ================= EXPORT ================= */

module.exports = initDB;

/* ================= RUN (when called directly) ================= */

if (require.main === module) {
  initDB().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
}
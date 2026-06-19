require('dotenv').config();
const mysql = require('mysql2/promise');

async function safeQuery(conn, sql, label) {
  try {
    await conn.query(sql);
    if (label) console.log(`✅ ${label}`);
  } catch (err) {
    console.error(`❌ ${label || 'Query failed'}:`, err.message);
  }
}

async function initSpin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'quizuser',
    password: process.env.DB_PASSWORD || 'QuizPass@123',
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  const dbName = process.env.DB_NAME || 'quiz_platform';
  await connection.query(`USE \`${dbName}\``);

  console.log('🎡 Running Spin-the-Wheel migration...');

  // ── 1. SPIN SETTINGS ──────────────────────────────────────────────────────
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS spin_settings (
      id                   INT AUTO_INCREMENT PRIMARY KEY,
      game_id              INT          NOT NULL UNIQUE,
      heading_1            VARCHAR(255),
      heading_2            VARCHAR(255),
      description_text     TEXT,
      spin_mode            ENUM('once','unlimited') NOT NULL DEFAULT 'once',
      win_message          TEXT,
      lose_message         TEXT,
      wheel_bg_color       VARCHAR(20)  DEFAULT '#FFFFFF',
      pointer_color        VARCHAR(20)  DEFAULT '#EF4444',
      center_color         VARCHAR(20)  DEFAULT '#1F2937',
      center_label         VARCHAR(50)  DEFAULT 'SPIN',
      bg_color             VARCHAR(20)  DEFAULT '#F8F8FF',
      primary_color        VARCHAR(20)  DEFAULT '#7C6FF7',
      bg_image_url         VARCHAR(500),
      thankyou_bg_image_url VARCHAR(500),
      game_logo_url        VARCHAR(500),
      font_family          VARCHAR(100) DEFAULT 'DM Sans',
      sound_spin_id        INT DEFAULT NULL,
      sound_win_id         INT DEFAULT NULL,
      sound_lose_id        INT DEFAULT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `, 'spin_settings table');

  // ── 2. SPIN SEGMENTS ──────────────────────────────────────────────────────
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS spin_segments (
      id                  INT AUTO_INCREMENT PRIMARY KEY,
      game_id             INT          NOT NULL,
      label               VARCHAR(100) NOT NULL,
      bg_color            VARCHAR(20)  DEFAULT '#7C6FF7',
      text_color          VARCHAR(20)  DEFAULT '#FFFFFF',
      weight              INT          NOT NULL DEFAULT 100,
      segment_type        ENUM('prize','no_prize','try_again') NOT NULL DEFAULT 'prize',
      prize_description   TEXT,
      coupon_code         VARCHAR(100),
      coupon_image_url    VARCHAR(500),
      overlay_image_url   VARCHAR(500),
      sound_id            INT DEFAULT NULL,
      segment_order       INT          NOT NULL DEFAULT 0,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      INDEX idx_game_order (game_id, segment_order)
    )
  `, 'spin_segments table');

  // ── 3. Add spin to games category enum if needed ──────────────────────────
  try {
    const [[col]] = await connection.query(`
      SELECT COLUMN_TYPE FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = '${dbName}' AND TABLE_NAME = 'games' AND COLUMN_NAME = 'category'
    `);
    if (col && !col.COLUMN_TYPE.includes('spin')) {
      await connection.query(`
        ALTER TABLE \`games\`
        MODIFY COLUMN \`category\` ENUM('quiz','survey','poll','crossword','spin') NOT NULL DEFAULT 'quiz'
      `);
      console.log('✅ games.category enum updated with spin');
    } else {
      console.log('ℹ️  games.category already has spin');
    }
  } catch (err) {
    console.error('❌ games.category enum update:', err.message);
  }

  await connection.end();
  console.log('\n🎉 Spin-the-Wheel migration completed!');
  console.log('Tables created: spin_settings, spin_segments');
}

initSpin().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

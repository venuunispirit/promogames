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

async function initPromo() {
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

  console.log('🚀 Running PromoPlayer migration...');

  // ── 1. PROMO PLAYERS ──────────────────────────────────────────────────────
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS promo_players (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      name         VARCHAR(100)  NOT NULL,
      age          INT,
      dob          DATE,
      email        VARCHAR(150)  NOT NULL UNIQUE,
      whatsapp     VARCHAR(20),
      city         VARCHAR(100),
      pincode      VARCHAR(10),
      pp_balance   INT           NOT NULL DEFAULT 100,
      created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `, 'promo_players table');

  // ── 2. OTP TOKENS ─────────────────────────────────────────────────────────
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS otp_tokens (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      email      VARCHAR(150) NOT NULL,
      otp_code   VARCHAR(10)  NOT NULL,
      expires_at DATETIME     NOT NULL,
      used       TINYINT(1)   DEFAULT 0,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email)
    )
  `, 'otp_tokens table');

  // ── 3. TRUSTED DEVICES (admin auto-login) ─────────────────────────────────
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS trusted_devices (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      user_id      INT          NOT NULL,
      device_token VARCHAR(255) NOT NULL UNIQUE,
      ip_last_seen VARCHAR(50),
      last_login   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_device_token (device_token)
    )
  `, 'trusted_devices table');

  // ── 4. PP TRANSACTIONS ────────────────────────────────────────────────────
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS pp_transactions (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      player_id  INT          NOT NULL,
      type       ENUM('earn','spend','reset') NOT NULL,
      points     INT          NOT NULL,
      game_id    INT          DEFAULT NULL,
      note       VARCHAR(255),
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES promo_players(id) ON DELETE CASCADE,
      INDEX idx_player (player_id)
    )
  `, 'pp_transactions table');

  // ── 5. BRAND REWARDS ──────────────────────────────────────────────────────
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS brand_rewards (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      client_id   INT          NOT NULL,
      title       VARCHAR(255) NOT NULL,
      description TEXT,
      pp_cost     INT          NOT NULL DEFAULT 0,
      stock       INT          DEFAULT -1,
      is_active   TINYINT(1)   DEFAULT 1,
      created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `, 'brand_rewards table');

  // ── 6. REDEMPTIONS ────────────────────────────────────────────────────────
  await safeQuery(connection, `
    CREATE TABLE IF NOT EXISTS redemptions (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      player_id   INT          NOT NULL,
      reward_id   INT          NOT NULL,
      pp_spent    INT          NOT NULL,
      status      ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
      redeemed_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES promo_players(id) ON DELETE CASCADE,
      FOREIGN KEY (reward_id) REFERENCES brand_rewards(id) ON DELETE CASCADE,
      INDEX idx_player_redemptions (player_id)
    )
  `, 'redemptions table');

  // ── 7. Add game_type column to games (branded vs promogames) ──────────────
  try {
    const [cols] = await connection.query(`SHOW COLUMNS FROM \`games\` LIKE 'game_type'`);
    if (cols.length === 0) {
      await connection.query(`
        ALTER TABLE \`games\`
        ADD COLUMN \`game_type\` ENUM('promogames','branded') NOT NULL DEFAULT 'promogames'
      `);
      console.log("✅ games.game_type column added");
    } else {
      console.log("ℹ️  games.game_type already exists");
    }
  } catch (err) {
    console.error("❌ games.game_type migration:", err.message);
  }

  // ── 8. Add pp_awarded column to player_sessions ───────────────────────────
  try {
    const [cols] = await connection.query(`SHOW COLUMNS FROM \`player_sessions\` LIKE 'pp_awarded'`);
    if (cols.length === 0) {
      await connection.query(`
        ALTER TABLE \`player_sessions\`
        ADD COLUMN \`pp_awarded\`    TINYINT(1) DEFAULT 0,
        ADD COLUMN \`promo_player_id\` INT DEFAULT NULL
      `);
      console.log("✅ player_sessions.pp_awarded + promo_player_id columns added");
    } else {
      console.log("ℹ️  player_sessions.pp_awarded already exists");
    }
  } catch (err) {
    console.error("❌ player_sessions migration:", err.message);
  }

  await connection.end();
  console.log('\n🎉 PromoPlayer migration completed successfully!');
  console.log('Tables created: promo_players, otp_tokens, trusted_devices, pp_transactions, brand_rewards, redemptions');
  console.log('Columns added: games.game_type, player_sessions.pp_awarded, player_sessions.promo_player_id');
}

initPromo().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
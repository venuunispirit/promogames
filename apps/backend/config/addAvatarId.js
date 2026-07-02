require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'quizuser',
    password: process.env.DB_PASSWORD || 'QuizPass@123',
  });
  await c.query('USE `' + (process.env.DB_NAME || 'quiz_platform') + '`');
  try {
    await c.query("ALTER TABLE promo_players ADD COLUMN avatar_id VARCHAR(50) DEFAULT 'av-3'");
    console.log('✅ added avatar_id column');
  } catch (e) {
    console.log(e.message);
  }
  await c.end();
})();

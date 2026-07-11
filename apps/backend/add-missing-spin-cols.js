require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'quizuser',
    password: process.env.DB_PASSWORD || 'QuizPass@123',
    database: process.env.DB_NAME || 'quiz_platform',
    charset: 'utf8mb4',
  });

  console.log('Adding missing columns to spin_settings...');

  const columns = [
    ['submit_confirm_gif_url', 'VARCHAR(500)'],
    ['meta_description', 'TEXT'],
    ['outro_text', 'TEXT'],
    ['outro_text_color', "VARCHAR(20) DEFAULT '#1a1a2e'"],
    ['thankyou_subtitle', 'TEXT'],
    ['thankyou_subtitle_color', "VARCHAR(20) DEFAULT '#444444'"],
    ['submit_button_text', 'VARCHAR(500)'],
    ['submit_button_text_color', "VARCHAR(20) DEFAULT '#ffffff'"],
    ['submit_button_bg_color', 'VARCHAR(20)'],
    ['redirect_open_new_tab', 'TINYINT(1) DEFAULT 0'],
    ['continue_button_text_color', "VARCHAR(20) DEFAULT '#ffffff'"],
    ['continue_button_bg_color', 'VARCHAR(20)'],
    ['terms_enabled', 'TINYINT(1) DEFAULT 0'],
    ['terms_text', 'TEXT'],
    ['terms_url', 'VARCHAR(500)'],
    ['start_button_text', 'VARCHAR(500)'],
    ['start_button_text_color', "VARCHAR(20) DEFAULT '#ffffff'"],
    ['start_button_bg_color', 'VARCHAR(20)'],
  ];

  for (const [col, def] of columns) {
    try {
      await connection.query(`ALTER TABLE spin_settings ADD COLUMN IF NOT EXISTS \`${col}\` ${def}`);
      console.log('✅ Added column: ' + col);
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('ℹ️ Column already exists: ' + col);
      } else {
        console.error('❌ Failed to add ' + col + ':', err.message);
      }
    }
  }

  await connection.end();
  console.log('\n🎉 Done with spin_settings updates!');
})();

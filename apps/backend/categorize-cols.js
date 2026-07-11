require('dotenv').config();
const mysql = require('mysql2/promise');
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'quizuser',
  password: process.env.DB_PASSWORD || 'QuizPass@123',
  database: process.env.DB_NAME || 'quiz_platform',
  charset: 'utf8mb4'
});

(async () => {
  console.log('=== CHECKING TABLE COLUMNS ===\n');
  
  const tables = ['quiz_settings', 'spin_settings', 'crossword_settings'];
  
  for (const table of tables) {
    const [cols] = await db.query(`DESCRIBE ${table}`);
    console.log(`${table}:`);
    for (const col of cols) {
      console.log(`  ${col.Field} (${col.Type})`);
    }
    console.log();
  }
  
  await db.end();
})();

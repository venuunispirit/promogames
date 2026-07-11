require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'quizuser',
      password: process.env.DB_PASSWORD || 'QuizPass@123',
      database: process.env.DB_NAME || 'quiz_platform',
      charset: 'utf8mb4',
      multipleStatements: true
    });
    
    const [rows] = await connection.query('SHOW COLUMNS FROM quiz_settings');
    console.log('=== quiz_settings ===');
    for (const row of rows) {
      console.log(row.Field + ' ' + row.Type);
    }
    
    const [rows2] = await connection.query('SHOW COLUMNS FROM spin_settings');
    console.log('\n=== spin_settings ===');
    for (const row of rows2) {
      console.log(row.Field + ' ' + row.Type);
    }
    
    const [rows3] = await connection.query('SHOW COLUMNS FROM crossword_settings');
    console.log('\n=== crossword_settings ===');
    for (const row of rows3) {
      console.log(row.Field + ' ' + row.Type);
    }
    
    const [rows4] = await connection.query('SHOW COLUMNS FROM math_settings');
    console.log('\n=== math_settings ===');
    for (const row of rows4) {
      console.log(row.Field + ' ' + row.Type);
    }
    
    const [rows5] = await connection.query('SHOW COLUMNS FROM soundify_settings');
    console.log('\n=== soundify_settings ===');
    for (const row of rows5) {
      console.log(row.Field + ' ' + row.Type);
    }
    
    const [rows6] = await connection.query('SHOW COLUMNS FROM stressbuster_settings');
    console.log('\n=== stressbuster_settings ===');
    for (const row of rows6) {
      console.log(row.Field + ' ' + row.Type);
    }
    
    await connection.end();
  } catch (e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  }
})();

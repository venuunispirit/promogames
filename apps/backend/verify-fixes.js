require('dotenv').config();
const env = require('./config/env');
const mysql = require('mysql2/promise');
const db = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  charset: 'utf8mb4',
  multipleStatements: true
});

(async () => {
  console.log('Checking table structures...\n');
  
  // Check quiz_settings columns vs routes/games.js references
  const [qsCols] = await db.query('DESCRIBE quiz_settings');
  const qsFieldNames = qsCols.map(c => c.Field);
  
  const routeCols = [
    'bg_color', 'primary_color', 'show_progress', 'allow_back', 'time_per_question',
    'heading_1', 'heading_2', 'intro_text', 'outro_text',
    'win_sound_url', 'win_sound_id', 'lose_sound_id', 'sound_correct_id', 'sound_wrong_id',
    'terms_enabled', 'terms_text', 'terms_url', 'send_email',
    'bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'font_family', 'submit_confirm_gif_url',
    'heading_1_color', 'heading_2_color', 'intro_text_color',
    'title_color', 'description_color',  // from initPromo.js
    'thankyou_subtitle', 'outro_text_color', 'thankyou_subtitle_color',
    'start_button_text', 'start_button_text_color', 'start_button_bg_color',
    'submit_button_text', 'submit_button_text_color', 'submit_button_bg_color',
    'continue_button_text', 'continue_button_text_color', 'continue_button_bg_color',
    'next_button_text', 'next_button_text_color', 'next_button_bg_color',
    'randomize_questions', 'questions_per_session'
  ];
  
  console.log('Columns referenced in routes/games.js but NOT in quiz_settings table:');
  const missingCols = routeCols.filter(c => !qsFieldNames.includes(c));
  if (missingCols.length > 0) {
    for (const col of missingCols) {
      if (['heading_1', 'heading_2', 'title_color', 'description_color', 
           'start_button_text', 'next_button_text', 'submit_button_text', 'continue_button_text',
           'start_button_text_color', 'next_button_text_color', 'submit_button_text_color', 
           'continue_button_text_color', 'start_button_bg_color', 'next_button_bg_color',
           'submit_button_bg_color', 'continue_button_bg_color'].includes(col)) {
        console.log(`  ⚠️  ${col}: exists in the route but may be cosmetic in initPromo.js`);
      } else if (['heading_1_color', 'heading_2_color', 'intro_text_color', 
                   'thankyou_subtitle', 'outro_text_color', 'thankyou_subtitle_color'].includes(col)) {
        console.log(`  ❌ ${col}: referenced in route but NOT in table (BUG! Should be added)`);
      }
    }
  } else {
    console.log('  ✅ All route-referenced columns exist in quiz_settings table');
  }
  
  console.log('\nChecking spin_settings table vs routes/spin.js...');
  const [ssCols] = await db.query('DESCRIBE spin_settings');
  const ssFieldNames = ssCols.map(c => c.Field);
  
  const spinRouteCols = [
    'heading_1', 'heading_1_color', 'heading_2', 'heading_2_color',
    'description_text', 'description_color', 'spin_mode', 'win_message', 'lose_message',
    'wheel_bg_color', 'pointer_color', 'center_color', 'center_label',
    'bg_color', 'primary_color', 'bg_image_url', 'thankyou_bg_image_url',
    'game_logo_url', 'font_family', 'sound_spin_id', 'sound_win_id', 'sound_lose_id',
    'center_image_url', 'submit_confirm_gif_url', 'meta_description',
    'outro_text', 'outro_text_color', 'thankyou_subtitle', 'thankyou_subtitle_color',
    'submit_button_text', 'submit_button_text_color', 'submit_button_bg_color',
    'redirect_url', 'redirect_delay', 'redirect_open_new_tab',
    'continue_button_text', 'continue_button_text_color', 'continue_button_bg_color',
    'terms_enabled', 'terms_text', 'terms_url', 'start_button_text',
    'start_button_text_color', 'start_button_bg_color'
  ];
  
  console.log('Columns referenced in routes/spin.js but NOT in spin_settings table:');
  const ssMissing = spinRouteCols.filter(c => !ssFieldNames.includes(c));
  if (ssMissing.length > 0) {
    console.log('  ❌ CRITICAL BUG - Spin settings route references missing columns:');
    for (const col of ssMissing) {
      console.log(`    • ${col}`);
    }
  } else {
    console.log('  ✅ All spin route columns exist in spin_settings table');
  }
  
  console.log('\nChecking crossword_settings table...');
  const [csCols] = await db.query('DESCRIBE crossword_settings');
  const csFieldNames = csCols.map(c => c.Field);
  
  // Check columns that CrosswordPlayerPage.jsx should support
  const playerUses = ['grid_rows', 'grid_cols', 'cell_size', 'show_timer', 'time_limit_seconds', 'allow_hints', 'auto_size', 'blank_cell_image_url'];
  console.log('Columns needed for CrosswordPlayerPage but NOT in crossword_settings table:');
  const csMissingPlayer = playerUses.filter(c => !csFieldNames.includes(c));
  for (const col of csMissingPlayer) {
    console.log(`  ❌ ${col}: player should read this but column missing from table`);
  }
  
  const unneededCols = ['heading_1_color', 'heading_2_color', 'heading_3_color', 'description_color', 'meta_description', 'outro_text', 'submit_button_text', 'continue_button_text', 'submit_confirm_gif_url', 'start_button_text'];
  console.log('\nCosmetic columns in crossword_settings not used by CrosswordPlayerPage:');
  for (const col of unneededCols) {
    if (csFieldNames.includes(col)) {
      console.log(`  📝 ${col}: exists but CrosswordPlayerPage doesn't use it`);
    }
  }
  
  await db.end();
})();

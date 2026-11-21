#!/usr/bin/env node
/**
 * Fix double/multi-encoded UTF-8 mojibake stored in MySQL.
 *
 * Common cause: UTF-8 text was incorrectly decoded as Latin-1/Windows-1252 and then
 * re-encoded/saved as UTF-8, producing strings like "ÃƒÆ’..." or "â€™".
 * Fix: interpret the corrupted string's bytes as Latin-1 and decode as UTF-8.
 *
 * Usage (from repo root or apps/backend):
 *   node apps/backend/scripts/fix_mojibake.js
 *   node apps/backend/scripts/fix_mojibake.js --dry-run
 *
 * Requires apps/backend/.env with DB_* vars.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require('../config/env'); // validate env
const db = require('../config/db');

const DRY_RUN = process.argv.includes('--dry-run');

// Heuristic: detect common mojibake artifacts from UTF-8 misread as Latin-1
function looksLikeMojibake(s) {
  if (typeof s !== 'string' || s.length === 0) return false;
  // Common markers
  if (/[ÃÂ][\u0080-\u00BF]/.test(s)) return true;
  if (s.includes('â€™') || s.includes('â€œ') || s.includes('â€�') || s.includes('â€¦') ||
      s.includes('â€“') || s.includes('â€”') || s.includes('â€¢') || s.includes('â€˜') ||
      s.includes('Ã©') || s.includes('Ã¨') || s.includes('Ã ') || s.includes('Ã¡') ||
      s.includes('Ã¢') || s.includes('Ã³') || s.includes('Ã´') || s.includes('Ãº') ||
      s.includes('Ã±') || s.includes('Ã¼')) return true;
  if (s.includes('Ãƒ') || s.includes('Ã‚')) return true;
  return false;
}

function fixMojibakeString(s) {
  if (typeof s !== 'string' || s.length === 0) return { changed: false, value: s };
  // Try to repair by treating the JS string as Latin-1 bytes -> UTF-8
  try {
    const fixed = Buffer.from(s, 'latin1').toString('utf8');
    if (fixed === s) return { changed: false, value: s };
    // If the fixed version still contains replacement char in suspicious way, skip
    // But allow normal cases; be conservative: if original looked like mojibake, accept fix.
    if (looksLikeMojibake(s)) {
      return { changed: true, value: fixed };
    }
    // Even if not strongly matched, if it clearly improved (no more common artifacts), accept
    if (looksLikeMojibake(fixed)) {
      return { changed: false, value: s }; // fix made it worse, skip
    }
    // If original had no obvious markers but fix differs, it might be risky; skip to be safe
    return { changed: false, value: s };
  } catch (e) {
    return { changed: false, value: s };
  }
}

async function fixTableColumn(table, idCol, textCols) {
  let totalFixed = 0;
  for (const col of textCols) {
    try {
      const [rows] = await db.query(`SELECT \`${idCol}\` AS id, \`${col}\` AS val FROM \`${table}\` WHERE \`${col}\` IS NOT NULL AND \`${col}\` != ''`);
      for (const row of rows) {
        const original = row.val;
        if (typeof original !== 'string') continue;
        const { changed, value: fixed } = fixMojibakeString(original);
        if (changed && fixed !== original) {
          console.log(`[${table}.${col}] id=${row.id}:`);
          console.log(`  - "${original.slice(0, 120)}${original.length > 120 ? '...' : ''}"`);
          console.log(`  + "${fixed.slice(0, 120)}${fixed.length > 120 ? '...' : ''}"`);
          if (!DRY_RUN) {
            await db.query(`UPDATE \`${table}\` SET \`${col}\` = ? WHERE \`${idCol}\` = ?`, [fixed, row.id]);
          }
          totalFixed++;
        }
      }
    } catch (e) {
      // Table or column may not exist; skip
      console.warn(`Skip ${table}.${col}: ${e.message}`);
    }
  }
  return totalFixed;
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN (no changes will be written) ===' : '=== APPLYING FIXES ===');

  let grandTotal = 0;

  // Common settings tables (names seen in initDB)
  const settingsTables = [
    'quiz_settings',
    'spin_settings',
    'memory_settings',
    'jigsaw_settings',
    'wordsearch_settings',
    'pouring_settings',
    'typer_settings',
    'screw_settings',
    'tower_settings',
    'snake_settings',
    'catch_settings',
    'reaction_settings',
    'math_settings',
    'maze_settings',
    'game2048_settings',
    'simon_settings',
    'bounce_settings',
    'flappy_settings',
    'connect4_settings',
    'bowling_settings',
    'sudoku_settings',
    'minesweeper_settings',
    'wordscramble_settings',
    'rps_settings',
    'arrowescape_settings',
    'space_settings',
    'bejeweled_settings',
    'candyblast_settings',
    'tetris_settings',
    'stack_settings',
    'whackamole_settings',
    'hanoi_settings',
    'breakout_settings',
    'bubbleshooter_settings',
    'carlaunch_settings',
    'stressbuster_settings',
    'soundify_settings',
    'tictactoe_settings',
    'chess_settings',
    'spotreg_settings',
    'snakeandladder_settings',
    'ludo_settings',
    'carrom_settings',
    'tictactoemulti_settings',
    'crossword_settings',
  ];

  const textCols = [
    'heading_1', 'heading_2', 'heading_3',
    'description_text', 'intro_text',
    'start_button_text', 'start_button_text_color', // color usually not text mojibake, but harmless
    'terms_text', 'continue_button_text', 'submit_button_text',
    'next_button_text', 'play_again_text', 'leaderboard_button_text',
    'no_attempts_text', 'form_title',
  ];

  for (const t of settingsTables) {
    const n = await fixTableColumn(t, 'id', textCols);
    grandTotal += n;
  }

  // Form fields tables (common patterns)
  const formFieldTables = [
    { table: 'quiz_form_fields', idCol: 'id', cols: ['field_label', 'placeholder'] },
    { table: 'spin_form_fields', idCol: 'id', cols: ['field_label', 'placeholder'] },
    { table: 'memory_form_fields', idCol: 'id', cols: ['field_label', 'placeholder'] },
  ];
  for (const ft of formFieldTables) {
    try {
      const n = await fixTableColumn(ft.table, ft.idCol, ft.cols);
      grandTotal += n;
    } catch (e) {
      console.warn(`Skip ${ft.table}: ${e.message}`);
    }
  }

  console.log(`\nDone. ${DRY_RUN ? 'Would fix' : 'Fixed'} ~${grandTotal} field(s).`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});

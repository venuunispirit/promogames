/* ⛠️  LEGACY ROUTE — OUT OF SERVICE (migrated)
 * Superseded by module: games/tictactoe/route.js
 * This file is NO LONGER imported by apps/backend/server.js.
 * Kept temporarily for reference/rollback during migration testing.
 * TODO: DELETE this file once migrated-module testing is confirmed.
 * ---------------------------------------------------------------- */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../config/upload');
const { sendError } = require('../lib/apiError');

// Get tictactoe settings
router.get('/:gameId/settings', auth, async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM tictactoe_settings WHERE game_id = ?', [req.params.gameId]);
    res.json({ success: true, settings: settings[0] || null });
  } catch (err) {
    sendError(res, err);
  }
});

// Save tictactoe settings (upsert) with image uploads
router.put('/:gameId/settings', auth, upload.fields([
  { name: 'bg_image', maxCount: 1 },
  { name: 'thankyou_bg_image', maxCount: 1 },
  { name: 'game_logo', maxCount: 1 },
  { name: 'submit_confirm_gif', maxCount: 1 },
  { name: 'o_image', maxCount: 1 }
]), async (req, res) => {
const {
     heading_1, heading_2, heading_3, description_text,
     heading_1_color, heading_2_color, heading_3_color, description_color,
     custom_win_msg, try_again_btn_text, try_again_text_color, try_again_bg_color,
     continue_btn_text, continue_btn_text_color, continue_btn_bg_color,
     bg_color, primary_color, board_cell_color, bg_image_url, thankyou_bg_image_url, game_logo_url,
     font_family, submit_confirm_gif_url, meta_description,
     enable_board_selection, enable_level_selection, board_size, difficulty,
     terms_enabled, terms_text, terms_url,
     start_button_text, start_button_text_color, start_button_bg_color,
      sound_correct_id, sound_wrong_id, win_sound_id, lose_sound_id, o_image_url,
     thankyou_heading_text, thankyou_heading_color, thankyou_subtitle_text, thankyou_subtitle_color,
     submit_btn_text, submit_btn_text_color, submit_btn_bg_color,
     redirect_url, continue_now_btn_text, continue_now_btn_text_color, continue_now_btn_bg_color
   } = req.body;

  try {

    const [existing] = await db.query('SELECT * FROM tictactoe_settings WHERE game_id = ?', [req.params.gameId]);

    const bgImg  = req.files?.bg_image           ? `/uploads/images/${req.files.bg_image[0].filename}`           : (bg_image_url           !== undefined ? bg_image_url           : (existing[0]?.bg_image_url           || null));
    const tyImg  = req.files?.thankyou_bg_image  ? `/uploads/images/${req.files.thankyou_bg_image[0].filename}`  : (thankyou_bg_image_url  !== undefined ? thankyou_bg_image_url  : (existing[0]?.thankyou_bg_image_url  || null));
    const logoImg = req.files?.game_logo         ? `/uploads/images/${req.files.game_logo[0].filename}`          : (game_logo_url          !== undefined ? game_logo_url          : (existing[0]?.game_logo_url          || null));
    const gifImg  = req.files?.submit_confirm_gif  ? `/uploads/images/${req.files.submit_confirm_gif[0].filename}` : (submit_confirm_gif_url !== undefined ? submit_confirm_gif_url : (existing[0]?.submit_confirm_gif_url  || null));
    const oImg    = req.files?.o_image            ? `/uploads/images/${req.files.o_image[0].filename}`            : (o_image_url            !== undefined ? o_image_url            : (existing[0]?.o_image_url            || null));

    const toNullInt = v => (v === '' || v === undefined || v === null) ? null : Number(v);

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO tictactoe_settings (game_id,
          heading_1, heading_2, heading_3, description_text,
          heading_1_color, heading_2_color, heading_3_color, description_color,
          custom_win_msg, try_again_btn_text, try_again_text_color, try_again_bg_color,
          continue_btn_text, continue_btn_text_color, continue_btn_bg_color,
          bg_color, primary_color, board_cell_color, bg_image_url, thankyou_bg_image_url, game_logo_url, font_family, meta_description, submit_confirm_gif_url, o_image_url,
          enable_board_selection, enable_level_selection, board_size, difficulty,
          terms_enabled, terms_text, terms_url,
          start_button_text, start_button_text_color, start_button_bg_color,
          sound_correct_id, sound_wrong_id, win_sound_id, lose_sound_id,
          thankyou_heading_text, thankyou_heading_color, thankyou_subtitle_text, thankyou_subtitle_color,
          submit_btn_text, submit_btn_text_color, submit_btn_bg_color,
          redirect_url, continue_now_btn_text, continue_now_btn_text_color, continue_now_btn_bg_color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.params.gameId,
         heading_1 || null, heading_2 || null, heading_3 || null, description_text || null,
         heading_1_color || '#1a1a2e', heading_2_color || '#666666', heading_3_color || '#777777', description_color || '#888888',
         custom_win_msg || null, try_again_btn_text || null, try_again_text_color || '#ffffff', try_again_bg_color || null,
         continue_btn_text || null, continue_btn_text_color || '#ffffff', continue_btn_bg_color || null,
         bg_color || '#1e293b', primary_color || '#6366f1', board_cell_color || '#ffffff', bgImg, tyImg, logoImg, font_family || 'DM Sans', meta_description || null, gifImg || null, oImg,
         enable_board_selection !== undefined ? Number(enable_board_selection) : 1,
         enable_level_selection !== undefined ? Number(enable_level_selection) : 1,
         board_size || '3', difficulty || 'easy',
         terms_enabled !== undefined ? Number(terms_enabled) : 0, terms_text || null, terms_url || null,
         start_button_text || 'Start Game', start_button_text_color || '#ffffff', start_button_bg_color || null,
         toNullInt(sound_correct_id), toNullInt(sound_wrong_id), toNullInt(win_sound_id), toNullInt(lose_sound_id),
         thankyou_heading_text || null, thankyou_heading_color || '#1a1a2e', thankyou_subtitle_text || null, thankyou_subtitle_color || '#444444',
         submit_btn_text || null, submit_btn_text_color || '#ffffff', submit_btn_bg_color || '#000000',
         redirect_url || null, continue_now_btn_text || null, continue_now_btn_text_color || '#ffffff', continue_now_btn_bg_color || '#000000']
      );
    } else {
      const e = existing[0];
      await db.query(
        `UPDATE tictactoe_settings SET
          heading_1=?, heading_2=?, heading_3=?, description_text=?,
          heading_1_color=?, heading_2_color=?, heading_3_color=?, description_color=?,
          custom_win_msg=?, try_again_btn_text=?, try_again_text_color=?, try_again_bg_color=?,
          continue_btn_text=?, continue_btn_text_color=?, continue_btn_bg_color=?,
          bg_color=?, primary_color=?, board_cell_color=?, bg_image_url=?, thankyou_bg_image_url=?, game_logo_url=?, font_family=?, meta_description=?, submit_confirm_gif_url=?, o_image_url=?,
          enable_board_selection=?, enable_level_selection=?, board_size=?, difficulty=?,
          terms_enabled=?, terms_text=?, terms_url=?,
          start_button_text=?, start_button_text_color=?, start_button_bg_color=?,
          sound_correct_id=?, sound_wrong_id=?, win_sound_id=?, lose_sound_id=?,
          thankyou_heading_text=?, thankyou_heading_color=?, thankyou_subtitle_text=?, thankyou_subtitle_color=?,
          submit_btn_text=?, submit_btn_text_color=?, submit_btn_bg_color=?,
          redirect_url=?, continue_now_btn_text=?, continue_now_btn_text_color=?, continue_now_btn_bg_color=?
         WHERE game_id=?`,
        [heading_1 !== undefined ? heading_1 : e.heading_1,
         heading_2 !== undefined ? heading_2 : e.heading_2,
         heading_3 !== undefined ? heading_3 : e.heading_3,
         description_text !== undefined ? description_text : e.description_text,
         heading_1_color || e.heading_1_color || '#1a1a2e',
         heading_2_color || e.heading_2_color || '#666666',
         heading_3_color || e.heading_3_color || '#777777',
         description_color || e.description_color || '#888888',
         custom_win_msg !== undefined ? custom_win_msg : e.custom_win_msg,
         try_again_btn_text !== undefined ? try_again_btn_text : e.try_again_btn_text,
         try_again_text_color !== undefined ? try_again_text_color : (e.try_again_text_color || '#ffffff'),
         try_again_bg_color !== undefined ? try_again_bg_color : e.try_again_bg_color,
         continue_btn_text !== undefined ? continue_btn_text : e.continue_btn_text,
         continue_btn_text_color !== undefined ? continue_btn_text_color : (e.continue_btn_text_color || '#ffffff'),
         continue_btn_bg_color !== undefined ? continue_btn_bg_color : e.continue_btn_bg_color,
         bg_color || e.bg_color, primary_color || e.primary_color,
          board_cell_color !== undefined ? board_cell_color : (e.board_cell_color || '#ffffff'),
          bgImg, tyImg, logoImg,
          font_family || e.font_family,
          meta_description !== undefined ? meta_description : e.meta_description,
          gifImg || null, oImg,
         enable_board_selection !== undefined ? Number(enable_board_selection) : e.enable_board_selection,
         enable_level_selection !== undefined ? Number(enable_level_selection) : e.enable_level_selection,
         board_size !== undefined ? board_size : e.board_size,
         difficulty !== undefined ? difficulty : e.difficulty,
         terms_enabled !== undefined ? Number(terms_enabled) : e.terms_enabled,
         terms_text !== undefined ? terms_text : e.terms_text,
         terms_url !== undefined ? terms_url : e.terms_url,
start_button_text !== undefined ? start_button_text : e.start_button_text,
          start_button_text_color !== undefined ? start_button_text_color : e.start_button_text_color,
          start_button_bg_color !== undefined ? start_button_bg_color : e.start_button_bg_color,
           sound_correct_id !== undefined ? toNullInt(sound_correct_id) : e.sound_correct_id,
           sound_wrong_id !== undefined ? toNullInt(sound_wrong_id) : e.sound_wrong_id,
           win_sound_id !== undefined ? toNullInt(win_sound_id) : e.win_sound_id,
          lose_sound_id !== undefined ? toNullInt(lose_sound_id) : e.lose_sound_id,
         thankyou_heading_text !== undefined ? thankyou_heading_text : e.thankyou_heading_text,
         thankyou_heading_color !== undefined ? thankyou_heading_color : (e.thankyou_heading_color || '#1a1a2e'),
         thankyou_subtitle_text !== undefined ? thankyou_subtitle_text : e.thankyou_subtitle_text,
         thankyou_subtitle_color !== undefined ? thankyou_subtitle_color : (e.thankyou_subtitle_color || '#444444'),
         submit_btn_text !== undefined ? submit_btn_text : e.submit_btn_text,
         submit_btn_text_color !== undefined ? submit_btn_text_color : (e.submit_btn_text_color || '#ffffff'),
         submit_btn_bg_color !== undefined ? submit_btn_bg_color : (e.submit_btn_bg_color || '#000000'),
         redirect_url !== undefined ? redirect_url : e.redirect_url,
         continue_now_btn_text !== undefined ? continue_now_btn_text : e.continue_now_btn_text,
         continue_now_btn_text_color !== undefined ? continue_now_btn_text_color : (e.continue_now_btn_text_color || '#ffffff'),
         continue_now_btn_bg_color !== undefined ? continue_now_btn_bg_color : (e.continue_now_btn_bg_color || '#000000'),
         req.params.gameId]
      );
    }

    if (redirect_url !== undefined) {
      await db.query('UPDATE games SET redirect_url = ? WHERE id = ?', [redirect_url || null, req.params.gameId]);
    }

    const [updated] = await db.query('SELECT * FROM tictactoe_settings WHERE game_id = ?', [req.params.gameId]);
    res.json({ success: true, settings: updated[0] });
  } catch (err) {
    sendError(res, err);
  }
});

module.exports = router;

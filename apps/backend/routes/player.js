const express = require('express');
const router = express.Router();
const db = require('../config/db');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

router.get('/:gameName/:companyName', async (req, res) => {
  try {
    const [allRows] = await db.query(`
      SELECT g.*, c.company_name, c.slug as client_slug, c.logo_url as client_logo
      FROM games g JOIN clients c ON g.client_id = c.id
      WHERE g.slug = ? AND c.slug = ?
    `, [req.params.gameName, req.params.companyName]);

    if (allRows.length === 0) return res.status(404).json({ success: false, message: 'Game not found' });
    if (!allRows[0].is_active) return res.status(403).json({ success: false, message: 'This game is currently inactive' });

    const game = allRows[0];
    const toAbs = (url) => url || null;

    // ── CROSSWORD branch ──────────────────────────────────────────────────────
    if (game.category === 'crossword') {
      const [cwSettings] = await db.query(
        'SELECT * FROM crossword_settings WHERE game_id = ?', [game.id]
      );
      const [cwWords] = await db.query(
        'SELECT * FROM crossword_words WHERE game_id = ? ORDER BY word_order', [game.id]
      );
      const [cwFormFields] = await db.query(
        'SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]
      );
      const [sounds] = await db.query(
        'SELECT * FROM sounds WHERE game_id = ?', [game.id]
      );

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = cwSettings[0] ? { ...cwSettings[0] } : {};
      // normalise image urls
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          words: cwWords,
          soundMap,
          // crossword form fields
          formFields: cwFormFields,
          questions: [],
        },
      });
    }

    // ── SPIN branch ───────────────────────────────────────────────────────────
    if (game.category === 'spin') {
      const [spinSettings] = await db.query(
        'SELECT * FROM spin_settings WHERE game_id = ?', [game.id]
      );
      const [spinSegments] = await db.query(
        'SELECT * FROM spin_segments WHERE game_id = ? ORDER BY segment_order', [game.id]
      );
      const [formFields] = await db.query(
        'SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]
      );
      const [sounds] = await db.query(
        'SELECT * FROM sounds WHERE game_id = ?', [game.id]
      );

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = spinSettings[0] ? { ...spinSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }
      for (const seg of spinSegments) {
        seg.coupon_image_url  = toAbs(seg.coupon_image_url);
        seg.overlay_image_url = toAbs(seg.overlay_image_url);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          segments: spinSegments,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── MEMORY branch ─────────────────────────────────────────────────────────
    if (game.category === 'memory') {
      const [memSettings] = await db.query(
        'SELECT * FROM memory_settings WHERE game_id = ?', [game.id]
      );
      const [memTiles] = await db.query(
        'SELECT * FROM memory_tiles WHERE game_id = ? ORDER BY tile_order', [game.id]
      );
      const [formFields] = await db.query(
        'SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]
      );
      const [sounds] = await db.query(
        'SELECT * FROM sounds WHERE game_id = ?', [game.id]
      );

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = memSettings[0] ? { ...memSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'card_cover_image_url', 'overlay_image_url', 'gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          tiles: memTiles,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── JIGSAW branch ────────────────────────────────────────────────────────
    if (game.category === 'jigsaw') {
      const [jigSettings] = await db.query(
        'SELECT * FROM jigsaw_settings WHERE game_id = ?', [game.id]
      );
      const [formFields] = await db.query(
        'SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]
      );
      const [sounds] = await db.query(
        'SELECT * FROM sounds WHERE game_id = ?', [game.id]
      );

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = jigSettings[0] ? { ...jigSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'puzzle_image_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── WORD SEARCH branch ───────────────────────────────────────────────────
    if (game.category === 'wordsearch') {
      const [wsSettings] = await db.query(
        'SELECT * FROM wordsearch_settings WHERE game_id = ?', [game.id]
      );
      const [wsWords] = await db.query(
        'SELECT * FROM wordsearch_words WHERE game_id = ? ORDER BY word_order', [game.id]
      );
      const [formFields] = await db.query(
        'SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]
      );
      const [sounds] = await db.query(
        'SELECT * FROM sounds WHERE game_id = ?', [game.id]
      );

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = wsSettings[0] ? { ...wsSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          words: wsWords,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── POURING branch ──────────────────────────────────────────────────────
    if (game.category === 'pouring') {
      const [pourSettings] = await db.query(
        'SELECT * FROM pouring_settings WHERE game_id = ?', [game.id]
      );
      const [formFields] = await db.query(
        'SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]
      );
      const [sounds] = await db.query(
        'SELECT * FROM sounds WHERE game_id = ?', [game.id]
      );

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = pourSettings[0] ? { ...pourSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── TYPER branch ────────────────────────────────────────────────────────
    if (game.category === 'typer') {
      const [typerSettings] = await db.query(
        'SELECT * FROM typer_settings WHERE game_id = ?', [game.id]
      );
      const [typerWords] = await db.query(
        'SELECT * FROM typer_words WHERE game_id = ? ORDER BY word_order', [game.id]
      );
      const [formFields] = await db.query(
        'SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]
      );
      const [sounds] = await db.query(
        'SELECT * FROM sounds WHERE game_id = ?', [game.id]
      );

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = typerSettings[0] ? { ...typerSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          words: typerWords,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── MATH branch ─────────────────────────────────────────────────────────
    if (game.category === 'math') {
      const [mathSettings] = await db.query(
        'SELECT * FROM math_settings WHERE game_id = ?', [game.id]
      );
      const [formFields] = await db.query(
        'SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]
      );
      const [sounds] = await db.query(
        'SELECT * FROM sounds WHERE game_id = ?', [game.id]
      );

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = mathSettings[0] ? { ...mathSettings[0] } : {};

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── MAZE branch ──────────────────────────────────────────────────────────
    if (game.category === 'maze') {
      const [mazeSettings] = await db.query(
        'SELECT * FROM maze_settings WHERE game_id = ?', [game.id]
      );
      const [formFields] = await db.query(
        'SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]
      );
      const [sounds] = await db.query(
        'SELECT * FROM sounds WHERE game_id = ?', [game.id]
      );

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = mazeSettings[0] ? { ...mazeSettings[0] } : {};

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── SCREW branch ────────────────────────────────────────────────────────
    if (game.category === 'screw') {
      const [screwSettings] = await db.query(
        'SELECT * FROM screw_settings WHERE game_id = ?', [game.id]
      );
      const [formFields] = await db.query(
        'SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]
      );
      const [sounds] = await db.query(
        'SELECT * FROM sounds WHERE game_id = ?', [game.id]
      );

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = screwSettings[0] ? { ...screwSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'reveal_image_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── 2048 branch ──────────────────────────────────────────────────────────
    if (game.category === '2048') {
      const [gameSettings] = await db.query('SELECT * FROM game2048_settings WHERE game_id = ?', [game.id]);
      const [formFields] = await db.query('SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]);
      const [sounds] = await db.query('SELECT * FROM sounds WHERE game_id = ?', [game.id]);

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = gameSettings[0] ? { ...gameSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }
      if (settings.tile_colors && typeof settings.tile_colors === 'string') {
        try { settings.tile_colors = JSON.parse(settings.tile_colors) } catch {}
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── SNAKE branch ──────────────────────────────────────────────────────────
    if (game.category === 'snake') {
      const [gameSettings] = await db.query('SELECT * FROM snake_settings WHERE game_id = ?', [game.id]);
      const [formFields] = await db.query('SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]);
      const [sounds] = await db.query('SELECT * FROM sounds WHERE game_id = ?', [game.id]);

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = gameSettings[0] ? { ...gameSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── CATCH branch ──────────────────────────────────────────────────────────
    if (game.category === 'catch') {
      const [gameSettings] = await db.query('SELECT * FROM catch_settings WHERE game_id = ?', [game.id]);
      const [formFields] = await db.query('SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]);
      const [sounds] = await db.query('SELECT * FROM sounds WHERE game_id = ?', [game.id]);

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = gameSettings[0] ? { ...gameSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── REACTION branch ───────────────────────────────────────────────────────
    if (game.category === 'reaction') {
      const [gameSettings] = await db.query('SELECT * FROM reaction_settings WHERE game_id = ?', [game.id]);
      const [formFields] = await db.query('SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]);
      const [sounds] = await db.query('SELECT * FROM sounds WHERE game_id = ?', [game.id]);

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = gameSettings[0] ? { ...gameSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── SIMON branch ──────────────────────────────────────────────────────────
    if (game.category === 'simon') {
      const [gameSettings] = await db.query('SELECT * FROM simon_settings WHERE game_id = ?', [game.id]);
      const [formFields] = await db.query('SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]);
      const [sounds] = await db.query('SELECT * FROM sounds WHERE game_id = ?', [game.id]);

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = gameSettings[0] ? { ...gameSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id,
          name: game.name,
          category: game.category,
          description: game.description,
          redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings,
          formFields,
          soundMap,
          questions: [],
        },
      });
    }

    // ── GAME-SPECIFIC SETTINGS BRANCHES ──────────────────────────────────────
    const categorySettingsMap = {
      connect4:   'connect4_settings',
      flappy:     'flappy_settings',
      bounce:     'bounce_settings',
      '2048':     'game2048_settings',
      maze:       'maze_settings',
      screw:      'screw_settings',
      typer:      'typer_settings',
      pouring:    'pouring_settings',
      wordsearch: 'wordsearch_settings',
      jigsaw:     'jigsaw_settings',
      memory:     'memory_settings',
      crossword:  'crossword_settings',
      spin:       'spin_settings',
      math:       'math_settings',
      space:      'space_settings',
      bejeweled:  'bejeweled_settings',
      tetris:     'tetris_settings',
      stack:      'stack_settings',
      whackamole: 'whackamole_settings',
      hanoi:      'hanoi_settings',
      breakout:   'breakout_settings',
      bubbleshooter: 'bubbleshooter_settings',
      carlaunch:     'carlaunch_settings',
    };
    const settingsTable = categorySettingsMap[game.category];

    if (settingsTable) {
      const [gameSettings] = await db.query(`SELECT * FROM ${settingsTable} WHERE game_id = ?`, [game.id]);
      const [formFields] = await db.query('SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]);
      const [sounds] = await db.query('SELECT * FROM sounds WHERE game_id = ?', [game.id]);

      const soundMap = {};
      for (const s of sounds) soundMap[s.id] = toAbs(s.url);

      const settings = gameSettings[0] ? { ...gameSettings[0] } : {};
      for (const f of ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'submit_confirm_gif_url']) {
        if (settings[f] !== undefined) settings[f] = toAbs(settings[f]);
      }

      return res.json({
        success: true,
        game: {
          id: game.id, name: game.name, category: game.category,
          description: game.description, redirect_url: game.redirect_url,
          client_logo: toAbs(game.client_logo),
          company_name: game.company_name,
          settings, formFields, soundMap, questions: [],
        },
      });
    }

    // ── QUIZ / SURVEY branch (unchanged) ─────────────────────────────────────
    const [settings]   = await db.query('SELECT * FROM quiz_settings WHERE game_id = ?', [game.id]);
    const [formFields] = await db.query('SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]);
    const [questions]  = await db.query('SELECT * FROM questions WHERE game_id = ? ORDER BY question_order', [game.id]);
    const [sounds]     = await db.query('SELECT * FROM sounds WHERE game_id = ?', [game.id]);

    for (let q of questions) {
      const [options] = await db.query('SELECT * FROM options WHERE question_id = ? ORDER BY option_order', [q.id]);
      q.options = options;
    }

    const soundMap = {};
    for (const s of sounds) soundMap[s.id] = toAbs(s.url);

    const safeSettings = settings[0] ? { ...settings[0] } : null;
    if (safeSettings) {
      for (const f of ['bg_image_url','thankyou_bg_image_url','game_logo_url','submit_confirm_gif_url']) {
        safeSettings[f] = toAbs(safeSettings[f]);
      }
    }

    for (const q of questions) {
      for (const f of ['question_image_url','question_bg_image_url']) q[f] = toAbs(q[f]);
      for (const opt of (q.options || [])) {
        for (const f of ['option_image_url','option_overlay_image_url']) opt[f] = toAbs(opt[f]);
      }
    }

    res.json({
      success: true,
      game: {
        id: game.id, name: game.name, category: game.category,
        description: game.description, redirect_url: game.redirect_url,
        client_logo: toAbs(game.client_logo),
        company_name: game.company_name,
        settings: safeSettings, formFields, questions, soundMap,
      },
    });
  } catch (err) {
    console.error('GET game error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/session/start', async (req, res) => {
  const { game_id, player_data, source_type, promo_player_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = req.body;
  const validSrc = ['direct', 'link', 'player'];
  const src = validSrc.includes(source_type) ? source_type : 'link';
  try {
    // ── Hardened uniqueness check ─────────────────────────────────────────────
    if (promo_player_id) {
      const [existing] = await db.query(
        'SELECT id FROM player_sessions WHERE game_id = ? AND promo_player_id = ? AND completed = 1 LIMIT 1',
        [game_id, promo_player_id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, already_played: true, message: 'You have already played this game' });
      }
    } else {
      // Check by email from player_data for anonymous-turned-logged-in scenarios
      const pd = player_data || {};
      const emailKey = Object.keys(pd).find(k => ['email','emailaddress','e-mail','email address'].includes(k.toLowerCase().replace(/\s+/g, '')));
      if (emailKey && pd[emailKey]) {
        const [existing] = await db.query(
          "SELECT id FROM player_sessions WHERE game_id = ? AND completed = 1 AND JSON_UNQUOTE(JSON_EXTRACT(player_data, '$.\"Email\"')) = ? LIMIT 1",
          [game_id, pd[emailKey]]
        );
        if (existing.length > 0) {
          return res.status(400).json({ success: false, already_played: true, message: 'You have already played this game' });
        }
      }
    }
    const token = uuidv4();
    const [result] = await db.query(
      `INSERT INTO player_sessions (game_id, session_token, player_data, source_type, promo_player_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [game_id, token, JSON.stringify(player_data || {}), src, promo_player_id || null,
       utm_source || null, utm_medium || null, utm_campaign || null, utm_term || null, utm_content || null]
    );
    res.json({ success: true, session_token: token, session_id: result.insertId });
  } catch (err) {
    console.error('Session start error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Quiz / survey answer ──────────────────────────────────────────────────────
router.post('/session/answer', async (req, res) => {
  const { session_token, question_id, option_id, is_correct, question_type, answer_text } = req.body;
  try {
    const [sessions] = await db.query('SELECT * FROM player_sessions WHERE session_token = ?', [session_token]);
    if (sessions.length === 0) return res.status(404).json({ success: false, message: 'Session not found' });
    const session = sessions[0];
    await db.query(
      'INSERT INTO player_answers (session_id, question_id, option_id, answer_text, is_correct, question_type) VALUES (?, ?, ?, ?, ?, ?)',
      [session.id, question_id, option_id || null, answer_text || null, is_correct === true ? 1 : 0, question_type || null]
    );
    if (question_type === 'right_wrong' && is_correct) {
      await db.query('UPDATE player_sessions SET score = score + 1 WHERE id = ?', [session.id]);
    }
    if (question_type === 'right_wrong') {
      await db.query('UPDATE player_sessions SET total_scoreable = total_scoreable + 1 WHERE id = ?', [session.id]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Answer error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Crossword word answer ─────────────────────────────────────────────────────
router.post('/session/crossword-answer', async (req, res) => {
  const { session_token, crossword_word_id, answer_text, is_correct } = req.body;
  try {
    const [sessions] = await db.query('SELECT * FROM player_sessions WHERE session_token = ?', [session_token]);
    if (sessions.length === 0) return res.status(404).json({ success: false, message: 'Session not found' });
    const session = sessions[0];

    // Store using question_id slot (crossword_word_id maps to question_id column)
    await db.query(
      'INSERT INTO player_answers (session_id, question_id, option_id, is_correct) VALUES (?, ?, ?, ?)',
      [session.id, crossword_word_id, null, is_correct ? 1 : 0]
    );

    // Always count as scoreable; correct ones get a point
    await db.query(
      'UPDATE player_sessions SET total_scoreable = total_scoreable + 1 WHERE id = ?',
      [session.id]
    );
    if (is_correct) {
      await db.query('UPDATE player_sessions SET score = score + 1 WHERE id = ?', [session.id]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Crossword answer error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/session/complete', async (req, res) => {
  const { session_token, score, player_data } = req.body;
  try {
    const [sessions] = await db.query('SELECT * FROM player_sessions WHERE session_token = ?', [session_token]);
    if (sessions.length === 0) return res.status(404).json({ success: false, message: 'Session not found' });

    const session = sessions[0];

    // Merge player_data
    let existingData = typeof session.player_data === 'string' ? JSON.parse(session.player_data) : (session.player_data || {});
    const mergedData = { ...existingData, ...(player_data || {}) };

    await db.query(
      'UPDATE player_sessions SET completed = 1, completed_at = NOW(), score = ?, player_data = ? WHERE id = ?',
      [score !== undefined ? score : session.score, JSON.stringify(mergedData), session.id]
    );

    const [games]          = await db.query('SELECT * FROM games WHERE id = ?', [session.game_id]);
    const [emailTemplates] = await db.query('SELECT * FROM email_templates WHERE game_id = ?', [session.game_id]);
    const [settingsRows]   = await db.query('SELECT * FROM quiz_settings WHERE game_id = ?', [session.game_id]);
    const gameSettings     = settingsRows[0] || {};

    const playerData  = mergedData;

    const normalize = (obj, keys) => {
      for (const k of keys) {
        for (const [label, val] of Object.entries(obj || {})) {
          if (label.toLowerCase().replace(/\s+/g, '') === k.toLowerCase().replace(/\s+/g, '') && val) {
            return String(val).trim();
          }
        }
      }
      return null;
    };
    const playerEmail = normalize(playerData, ['email','emailaddress','e-mail']);
    const playerName  = normalize(playerData, ['name','fullname','full name']) || 'Player';

    let emailSent = false;
    const emailEnabled = gameSettings.send_email === 1 || gameSettings.send_email === '1' || gameSettings.send_email === true;
    const templateOk   = emailTemplates.length > 0 && (emailTemplates[0].is_enabled === 1 || emailTemplates[0].is_enabled === true);

    if (emailEnabled && templateOk && playerEmail) {
      const template = emailTemplates[0];
      const scoreText = session.total_scoreable > 0
        ? `You scored <strong>${session.score} out of ${session.total_scoreable}</strong>.` : '';
      const rawBody = (template.body_html || '').replace(/^```html[\s\S]*?\n/, '').replace(/^```[\s\S]*?\n/, '').replace(/```\s*$/, '').trim();

      const pct = session.total_scoreable > 0 ? (session.score / session.total_scoreable) * 100 : 0;
      const perfMsg = pct === 100 ? 'Perfect score! You nailed every single one. 🏆'
        : pct >= 70 ? 'Great job! You got most of them right. 🎉'
        : pct >= 40 ? 'Good effort! Keep exploring and you will master them all. 🍰'
        : 'Thanks for playing! Every expert starts somewhere. Come back and try again! 😊';

      const bodyContent = rawBody
        .replace(/\{\{player_name\}\}/g, playerName)
        .replace(/\{\{name\}\}/g, playerName)
        .replace(/\{\{score\}\}/g, session.score)
        .replace(/\{\{total\}\}/g, session.total_scoreable)
        .replace(/\{\{total_questions\}\}/g, session.total_scoreable)
        .replace(/\{\{game_name\}\}/g, games[0]?.name || 'Game')
        .replace(/\{\{time_taken\}\}/g, 'N/A')
        .replace(/\{\{performance_message\}\}/g, perfMsg)
        .replace(/\{\{website_link\}\}/g, 'https://www.thirdwavecoffeeroasters.com/');

      const htmlEmail = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
              <tr><td style="background:${template.header_color||'#6366f1'};padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:24px;">${template.header_text||'🎉 Congratulations!'}</h1>
              </td></tr>
              <tr><td style="padding:32px 40px;">
                <p style="font-size:18px;color:#1a1a2e;margin:0 0 16px;">Hi <strong>${playerName}</strong>,</p>
                ${scoreText ? `<p style="font-size:16px;color:#333;">${scoreText}</p>` : ''}
                <p style="font-size:16px;color:#333;">You have completed the game!</p>
                ${bodyContent ? `<div style="margin-top:16px;color:#555;">${bodyContent}</div>` : ''}
              </td></tr>
              ${template.footer_text ? `<tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;color:#888;font-size:14px;">${template.footer_text}</td></tr>` : ''}
            </table>
          </td></tr>
        </table></body></html>`;

      try {
        const smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';
        const smtpPort   = parseInt(process.env.SMTP_PORT || '587', 10);
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          tls: { rejectUnauthorized: false },
        });
        await transporter.sendMail({
          from: `"${template.sender_name||'Quiz Platform'}" <${template.sender_email||process.env.SMTP_USER}>`,
          to: playerEmail,
          subject: (template.subject||'You completed the game! 🎉').replace(/\{\{name\}\}/g, playerName),
          html: htmlEmail,
        });
        emailSent = true;
        await db.query('UPDATE player_sessions SET email_sent = 1 WHERE id = ?', [session.id]);
        console.log(`✅ Email sent to ${playerEmail}`);
      } catch (emailErr) {
        console.error('❌ Email error:', emailErr.message);
        console.error('   SMTP:', process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER);
      }
    } else if (emailEnabled && !playerEmail) {
      console.warn('⚠️  Email enabled but no email found in player data:', JSON.stringify(playerData));
    }

    // ── Award Promo Coins (PC) ────────────────────────────────────────────────
    const game = games[0];
    if (session.promo_player_id && !session.pc_awarded && game) {
      const pcAmount = game.game_type === 'branded' ? 50 : 10;
      await db.query(
        'UPDATE promo_players SET pc_balance = pc_balance + ? WHERE id = ?',
        [pcAmount, session.promo_player_id]
      );
      await db.query(
        'INSERT INTO pc_transactions (player_id, type, points, game_id, note) VALUES (?, ?, ?, ?, ?)',
        [session.promo_player_id, 'earn', pcAmount, session.game_id, `Game completed: ${game.name}`]
      );
      await db.query('UPDATE player_sessions SET pc_awarded = 1 WHERE id = ?', [session.id]);
      console.log(`✅ Awarded ${pcAmount} PC to player ${session.promo_player_id} for game ${game.name}`);
    }

    const [updatedSession] = await db.query('SELECT * FROM player_sessions WHERE id = ?', [session.id]);
    res.json({ success: true, session: updatedSession[0], email_sent: emailSent, redirect_url: game?.redirect_url || null });
  } catch (err) {
    console.error('Complete session error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/play/hero-games
router.get('/hero-games', async (req, res) => {
  try {
    const [games] = await db.query(`
      SELECT g.id, g.name, g.slug, g.category,
             c.slug as client_slug,
             qs.game_logo_url, qs.bg_image_url,
             (SELECT COUNT(*) FROM player_sessions ps WHERE ps.game_id = g.id AND ps.completed = 1) as play_count
      FROM games g
      JOIN clients c ON g.client_id = c.id
      LEFT JOIN quiz_settings qs ON qs.game_id = g.id
      WHERE g.show_in_hero_page = 1 AND g.is_active = 1
      ORDER BY play_count DESC
      LIMIT 10
    `);
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/play/play-page-games
router.get('/play-page-games', async (req, res) => {
  try {
    // Branded games → Featured row
    const [branded] = await db.query(`
      SELECT g.id, g.name, g.slug, g.category, g.game_type,
             c.slug as client_slug, c.company_name,
             qs.game_logo_url, qs.bg_image_url,
             (SELECT COUNT(*) FROM player_sessions ps WHERE ps.game_id = g.id AND ps.completed = 1) as play_count
      FROM games g
      JOIN clients c ON g.client_id = c.id
      LEFT JOIN quiz_settings qs ON qs.game_id = g.id
      WHERE g.show_in_play_page = 1 AND g.is_active = 1 AND g.game_type = 'branded'
      ORDER BY play_count DESC
    `);

    // PromoGames → PromoGames row
    const [promoGames] = await db.query(`
      SELECT g.id, g.name, g.slug, g.category, g.game_type,
             c.slug as client_slug, c.company_name,
             qs.game_logo_url, qs.bg_image_url,
             (SELECT COUNT(*) FROM player_sessions ps WHERE ps.game_id = g.id AND ps.completed = 1) as play_count
      FROM games g
      JOIN clients c ON g.client_id = c.id
      LEFT JOIN quiz_settings qs ON qs.game_id = g.id
      WHERE g.show_in_play_page = 1 AND g.is_active = 1 AND g.game_type = 'promogames'
      ORDER BY play_count DESC
    `);

    const allGames = [...branded, ...promoGames];
    res.json({ success: true, games: allGames, featured: branded, promogames: promoGames });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET dashboard games for player (active, grouped by type) ────────────
router.get('/dashboard-games', async (req, res) => {
  try {
    // Simplified query for initial testing, using LEFT JOINs safely
const [games] = await db.query(`
      SELECT g.id, g.name, g.slug, g.game_type, g.category, 
             g.redirect_url, g.description, g.game_logo_url, qs.bg_image_url,
             c.company_name, c.slug as client_slug
      FROM games g
      JOIN clients c ON g.client_id = c.id
      LEFT JOIN quiz_settings qs ON qs.game_id = g.id
      WHERE g.is_active = 1
      ORDER BY g.game_type, g.name
    `)
    const grouped = { promogames: [], branded: [] }
    for (const g of games) {
      const entry = { ...g }
      if (g.game_type === 'branded') grouped.branded.push(entry)
      else grouped.promogames.push(entry)
    }
    res.json({ success: true, games: grouped })
  } catch (err) {
    console.error('DASHBOARD-GAMES FATAL ERROR:', err)
    res.status(500).json({ 
      success: false, 
      message: 'Server Error: ' + err.message,
      debug: {
        error: err.toString(),
        stack: err.stack,
        sql: err.sql
      }
    })
  }
})

// ── Lightweight play-count poll endpoint ─────────────────────────────────
router.get('/game/:id/play-count', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT play_count FROM games WHERE id = ?', [req.params.id]);
    res.json({ play_count: rows[0]?.play_count || 0 });
  } catch (err) {
    res.status(500).json({ play_count: 0 });
  }
});

module.exports = router;

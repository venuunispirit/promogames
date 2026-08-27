module.exports = {
  table: 'chess_settings',
  fields: [
    'difficulty', 'time_control', 'board_theme', 'primary_color', 'bg_color',
    'intro_text', 'outro_text', 'show_coordinates', 'piece_style', 'sound_enabled',
  ],
  uploads: [],
  defaults: {
    difficulty: 'medium',
    time_control: 600,
    board_theme: 'classic',
    primary_color: '#6366f1',
    bg_color: '#0f172a',
    show_coordinates: 1,
    piece_style: 'standard',
    sound_enabled: 1,
  },
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Home, Lightbulb, Shuffle, Volume2, VolumeX, LayoutGrid, Trophy, Check, Play, X } from 'lucide-react';

const CATEGORIES = {
  animals: { label: 'Safari', emoji: '🦁', tagline: 'Stalk the savanna',
    words: [
      'TIGER','ZEBRA','PANDA','EAGLE','KOALA','OTTER','RHINO','LEMUR','HYENA','CAMEL',
      'GAZELLE','BUFFALO','JAGUAR','PANTHER','WALRUS','PENGUIN','FLAMINGO','OCELOT','MOOSE','RACCOON',
      'IGUANA','PARROT','SLOTH','TOUCAN','COBRA','VULTURE','FALCON','CRANE','EGRET','STORK',
      'OWL','WOLF','FOX','BEAR','DEER','HARE','BISON','GOPHER','WEASEL','BADGER',
      'JACKAL','COYOTE','PUMA','LYNX','CARACAL','GORILLA','BABOON','MONKEY','MEERKAT','PORCUPINE',
      'CAPYBARA','HEDGEHOG','PLATYPUS','KANGAROO','WOMBAT','CHINCHILLA','FENNEC','MARMOSET','LANGUR','MACAW',
      'IBIS','COOT','WREN','FINCH','ROBIN','SPARROW','STARLING','WARBLER','BUNTING','HAWK',
      'KESTREL','RAVEN','CROW','MAGPIE','JAY','NUTHATCH','WOODPECKER','PELICAN','ALBATROSS','CORMORANT',
      'BOOBY','TERN','GULL','PUFFIN','SEAL','MANATEE','POLARBEAR','CHITAL','SAIGA','MARKHOR',
      'IBEX','TAKIN','SEROW','GORAL','MUSKDEER','MUNTJAC','CHINKARA','BLACKBUCK','SABLE','ROEBUCK',
      'WAPITI','ELK','CARIBOU','REINDEER','ELAND','KUDU','GERENUK','IMPALA','SPRINGBOK','HARTEBEEST',
      'WILDEBEEST','NYALA','BUSHBUCK','SITATUNGA','LECHWE','PUKU','WATERBUCK','TAPIR','ANTEATER','SUNBEAR',
      'SLOTHBEAR','CAIMAN','TURTLE','PYTHON','BOA','VIPER','GECKO','CHAMELEON','SALAMANDER','NEWT',
      'FROG','TOAD','AXOLOTL','ARMADILLO','MUSKRAT','ORANGUTAN','CHIMPANZEE','TARSIER','SIFAKA','INDRI',
      'LION','LEOPARD','CHEETAH','COUGAR','BOBCAT','MARGAY','ONCILLA','PALLASCAT','MANUL','SERVAL',
      'CLOUDEDLEOPARD','AFRICANCAT','JUNGLECAT','SUNGLASS','SANDBCAT','BLACKFOOTED','CANADA','EURASIAN','IBERIAN','SIBERIAN',
      'AMUR','SUMATRAN','BENGAL','INDOCHINESE','MALAYAN','SOUTHCHINA','CASPIAN','BALI','JAVAN','ROAN'
    ] },
  ocean: { label: 'Ocean', emoji: '🐙', tagline: 'Dive the deep blue',
    words: [
      'EEL','TUNA','CRAB','SQUID','SHARK','WHALE','CORAL','MANTA','URCHIN','DOLPHIN',
      'LOBSTER','OCTOPUS','STARFISH','SEAHORSE','BARRACUDA','SWORDFISH','GROUPER','SNAPPER','GRUNION','PILCHARD',
      'ANCHOVY','SARDINE','MACKEREL','MARLIN','SAILFISH','OPAH','TARPOON','BONEFISH','TRIGGERFISH','PUFFERFISH',
      'LIONFISH','WOLFFISH','MUSSEL','CLAM','OYSTER','SCALLOP','COCKLE','ABALONE','CONCH','SHRIMP',
      'PRAWN','KRILL','BARNACLE','CUTTLEFISH','NAUTILUS','KELP','SEAWEED','DUGONG','PORPOISE','ORCA',
      'BELUGA','NARWHAL','HUMPBACK','FINWHALE','MINKEWHALE','SUNFISH','MAKO','HAMMERHEAD','BULLSHARK','TIGERSHARK',
      'LEOPARDSHARK','BLACKTIP','BASKINGSHARK','WHALESHARK','SEVENGILL','CRAYFISH','HERMITCRAB','KINGCRAB','SPIDERCRAB','LANTERNFISH',
      'GOBY','BLENNY','PARROTFISH','WRASSE','SURGEONFISH','HOGFISH','ANGELFISH','DISCUSFISH','TETRA','GUPPY',
      'MOLLY','PLATY','BETTA','CICHLID','TILAPIA','BASS','CARP','PIKE','TENCH','RUDD',
      'DACE','CHUB','BARBEL','ORFE','LOACH','ROACH','RUFF','GUDGEON','MINNOW','DARTER',
      'SCULPIN','STURGEON','PADDLEFISH','MOJARRA','PINFISH','CROAKER','KINGFISH','HAKE','LING','COD',
      'HADDOCK','PLAICE','SOLE','FLOUNDER','HALIBUT','POLLOCK','WHITING','ROCKFISH','GREENLING','GAR',
      'BOWFIN','VIPERFISH','DRAGONFISH','HATCHETFISH','FANGTOOTH','BARRACUDINA','SPEARFISH','POMFRET','POMPANO','AMBERJACK',
      'COBIA','REMORA','GOATFISH','SCORPIONFISH','STONEFISH','CABILLA','PALEOGLOSSA','LIONOPSIS','FIERASFER','PTERYS',
      'SEAMOSS','REEF','LAGOON','TIDEPOOL','INTERTIDAL','PELAGIC','ABYSSAL','BENTHIC','HADAL',
      'NERITIC','OCEANIC','TRENCH','RIDGE','SEAMOUNT','GUYOT','ARCHIPELAGO','ATOLL','COVE','INLET'
    ] },
  space: { label: 'Space', emoji: '🚀', tagline: 'Chart the cosmos',
    words: [
      'COMET','ORBIT','LUNAR','METEOR','GALAXY','ROCKET','PLANET','NEBULA','SATURN','COSMOS',
      'ECLIPSE','GRAVITY','SHUTTLE','ASTEROID','JUPITER','MERCURY','VENUS','MARS','URANUS','NEPTUNE',
      'PLUTO','QUASAR','PULSAR','NOVA','MOON','STAR','ASTRONAUT','SATELLITE','PROBE','MODULE',
      'LANDER','ORBITER','SPACECRAFT','STATION','AIRLOCK','ANTENNA','TELESCOPE','SPECTRUM','RADIATION','PLASMA',
      'FLARE','SOLAR','ASTRAL','CELESTIAL','COSMIC','STELLAR','GALACTIC','ORBITAL','MAGNETOSPHERE','IONOSPHERE',
      'THERMOSPHERE','EXOSPHERE','MAGNETIC','PHOTON','NEUTRINO','QUARK','LEPTON','BOSON','MUON','GLUON',
      'ELECTRON','PROTON','NEUTRON','NUCLEUS','ATOM','ISOTOPE','FUSION','FISSION','REDSHIFT','BLUESHIFT',
      'DOPPLER','WAVELENGTH','CONSTELLATION','ZODIAC','MILKYWAY','ANDROMEDA','ORION','CASSIOPEIA','PLEIADES','ALDEBARAN',
      'BETELGEUSE','RIGEL','ANTARES','VEGA','SIRIUS','ARCTURUS','POLARIS','CAPELLA','PROCYON','SPICA',
      'REGULUS','DENEB','ALTAIR','CASTOR','POLLUX','SUPERNOVA','MAGNETAR','BLACKHOLE','WORMHOLE','DARKMATTER',
      'COSMOLOGY','EXOPLANET','DWARFPLANET','TRANSIT','INTERSTELLAR','SUPERCLUSTER','COSMICRAY','HELIOSPHERE','CORONA','CHROMOSPHERE',
      'PHOTOSPHERE','ZENITH','NADIR','APHELION','PERIHELION','ECLIPTIC','UMBRA','PENUMBRA',
      'BLAZAR','RADIOGALAXY','HERBIG','FUORI','GIANT','SUPERGIANT','HYPERGIANT','WHITEDWARF',
      'NEUTRONSTAR','PROTOSTAR','REDGIANT','BINARY','TRINARY','OPENCLUSTER','GLOBULAR','STARCLUSTER',
      'BROWNIE','DWARF','CEPHEID','BARSPIRAL','AXIOM','AURORA','SOLSTICE','EQUINOX',
      'PARALLAX','TIDAL','ROTATION','REVOLUTION','PRECESSION','NUTATION','APOGEE','PERIGEE'
    ] },
  sweets: { label: 'Sweets', emoji: '🍩', tagline: 'Raid the bakery',
    words: [
      'CANDY','MOCHA','FUDGE','DONUT','TOFFEE','WAFFLE','COOKIE','PASTRY','MUFFIN','ECLAIR',
      'PRALINE','CARAMEL','BISCUIT','PANCAKE','GUMDROP','LOLLIPOP','BROWNIE','CUPCAKE','CROISSANT','BAGEL',
      'PRETZEL','SCONE','STRUDEL','CHURRO','SUNDAE','SORBET','GELATO','TRUFFLE','MACARON','MERINGUE',
      'TART','PIE','GALETTE','CLAFOUTIS','POUNDCAKE','SPONGE','ANGELFOOD','REDVELVET','CHEESECAKE','TIRAMISU',
      'MOUSSE','PARFAIT','TRIFLE','SHORTCAKE','BISCOTTI','LADYFINGER','MADELEINE','NOUGAT','MARZIPAN','FONDANT',
      'GANACHE','GLAZE','ICING','FROSTING','SPRINKLE','MAPLE','HONEY','SYRUP','MOLASSES','AGAVE',
      'NECTAR','JAM','JELLY','MARMALADE','PRESERVE','CHUTNEY','COMPOTE','COULIS','BUTTERCREAM','TOPPING',
      'BANANA','BERRY','CHERRY','LEMON','PEACH','APPLE','PLUM','GRAPE','MANGO','PAPAYA',
      'LYCHEE','FIG','DATE','PRUNE','RAISIN','COCONUT','ALMOND','WALNUT','PECAN','CASHEW',
      'PISTACHIO','HAZELNUT','PEANUT','CHOCOLATE','COCOA','VANILLA','CINNAMON','NUTMEG','GINGER','ANISE',
      'SAFFRON','MINT','BASIL','ROSEMARY','LAVENDER','ROSEWATER','JASMINE','CHAMOMILE','HIBISCUS','ELDERFLOWER',
      'HONEYSUCKLE','MUSHROOM','MOREL','CHANTERELLE','PORCINI','SHIITAKE','ENOKI','CORDYCEPS','PORTABELLA','CRIMINI',
      'SOURDOUGH','BRIOCHE','BAGUETTE','FOCACCIA','NAAN','PITA','TURNOVER','SOPAPILLA','CREAMPIE','DOUGHNUT',
      'MILKSHAKE','SMOOTHIE','COLA','LEMONADE','BUTTERSCOTCH','TOFFEENUT','JELLYBEAN','TAFFY','BONBON','MINTBALL',
      'PEPPERMINT','SPEARMINT','LICORICE','COTTONCANDY','POPCORN','KETTLE','SWEETCORN','CRACKER','SODA','FLOAT',
      'MALT','SUGARCANE','JELLYBABY','RIBS','PUDDING','CUSTARD','MOCHI','TAPIOCA','HALVA','ROCKCANDY'
    ] },
};

const DIFFICULTIES = {
  easy: { label: 'Easy', size: 8, count: 6, hints: 3, dirs: [[0, 1], [1, 0], [1, 1]] },
  medium: { label: 'Medium', size: 10, count: 8, hints: 3, dirs: [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1]] },
  hard: { label: 'Hard', size: 12, count: 10, hints: 2, dirs: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]] },
};

const WORD_COLORS = [
  { main: '#FF6FA5', shadow: '#D94A80' },
  { main: '#8B6EF0', shadow: '#6A4ED0' },
  { main: '#35C9A5', shadow: '#1FA688' },
  { main: '#FF8A3D', shadow: '#E4661B' },
  { main: '#4FB6FF', shadow: '#2A8FDB' },
  { main: '#FFC93D', shadow: '#E79A0B' },
];
const ACTIVE_COLOR = { main: '#FF3D7A', shadow: '#C22558' };
const PRAISE = ['GOOD JOB!', 'NICE!', 'SWEET!', 'AWESOME!', 'BOOM!', 'SUPER!'];
const CLOUDS = [
  { top: '6%', left: '8%', scale: 1.1, duration: 70 },
  { top: '14%', left: '55%', scale: 0.8, duration: 55 },
  { top: '4%', left: '78%', scale: 1.3, duration: 85 },
  { top: '22%', left: '30%', scale: 0.65, duration: 60 },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPuzzle(categoryKey, difficultyKey) {
  const { size, count, dirs } = DIFFICULTIES[difficultyKey];
  const pool = CATEGORIES[categoryKey].words.filter((w) => w.length <= size);
  const words = shuffle(pool).slice(0, count).sort((a, b) => b.length - a.length);
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const placements = [];

  words.forEach((word, idx) => {
    let placed = false;
    let attempts = 0;
    const len = word.length;
    while (!placed && attempts < 400) {
      attempts++;
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const minRow = dr === 1 ? 0 : dr === -1 ? len - 1 : 0;
      const maxRow = dr === 1 ? size - len : dr === -1 ? size - 1 : size - 1;
      const minCol = dc === 1 ? 0 : dc === -1 ? len - 1 : 0;
      const maxCol = dc === 1 ? size - len : dc === -1 ? size - 1 : size - 1;
      if (minRow > maxRow || minCol > maxCol) continue;
      const row = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
      const col = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));
      let ok = true;
      const cells = [];
      for (let i = 0; i < len; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        const existing = grid[r][c];
        if (existing && existing !== word[i]) { ok = false; break; }
        cells.push({ r, c });
      }
      if (ok) {
        cells.forEach((cell, i) => { grid[cell.r][cell.c] = word[i]; });
        placements.push({ word, cells, color: WORD_COLORS[idx % WORD_COLORS.length] });
        placed = true;
      }
    }
  });

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
  }
  return { size, grid, placements };
}

function computeLine(start, end) {
  const dr = end.r - start.r;
  const dc = end.c - start.c;
  if (dr === 0 && dc === 0) return [start];
  const straight = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
  if (!straight) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = Math.sign(dr);
  const stepC = Math.sign(dc);
  const cells = [];
  for (let i = 0; i <= steps; i++) cells.push({ r: start.r + stepR * i, c: start.c + stepC * i });
  return cells;
}

function lineCoords(cells, size) {
  const cell = 100 / size;
  const first = cells[0];
  const last = cells[cells.length - 1];
  return {
    x1: (first.c + 0.5) * cell, y1: (first.r + 0.5) * cell,
    x2: (last.c + 0.5) * cell, y2: (last.r + 0.5) * cell,
  };
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function WordHuntGame() {
  const [appState, setAppState] = useState('menu');
  const [category, setCategory] = useState('animals');
  const [difficulty, setDifficulty] = useState('easy');
  const [seed, setSeed] = useState(0);
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [praise, setPraise] = useState(null);
  const praiseTimer = useRef(null);

  const puzzle = useMemo(() => buildPuzzle(category, difficulty), [category, difficulty, seed]);

  const [foundWords, setFoundWords] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(DIFFICULTIES[difficulty].hints);
  const [hintCell, setHintCell] = useState(null);
  const [confetti, setConfetti] = useState([]);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selStart, setSelStart] = useState(null);
  const [selCells, setSelCells] = useState([]);
  const selCellsRef = useRef([]);
  const audioCtxRef = useRef(null);

  // ---------- sound + haptics ----------
  function ensureAudio() {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }
  function tone(freq, start, duration, type, peakGain) {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + start;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peakGain || 0.15, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }
  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* no-op */ }
  }
  const playTap = () => tone(650, 0, 0.08, 'sine', 0.13);
  const playSelectStart = () => tone(520, 0, 0.06, 'sine', 0.1);
  const playFound = () => { tone(784, 0, 0.12, 'triangle', 0.16); tone(988, 0.09, 0.14, 'triangle', 0.16); tone(1175, 0.18, 0.22, 'triangle', 0.18); };
  const playHint = () => { tone(660, 0, 0.1, 'sine', 0.14); tone(880, 0.09, 0.16, 'sine', 0.14); };
  const playCoin = () => { tone(1400, 0, 0.06, 'square', 0.07); tone(1800, 0.05, 0.09, 'square', 0.08); };
  const playWin = () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.28, 'triangle', 0.2)); };
  const playSwoosh = () => tone(220, 0, 0.15, 'sine', 0.07);

  // ---------- playful looping background music ----------
  const MUSIC_MELODY = [523.25, 0, 659.25, 783.99, 0, 659.25, 587.33, 0, 523.25, 0, 659.25, 880.0, 783.99, 659.25, 587.33, 0];
  const MUSIC_BASS = { 0: 130.81, 8: 196.0 };
  const musicStepRef = useRef(0);
  const musicTimerRef = useRef(null);
  function playMusicStep() {
    const step = musicStepRef.current % MUSIC_MELODY.length;
    const note = MUSIC_MELODY[step];
    if (note) tone(note, 0, 0.2, 'triangle', 0.055);
    if (MUSIC_BASS[step]) tone(MUSIC_BASS[step], 0, 0.32, 'sine', 0.05);
    if (step % 2 === 1) tone(2400, 0, 0.05, 'square', 0.015);
    musicStepRef.current += 1;
  }
  function startMusic() {
    if (musicTimerRef.current) return;
    ensureAudio();
    musicStepRef.current = 0;
    playMusicStep();
    musicTimerRef.current = setInterval(playMusicStep, 227);
  }
  function stopMusic() {
    if (musicTimerRef.current) { clearInterval(musicTimerRef.current); musicTimerRef.current = null; }
  }
  useEffect(() => {
    if (appState === 'playing' && soundOn && !won) startMusic(); else stopMusic();
    return () => stopMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, soundOn, won]);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => { selCellsRef.current = selCells; }, [selCells]);

  useEffect(() => {
    setFoundWords({});
    setElapsed(0);
    setWon(false);
    setSelCells([]);
    setSelStart(null);
    setIsSelecting(false);
    setHintCell(null);
    setHintsLeft(DIFFICULTIES[difficulty].hints);
    setConfetti([]);
  }, [puzzle]);

  useEffect(() => {
    if (won || appState !== 'playing') return undefined;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [won, puzzle, appState]);

  useEffect(() => {
    if (!won && puzzle.placements.length > 0 && Object.keys(foundWords).length === puzzle.placements.length) {
      setWon(true);
      setCoins((c) => c + 50);
      playWin();
      vibrate([40, 60, 40, 60, 40, 80, 120]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundWords, puzzle]);

  useEffect(() => {
    if (!won) return;
    const pieces = Array.from({ length: 26 }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 0.5,
      duration: 1.9 + Math.random() * 1.3, color: WORD_COLORS[i % WORD_COLORS.length].main, rotate: Math.random() * 360,
    }));
    setConfetti(pieces);
  }, [won]);

  useEffect(() => {
    if (!isSelecting) return undefined;
    const handleUp = () => finishSelection();
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelecting]);

  function finishSelection() {
    const cells = selCellsRef.current;
    setIsSelecting(false);
    if (cells.length > 1) {
      const letters = cells.map(({ r, c }) => puzzle.grid[r][c]).join('');
      const reversed = letters.split('').reverse().join('');
      const match = puzzle.placements.find((p) => !foundWords[p.word] && (p.word === letters || p.word === reversed));
      if (match) {
        setFoundWords((prev) => ({ ...prev, [match.word]: match }));
        setCoins((c) => c + 10);
        playFound();
        playCoin();
        vibrate([35, 45, 35, 45]);
        if (praiseTimer.current) clearTimeout(praiseTimer.current);
        const text = PRAISE[Math.floor(Math.random() * PRAISE.length)];
        setPraise({ text, id: Date.now() });
        praiseTimer.current = setTimeout(() => setPraise(null), 900);
      } else {
        playSwoosh();
        vibrate(20);
      }
    }
    setSelCells([]);
    setSelStart(null);
  }

  function cellFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    const target = el && el.closest ? el.closest('[data-cell]') : null;
    if (!target) return null;
    return { r: Number(target.dataset.r), c: Number(target.dataset.c) };
  }
  function startSelect(r, c) {
    return (e) => {
      e.preventDefault();
      ensureAudio();
      setIsSelecting(true);
      setSelStart({ r, c });
      setSelCells([{ r, c }]);
      playSelectStart();
      vibrate(18);
    };
  }
  function enterCell(r, c) {
    return () => {
      if (!isSelecting || !selStart) return;
      const line = computeLine(selStart, { r, c });
      if (line) setSelCells(line);
    };
  }
  function handleTouchMove(e) {
    if (!isSelecting || !selStart) return;
    const t = e.touches[0];
    const cell = cellFromPoint(t.clientX, t.clientY);
    if (cell) {
      const line = computeLine(selStart, cell);
      if (line) setSelCells(line);
    }
  }
  function useHint() {
    if (hintsLeft <= 0 || won) return;
    const remaining = puzzle.placements.filter((p) => !foundWords[p.word]);
    if (remaining.length === 0) return;
    const target = remaining[Math.floor(Math.random() * remaining.length)];
    setHintCell(target.cells[0]);
    setHintsLeft((h) => h - 1);
    playHint();
    vibrate([25, 20, 25]);
    setTimeout(() => setHintCell(null), 1400);
  }
  function shufflePuzzle() { playTap(); vibrate(15); setSeed((s) => s + 1); }
  function nextLevel() { playTap(); vibrate(15); setLevel((l) => l + 1); setSeed((s) => s + 1); }
  function toggleSound() { playTap(); setSoundOn((s) => !s); }
  function startGame() { ensureAudio(); playTap(); vibrate(15); setLevel(1); setCoins(0); setSeed((s) => s + 1); setAppState('playing'); }
  function goHome() { playTap(); setAppState('menu'); setPackModalOpen(false); }
  function choosePack(catKey, diffKey) {
    playTap(); vibrate(15);
    setCategory(catKey); setDifficulty(diffKey);
    setSeed((s) => s + 1);
    setPackModalOpen(false); setWon(false);
  }

  const foundCellColor = useMemo(() => {
    const map = new Map();
    Object.values(foundWords).forEach((p) => p.cells.forEach(({ r, c }) => map.set(`${r}-${c}`, p.color)));
    return map;
  }, [foundWords]);

  const foundCount = Object.keys(foundWords).length;
  const total = puzzle.placements.length;
  const progressPct = total ? (foundCount / total) * 100 : 0;
  const strokeW = (100 / puzzle.size) * 0.6;
  const cellFontSize = puzzle.size <= 8 ? '1.6rem' : puzzle.size <= 10 ? '1.25rem' : '1rem';
  const catInfo = CATEGORIES[category];

  return (
    <div className="ww-root">
      <style>{`
        .ww-root {
          --sky-top:#7BE1F0; --sky-bot:#CFF3D9;
          --hill-back:#8FE07C; --hill-mid:#63C862; --hill-front:#3FAE4E;
          --cream:#FFF7E9; --cream-edge:#F4E6C7;
          --outline:#5A3A1E; --outline-soft:#7A4E27;
          --orange:#FF8A3D; --orange-dark:#E4661B;
          --gold:#FFC93D; --gold-dark:#E79A0B;
          --ink:#4A3220; --ink-soft:#7A5C42;
          --wood:#8A5A2E; --wood-dark:#6B4220;
          font-family:'Nunito', system-ui, sans-serif;
          color:var(--ink);
          min-height:100vh; width:100%; box-sizing:border-box;
          display:flex; justify-content:center; position:relative; overflow:hidden;
          padding: clamp(14px,3vw,32px) clamp(10px,3vw,32px) 30px;
          background: linear-gradient(180deg, var(--sky-top) 0%, var(--sky-bot) 62%, var(--sky-bot) 100%);
        }
        .ww-root *,.ww-root *::before,.ww-root *::after{box-sizing:border-box;}
        .ww-bg{position:absolute;inset:0;overflow:hidden;z-index:0;pointer-events:none;}
        .ww-sun{position:absolute;top:-60px;left:-40px;width:220px;height:220px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,246,196,0.9),rgba(255,246,196,0) 70%);}
        .ww-cloud{position:absolute;width:70px;height:26px;border-radius:50px;background:#fff;opacity:0.85;
          box-shadow:18px -14px 0 -2px #fff,-16px -10px 0 -4px #fff,34px -4px 0 -6px #fff;
          animation:ww-drift linear infinite;}
        @keyframes ww-drift{from{transform:translateX(-10vw);}to{transform:translateX(110vw);}}
        .ww-hill{position:absolute;left:-15%;width:130%;border-radius:50% 50% 0 0/100% 100% 0 0;}
        .ww-hill.back{bottom:-30px;height:210px;background:var(--hill-back);opacity:0.9;}
        .ww-hill.mid{bottom:-40px;height:160px;background:var(--hill-mid);}
        .ww-hill.front{bottom:-50px;height:120px;background:var(--hill-front);}
        @media (prefers-reduced-motion: reduce){ .ww-cloud{animation:none;} }

        .ww-shell{position:relative;z-index:1;width:100%;max-width:460px;}
        .ww-btn{font-family:'Nunito',sans-serif;font-weight:800;border:none;cursor:pointer;border-radius:999px;
          transition:transform .1s ease, box-shadow .1s ease;}
        .ww-btn:active{transform:translateY(2px);}
        .ww-root button:focus-visible,.ww-root [tabindex]:focus-visible{outline:3px solid var(--gold-dark);outline-offset:2px;}

        .ww-bubble{
          font-family:'Fredoka',sans-serif; font-weight:700;
          background:linear-gradient(180deg,#FFE07A 0%,#FFB627 55%,#FF8A2E 100%);
          -webkit-background-clip:text;background-clip:text;color:transparent;
          -webkit-text-stroke:3px var(--outline); paint-order:stroke fill;
          filter:drop-shadow(0 5px 0 rgba(90,58,30,0.35));
        }

        .ww-3d-btn{
          background:linear-gradient(180deg,var(--gold) 0%,var(--orange) 100%);
          color:var(--outline); box-shadow:0 6px 0 var(--orange-dark), 0 14px 26px -10px rgba(228,102,27,0.55);
          padding:16px 40px; font-size:1.05rem; display:inline-flex; align-items:center; gap:8px;
        }
        .ww-3d-btn:active{box-shadow:0 2px 0 var(--orange-dark);}
        .ww-3d-btn.secondary{background:linear-gradient(180deg,#fff,#EFE6D3);color:var(--ink);
          box-shadow:0 6px 0 var(--cream-edge), 0 10px 20px -10px rgba(0,0,0,0.25);}
        .ww-3d-btn.secondary:active{box-shadow:0 2px 0 var(--cream-edge);}

        /* ---------- Menu ---------- */
        .ww-menu{text-align:center;padding-top:6vh;}
        .ww-title{font-size:clamp(2.6rem,10vw,4rem);margin:0 0 2px;letter-spacing:1px;line-height:0.95;}
        .ww-menu-sub{color:var(--outline-soft);font-weight:800;margin:10px 0 30px;font-size:0.95rem;
          background:rgba(255,255,255,0.55);display:inline-block;padding:6px 16px;border-radius:999px;}
        .ww-panel{background:var(--cream);border:4px solid var(--outline);border-radius:26px;padding:22px;
          box-shadow:0 16px 0 rgba(90,58,30,0.18), 0 22px 40px -14px rgba(0,0,0,0.35); position:relative; overflow:hidden;}
        .ww-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:40%;
          background:linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0));pointer-events:none;}
        .ww-section-label{text-align:left;font-size:0.78rem;font-weight:900;text-transform:uppercase;letter-spacing:1px;
          color:var(--ink-soft);margin:0 0 10px;}
        .ww-cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:22px;}
        .ww-cat-card{background:#fff;border:3px solid var(--cream-edge);border-radius:16px;padding:12px 8px;cursor:pointer;
          display:flex;flex-direction:column;align-items:center;gap:2px;transition:transform .12s,border-color .12s;}
        .ww-cat-card:hover{transform:translateY(-2px);}
        .ww-cat-card.is-active{border-color:var(--orange);background:#FFF1DC;}
        .ww-cat-emoji{font-size:1.6rem;}
        .ww-cat-name{font-weight:900;font-size:0.9rem;color:var(--ink);}
        .ww-cat-tag{font-size:0.68rem;color:var(--ink-soft);font-weight:700;}
        .ww-diff-row{display:flex;gap:8px;justify-content:center;margin-bottom:24px;flex-wrap:wrap;}
        .ww-diff-chip{background:#fff;border:3px solid var(--cream-edge);color:var(--ink);padding:9px 18px;
          font-size:0.82rem;border-radius:999px;cursor:pointer;font-weight:900;font-family:'Nunito',sans-serif;}
        .ww-diff-chip.is-active{border-color:var(--teal,#35C9A5);background:#DFF7F0;color:#1FA688;}

        /* ---------- HUD ---------- */
        .ww-hud{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;}
        .ww-home-btn{width:44px;height:44px;border-radius:14px;background:linear-gradient(180deg,var(--gold),var(--orange));
          border:3px solid var(--outline);display:flex;align-items:center;justify-content:center;color:var(--outline);
          box-shadow:0 4px 0 var(--orange-dark);}
        .ww-home-btn:active{box-shadow:0 1px 0 var(--orange-dark);transform:translateY(3px);}
        .ww-level-pill{font-family:'Baloo 2',sans-serif;font-weight:800;background:rgba(255,255,255,0.75);
          border:2px solid rgba(90,58,30,0.25);border-radius:999px;padding:8px 18px;font-size:0.95rem;color:var(--ink);}
        .ww-coin-pill{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.75);
          border:2px solid rgba(90,58,30,0.25);border-radius:999px;padding:7px 14px;font-weight:900;
          font-family:'Baloo 2',sans-serif;font-size:0.95rem;}

        .ww-ribbon{position:relative;background:linear-gradient(180deg,var(--orange),var(--orange-dark));
          color:#fff;text-align:center;font-family:'Fredoka',sans-serif;font-weight:600;font-size:1.05rem;
          letter-spacing:1.5px;padding:9px 10px 8px;border-radius:12px;margin:0 26px 12px;
          border:2px solid var(--outline);box-shadow:0 4px 0 var(--outline-soft);}
        .ww-ribbon::before,.ww-ribbon::after{content:'';position:absolute;top:2px;width:0;height:0;
          border-style:solid;}
        .ww-ribbon::before{left:-16px;border-width:14px 16px 14px 0;border-color:transparent var(--orange-dark) transparent transparent;}
        .ww-ribbon::after{right:-16px;border-width:14px 0 14px 16px;border-color:transparent transparent transparent var(--orange-dark);}

        .ww-wordbank{background:rgba(90,58,30,0.28);backdrop-filter:blur(2px);border-radius:16px;padding:10px 12px;
          display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;margin-bottom:14px;}
        .ww-word-chip{font-family:'Baloo 2',sans-serif;font-weight:700;font-size:0.85rem;letter-spacing:0.5px;
          color:#fff;text-shadow:0 2px 0 rgba(0,0,0,0.25);transition:opacity .2s;}
        .ww-word-chip.is-found{opacity:0.55;text-decoration:line-through;text-decoration-thickness:2px;}

        .ww-grid-wrap{position:relative;margin-bottom:14px;}
        .ww-grid{position:relative;display:grid;gap:0;background:var(--cream);border:4px solid var(--outline);
          border-radius:20px;overflow:hidden;box-shadow:0 10px 0 rgba(90,58,30,0.2), 0 20px 40px -18px rgba(0,0,0,0.4);
          user-select:none;-webkit-user-select:none;touch-action:none;font-size:${cellFontSize};padding:6px;}
        .ww-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;
          font-family:'Baloo 2',sans-serif;font-weight:700;color:var(--ink);cursor:pointer;position:relative;
          z-index:2;transition:color .12s ease;}
        .ww-cell.is-selected{color:#fff;}
        .ww-cell.is-found{color:#fff;}
        .ww-cell.is-hint{animation:ww-hint-pulse .7s ease-in-out infinite;border-radius:50%;}
        @keyframes ww-hint-pulse{0%,100%{box-shadow:inset 0 0 0 2px var(--gold-dark);}50%{box-shadow:inset 0 0 0 5px var(--gold-dark);}}
        .ww-lines{position:absolute;inset:6px;width:calc(100% - 12px);height:calc(100% - 12px);z-index:1;pointer-events:none;}

        .ww-praise{position:absolute;left:50%;top:6%;transform:translate(-50%,0);font-size:1.7rem;
          pointer-events:none;z-index:5;animation:ww-praise-pop .9s ease forwards;
          font-family:'Fredoka',sans-serif;font-weight:700;
          background:linear-gradient(180deg,#FFE07A,#FFB627 55%,#FF8A2E);
          -webkit-background-clip:text;background-clip:text;color:transparent;
          -webkit-text-stroke:2.5px var(--outline);paint-order:stroke fill;}
        @keyframes ww-praise-pop{0%{opacity:0;transform:translate(-50%,10px) scale(.6) rotate(-6deg);}
          15%{opacity:1;transform:translate(-50%,-6px) scale(1.15) rotate(3deg);}
          30%{transform:translate(-50%,-2px) scale(1) rotate(-2deg);}
          75%{opacity:1;}100%{opacity:0;transform:translate(-50%,-18px) scale(.9) rotate(0);}}

        .ww-progress-row{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:0 4px;}
        .ww-progress-track{flex:1;height:10px;background:rgba(90,58,30,0.2);border-radius:999px;overflow:hidden;}
        .ww-progress-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--orange));border-radius:999px;transition:width .3s ease;}
        .ww-progress-label{font-weight:900;font-size:0.78rem;color:var(--outline-soft);white-space:nowrap;}

        .ww-dock{display:flex;justify-content:space-around;align-items:center;background:linear-gradient(180deg,var(--wood),var(--wood-dark));
          border:3px solid var(--outline);border-radius:22px;padding:10px 8px;box-shadow:0 8px 0 rgba(0,0,0,0.2);}
        .ww-dock-btn{position:relative;width:54px;height:54px;border-radius:16px;background:linear-gradient(180deg,#FFF7E9,#F4E6C7);
          border:2px solid var(--outline);color:var(--ink);display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 0 rgba(0,0,0,0.25);}
        .ww-dock-btn:disabled{opacity:0.45;}
        .ww-dock-btn:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,0.25);}
        .ww-badge{position:absolute;top:-6px;right:-6px;background:var(--orange);color:#fff;font-size:0.65rem;
          font-weight:900;border-radius:999px;min-width:18px;height:18px;display:flex;align-items:center;justify-content:center;
          border:2px solid var(--outline);font-family:'Baloo 2',sans-serif;}

        /* ---------- Modal ---------- */
        .ww-modal-overlay{position:fixed;inset:0;background:rgba(20,20,40,0.5);display:flex;align-items:flex-end;
          justify-content:center;z-index:60;padding:0;}
        .ww-modal-card{background:var(--cream);border:4px solid var(--outline);border-radius:26px 26px 0 0;
          padding:22px 20px 28px;width:100%;max-width:460px;animation:ww-sheet-up .25s ease;}
        @keyframes ww-sheet-up{from{transform:translateY(30px);opacity:0;}to{transform:translateY(0);opacity:1;}}
        .ww-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .ww-modal-head h3{font-family:'Fredoka',sans-serif;margin:0;font-size:1.2rem;color:var(--ink);}
        .ww-modal-close{width:34px;height:34px;border-radius:50%;background:#fff;border:2px solid var(--cream-edge);
          display:flex;align-items:center;justify-content:center;color:var(--ink);}

        /* ---------- Win overlay ---------- */
        .ww-win-overlay{position:fixed;inset:0;background:rgba(20,20,40,0.55);backdrop-filter:blur(3px);
          display:flex;align-items:center;justify-content:center;z-index:50;padding:20px;}
        .ww-win-card{background:var(--cream);border:4px solid var(--outline);border-radius:24px;padding:36px 30px;
          text-align:center;max-width:360px;position:relative;z-index:2;animation:ww-pop .35s cubic-bezier(.2,1.4,.4,1);}
        @keyframes ww-pop{from{transform:scale(.85);opacity:0;}to{transform:scale(1);opacity:1;}}
        .ww-win-card svg{color:var(--gold-dark);}
        .ww-win-card h2{font-family:'Fredoka',sans-serif;font-size:1.7rem;margin:8px 0 6px;color:var(--ink);}
        .ww-win-card p{color:var(--ink-soft);margin:0 0 8px;font-size:0.9rem;font-weight:700;}
        .ww-win-coins{font-family:'Baloo 2',sans-serif;font-weight:800;color:var(--gold-dark);font-size:1.15rem;margin-bottom:20px;}
        .ww-win-actions{display:flex;flex-direction:column;gap:10px;}
        .ww-win-actions .ww-3d-btn{justify-content:center;padding:13px;font-size:0.92rem;}
        .ww-confetti-piece{position:fixed;top:-12px;width:8px;height:14px;z-index:40;border-radius:2px;
          animation-name:ww-fall;animation-timing-function:cubic-bezier(.4,0,.6,1);animation-iteration-count:1;animation-fill-mode:forwards;}
        @keyframes ww-fall{to{transform:translateY(105vh) rotate(540deg);opacity:0.2;}}

        .ww-bump{display:inline-block;animation:ww-bump-kf .4s ease;}
        @keyframes ww-bump-kf{0%{transform:scale(1);}30%{transform:scale(1.35);}100%{transform:scale(1);}}

        @media (max-width:380px){ .ww-cat-grid{gap:8px;} .ww-title{font-size:2.3rem;} }
      `}</style>

      <div className="ww-bg">
        <div className="ww-sun" />
        {CLOUDS.map((c, i) => (
          <div key={i} className="ww-cloud" style={{ top: c.top, left: c.left, transform: `scale(${c.scale})`, animationDuration: `${c.duration}s` }} />
        ))}
        <div className="ww-hill back" />
        <div className="ww-hill mid" />
        <div className="ww-hill front" />
      </div>

      <div className="ww-shell">
        {appState === 'menu' && (
          <div className="ww-menu">
            <h1 className="ww-bubble ww-title">WORD<br />SEARCH</h1>
            <span className="ww-menu-sub">Sweep every word before time's up!</span>
            <div className="ww-panel">
              <p className="ww-section-label">Choose a pack</p>
              <div className="ww-cat-grid">
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <div key={key} className={`ww-cat-card ${category === key ? 'is-active' : ''}`}
                    onClick={() => { playTap(); setCategory(key); }} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setCategory(key); }}>
                    <span className="ww-cat-emoji">{cat.emoji}</span>
                    <span className="ww-cat-name">{cat.label}</span>
                    <span className="ww-cat-tag">{cat.tagline}</span>
                  </div>
                ))}
              </div>
              <p className="ww-section-label">Difficulty</p>
              <div className="ww-diff-row">
                {Object.entries(DIFFICULTIES).map(([key, d]) => (
                  <button key={key} className={`ww-diff-chip ${difficulty === key ? 'is-active' : ''}`}
                    onClick={() => { playTap(); setDifficulty(key); }}>{d.label}</button>
                ))}
              </div>
              <button className="ww-btn ww-3d-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={startGame}>
                <Play size={20} fill="#5A3A1E" /> PLAY
              </button>
            </div>
          </div>
        )}

        {appState === 'playing' && (
          <div>
            <div className="ww-hud">
              <button className="ww-home-btn" onClick={goHome} aria-label="Home"><Home size={20} /></button>
              <span className="ww-level-pill">LEVEL {level}</span>
              <span className="ww-coin-pill"><span key={coins} className="ww-bump">🪙 {coins}</span></span>
            </div>

            <div className="ww-ribbon">{catInfo.emoji} {catInfo.label.toUpperCase()}</div>

            <div className="ww-wordbank">
              {puzzle.placements.map((p) => (
                <span key={p.word} className={`ww-word-chip ${foundWords[p.word] ? 'is-found' : ''}`}>{p.word}</span>
              ))}
            </div>

            <div className="ww-grid-wrap">
              <div className="ww-grid" style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }} onTouchMove={handleTouchMove}>
                {puzzle.grid.map((row, r) => row.map((letter, c) => {
                  const key = `${r}-${c}`;
                  const selected = selCells.some((s) => s.r === r && s.c === c);
                  const fc = foundCellColor.get(key);
                  const isHint = hintCell && hintCell.r === r && hintCell.c === c;
                  return (
                    <div key={key} data-cell="true" data-r={r} data-c={c}
                      className={`ww-cell ${selected ? 'is-selected' : ''} ${fc ? 'is-found' : ''} ${isHint ? 'is-hint' : ''}`}
                      onMouseDown={startSelect(r, c)} onMouseEnter={enterCell(r, c)} onTouchStart={startSelect(r, c)}>
                      {letter}
                    </div>
                  );
                }))}
                <svg className="ww-lines" viewBox="0 0 100 100">
                  {puzzle.placements.filter((p) => foundWords[p.word]).map((p) => {
                    const coords = lineCoords(p.cells, puzzle.size);
                    return (
                      <g key={p.word}>
                        <line {...coords} stroke={p.color.shadow} strokeWidth={strokeW} strokeLinecap="round" transform="translate(0,1.6)" />
                        <line {...coords} stroke={p.color.main} strokeWidth={strokeW} strokeLinecap="round" />
                      </g>
                    );
                  })}
                  {selCells.length > 1 && (
                    <g>
                      <line {...lineCoords(selCells, puzzle.size)} stroke={ACTIVE_COLOR.shadow} strokeWidth={strokeW} strokeLinecap="round" transform="translate(0,1.6)" />
                      <line {...lineCoords(selCells, puzzle.size)} stroke={ACTIVE_COLOR.main} strokeWidth={strokeW} strokeLinecap="round" />
                    </g>
                  )}
                </svg>
              </div>
              {praise && <div key={praise.id} className="ww-praise">{praise.text}</div>}
            </div>

            <div className="ww-progress-row">
              <div className="ww-progress-track"><div className="ww-progress-fill" style={{ width: `${progressPct}%` }} /></div>
              <span className="ww-progress-label">{foundCount}/{total}</span>
              <span className="ww-progress-label"><Check size={12} style={{ verticalAlign: -1 }} /> {formatTime(elapsed)}</span>
            </div>

            <div className="ww-dock">
              <button className="ww-dock-btn" onClick={useHint} disabled={hintsLeft <= 0} aria-label="Hint">
                <Lightbulb size={22} /><span className="ww-badge">{hintsLeft}</span>
              </button>
              <button className="ww-dock-btn" onClick={shufflePuzzle} aria-label="Shuffle puzzle"><Shuffle size={22} /></button>
              <button className="ww-dock-btn" onClick={() => { playTap(); setPackModalOpen(true); }} aria-label="Change pack"><LayoutGrid size={22} /></button>
              <button className="ww-dock-btn" onClick={toggleSound} aria-label="Toggle sound">
                {soundOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {packModalOpen && (
        <div className="ww-modal-overlay" onClick={() => setPackModalOpen(false)}>
          <div className="ww-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ww-modal-head">
              <h3>Choose a pack</h3>
              <button className="ww-modal-close" onClick={() => setPackModalOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="ww-cat-grid" style={{ marginBottom: 16 }}>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <div key={key} className={`ww-cat-card ${category === key ? 'is-active' : ''}`}
                  onClick={() => { playTap(); setCategory(key); }} role="button" tabIndex={0}>
                  <span className="ww-cat-emoji">{cat.emoji}</span>
                  <span className="ww-cat-name">{cat.label}</span>
                  <span className="ww-cat-tag">{cat.tagline}</span>
                </div>
              ))}
            </div>
            <div className="ww-diff-row">
              {Object.entries(DIFFICULTIES).map(([key, d]) => (
                <button key={key} className={`ww-diff-chip ${difficulty === key ? 'is-active' : ''}`}
                  onClick={() => { playTap(); setDifficulty(key); }}>{d.label}</button>
              ))}
            </div>
            <button className="ww-btn ww-3d-btn" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => choosePack(category, difficulty)}>START</button>
          </div>
        </div>
      )}

      {won && (
        <div className="ww-win-overlay">
          {confetti.map((p) => (
            <span key={p.id} className="ww-confetti-piece" style={{
              left: `${p.left}%`, background: p.color, animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`, transform: `rotate(${p.rotate}deg)`,
            }} />
          ))}
          <div className="ww-win-card">
            <Trophy size={40} />
            <h2>LEVEL COMPLETE!</h2>
            <p>All {total} words found in {formatTime(elapsed)}</p>
            <div className="ww-win-coins">+50 🪙</div>
            <div className="ww-win-actions">
              <button className="ww-btn ww-3d-btn" onClick={nextLevel}>NEXT LEVEL</button>
              <button className="ww-btn ww-3d-btn secondary" onClick={() => { setWon(false); setPackModalOpen(true); }}>CHANGE PACK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
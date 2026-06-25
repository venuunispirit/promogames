import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const BouncePlayerPage = () => {
  const { gameName, companyName } = useParams();
  const navigate = useNavigate();
  
  const [game, setGame] = useState(null);
  const [settings, setSettings] = useState({});
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameState, setGameState] = useState('loading'); // loading, playing, paused, complete
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const keysRef = useRef({});
  const lastTimeRef = useRef(0);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  
  const BALL_SIZE = 24;
  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;
  const FRICTION = 0.85;
  const MAX_SPEED = 8;
  
  // Load game data
  useEffect(() => {
    api.get(`/api/bounce/${gameName}/${companyName}`)
      .then(res => {
        setGame(res.data.game);
        setSettings(res.data.settings);
        setLevels(res.data.levels);
        setCurrentLevelIndex(0);
      })
      .catch(err => {
        console.error('Error loading game:', err);
      });
  }, [gameName, companyName, navigate]);
  
  // Load progress for current level
  useEffect(() => {
    if (currentLevelIndex >= 0 && levels.length > 0) {
      const level = levels[currentLevelIndex];
      setCurrentLevel(level);
      
      api.get(`/api/play/session/progress`, {
        params: {
          game_id: game?.id,
          level_id: level.id,
          session_token: localStorage.getItem('playerToken')
        }
      })
      .then(res => {
        const progress = res.data.progress;
        if (progress) {
          setScore(progress.score || 0);
          setCoinsCollected(progress.coins_collected || 0);
          setTimeElapsed(progress.time_elapsed || 0);
          setDeaths(progress.deaths || 0);
          setBestScore(progress.best_score || 0);
          setBestTime(progress.best_time || null);
        }
      })
      .catch(err => {
        console.log('No existing progress, starting fresh');
      });
    }
  }, [currentLevelIndex, levels, game?.id]);
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || !currentLevel) return;
    
    const gameLoop = (timestamp) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;
      
      updateGame(deltaTime);
      renderGame();
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, currentLevel]);
  
  // Timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      e.preventDefault();
    };
    
    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
      e.preventDefault();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Touch controls for mobile
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Jump button (right side of screen)
      if (x > rect.width / 2) {
        keysRef.current[' '] = true;
      }
    };
    
    const handleTouchEnd = (e) => {
      e.preventDefault();
      keysRef.current[' '] = false;
    };
    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  const updateGame = (deltaTime) => {
    if (!game || gameState !== 'playing') return;
    
    const ball = gameStateData.ball;
    const objects = gameStateData.objects;
    
    // Apply gravity
    ball.velocity.y += GRAVITY * deltaTime;
    
    // Apply friction
    ball.velocity.x *= FRICTION;
    
    // Limit max speed
    const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
    if (speed > MAX_SPEED) {
      const scale = MAX_SPEED / speed;
      ball.velocity.x *= scale;
      ball.velocity.y *= scale;
    }
    
    // Handle input
    if (keysRef.current['arrowleft'] || keysRef.current['a']) {
      ball.velocity.x -= 2 * deltaTime;
    }
    if (keysRef.current['arrowright'] || keysRef.current['d']) {
      ball.velocity.x += 2 * deltaTime;
    }
    if ((keysRef.current['arrowup'] || keysRef.current['w'] || keysRef.current[' ']) && !ball.onGround) {
      ball.velocity.y = JUMP_FORCE;
      ball.onGround = false;
    }
    
    // Update position
    ball.x += ball.velocity.x * deltaTime;
    ball.y += ball.velocity.y * deltaTime;
    
    // Ground collision
    if (ball.y + BALL_SIZE >= currentLevel.height) {
      ball.y = currentLevel.height - BALL_SIZE;
      ball.velocity.y = 0;
      ball.onGround = true;
    }
    
    // Wall collision
    if (ball.x < 0) ball.x = 0;
    if (ball.x + BALL_SIZE > currentLevel.width) ball.x = currentLevel.width - BALL_SIZE;
    
    // Object collision
    objects.forEach(obj => {
      switch (obj.type) {
        case 'platform':
          if (
            ball.x < obj.x + obj.width &&
            ball.x + BALL_SIZE > obj.x &&
            ball.y < obj.y + obj.height &&
            ball.y + BALL_SIZE > obj.y
          ) {
            // Top collision
            if (ball.velocity.y > 0 && ball.y < obj.y + obj.height / 2) {
              ball.y = obj.y - BALL_SIZE;
              ball.velocity.y = -JUMP_FORCE * 0.8;
              ball.onGround = true;
            }
            // Side collision
            else if (ball.velocity.x !== 0) {
              if (ball.x < obj.x + obj.width / 2) {
                ball.x = obj.x - BALL_SIZE;
                ball.velocity.x = -ball.velocity.x * 0.5;
              } else {
                ball.x = obj.x + obj.width;
                ball.velocity.x = -ball.velocity.x * 0.5;
              }
            }
          }
          break;
        
        case 'spike':
          if (
            ball.x < obj.x + obj.width &&
            ball.x + BALL_SIZE > obj.x &&
            ball.y < obj.y + obj.height &&
            ball.y + BALL_SIZE > obj.y
          ) {
            die();
          }
          break;
        
        case 'spring':
          if (
            ball.x < obj.x + obj.width &&
            ball.x + BALL_SIZE > obj.x &&
            ball.y < obj.y + obj.height &&
            ball.y + BALL_SIZE > obj.y
          ) {
            ball.velocity.y = -JUMP_FORCE * 2;
            ball.onGround = true;
          }
          break;
        
        case 'coin':
          if (
            ball.x < obj.x + obj.width &&
            ball.x + BALL_SIZE > obj.x &&
            ball.y < obj.y + obj.height &&
            ball.y + BALL_SIZE > obj.y
          ) {
            setCoinsCollected(prev => prev + (obj.coin_value || 10));
            setScore(prev => prev + (obj.coin_value || 10));
            // Remove coin
            gameStateData.objects = objects.filter(o => o.id !== obj.id);
          }
          break;
        
        case 'goal':
          if (
            ball.x < obj.x + obj.width &&
            ball.x + BALL_SIZE > obj.x &&
            ball.y < obj.y + obj.height &&
            ball.y + BALL_SIZE > obj.y
          ) {
            completeLevel();
          }
          break;
        
        case 'death_zone':
          if (
            ball.x < obj.x + obj.width &&
            ball.x + BALL_SIZE > obj.x &&
            ball.y < obj.y + obj.height &&
            ball.y + BALL_SIZE > obj.y
          ) {
            die();
          }
          break;
      }
    });
    
    // Check win condition
    const totalCoins = objects.filter(o => o.type === 'coin').length * 10;
    if (currentLevel.target_score > 0 && score >= currentLevel.target_score) {
      completeLevel();
    }
    
    // Update progress
    saveProgress();
  };
  
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    if (settings.bg_image_url) {
      const img = new Image();
      img.src = settings.bg_image_url;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else if (settings.bg_color) {
      ctx.fillStyle = settings.bg_color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw parallax background
    if (currentLevel.parallax_bg_url) {
      const img = new Image();
      img.src = currentLevel.parallax_bg_url;
      ctx.drawImage(img, 0, 0, canvas.width * 2, canvas.height);
    }
    
    // Draw objects
    objects.forEach(obj => {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      
      // Set color based on type
      let color = obj.color || '#333';
      if (obj.type === 'spike') color = '#dc2626';
      else if (obj.type === 'spring') color = '#16a34a';
      else if (obj.type === 'coin') color = '#f59e0b';
      else if (obj.type === 'goal') color = '#3b82f6';
      else if (obj.type === 'death_zone') color = '#991b1b';
      
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, obj.width, obj.height);
      
      // Draw object type icon
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.type.charAt(0).toUpperCase(), obj.width / 2, obj.height / 2);
      
      ctx.restore();
    });
    
    // Draw ball
    ctx.save();
    ctx.translate(gameStateData.ball.x, gameStateData.ball.y);
    
    if (settings.ball_image_url) {
      const img = new Image();
      img.src = settings.ball_image_url;
      ctx.drawImage(img, -BALL_SIZE / 2, -BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);
    } else {
      ctx.fillStyle = settings.ball_color || '#e53935';
      ctx.beginPath();
      ctx.arc(BALL_SIZE / 2, BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
    
    // Draw UI
    drawUI(ctx);
  };
  
  const drawUI = (ctx) => {
    // Score
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 40);
    
    // Coins
    ctx.fillText(`Coins: ${coinsCollected}`, 20, 70);
    
    // Time
    if (settings.show_timer) {
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = timeElapsed % 60;
      ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, 20, 100);
    }
    
    // Deaths
    ctx.fillText(`Deaths: ${deaths}`, 20, 130);
    
    // Level info
    ctx.fillText(`Level ${currentLevelIndex + 1} of ${levels.length}`, canvas.width - 20, 40, canvas.width - 40);
    
    // Game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 40);
      
      ctx.font = '20px sans-serif';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
      ctx.fillText(`Coins: ${coinsCollected}`, canvas.width / 2, canvas.height / 2 + 30);
      
      ctx.font = '16px sans-serif';
      ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 80);
    }
    
    // Level complete overlay
    if (gameState === 'complete') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2 - 40);
      
      ctx.font = '20px sans-serif';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
      ctx.fillText(`Coins: ${coinsCollected}`, canvas.width / 2, canvas.height / 2 + 30);
      
      if (currentLevelIndex < levels.length - 1) {
        ctx.font = '16px sans-serif';
        ctx.fillText('Press SPACE to continue', canvas.width / 2, canvas.height / 2 + 80);
      } else {
        ctx.font = '16px sans-serif';
        ctx.fillText('All levels completed!', canvas.width / 2, canvas.height / 2 + 80);
      }
    }
  };
  
  const die = () => {
    setDeaths(prev => prev + 1);
    // Reset position
    gameStateData.ball.x = 100;
    gameStateData.ball.y = currentLevel.height - BALL_SIZE - 50;
    gameStateData.ball.velocity.x = 0;
    gameStateData.ball.velocity.y = 0;
    gameStateData.ball.onGround = true;
    
    // Show temporary damage effect
    setGameOver(true);
    setTimeout(() => setGameOver(false), 500);
  };
  
  const completeLevel = () => {
    setGameState('complete');
    
    // Update best scores
    if (score > bestScore) {
      setBestScore(score);
    }
    if (timeElapsed < (bestTime || Infinity)) {
      setBestTime(timeElapsed);
    }
    
    // Save progress
    saveProgress();
    
    // Show completion
    setTimeout(() => {
      if (currentLevelIndex < levels.length - 1) {
        nextLevel();
      } else {
        setGameState('complete');
      }
    }, 2000);
  };
  
  const nextLevel = () => {
    if (currentLevelIndex < levels.length - 1) {
      const nextIndex = currentLevelIndex + 1;
      setCurrentLevelIndex(nextIndex);
      setScore(0);
      setCoinsCollected(0);
      setTimeElapsed(0);
      setGameState('playing');
    }
  };
  
  const restartLevel = () => {
    setScore(0);
    setCoinsCollected(0);
    setTimeElapsed(0);
    setDeaths(0);
    setGameOver(false);
    setGameState('playing');
    
    // Reset ball position
    gameStateData.ball.x = 100;
    gameStateData.ball.y = currentLevel.height - BALL_SIZE - 50;
    gameStateData.ball.velocity.x = 0;
    gameStateData.ball.velocity.y = 0;
    gameStateData.ball.onGround = true;
  };
  
  const saveProgress = () => {
    const progress = {
      session_token: localStorage.getItem('playerToken'),
      game_id: game?.id,
      level_id: currentLevel?.id,
      score,
      coins_collected: coinsCollected,
      time_elapsed: timeElapsed,
      completed: gameState === 'complete' ? 1 : 0,
      deaths,
      best_score: bestScore,
      best_time: bestTime
    };
    
    api.post('/play/session/complete', progress)
      .catch(err => console.error('Error saving progress:', err));
  };
  
  const handleKeyPress = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      if (gameOver) {
        restartLevel();
      } else if (gameState === 'complete') {
        if (currentLevelIndex < levels.length - 1) {
          nextLevel();
        }
      }
    }
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, gameState, currentLevelIndex, levels.length]);
  
  // Initialize game state
  const gameStateData = {
    ball: {
      x: 100,
      y: currentLevel?.height - BALL_SIZE - 50 || 500,
      velocity: { x: 0, y: 0 },
      onGround: true
    },
    objects: currentLevel?.objects || []
  };
  
  if (gameState === 'loading' || !game) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading Bounce Game...</h2>
          <p>Preparing levels and assets...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={currentLevel?.width || 3000}
        height={currentLevel?.height || 600}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      
      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        {/* Left side info */}
        <div style={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', padding: '12px', pointerEvents: 'auto' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Bounce Game</div>
          <div style={{ fontSize: '14px' }}>Level {currentLevelIndex + 1} of {levels.length}</div>
          <div style={{ fontSize: '14px' }}>Target: {currentLevel?.target_score > 0 ? currentLevel.target_score : 'None'}</div>
        </div>
        
        {/* Right side controls */}
        <div style={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', padding: '12px', pointerEvents: 'auto' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Controls</div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>← → Arrow Keys / A/D to move</div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>SPACE / W/↑ to jump</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Mobile: Tap right side of screen</div>
        </div>
      </div>
      
      {/* Level Select Modal */}
      {showLevelSelect && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Select Level</h2>
            <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px' }}>
              {levels.map((level, index) => (
                <div
                  key={level.id}
                  onClick={() => {
                    setCurrentLevelIndex(index);
                    setShowLevelSelect(false);
                  }}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    background: index === currentLevelIndex ? '#e3f2fd' : '#fff',
                    ':hover': { background: '#f5f5f5' }
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => {
                    if (index !== currentLevelIndex) e.target.style.background = '#fff';
                    else e.target.style.background = '#e3f2fd';
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{level.level_name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Size: {level.width} × {level.height}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Target: {level.target_score > 0 ? level.target_score : 'None'}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLevelSelect(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Game Over Overlay */}
      {gameOver && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '16px' }}>Game Over!</h2>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Score: {score}</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Coins: {coinsCollected}</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Deaths: {deaths}</div>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
            <button
              onClick={restartLevel}
              style={{
                padding: '12px 24px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Restart Level
            </button>
          </div>
        </div>
      )}
      
      {/* Level Complete Overlay */}
      {gameState === 'complete' && currentLevelIndex < levels.length - 1 && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a', marginBottom: '16px' }}>Level Complete!</h2>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Score: {score}</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Coins: {coinsCollected}</div>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
            <button
              onClick={nextLevel}
              style={{
                padding: '12px 24px',
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Next Level
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'complete' && currentLevelIndex >= levels.length - 1 && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '16px' }}>All Levels Completed!</h2>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Final Score: {score}</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Total Coins: {coinsCollected}</div>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>Best Score: {bestScore}</div>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Best Time: {bestTime ? `${Math.floor(bestTime / 60)}:${(bestTime % 60).toString().padStart(2, '0')}` : 'N/A'}</div>
            <button
              onClick={() => setShowLevelSelect(true)}
              style={{
                padding: '12px 24px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Select Level
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BouncePlayerPage;
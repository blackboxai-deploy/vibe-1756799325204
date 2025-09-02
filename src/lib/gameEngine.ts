import { 
  Ball, 
  Paddle, 
  Block, 
  PowerUp, 
  Particle, 
  GameState, 
  GameStats, 
  GameConfig, 
  Level, 
  PowerUpType,
  Vector2D 
} from '@/types/game';
import {
  ballPaddleCollision,
  ballBlockCollision,
  calculateBallPaddleReflection,
  calculateBlockCollisionSide,
  createParticles,
  updateParticles,
  clamp,
  randomBetween,
  getRandomColor
} from '@/lib/gameUtils';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameConfig;
  private gameState: GameState;
  private gameStats: GameStats;
  private currentLevel: Level;
  
  // Game objects
  private balls: Ball[] = [];
  private paddle: Paddle;
  private blocks: Block[] = [];
  private powerUps: PowerUp[] = [];
  private particles: Particle[] = [];
  
  // Game timing
  private lastTime = 0;
  private animationId: number | null = null;
  
  // Input handling
  private keys: { [key: string]: boolean } = {};
  private mouseX = 0;
  private touchX = 0;
  private isTouch = false;
  
  // Power-up effects
  private activePowerUps: Map<PowerUpType, number> = new Map();
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');
    this.ctx = ctx;
    
    this.config = this.getDefaultConfig();
    this.gameState = GameState.START_SCREEN;
    this.gameStats = this.getInitialStats();
    this.currentLevel = this.createLevel(1);
    
    this.paddle = this.createPaddle();
    this.setupEventListeners();
    this.resizeCanvas();
  }
  
  private getDefaultConfig(): GameConfig {
    return {
      canvas: {
        width: 800,
        height: 600
      },
      ball: {
        radius: 8,
        speed: 300,
        maxTrailLength: 10
      },
      paddle: {
        width: 100,
        height: 12,
        speed: 500,
        minWidth: 60,
        maxWidth: 150
      },
      blocks: {
        rows: 6,
        cols: 10,
        width: 70,
        height: 25,
        padding: 5,
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
      },
      physics: {
        friction: 0.98,
        bounceDamping: 0.95,
        maxBallSpeed: 500
      },
      powerUps: {
        fallSpeed: 150,
        size: 20,
        duration: 15000
      },
      particles: {
        count: 8,
        speed: 100,
        life: 800
      }
    };
  }
  
  private getInitialStats(): GameStats {
    const savedHighScore = localStorage.getItem('blockBreakerHighScore');
    return {
      score: 0,
      lives: 3,
      level: 1,
      combo: 0,
      highScore: savedHighScore ? parseInt(savedHighScore) : 0
    };
  }
  
  private createPaddle(): Paddle {
    return {
      position: { 
        x: this.config.canvas.width / 2 - this.config.paddle.width / 2, 
        y: this.config.canvas.height - 50 
      },
      width: this.config.paddle.width,
      height: this.config.paddle.height,
      velocity: 0,
      color: '#FFFFFF'
    };
  }
  
  private createLevel(levelNumber: number): Level {
    const level: Level = {
      id: levelNumber,
      name: `Level ${levelNumber}`,
      blocks: [],
      ballSpeed: this.config.ball.speed + (levelNumber - 1) * 20,
      powerUpChance: 0.15 + (levelNumber - 1) * 0.05,
      backgroundGradient: this.getLevelGradient(levelNumber)
    };
    
    // Create block pattern
    const { rows, cols, width, height, padding, colors } = this.config.blocks;
    const startX = (this.config.canvas.width - (cols * (width + padding) - padding)) / 2;
    const startY = 80;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip some blocks for interesting patterns
        if (levelNumber > 1 && Math.random() < 0.1) continue;
        
        const block: Block = {
          position: {
            x: startX + col * (width + padding),
            y: startY + row * (height + padding)
          },
          width,
          height,
          color: getRandomColor(colors),
          health: Math.min(3, 1 + Math.floor(levelNumber / 3)),
          maxHealth: Math.min(3, 1 + Math.floor(levelNumber / 3)),
          points: 10 * (row + 1),
          powerUpChance: level.powerUpChance,
          destroyed: false
        };
        
        level.blocks.push(block);
      }
    }
    
    return level;
  }
  
  private getLevelGradient(levelNumber: number): string[] {
    const gradients: string[][] = [
      ['#667eea', '#764ba2'], // Purple-blue
      ['#f093fb', '#f5576c'], // Pink-red
      ['#4facfe', '#00f2fe'], // Blue-cyan
      ['#43e97b', '#38f9d7'], // Green-turquoise
      ['#fa709a', '#fee140'], // Pink-yellow
      ['#a8edea', '#fed6e3'], // Mint-pink
      ['#ff9a9e', '#fecfef'], // Coral-pink
      ['#ffecd2', '#fcb69f']  // Peach-orange
    ];
    
    return gradients[(levelNumber - 1) % gradients.length] || gradients[0];
  }
  
  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      
      if (e.key === ' ') {
        e.preventDefault();
        this.handleSpaceKey();
      } else if (e.key === 'Escape') {
        this.togglePause();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
    
    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isTouch) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
      }
    });
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isTouch = true;
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.touchX = e.touches[0].clientX - rect.left;
      }
    });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleSpaceKey();
    });
    
    // Canvas click for starting game
    this.canvas.addEventListener('click', () => {
      if (this.gameState === GameState.START_SCREEN || this.gameState === GameState.GAME_OVER) {
        this.startGame();
      }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }
  
  private resizeCanvas(): void {
    const container = this.canvas.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const aspectRatio = this.config.canvas.width / this.config.canvas.height;
    
    let newWidth = containerRect.width;
    let newHeight = containerRect.width / aspectRatio;
    
    if (newHeight > containerRect.height) {
      newHeight = containerRect.height;
      newWidth = containerRect.height * aspectRatio;
    }
    
    this.canvas.width = this.config.canvas.width;
    this.canvas.height = this.config.canvas.height;
    this.canvas.style.width = `${newWidth}px`;
    this.canvas.style.height = `${newHeight}px`;
  }
  
  private handleSpaceKey(): void {
    switch (this.gameState) {
      case GameState.START_SCREEN:
        this.startGame();
        break;
      case GameState.PLAYING:
        if (this.balls.length === 0) {
          this.launchBall();
        }
        break;
      case GameState.PAUSED:
        this.resumeGame();
        break;
      case GameState.LEVEL_COMPLETE:
        this.nextLevel();
        break;
      case GameState.GAME_OVER:
        this.resetGame();
        break;
    }
  }
  
  public startGame(): void {
    this.gameState = GameState.PLAYING;
    this.resetLevel();
    this.launchBall();
    this.start();
  }
  
  private resetGame(): void {
    this.gameStats = this.getInitialStats();
    this.currentLevel = this.createLevel(1);
    this.resetLevel();
    this.startGame();
  }
  
  private resetLevel(): void {
    this.balls = [];
    this.powerUps = [];
    this.particles = [];
    this.activePowerUps.clear();
    this.blocks = [...this.currentLevel.blocks];
    this.paddle = this.createPaddle();
  }
  
  private launchBall(): void {
    const ball: Ball = {
      position: {
        x: this.paddle.position.x + this.paddle.width / 2,
        y: this.paddle.position.y - this.config.ball.radius - 5
      },
      velocity: {
        x: randomBetween(-100, 100),
        y: -this.currentLevel.ballSpeed
      },
      radius: this.config.ball.radius,
      color: '#FFFFFF',
      trail: []
    };
    
    this.balls.push(ball);
  }
  
  private togglePause(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
      this.stop();
    } else if (this.gameState === GameState.PAUSED) {
      this.resumeGame();
    }
  }
  
  private resumeGame(): void {
    this.gameState = GameState.PLAYING;
    this.start();
  }
  
  private nextLevel(): void {
    this.gameStats.level++;
    this.currentLevel = this.createLevel(this.gameStats.level);
    this.resetLevel();
    this.gameState = GameState.PLAYING;
    this.launchBall();
  }
  
  public start(): void {
    if (this.animationId) return;
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  private gameLoop = (): void => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    if (this.gameState === GameState.PLAYING) {
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  };
  
  private update(deltaTime: number): void {
    if (this.gameState !== GameState.PLAYING) return;
    
    this.updatePaddle(deltaTime);
    this.updateBalls(deltaTime);
    this.updatePowerUps(deltaTime);
    this.updateParticles(deltaTime);
    this.updateActivePowerUps(deltaTime);
    this.checkGameState();
  }
  
  private updatePaddle(deltaTime: number): void {
    let targetX = this.paddle.position.x;
    
    // Handle input
    if (this.isTouch) {
      targetX = this.touchX - this.paddle.width / 2;
    } else if (this.mouseX > 0) {
      targetX = this.mouseX - this.paddle.width / 2;
    } else {
      if (this.keys['ArrowLeft'] || this.keys['a']) {
        targetX -= this.config.paddle.speed * deltaTime;
      }
      if (this.keys['ArrowRight'] || this.keys['d']) {
        targetX += this.config.paddle.speed * deltaTime;
      }
    }
    
    // Clamp paddle position
    this.paddle.position.x = clamp(targetX, 0, this.config.canvas.width - this.paddle.width);
  }
  
  private updateBalls(deltaTime: number): void {
    this.balls = this.balls.filter(ball => {
      // Update position
      ball.position.x += ball.velocity.x * deltaTime;
      ball.position.y += ball.velocity.y * deltaTime;
      
      // Update trail
      ball.trail.push({ ...ball.position });
      if (ball.trail.length > this.config.ball.maxTrailLength) {
        ball.trail.shift();
      }
      
      // Wall collisions
      if (ball.position.x <= ball.radius || ball.position.x >= this.config.canvas.width - ball.radius) {
        ball.velocity.x *= -1;
        ball.position.x = clamp(ball.position.x, ball.radius, this.config.canvas.width - ball.radius);
      }
      
      if (ball.position.y <= ball.radius) {
        ball.velocity.y *= -1;
        ball.position.y = ball.radius;
      }
      
      // Bottom boundary (lose ball)
      if (ball.position.y > this.config.canvas.height + ball.radius) {
        return false;
      }
      
      // Paddle collision
      if (ballPaddleCollision(ball, this.paddle) && ball.velocity.y > 0) {
        ball.velocity = calculateBallPaddleReflection(ball, this.paddle);
        this.gameStats.combo = 0;
      }
      
      // Block collisions
      for (const block of this.blocks) {
        if (ballBlockCollision(ball, block)) {
          this.handleBlockCollision(ball, block);
        }
      }
      
      // Limit ball speed
      const speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
      if (speed > this.config.physics.maxBallSpeed) {
        ball.velocity.x = (ball.velocity.x / speed) * this.config.physics.maxBallSpeed;
        ball.velocity.y = (ball.velocity.y / speed) * this.config.physics.maxBallSpeed;
      }
      
      return true;
    });
    
    // Check if all balls lost
    if (this.balls.length === 0) {
      this.gameStats.lives--;
      this.gameStats.combo = 0;
      
      if (this.gameStats.lives <= 0) {
        this.gameOver();
      } else {
        // Wait a moment before launching new ball
        setTimeout(() => {
          if (this.gameState === GameState.PLAYING) {
            this.launchBall();
          }
        }, 1000);
      }
    }
  }
  
  private handleBlockCollision(ball: Ball, block: Block): void {
    if (block.destroyed) return;
    
    // Determine collision side and reflect ball
    const side = calculateBlockCollisionSide(ball, block);
    if (side === 'top' || side === 'bottom') {
      ball.velocity.y *= -1;
    } else {
      ball.velocity.x *= -1;
    }
    
    // Damage block
    block.health--;
    
    // Update combo and score
    this.gameStats.combo++;
    const comboMultiplier = Math.min(5, Math.floor(this.gameStats.combo / 3) + 1);
    this.gameStats.score += block.points * comboMultiplier;
    
    if (block.health <= 0) {
      block.destroyed = true;
      
      // Create particles
      const blockCenter = {
        x: block.position.x + block.width / 2,
        y: block.position.y + block.height / 2
      };
      
      const newParticles = createParticles(
        blockCenter,
        this.config.particles.count,
        block.color,
        this.config.particles.speed,
        this.config.particles.life
      );
      
      this.particles.push(...newParticles);
      
      // Chance to drop power-up
      if (Math.random() < block.powerUpChance) {
        this.createPowerUp(blockCenter);
      }
    } else {
      // Change color to indicate damage
      const alpha = block.health / block.maxHealth;
      const color = block.color;
      block.color = this.adjustColorAlpha(color, alpha);
    }
  }
  
  private adjustColorAlpha(color: string, alpha: number): string {
    // Simple alpha adjustment - in a real implementation, you'd parse hex colors properly
    const opacity = Math.floor(alpha * 255);
    return color + opacity.toString(16).padStart(2, '0');
  }
  
  private createPowerUp(position: Vector2D): void {
    const types = Object.values(PowerUpType);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerUpColors: Record<PowerUpType, string> = {
      [PowerUpType.MULTI_BALL]: '#FF6B6B',
      [PowerUpType.PADDLE_EXTEND]: '#4ECDC4',
      [PowerUpType.BALL_SLOW]: '#45B7D1',
      [PowerUpType.BONUS_POINTS]: '#FFEAA7'
    };
    
    const powerUp: PowerUp = {
      position: { ...position },
      velocity: { x: 0, y: this.config.powerUps.fallSpeed },
      type,
      size: this.config.powerUps.size,
      color: powerUpColors[type],
      active: true
    };
    
    this.powerUps.push(powerUp);
  }
  
  private updatePowerUps(deltaTime: number): void {
    this.powerUps = this.powerUps.filter(powerUp => {
      if (!powerUp.active) return false;
      
      // Update position
      powerUp.position.y += powerUp.velocity.y * deltaTime;
      
      // Remove if off screen
      if (powerUp.position.y > this.config.canvas.height + powerUp.size) {
        return false;
      }
      
      // Check paddle collision
      if (this.isPowerUpCollidingWithPaddle(powerUp)) {
        this.activatePowerUp(powerUp);
        return false;
      }
      
      return true;
    });
  }
  
  private isPowerUpCollidingWithPaddle(powerUp: PowerUp): boolean {
    return powerUp.position.x < this.paddle.position.x + this.paddle.width &&
           powerUp.position.x + powerUp.size > this.paddle.position.x &&
           powerUp.position.y < this.paddle.position.y + this.paddle.height &&
           powerUp.position.y + powerUp.size > this.paddle.position.y;
  }
  
  private activatePowerUp(powerUp: PowerUp): void {
    this.activePowerUps.set(powerUp.type, this.config.powerUps.duration);
    
    switch (powerUp.type) {
      case PowerUpType.MULTI_BALL:
        this.spawnExtraBalls();
        break;
      case PowerUpType.PADDLE_EXTEND:
        this.paddle.width = Math.min(this.config.paddle.maxWidth, this.paddle.width * 1.5);
        break;
      case PowerUpType.BALL_SLOW:
        this.balls.forEach(ball => {
          ball.velocity.x *= 0.7;
          ball.velocity.y *= 0.7;
        });
        break;
      case PowerUpType.BONUS_POINTS:
        this.gameStats.score += 500;
        break;
    }
    
    // Create pickup particles
    const pickupParticles = createParticles(
      powerUp.position,
      6,
      powerUp.color,
      150,
      600
    );
    this.particles.push(...pickupParticles);
  }
  
  private spawnExtraBalls(): void {
    if (this.balls.length === 0) return;
    
    const originalBall = this.balls[0];
    const numNewBalls = 2;
    
    for (let i = 0; i < numNewBalls; i++) {
      const angle = (Math.PI / 4) * (i + 1) * (Math.random() > 0.5 ? 1 : -1);
      const speed = Math.sqrt(originalBall.velocity.x ** 2 + originalBall.velocity.y ** 2);
      
      const newBall: Ball = {
        position: { ...originalBall.position },
        velocity: {
          x: Math.sin(angle) * speed,
          y: -Math.abs(Math.cos(angle)) * speed
        },
        radius: originalBall.radius,
        color: originalBall.color,
        trail: []
      };
      
      this.balls.push(newBall);
    }
  }
  
  private updateActivePowerUps(deltaTime: number): void {
    for (const [type, timeLeft] of this.activePowerUps.entries()) {
      const newTime = timeLeft - deltaTime * 1000;
      
      if (newTime <= 0) {
        this.deactivatePowerUp(type);
        this.activePowerUps.delete(type);
      } else {
        this.activePowerUps.set(type, newTime);
      }
    }
  }
  
  private deactivatePowerUp(type: PowerUpType): void {
    switch (type) {
      case PowerUpType.PADDLE_EXTEND:
        this.paddle.width = this.config.paddle.width;
        break;
      case PowerUpType.BALL_SLOW:
        this.balls.forEach(ball => {
          ball.velocity.x *= 1.43; // Reverse the 0.7 multiplier
          ball.velocity.y *= 1.43;
        });
        break;
    }
  }
  
  private updateParticles(deltaTime: number): void {
    this.particles = updateParticles(this.particles, deltaTime);
  }
  
  private checkGameState(): void {
    // Check for level completion
    const activeBlocks = this.blocks.filter(block => !block.destroyed);
    if (activeBlocks.length === 0) {
      this.gameState = GameState.LEVEL_COMPLETE;
      this.stop();
    }
    
    // Update high score
    if (this.gameStats.score > this.gameStats.highScore) {
      this.gameStats.highScore = this.gameStats.score;
      localStorage.setItem('blockBreakerHighScore', this.gameStats.highScore.toString());
    }
  }
  
  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;
    this.stop();
  }
  
  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.config.canvas.width, this.config.canvas.height);
    
    // Draw background gradient
    this.drawBackground();
    
    if (this.gameState === GameState.START_SCREEN) {
      this.renderStartScreen();
    } else if (this.gameState === GameState.GAME_OVER) {
      this.renderGameOverScreen();
    } else if (this.gameState === GameState.LEVEL_COMPLETE) {
      this.renderLevelCompleteScreen();
    } else if (this.gameState === GameState.PAUSED) {
      this.renderGame();
      this.renderPauseOverlay();
    } else {
      this.renderGame();
    }
    
    // Always render UI
    this.renderUI();
  }
  
  private drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.canvas.height);
    gradient.addColorStop(0, this.currentLevel.backgroundGradient[0]);
    gradient.addColorStop(1, this.currentLevel.backgroundGradient[1]);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
  }
  
  private renderGame(): void {
    // Render blocks
    this.blocks.forEach(block => {
      if (!block.destroyed) {
        this.ctx.fillStyle = block.color;
        this.ctx.fillRect(block.position.x, block.position.y, block.width, block.height);
        
        // Add border
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(block.position.x, block.position.y, block.width, block.height);
      }
    });
    
    // Render paddle
    this.ctx.fillStyle = this.paddle.color;
    this.ctx.fillRect(this.paddle.position.x, this.paddle.position.y, this.paddle.width, this.paddle.height);
    
    // Render balls
    this.balls.forEach(ball => {
      // Draw trail
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      ball.trail.forEach((point, index) => {
        if (index === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      });
      this.ctx.stroke();
      
      // Draw ball
      this.ctx.fillStyle = ball.color;
      this.ctx.beginPath();
      this.ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Render power-ups
    this.powerUps.forEach(powerUp => {
      this.ctx.fillStyle = powerUp.color;
      this.ctx.fillRect(powerUp.position.x, powerUp.position.y, powerUp.size, powerUp.size);
      
      // Add icon or text (simplified)
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      const iconText = powerUp.type.charAt(0).toUpperCase();
      this.ctx.fillText(iconText, powerUp.position.x + powerUp.size / 2, powerUp.position.y + powerUp.size / 2 + 4);
    });
    
    // Render particles
    this.particles.forEach(particle => {
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(particle.position.x, particle.position.y, particle.size, particle.size);
    });
    this.ctx.globalAlpha = 1;
  }
  
  private renderUI(): void {
    // Score
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '24px Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.gameStats.score}`, 10, 30);
    
    // Lives
    this.ctx.fillText(`Lives: ${this.gameStats.lives}`, 10, 60);
    
    // Level
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Level: ${this.gameStats.level}`, this.config.canvas.width - 10, 30);
    
    // High score
    this.ctx.fillText(`Best: ${this.gameStats.highScore}`, this.config.canvas.width - 10, 60);
    
    // Active power-ups
    let powerUpY = 90;
    for (const [type, timeLeft] of this.activePowerUps.entries()) {
      const secondsLeft = Math.ceil(timeLeft / 1000);
      this.ctx.font = '16px Arial';
      this.ctx.fillText(`${type}: ${secondsLeft}s`, this.config.canvas.width - 10, powerUpY);
      powerUpY += 25;
    }
  }
  
  private renderStartScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '48px Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('BLOCK BREAKER', this.config.canvas.width / 2, this.config.canvas.height / 2 - 50);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Click or Press SPACE to Start', this.config.canvas.width / 2, this.config.canvas.height / 2 + 20);
    
    this.ctx.font = '18px Arial';
    this.ctx.fillText('Use mouse or arrow keys to control paddle', this.config.canvas.width / 2, this.config.canvas.height / 2 + 60);
    this.ctx.fillText('Press ESC to pause', this.config.canvas.width / 2, this.config.canvas.height / 2 + 85);
  }
  
  private renderGameOverScreen(): void {
    this.renderGame();
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
    
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.font = '48px Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.config.canvas.width / 2, this.config.canvas.height / 2 - 50);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.gameStats.score}`, this.config.canvas.width / 2, this.config.canvas.height / 2);
    this.ctx.fillText(`High Score: ${this.gameStats.highScore}`, this.config.canvas.width / 2, this.config.canvas.height / 2 + 30);
    this.ctx.fillText('Click or Press SPACE to Restart', this.config.canvas.width / 2, this.config.canvas.height / 2 + 70);
  }
  
  private renderLevelCompleteScreen(): void {
    this.renderGame();
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
    
    this.ctx.fillStyle = '#4ECDC4';
    this.ctx.font = '48px Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('LEVEL COMPLETE!', this.config.canvas.width / 2, this.config.canvas.height / 2 - 50);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.gameStats.score}`, this.config.canvas.width / 2, this.config.canvas.height / 2);
    this.ctx.fillText('Press SPACE for Next Level', this.config.canvas.width / 2, this.config.canvas.height / 2 + 40);
  }
  
  private renderPauseOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '36px Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.config.canvas.width / 2, this.config.canvas.height / 2);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Press ESC to Resume', this.config.canvas.width / 2, this.config.canvas.height / 2 + 40);
  }
  
  public getGameState(): GameState {
    return this.gameState;
  }
  
  public getGameStats(): GameStats {
    return { ...this.gameStats };
  }
  
  public destroy(): void {
    this.stop();
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
    window.removeEventListener('resize', () => {});
  }
}
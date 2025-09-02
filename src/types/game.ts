export interface Vector2D {
  x: number;
  y: number;
}

export interface Ball {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  color: string;
  trail: Vector2D[];
}

export interface Paddle {
  position: Vector2D;
  width: number;
  height: number;
  velocity: number;
  color: string;
}

export interface Block {
  position: Vector2D;
  width: number;
  height: number;
  color: string;
  health: number;
  maxHealth: number;
  points: number;
  powerUpChance: number;
  destroyed: boolean;
}

export enum PowerUpType {
  MULTI_BALL = 'multiball',
  PADDLE_EXTEND = 'paddleExtend',
  BALL_SLOW = 'ballSlow',
  BONUS_POINTS = 'bonusPoints'
}

export interface PowerUp {
  position: Vector2D;
  velocity: Vector2D;
  type: PowerUpType;
  size: number;
  color: string;
  active: boolean;
  duration?: number;
}

export interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
}

export enum GameState {
  START_SCREEN = 'startScreen',
  PLAYING = 'playing',
  PAUSED = 'paused',
  LEVEL_COMPLETE = 'levelComplete',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory'
}

export interface GameStats {
  score: number;
  lives: number;
  level: number;
  combo: number;
  highScore: number;
}

export interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  ball: {
    radius: number;
    speed: number;
    maxTrailLength: number;
  };
  paddle: {
    width: number;
    height: number;
    speed: number;
    minWidth: number;
    maxWidth: number;
  };
  blocks: {
    rows: number;
    cols: number;
    width: number;
    height: number;
    padding: number;
    colors: string[];
  };
  physics: {
    friction: number;
    bounceDamping: number;
    maxBallSpeed: number;
  };
  powerUps: {
    fallSpeed: number;
    size: number;
    duration: number;
  };
  particles: {
    count: number;
    speed: number;
    life: number;
  };
}

export interface Level {
  id: number;
  name: string;
  blocks: Block[];
  ballSpeed: number;
  powerUpChance: number;
  backgroundGradient: string[];
}
import { Vector2D, Ball, Paddle, Block, Particle } from '@/types/game';

// Vector2D utility functions
export const createVector2D = (x: number, y: number): Vector2D => ({ x, y });

export const addVectors = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x + b.x,
  y: a.y + b.y
});

export const subtractVectors = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x - b.x,
  y: a.y - b.y
});

export const multiplyVector = (vector: Vector2D, scalar: number): Vector2D => ({
  x: vector.x * scalar,
  y: vector.y * scalar
});

export const normalizeVector = (vector: Vector2D): Vector2D => {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (magnitude === 0) return { x: 0, y: 0 };
  return { x: vector.x / magnitude, y: vector.y / magnitude };
};

export const getDistance = (a: Vector2D, b: Vector2D): number => {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
};

// Collision detection functions
export const ballPaddleCollision = (ball: Ball, paddle: Paddle): boolean => {
  const ballBottom = ball.position.y + ball.radius;
  const ballTop = ball.position.y - ball.radius;
  const ballLeft = ball.position.x - ball.radius;
  const ballRight = ball.position.x + ball.radius;
  
  const paddleTop = paddle.position.y;
  const paddleBottom = paddle.position.y + paddle.height;
  const paddleLeft = paddle.position.x;
  const paddleRight = paddle.position.x + paddle.width;
  
  return ballBottom >= paddleTop && 
         ballTop <= paddleBottom && 
         ballRight >= paddleLeft && 
         ballLeft <= paddleRight;
};

export const ballBlockCollision = (ball: Ball, block: Block): boolean => {
  if (block.destroyed) return false;
  
  const ballLeft = ball.position.x - ball.radius;
  const ballRight = ball.position.x + ball.radius;
  const ballTop = ball.position.y - ball.radius;
  const ballBottom = ball.position.y + ball.radius;
  
  const blockLeft = block.position.x;
  const blockRight = block.position.x + block.width;
  const blockTop = block.position.y;
  const blockBottom = block.position.y + block.height;
  
  return ballRight >= blockLeft && 
         ballLeft <= blockRight && 
         ballBottom >= blockTop && 
         ballTop <= blockBottom;
};

export const calculateBallPaddleReflection = (ball: Ball, paddle: Paddle): Vector2D => {
  // Calculate reflection angle based on where ball hits paddle
  const paddleCenter = paddle.position.x + paddle.width / 2;
  const hitPosition = (ball.position.x - paddleCenter) / (paddle.width / 2);
  
  // Normalize hit position between -1 and 1
  const normalizedHit = Math.max(-1, Math.min(1, hitPosition));
  
  // Calculate reflection angle (more extreme angles near edges)
  const angle = normalizedHit * Math.PI / 3; // Max 60 degrees
  const speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
  
  return {
    x: Math.sin(angle) * speed,
    y: -Math.abs(Math.cos(angle)) * speed // Always go up
  };
};

export const calculateBlockCollisionSide = (ball: Ball, block: Block): 'top' | 'bottom' | 'left' | 'right' => {
  const ballCenter = ball.position;
  const blockCenter = {
    x: block.position.x + block.width / 2,
    y: block.position.y + block.height / 2
  };
  
  const dx = ballCenter.x - blockCenter.x;
  const dy = ballCenter.y - blockCenter.y;
  
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  
  if (absDx / block.width > absDy / block.height) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'bottom' : 'top';
  }
};

// Particle system utilities
export const createParticles = (
  position: Vector2D, 
  count: number, 
  color: string, 
  speed: number = 100,
  life: number = 1000
): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const velocity = {
      x: Math.cos(angle) * (speed + Math.random() * speed),
      y: Math.sin(angle) * (speed + Math.random() * speed)
    };
    
    particles.push({
      position: { ...position },
      velocity,
      color,
      size: Math.random() * 4 + 2,
      life,
      maxLife: life,
      alpha: 1
    });
  }
  
  return particles;
};

export const updateParticles = (particles: Particle[], deltaTime: number): Particle[] => {
  return particles.filter(particle => {
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    particle.life -= deltaTime * 1000;
    particle.alpha = particle.life / particle.maxLife;
    particle.velocity.y += 200 * deltaTime; // Gravity
    
    return particle.life > 0;
  });
};

// Game utility functions
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const getRandomColor = (colors: string[]): string => {
  return colors[Math.floor(Math.random() * colors.length)];
};

// Canvas utility functions
export const drawCircle = (
  ctx: CanvasRenderingContext2D, 
  position: Vector2D, 
  radius: number, 
  color: string
): void => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
  ctx.fill();
};

export const drawRect = (
  ctx: CanvasRenderingContext2D, 
  position: Vector2D, 
  width: number, 
  height: number, 
  color: string,
  borderRadius: number = 0
): void => {
  ctx.fillStyle = color;
  
  if (borderRadius > 0) {
    ctx.beginPath();
    ctx.roundRect(position.x, position.y, width, height, borderRadius);
    ctx.fill();
  } else {
    ctx.fillRect(position.x, position.y, width, height);
  }
};

export const drawText = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  position: Vector2D, 
  fontSize: number, 
  color: string,
  align: CanvasTextAlign = 'center'
): void => {
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(text, position.x, position.y);
};
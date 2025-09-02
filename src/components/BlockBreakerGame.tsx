'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/lib/gameEngine';
import { GameState, GameStats } from '@/types/game';

interface BlockBreakerGameProps {
  className?: string;
}

export default function BlockBreakerGame({ className = '' }: BlockBreakerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    lives: 3,
    level: 1,
    combo: 0,
    highScore: 0
  });
  
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine
    gameEngineRef.current = new GameEngine(canvasRef.current);
    
    // Set up game state polling
    const pollGameState = () => {
      if (gameEngineRef.current) {
        setGameStats(gameEngineRef.current.getGameStats());
        setGameState(gameEngineRef.current.getGameState());
      }
    };
    
    const pollInterval = setInterval(pollGameState, 100);
    
    // Initial poll
    pollGameState();
    
    // Cleanup
    return () => {
      clearInterval(pollInterval);
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };
  
  const startGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.startGame();
    }
  };
  
  const getGameStateMessage = () => {
    switch (gameState) {
      case GameState.START_SCREEN:
        return {
          title: 'BLOCK BREAKER',
          subtitle: 'Click canvas or press SPACE to start',
          description: 'Use mouse or arrow keys to control paddle. Press ESC to pause.'
        };
      case GameState.PAUSED:
        return {
          title: 'PAUSED',
          subtitle: 'Press ESC to resume',
          description: ''
        };
      case GameState.GAME_OVER:
        return {
          title: 'GAME OVER',
          subtitle: `Final Score: ${gameStats.score}`,
          description: 'Click canvas or press SPACE to restart'
        };
      case GameState.LEVEL_COMPLETE:
        return {
          title: 'LEVEL COMPLETE!',
          subtitle: `Score: ${gameStats.score}`,
          description: 'Press SPACE for next level'
        };
      default:
        return null;
    }
  };
  
  const message = getGameStateMessage();

  return (
    <div 
      ref={containerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl ${className}`}
    >
      {/* Header with stats and controls */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-300">Score:</span>
            <span className="text-lg font-bold text-yellow-400">
              {gameStats.score.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-300">Lives:</span>
            <div className="flex space-x-1">
              {Array.from({ length: gameStats.lives }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-red-500 rounded-full"></div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-300">Level:</span>
            <span className="text-lg font-bold text-blue-400">{gameStats.level}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-gray-400">High Score</div>
            <div className="text-sm font-bold text-green-400">
              {gameStats.highScore.toLocaleString()}
            </div>
          </div>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '⤙' : '⤢'}
          </button>
        </div>
      </div>
      
      {/* Game canvas container */}
      <div className="relative w-full aspect-[4/3] bg-black">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Game state overlay */}
        {message && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="text-center text-white space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                {message.title}
              </h1>
              {message.subtitle && (
                <p className="text-xl md:text-2xl text-gray-300">{message.subtitle}</p>
              )}
              {message.description && (
                <p className="text-sm md:text-base text-gray-400 max-w-md mx-auto">
                  {message.description}
                </p>
              )}
              {gameState === GameState.START_SCREEN && (
                <button
                  onClick={startGame}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Game
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions footer */}
      <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400">
        <div className="flex flex-wrap items-center justify-center space-x-4 text-center">
          <span>🎮 Mouse/Arrow Keys: Move paddle</span>
          <span>🚀 Space: Launch ball</span>
          <span>⏸️ Escape: Pause</span>
          <span>📱 Touch friendly</span>
        </div>
      </div>
      
      {/* Hidden instructions for screen readers */}
      <div className="sr-only">
        <h2>Block Breaker Game Instructions</h2>
        <ul>
          <li>Use your mouse or arrow keys to move the paddle left and right</li>
          <li>Press the space bar to launch the ball</li>
          <li>Break all the blocks to complete each level</li>
          <li>Collect power-ups for special abilities</li>
          <li>Don't let the ball fall off the bottom of the screen</li>
          <li>Press Escape to pause the game at any time</li>
        </ul>
      </div>
    </div>
  );
}
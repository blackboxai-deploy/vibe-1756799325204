import BlockBreakerGame from '@/components/BlockBreakerGame';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4">
          Block Breaker
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Experience the classic arcade game with modern graphics, smooth gameplay, 
          and exciting power-ups. Break all the blocks and advance through challenging levels!
        </p>
      </div>
      
      {/* Game Container */}
      <div className="w-full max-w-4xl">
        <BlockBreakerGame className="w-full" />
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl w-full">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-700">
          <div className="text-3xl mb-3">🎮</div>
          <h3 className="text-lg font-semibold text-white mb-2">Classic Gameplay</h3>
          <p className="text-gray-400 text-sm">
            Familiar block-breaking action with smooth controls and responsive gameplay
          </p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-700">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="text-lg font-semibold text-white mb-2">Power-ups</h3>
          <p className="text-gray-400 text-sm">
            Collect special power-ups for multi-ball, extended paddle, and bonus points
          </p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-700">
          <div className="text-3xl mb-3">🏆</div>
          <h3 className="text-lg font-semibold text-white mb-2">Progressive Levels</h3>
          <p className="text-gray-400 text-sm">
            Advancing difficulty with unique block patterns and increasing challenge
          </p>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 max-w-4xl w-full border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">How to Play</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
          <div>
            <h3 className="font-semibold text-white mb-2">🎯 Objective</h3>
            <ul className="space-y-1 text-sm">
              <li>• Break all blocks to complete each level</li>
              <li>• Prevent the ball from falling off the bottom</li>
              <li>• Collect power-ups for special abilities</li>
              <li>• Achieve the highest score possible</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">🕹️ Controls</h3>
            <ul className="space-y-1 text-sm">
              <li>• <span className="font-mono bg-gray-700 px-1 rounded">Mouse</span> or <span className="font-mono bg-gray-700 px-1 rounded">Arrow Keys</span> Move paddle</li>
              <li>• <span className="font-mono bg-gray-700 px-1 rounded">Space</span> Launch ball / Start game</li>
              <li>• <span className="font-mono bg-gray-700 px-1 rounded">Escape</span> Pause game</li>
              <li>• <span className="font-mono bg-gray-700 px-1 rounded">Touch</span> Mobile-friendly controls</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Built with Next.js, TypeScript, and HTML5 Canvas • Responsive Design • Touch Friendly</p>
      </footer>
    </main>
  );
}
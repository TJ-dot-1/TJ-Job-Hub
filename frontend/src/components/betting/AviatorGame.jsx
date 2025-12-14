import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../utils/api';

const AviatorGame = () => {
  const [gameState, setGameState] = useState({
    roundId: null,
    status: 'waiting',
    multiplier: 1.0,
    totalBets: 0,
    totalPool: 0
  });
  const [betAmount, setBetAmount] = useState(0);
  const [autoCashout, setAutoCashout] = useState('');
  const [activeBets, setActiveBets] = useState([]);
  const [balance, setBalance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [planePosition, setPlanePosition] = useState({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      socketRef.current = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        path: '/socket.io/'
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to betting server');
        setIsConnected(true);
        socketRef.current.emit('join-betting', user.id);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from betting server');
        setIsConnected(false);
      });

      // Game events
      socketRef.current.on('game:start', (data) => {
        setGameState(prev => ({
          ...prev,
          roundId: data.roundId,
          status: 'flying',
          multiplier: 1.0
        }));
        setIsFlying(true);
        setIsCrashed(false);
        setCountdown(null);
        setPlanePosition({ x: 0, y: 0, scale: 1 });
        updatePlanePosition(1.0);
      });

      socketRef.current.on('multiplier:update', (data) => {
        setGameState(prev => ({
          ...prev,
          multiplier: data.multiplier
        }));
        updatePlanePosition(data.multiplier);
      });

      socketRef.current.on('game:crash', (data) => {
        setGameState(prev => ({
          ...prev,
          status: 'crashed',
          multiplier: data.crashPoint
        }));
        setIsFlying(false);
        setIsCrashed(true);
        setCountdown(5); // Start countdown for flying
        updatePlanePosition(data.crashPoint);
      });

      socketRef.current.on('bet:placed', (data) => {
        setGameState(prev => ({
          ...prev,
          totalBets: prev.totalBets + 1,
          totalPool: Number(prev.totalPool || 0) + Number(data.amount || 0)
        }));
      });

      socketRef.current.on('bet:cashout', () => {
        // Update balance and active bets
        fetchBalance();
        fetchActiveBets();
      });
    };

    initSocket();
    fetchCurrentRound();
    fetchBalance();
    fetchActiveBets();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
    }
  }, [countdown]);

  const fetchCurrentRound = async () => {
    try {
      const response = await api.get('/betting/current-round');
      if (response.data.success) {
        setGameState(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching current round:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await api.get('/wallet/balance');
      if (response.data.success) {
        setBalance(response.data.data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchActiveBets = async () => {
    try {
      const response = await api.get('/betting/active-bets');
      if (response.data.success) {
        setActiveBets(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching active bets:', error);
    }
  };

  const updatePlanePosition = (multiplier) => {
    const progress = multiplier - 1;
    const x = progress * 50; // Move right based on multiplier
    const y = progress * 50; // Move down
    const scale = 1 + progress * 0.02; // Scale slowly
    setPlanePosition({ x, y, scale });
  };

  const handlePlaceBet = async () => {
    if (betAmount < 10 || betAmount > balance) return;

    try {
      const response = await api.post('/betting/place-bet', {
        amount: betAmount,
        autoCashout: autoCashout ? parseFloat(autoCashout) : null
      });

      if (response.data.success) {
        setBalance(prev => prev - betAmount);
        fetchActiveBets();
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      alert(error.response?.data?.message || 'Failed to place bet');
    }
  };

  const handleCashout = async (betId) => {
    try {
      const response = await api.post(`/betting/cashout/${betId}`);
      if (response.data.success) {
        fetchBalance();
        fetchActiveBets();
      }
    } catch (error) {
      console.error('Error cashing out:', error);
      alert(error.response?.data?.message || 'Failed to cash out');
    }
  };


  const getMultiplierColor = () => {
    if (gameState.multiplier < 2) return 'text-green-400';
    if (gameState.multiplier < 5) return 'text-yellow-400';
    if (gameState.multiplier < 10) return 'text-orange-400';
    return 'text-red-400';
  };

  const PlaneIcon = () => (
    <div className="text-4xl">✈️</div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Aviator</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              Status: <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="text-lg font-semibold">
              Balance: {balance.toFixed(2)} KSH
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 h-96 relative overflow-hidden">
              {/* Sky background */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-500 filter blur-sm">
                {/* Clouds */}
                <div className="absolute top-10 left-10 w-16 h-8 bg-white rounded-full opacity-70 animate-pulse"></div>
                <div className="absolute top-20 right-20 w-20 h-10 bg-white rounded-full opacity-60 animate-bounce" style={{animationDuration: '3s'}}></div>
                <div className="absolute bottom-20 left-1/4 w-12 h-6 bg-white rounded-full opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/3 right-10 w-14 h-7 bg-white rounded-full opacity-65 animate-pulse" style={{animationDelay: '2s'}}></div>
              </div>

              {/* Plane */}
              {(isFlying || isCrashed) && (
                <div
                  className="absolute transition-all duration-200 ease-linear"
                  style={{
                    left: `${planePosition.x}%`,
                    bottom: `${100 - planePosition.y}%`,
                    transform: `scale(${planePosition.scale}) rotate(5deg)`
                  }}
                >
                  {isCrashed ? (
                    <div className="text-4xl">💥</div>
                  ) : (
                    <PlaneIcon />
                  )}
                </div>
              )}

              {/* Multiplier Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className={`text-6xl font-bold ${getMultiplierColor()}`}>
                  {gameState.multiplier.toFixed(2)}x
                </div>
                {gameState.status === 'crashed' && (
                  <div className="text-red-500 text-xl font-bold mt-2">
                    CRASHED!
                  </div>
                )}
                {countdown !== null && (
                  <div className="text-yellow-400 text-lg font-semibold mt-2">
                    Flying starts in {countdown} seconds
                  </div>
                )}
              </div>

              {/* Game Stats */}
              <div className="absolute bottom-4 left-4 text-sm text-gray-300">
                <div>Round: {gameState.roundId?.slice(-8) || 'Waiting...'}</div>
                <div>Bets: {gameState.totalBets}</div>
                <div>Pool: {Number(gameState.totalPool || 0).toFixed(2)} KSH</div>
              </div>
            </div>

            {/* Betting Panel */}
            <div className="bg-gray-800 rounded-lg p-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bet Amount</label>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    disabled={gameState.status === 'flying'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Auto Cashout</label>
                  <input
                    type="number"
                    min="1.1"
                    step="0.1"
                    placeholder="Optional"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    disabled={gameState.status === 'flying'}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handlePlaceBet}
                    disabled={gameState.status === 'flying' || betAmount > balance || betAmount < 10}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-md font-semibold"
                  >
                    Place Bet
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Bets */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Active Bets</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activeBets.length === 0 ? (
                <p className="text-gray-400">No active bets</p>
              ) : (
                activeBets.map((bet) => (
                  <div key={bet._id} className="bg-gray-700 rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{bet.amount.toFixed(2)} KSH</div>
                      <div className="text-sm text-gray-400">
                        Potential: {(bet.amount * gameState.multiplier).toFixed(2)} KSH
                      </div>
                    </div>
                      <button
                        onClick={() => handleCashout(bet._id)}
                        disabled={!isFlying}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded text-sm font-semibold"
                      >
                        Cash Out
                      </button>
                    </div>
                    {bet.cashOutMultiplier && (
                      <div className="text-xs text-gray-400 mt-1">
                        Auto: {bet.cashOutMultiplier}x
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AviatorGame;
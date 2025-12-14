import crypto from 'crypto';
import GameRound from '../models/GameRound.js';
import Bet from '../models/Bet.js';
import User from '../models/User.js';
import { getCrashPoint, getCrashTime, generateServerSeed } from '../utils/crashMath.js';

class GameEngine {
  constructor() {
    this.currentRound = null;
    this.gameInterval = null;
    this.multiplier = 1.0;
    this.isRunning = false;
    this.crashTime = 0;
    this.isCrashing = false;
  }

  // Generate a random server seed
  generateServerSeed() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate hash for provably fair
  generateHash(serverSeed, clientSeed = '', nonce = 0) {
    return crypto.createHash('sha256')
      .update(serverSeed + clientSeed + nonce)
      .digest('hex');
  }


  // Start a new game round
  async startNewRound() {
    if (this.isRunning) return;

    const serverSeed = generateServerSeed();
    const roundId = `round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hash = this.generateHash(serverSeed);
    const crashPoint = getCrashPoint(serverSeed);

    const gameRound = new GameRound({
      roundId,
      serverSeed,
      hash,
      crashPoint,
      status: 'waiting',
      totalBets: 0,
      totalPool: 0,
      startTime: null,
      endTime: null
    });

    await gameRound.save();
    this.currentRound = gameRound;
    this.multiplier = 1.0;
    this.isRunning = false;

    console.log(`New round started: ${roundId} with crash at ${crashPoint}x`);

    // Emit new round event
    if (global.io) {
      global.io.to('betting-room').emit('game:new_round', {
        roundId,
        status: 'waiting'
      });
    }

    // Auto-start flying after 5 seconds for betting
    setTimeout(() => {
      if (this.currentRound && this.currentRound.roundId === roundId) {
        console.log(`Starting flying phase for round ${roundId}`);
        this.startFlying();
      }
    }, 5000);

    return gameRound;
  }

  // Start the flying phase
  async startFlying() {
    if (!this.currentRound || this.isRunning) return;

    this.currentRound.status = 'flying';
    this.currentRound.startTime = new Date();

    await this.currentRound.save();

    this.isRunning = true;
    this.multiplier = 1.0;
    this.startTime = Date.now();
    this.crashTime = getCrashTime(this.currentRound.crashPoint);

    console.log(`Round ${this.currentRound.roundId} flying with crash at ${this.currentRound.crashPoint}x in ${this.crashTime}s`);

    // Emit game start event
    if (global.io) {
      global.io.to('betting-room').emit('game:start', {
        roundId: this.currentRound.roundId
      });
    }

    // Start multiplier updates
    this.gameInterval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000; // seconds

      this.multiplier = Math.exp(0.03 * elapsed);

      // Check for auto cashout (fire and forget)
      Bet.find({
        gameRound: this.currentRound._id,
        status: 'active',
        cashOutMultiplier: { $lte: this.multiplier }
      }).populate('user').then(autoCashoutBets => {
        for (const bet of autoCashoutBets) {
          this.cashOut(bet._id, bet.user._id).catch(error => {
            console.error(`Auto cashout failed for bet ${bet._id}:`, error.message);
          });
        }
      }).catch(error => {
        console.error('Error finding auto cashout bets:', error);
      });

      // Emit multiplier update
      if (global.io) {
        global.io.to('betting-room').emit('multiplier:update', {
          roundId: this.currentRound.roundId,
          multiplier: parseFloat(this.multiplier.toFixed(2))
        });
      }

      // Check for crash
      if (elapsed >= this.crashTime) {
        this.multiplier = this.currentRound.crashPoint;
        this.crashGame();
      }
    }, 100);
  }

  // Crash the game
  async crashGame() {
    if (!this.isRunning || this.isCrashing) return;

    this.isCrashing = true;
    clearInterval(this.gameInterval);

    this.currentRound.status = 'crashed';
    this.currentRound.endTime = new Date();
    await this.currentRound.save();

    console.log(`Round ${this.currentRound.roundId} crashed at ${this.multiplier.toFixed(2)}x`);

    this.isRunning = false;

    // Update remaining active bets to crashed
    await Bet.updateMany(
      { gameRound: this.currentRound._id, status: 'active' },
      { status: 'crashed' }
    );

    // Emit crash event
    if (global.io) {
      global.io.to('betting-room').emit('game:crash', {
        roundId: this.currentRound.roundId,
        crashPoint: parseFloat(this.multiplier.toFixed(2))
      });
    }

    // Start new round after delay
    setTimeout(() => {
      this.startNewRound();
    }, 0);

    this.isCrashing = false;
  }

  // Place a bet
  async placeBet(userId, amount, autoCashout = null) {
    if (!this.currentRound || (this.currentRound.status !== 'waiting' && this.currentRound.status !== 'flying')) {
      throw new Error('Cannot place bet: no active round');
    }

    // Don't allow betting after multiplier reaches 2x if game is flying
    if (this.currentRound.status === 'flying' && this.multiplier >= 2.0) {
      throw new Error('Cannot place bet: game already in progress (multiplier > 2x)');
    }

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Temporarily disabled for testing
    // if (user.bettingProfile.balance < amount) {
    //   throw new Error('Insufficient balance');
    // }

    // Check betting limits
    if (!user.bettingProfile.isBettingEnabled) {
      throw new Error('Betting is disabled for this account');
    }

    // Deduct from balance
    user.bettingProfile.balance -= amount;
    user.bettingProfile.totalBets += 1;
    user.bettingProfile.lastBet = new Date();
    await user.save();

    // Create bet
    const bet = new Bet({
      user: userId,
      gameRound: this.currentRound._id,
      amount,
      cashOutMultiplier: autoCashout,
      status: 'active',
      placedAt: new Date()
    });
    await bet.save();

    // Update round stats
    this.currentRound.totalBets += 1;
    this.currentRound.totalPool += amount;
    await this.currentRound.save();

    console.log(`Bet placed: ${amount} by ${user.name} on round ${this.currentRound.roundId}`);

    // Emit bet placed event
    if (global.io) {
      global.io.to('betting-room').emit('bet:placed', {
        roundId: this.currentRound.roundId,
        betId: bet._id,
        amount,
        user: {
          id: user._id,
          name: user.name
        },
        autoCashout
      });
    }

    return bet;
  }

  // Cash out a bet
  async cashOut(betId, userId) {
    const bet = await Bet.findById(betId).populate('user');
    if (!bet || bet.user._id.toString() !== userId) {
      throw new Error('Bet not found or unauthorized');
    }

    if (bet.status !== 'active') {
      throw new Error('Bet is not active');
    }

    if (!this.isRunning) {
      throw new Error('Game is not running');
    }

    const payout = bet.amount * this.multiplier;
    bet.status = 'cashed_out';
    bet.cashOutMultiplier = parseFloat(this.multiplier.toFixed(2));
    bet.payout = payout;
    bet.cashedOutAt = new Date();
    await bet.save();

    // Add to user balance
    const user = bet.user;
    user.bettingProfile.balance += payout;
    user.bettingProfile.totalWinnings += payout - bet.amount;
    user.bettingProfile.successfulCashouts += 1;
    await user.save();

    console.log(`Cashout: ${payout.toFixed(2)} for bet ${betId}`);

    // Emit cashout event
    if (global.io) {
      global.io.to('betting-room').emit('bet:cashout', {
        betId,
        payout: parseFloat(payout.toFixed(2)),
        multiplier: parseFloat(this.multiplier.toFixed(2)),
        user: {
          id: user._id,
          name: user.name
        }
      });
      
      // Also send to specific user
      global.io.to(`user-${userId}`).emit('bet:personal_cashout', {
        betId,
        payout: parseFloat(payout.toFixed(2)),
        multiplier: parseFloat(this.multiplier.toFixed(2)),
        profit: parseFloat((payout - bet.amount).toFixed(2))
      });
    }

    return bet;
  }

  // Get current game state
  getCurrentState() {
    return {
      roundId: this.currentRound?.roundId,
      status: this.currentRound?.status,
      multiplier: this.isRunning ? parseFloat(this.multiplier.toFixed(2)) : 1.0,
      totalBets: this.currentRound?.totalBets || 0,
      totalPool: this.currentRound?.totalPool || 0
    };
  }

  // Verify a round's fairness
  async verifyRound(roundId, clientSeed) {
    const round = await GameRound.findOne({ roundId });
    if (!round) throw new Error('Round not found');

    const crashPoint = getCrashPoint(round.serverSeed, clientSeed, 0);
    const hash = crypto.createHmac("sha256", round.serverSeed).update(`${clientSeed}:0`).digest("hex");

    return {
      roundId,
      serverSeed: round.serverSeed,
      clientSeed,
      hash,
      calculatedCrashPoint: crashPoint,
      actualCrashPoint: round.crashPoint,
      isFair: Math.abs(crashPoint - round.crashPoint) < 0.01
    };
  }

  // Force crash for testing
  async forceCrash() {
    if (this.isRunning && this.currentRound) {
      this.currentRound.crashPoint = parseFloat(this.multiplier.toFixed(2));
      await this.currentRound.save();
      this.crashGame();
    }
  }
}

// Singleton instance
const gameEngine = new GameEngine();

export default gameEngine;

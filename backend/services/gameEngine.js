import crypto from 'crypto';
import GameRound from '../models/GameRound.js';
import Bet from '../models/Bet.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { getCrashPoint, getCrashTime, generateServerSeed } from '../utils/crashMath.js';

class GameEngine {
  constructor() {
    this.currentRound = null;
    this.gameInterval = null;
    this.multiplier = 1.0;
    this.isRunning = false; // Is flying
    this.isCrashing = false;
    this.crashTime = 0;
    this.startTime = 0;
    
    // In-memory active bets for fast O(1) auto-cashout processing
    this.activeBets = new Map();
  }

  generateHash(serverSeed, clientSeed = '', nonce = 0) {
    return crypto.createHash('sha256')
      .update(serverSeed + clientSeed + nonce)
      .digest('hex');
  }

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
    this.isCrashing = false;
    this.activeBets.clear();

    console.log(`New round started: ${roundId} with crash at ${crashPoint}x`);

    if (global.io) {
      global.io.to('betting-room').emit('game:new_round', {
        roundId,
        status: 'waiting'
      });
    }

    setTimeout(() => {
      if (this.currentRound && this.currentRound.roundId === roundId) {
        this.startFlying();
      }
    }, 5000);

    return gameRound;
  }

  async startFlying() {
    if (!this.currentRound || this.isRunning || this.currentRound.status !== 'waiting') return;

    this.currentRound.status = 'flying';
    this.currentRound.startTime = new Date();
    await this.currentRound.save();

    this.isRunning = true;
    this.multiplier = 1.0;
    this.startTime = Date.now();
    this.crashTime = getCrashTime(this.currentRound.crashPoint);

    if (global.io) {
      global.io.to('betting-room').emit('game:start', {
        roundId: this.currentRound.roundId
      });
    }

    this.gameInterval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      
      // Fixed growth rate to match getCrashTime (0.06)
      this.multiplier = Math.exp(0.06 * elapsed);

      // Check auto cashout in memory
      for (const [betIdStr, betData] of this.activeBets.entries()) {
        if (betData.autoCashout && betData.autoCashout <= this.multiplier) {
          this.cashOut(betData.betId, betData.userId).catch(error => {
            console.error(`Auto cashout failed for bet ${betData.betId}:`, error.message);
          });
        }
      }

      if (global.io) {
        global.io.to('betting-room').emit('multiplier:update', {
          roundId: this.currentRound.roundId,
          multiplier: parseFloat(this.multiplier.toFixed(2))
        });
      }

      if (elapsed >= this.crashTime) {
        this.multiplier = this.currentRound.crashPoint;
        this.crashGame();
      }
    }, 100);
  }

  async crashGame() {
    if (!this.isRunning || this.isCrashing) return;
    this.isCrashing = true;
    clearInterval(this.gameInterval);

    this.currentRound.status = 'crashed';
    this.currentRound.endTime = new Date();
    await this.currentRound.save();

    console.log(`Round ${this.currentRound.roundId} crashed at ${this.multiplier.toFixed(2)}x`);

    this.isRunning = false;
    this.activeBets.clear();

    await Bet.updateMany(
      { gameRound: this.currentRound._id, status: 'active' },
      { status: 'crashed' }
    );

    if (global.io) {
      global.io.to('betting-room').emit('game:crash', {
        roundId: this.currentRound.roundId,
        crashPoint: parseFloat(this.multiplier.toFixed(2))
      });
    }

    setTimeout(() => {
      this.startNewRound();
    }, 2000); // 2 second delay before next waiting state
    
    this.isCrashing = false;
  }

  async placeBet(userId, amount, autoCashout = null) {
    if (!this.currentRound || this.currentRound.status !== 'waiting') {
      throw new Error('Cannot place bet: game already in progress');
    }

    // Atomic deduction and lock
    const user = await User.findOneAndUpdate(
      { 
        _id: userId, 
        'bettingProfile.isBettingEnabled': true,
        'bettingProfile.balance': { $gte: amount }
      },
      { 
        $inc: { 
          'bettingProfile.balance': -amount, 
          'bettingProfile.totalBets': 1 
        },
        $set: { 'bettingProfile.lastBet': new Date() }
      },
      { new: true }
    );

    if (!user) {
      throw new Error('Insufficient balance or betting disabled');
    }

    const bet = new Bet({
      user: userId,
      gameRound: this.currentRound._id,
      amount,
      cashOutMultiplier: autoCashout,
      status: 'active',
      placedAt: new Date()
    });
    await bet.save();

    const transaction = new Transaction({
      user: userId,
      type: 'bet',
      amount,
      gameRound: this.currentRound._id,
      bet: bet._id,
      status: 'completed',
      transactionId: `bet_${bet._id}`
    });
    await transaction.save();

    this.currentRound.totalBets += 1;
    this.currentRound.totalPool += amount;
    await this.currentRound.save();

    this.activeBets.set(bet._id.toString(), {
      userId: userId.toString(),
      betId: bet._id.toString(),
      autoCashout: autoCashout ? parseFloat(autoCashout) : null
    });

    if (global.io) {
      global.io.to('betting-room').emit('bet:placed', {
        roundId: this.currentRound.roundId,
        betId: bet._id,
        amount,
        user: { id: user._id, name: user.name },
        autoCashout
      });
    }

    return bet;
  }

  async cashOut(betId, userId) {
    if (!this.isRunning) {
      throw new Error('Game is not running');
    }

    const currentMult = parseFloat(this.multiplier.toFixed(2));

    // Atomically find and mark as cashed out to prevent race conditions
    const bet = await Bet.findOneAndUpdate(
      { _id: betId, user: userId, status: 'active' },
      { status: 'cashed_out', cashedOutAt: new Date() },
      { new: true } // Returns the updated document
    ).populate('user');

    if (!bet) {
      throw new Error('Bet not active, unauthorized, or already cashed out');
    }
    
    // We update multiplier and payout after to use atomic lock above safely
    const finalPayout = bet.amount * currentMult;
    bet.cashOutMultiplier = currentMult;
    bet.payout = finalPayout;
    await bet.save();

    // Safely increment user balance
    const user = await User.findByIdAndUpdate(userId, {
      $inc: {
        'bettingProfile.balance': finalPayout,
        'bettingProfile.totalWinnings': finalPayout - bet.amount,
        'bettingProfile.successfulCashouts': 1
      }
    }, { new: true });

    const transaction = new Transaction({
      user: userId,
      type: 'payout',
      amount: finalPayout,
      gameRound: bet.gameRound,
      bet: bet._id,
      status: 'completed',
      transactionId: `payout_${bet._id}`
    });
    await transaction.save();

    this.activeBets.delete(bet._id.toString());

    if (global.io) {
      global.io.to('betting-room').emit('bet:cashout', {
        betId,
        payout: parseFloat(finalPayout.toFixed(2)),
        multiplier: currentMult,
        user: { id: user._id, name: user.name }
      });
      
      global.io.to(`user-${userId}`).emit('bet:personal_cashout', {
        betId,
        payout: parseFloat(finalPayout.toFixed(2)),
        multiplier: currentMult,
        profit: parseFloat((finalPayout - bet.amount).toFixed(2))
      });
    }

    return bet;
  }

  getCurrentState() {
    return {
      roundId: this.currentRound?.roundId,
      status: this.currentRound?.status,
      multiplier: this.isRunning ? parseFloat(this.multiplier.toFixed(2)) : 1.0,
      totalBets: this.currentRound?.totalBets || 0,
      totalPool: this.currentRound?.totalPool || 0
    };
  }

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

  async forceCrash() {
    if (this.isRunning && this.currentRound) {
      this.currentRound.crashPoint = parseFloat(this.multiplier.toFixed(2));
      await this.currentRound.save();
      this.crashGame();
    }
  }
}

const gameEngine = new GameEngine();
export default gameEngine;

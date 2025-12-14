import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameRound: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameRound',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.1
  },
  multiplier: {
    type: Number,
    default: 1
  },
  cashOutMultiplier: {
    type: Number
  },
  payout: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'cashed_out', 'crashed'],
    default: 'active'
  },
  placedAt: {
    type: Date,
    default: Date.now
  },
  cashedOutAt: {
    type: Date
  }
});

// Indexes
betSchema.index({ user: 1, placedAt: -1 });
betSchema.index({ gameRound: 1 });
betSchema.index({ status: 1 });

export default mongoose.model('Bet', betSchema);
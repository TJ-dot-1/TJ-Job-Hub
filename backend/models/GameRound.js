import mongoose from 'mongoose';

const gameRoundSchema = new mongoose.Schema({
  roundId: {
    type: String,
    unique: true,
    required: true
  },
  serverSeed: {
    type: String,
    required: true
  },
  clientSeed: {
    type: String
  },
  nonce: {
    type: Number,
    default: 0
  },
  hash: {
    type: String,
    required: true
  },
  crashPoint: {
    type: Number
  },
  status: {
    type: String,
    enum: ['waiting', 'flying', 'crashed'],
    default: 'waiting'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  totalBets: {
    type: Number,
    default: 0
  },
  totalPool: {
    type: Number,
    default: 0
  }
});

// Indexes
gameRoundSchema.index({ roundId: 1 });
gameRoundSchema.index({ status: 1 });
gameRoundSchema.index({ startTime: -1 });

export default mongoose.model('GameRound', gameRoundSchema);
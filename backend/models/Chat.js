import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'file', 'interview_invite', 'offer'],
    default: 'text'
  },
  file: {
    url: String,
    name: String,
    size: Number,
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'archived', 'closed'],
    default: 'active'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ job: 1 });
chatSchema.index({ application: 1 });
chatSchema.index({ updatedAt: -1 });

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  this.participants.forEach(participant => {
    if (participant.user.toString() === userId.toString()) {
      participant.lastRead = new Date();
    }
  });

  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString() && !message.read) {
      message.read = true;
      message.readAt = new Date();
    }
  });

  return this.save();
};

// Static method to find or create chat
chatSchema.statics.findOrCreate = async function(participantIds, jobId = null) {
  let chat = await this.findOne({
    'participants.user': { $all: participantIds },
    ...(jobId && { job: jobId })
  }).populate('participants.user', 'name profile.avatar role');

  if (!chat) {
    chat = new this({
      participants: participantIds.map(id => ({ user: id })),
      job: jobId
    });
    await chat.save();
    chat = await this.findById(chat._id).populate('participants.user', 'name profile.avatar role');
  }

  return chat;
};

export default mongoose.model('Chat', chatSchema);
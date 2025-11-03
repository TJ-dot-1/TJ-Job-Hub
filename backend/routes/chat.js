import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

const router = express.Router();

// Get user's chats
router.get('/', verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find({
      'participants.user': req.user.id
    })
    .populate('participants.user', 'name profile.avatar role company.name')
    .populate('job', 'title company')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chats'
    });
  }
});

// Get specific chat
router.get('/:chatId', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants.user', 'name profile.avatar role company.name')
      .populate('job', 'title company')
      .populate('application');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat'
    });
  }
});

// Send message
router.post('/:chatId/messages', verifyToken, async (req, res) => {
  try {
    const { content, type = 'text', file } = req.body;

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const message = {
      sender: req.user.id,
      content,
      type,
      file
    };

    chat.messages.push(message);
    chat.lastMessage = chat.messages[chat.messages.length - 1]._id;
    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants.user', 'name profile.avatar role')
      .populate('messages.sender', 'name profile.avatar role');

    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

    // Emit real-time message (if using Socket.io)
    if (req.app.get('io')) {
      req.app.get('io').to(chat._id.toString()).emit('new-message', {
        chatId: chat._id,
        message: newMessage
      });
    }

    res.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// Mark messages as read
router.put('/:chatId/read', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    await chat.markAsRead(req.user.id);

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
});

// Start new chat
router.post('/', verifyToken, async (req, res) => {
  try {
    const { participantIds, jobId, applicationId } = req.body;

    // Add current user to participants
    const allParticipants = [...new Set([req.user.id, ...participantIds])];

    if (allParticipants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two participants are required'
      });
    }

    const chat = await Chat.findOrCreate(allParticipants, jobId);

    if (applicationId) {
      chat.application = applicationId;
      await chat.save();
    }

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat'
    });
  }
});

export default router;
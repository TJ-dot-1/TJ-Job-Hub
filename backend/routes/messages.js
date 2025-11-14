import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Send a message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { recipientId, jobId, message, subject } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and message are required'
      });
    }

    // Create the message
    const newMessage = new Message({
      sender: req.user._id,
      recipient: recipientId,
      job: jobId,
      subject: subject || 'Message from employer',
      content: message,
      messageType: 'direct'
    });

    await newMessage.save();

    // Populate sender and recipient info
    await newMessage.populate('sender', 'name email');
    await newMessage.populate('recipient', 'name email');
    await newMessage.populate('job', 'title');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// Get messages for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type = 'all' } = req.query;

    let query = {
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    };

    if (type === 'sent') {
      query = { sender: req.user._id };
    } else if (type === 'received') {
      query = { recipient: req.user._id };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// Get conversation between two users for a specific job
router.get('/conversation/:userId/:jobId', verifyToken, async (req, res) => {
  try {
    const { userId, jobId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId, job: jobId },
        { sender: userId, recipient: req.user._id, job: jobId }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .populate('job', 'title')
    .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation'
    });
  }
});

// Mark message as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    message.isRead = true;
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read'
    });
  }
});

// Delete message
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or recipient
    if (message.sender.toString() !== req.user._id.toString() &&
        message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message'
    });
  }
});

export default router;
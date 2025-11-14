import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import imagekit from '../config/imagekit.js';

const router = express.Router();

// Get profile for logged in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      profile: user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      title,
      bio,
      website,
      linkedin,
      github,
      twitter,
      skills,
      preferredJobTypes,
      availability,
      salaryExpectation
    } = req.body;

    // Validate required fields
    if (!name || !title) {
      return res.status(400).json({
        success: false,
        message: 'Name and title are required'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(name && { name }),
        ...(email && { email }),
        'profile.headline': title,
        'profile.location': location,
        'profile.phone': phone,
        'profile.bio': bio,
        'profile.website': website,
        'profile.socialLinks': {
          linkedin,
          github,
          twitter
        },
        'profile.skills': skills?.map(skill => ({
          name: skill.name,
          level: skill.level || 'intermediate',
          verified: false
        })),
        'profile.preferredJobTypes': preferredJobTypes,
        'profile.availability': availability,
        'profile.salaryExpectation': salaryExpectation,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      profile: user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload avatar
router.post('/avatar', verifyToken, multer().single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File received:', {
      mimetype: req.file.mimetype,
      size: req.file.size,
      originalname: req.file.originalname
    });

    // Validate image file
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // Validate file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size must be less than 5MB' });
    }

    const base64Image = req.file.buffer.toString('base64');
    console.log('Attempting ImageKit upload with length:', base64Image.length);

    // Upload to ImageKit with optimization
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `avatar-${Date.now()}`,
      folder: '/avatars',
      useUniqueFileName: true,
      extensions: [
        {
          name: "google-auto-tagging",
          maxTags: 5,
          minConfidence: 95
        }
      ]
    });

    if (!uploadResponse.url) {
      throw new Error('Failed to upload image to ImageKit');
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        'profile.avatar': uploadResponse.url,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({ 
      success: true,
      avatar: user.profile.avatar
    });
  } catch (error) {
    console.error('Avatar upload error:', {
      message: error.message,
      stack: error.stack,
      details: error.response?.data || error
    });
    
    if (error.response?.data) {
      return res.status(400).json({
        message: 'Image upload failed',
        details: error.response.data
      });
    }
    
    res.status(500).json({
      message: 'Server error during image upload',
      details: error.message
    });
  }
});

// Upload resume
router.post('/resume', verifyToken, multer().single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload original file to ImageKit
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `resume-${Date.now()}`,
      folder: '/resumes',
      useUniqueFileName: true
    });

    // Generate preview image for the resume (skip for now - PDF previews not supported)
    // const previewResponse = await imagekit.upload({
    //   file: req.file.buffer.toString('base64'),
    //   fileName: `resume-preview-${Date.now()}`,
    //   folder: '/resumes/previews',
    //   useUniqueFileName: true
    // });

    const previewResponse = { url: null }; // Placeholder for now

    if (!uploadResponse.url) {
      throw new Error('Failed to upload to ImageKit');
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        'profile.resume': uploadResponse.url,
        'profile.resumePreview': previewResponse.url,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      resume: user.profile.resume,
      resumePreview: user.profile.resumePreview || null
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user stats for dashboard
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        applicationsSent: user.stats.applicationsSent || 0,
        interviewsScheduled: user.stats.totalApplications || 0, // Using totalApplications as proxy for interviews
        profileViews: user.stats.profileViews || 0,
        profileCompleteness: user.stats.profileCompleteness || 0
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get public profile (for employers viewing applicants)
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name profile.headline profile.avatar profile.bio profile.location profile.socialLinks profile.skills -_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      profile: user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete resume
router.delete('/resume', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        'profile.resume': null,
        'profile.resumePreview': null,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Resume deletion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
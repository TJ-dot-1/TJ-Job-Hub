import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();


// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['job_seeker', 'employer', 'admin']).withMessage('Role must be either job_seeker, employer, or admin')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, companyName, adminCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate admin code if role is admin
    if (role === 'admin') {
      if (!adminCode || adminCode !== 'Josiah001') {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin code. Admin registration is restricted.'
        });
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Don't hash here - let the model middleware handle it
      role,
      ...(role === 'employer' && {
        company: {
          name: companyName || 'My Company',
          description: 'A growing company looking for talent',
          industry: 'Technology',
          size: '1-10 employees'
        }
      }),
      profile: {
        headline: role === 'employer' ? 'Recruiter' : 'Job Seeker',
        bio: role === 'employer'
          ? 'Hiring manager looking for great talent'
          : 'Skilled professional seeking new opportunities',
        skills: role === 'employer'
          ? [{ name: 'Recruitment', level: 'expert' }, { name: 'HR', level: 'advanced' }]
          : [{ name: 'JavaScript', level: 'advanced' }, { name: 'React', level: 'intermediate' }],
        experience: [],
        education: []
      },
      isVerified: true,
      isActive: true,
      lastLogin: new Date()
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      company: user.company,
      stats: user.stats,
      isVerified: user.isVerified
    };

    // Update user stats
    user.stats.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Enhanced Login endpoint with role validation
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, role } = req.body;


    // Regular user login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Validate role if provided and not empty
    if (role && role.trim() !== '' && user.role !== role) {
      return res.status(400).json({
        success: false,
        message: `This email is registered as a ${user.role}, not ${role}`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user.stats.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      company: user.company,
      stats: user.stats,
      isVerified: user.isVerified
    };

    res.json({
      success: true,
      message: `Login successful! Welcome back ${user.name}`,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      company: user.company,
      stats: user.stats,
      isVerified: user.isVerified,
      preferences: user.preferences
    };

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check email availability
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    res.json({
      success: true,
      available: !existingUser,
      exists: !!existingUser,
      ...(existingUser && { role: existingUser.role })
    });

  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email availability'
    });
  }
});

// Forgot password (placeholder)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Save it to the user document with expiry
    // 3. Send email with reset link
    
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request'
    });
  }
});

// Reset password (placeholder)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // In a real application, you would:
    // 1. Verify the reset token
    // 2. Check if it's expired
    // 3. Update the user's password
    // 4. Invalidate the used token
    
    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, profile, company } = req.body;

    // Update fields
    if (name) user.name = name;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (company && user.role === 'employer') {
      user.company = { ...user.company, ...company };
    }

    // Recalculate profile completeness
    user.calculateProfileCompleteness();

    await user.save();

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      company: user.company,
      stats: user.stats,
      isVerified: user.isVerified
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

export default router;
import express from 'express';
import multer from 'multer';
import CvRequest from '../models/CvRequest.js';
import { uploadToImageKit } from '../utils/imageKit.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
  }
});

// POST /api/cv-revamp - Submit CV revamp request
router.post('/', upload.single('cv'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      jobRole,
      industry,
      serviceType,
      message,
      package: packageType = 'basic'
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !jobRole || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate service type
    if (!['revamp', 'new'].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service type'
      });
    }

    // Validate package
    if (!['basic', 'professional', 'executive'].includes(packageType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package type'
      });
    }

    // Check if CV file is required for revamp service
    if (serviceType === 'revamp' && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'CV file is required for revamp service'
      });
    }

    let cvFile = null;

    // Upload CV file to ImageKit if provided
    if (req.file) {
      try {
        const uploadResult = await uploadToImageKit(req.file.buffer, req.file.originalname, 'cv-requests');
        cvFile = {
          url: uploadResult.url,
          fileId: uploadResult.fileId,
          fileName: req.file.originalname
        };
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload CV file'
        });
      }
    }

    // Create CV request
    const cvRequest = new CvRequest({
      fullName,
      email,
      phone,
      jobRole,
      industry,
      serviceType,
      message,
      package: packageType,
      cvFile
    });

    await cvRequest.save();

    // Prepare WhatsApp message
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '+1234567890';
    const packagePrices = {
      basic: 100,
      professional: 300,
      executive: 500
    };

    const whatsappMessage = `Hi! I'm ${fullName}. I'd like to request a CV ${serviceType === 'revamp' ? 'revamp' : 'creation'} service.

Details:
- Name: ${fullName}
- Email: ${email}
- Phone: ${phone}
- Job Role: ${jobRole}
${industry ? `- Industry: ${industry}` : ''}
- Service: ${serviceType === 'revamp' ? 'CV Revamp' : 'New CV Creation'}
- Package: ${packageType.charAt(0).toUpperCase() + packageType.slice(1)} (${packagePrices[packageType]})
${message ? `- Message: ${message}` : ''}
${cvFile ? `- CV File: ${cvFile.url}` : ''}

Please let me know the next steps. Thank you!`;

    res.json({
      success: true,
      message: 'CV request submitted successfully',
      whatsappNumber,
      whatsappMessage: encodeURIComponent(whatsappMessage),
      requestId: cvRequest._id
    });

  } catch (error) {
    console.error('CV request submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit CV request'
    });
  }
});

// GET /api/cv-revamp/admin - Get all CV requests (Admin only)
router.get('/admin', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      serviceType,
      package: packageFilter,
      sortBy = '-createdAt'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    if (packageFilter) filter.package = packageFilter;

    const cvRequests = await CvRequest.find(filter)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CvRequest.countDocuments(filter);

    res.json({
      success: true,
      data: {
        requests: cvRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('CV requests fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CV requests'
    });
  }
});

// PUT /api/cv-revamp/admin/:id - Update CV request status (Admin only)
router.put('/admin/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const cvRequest = await CvRequest.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!cvRequest) {
      return res.status(404).json({
        success: false,
        message: 'CV request not found'
      });
    }

    res.json({
      success: true,
      message: 'CV request updated successfully',
      request: cvRequest
    });
  } catch (error) {
    console.error('CV request update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update CV request'
    });
  }
});

// DELETE /api/cv-revamp/admin/:id - Delete CV request (Admin only)
router.delete('/admin/:id', async (req, res) => {
  try {
    const cvRequest = await CvRequest.findByIdAndDelete(req.params.id);

    if (!cvRequest) {
      return res.status(404).json({
        success: false,
        message: 'CV request not found'
      });
    }

    res.json({
      success: true,
      message: 'CV request deleted successfully'
    });
  } catch (error) {
    console.error('CV request delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete CV request'
    });
  }
});

export default router;
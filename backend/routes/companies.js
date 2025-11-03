// routes/companies.js
import express from 'express';
import Company from '../models/Company.js';
import Job from '../models/Job.js';

const router = express.Router();

// GET /api/companies - Get all companies
router.get('/', async (req, res) => {
  try {
    const { industry, location, size, search } = req.query;

    let query = {};

    if (industry && industry !== 'All Industries') {
      query.industry = industry;
    }

    if (location && location !== 'All Locations') {
      query.headquarters = { $regex: location, $options: 'i' };
    }

    if (size && size !== 'All Sizes') {
      query.size = size;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    const companies = await Company.find(query)
      .sort('-createdAt')
      .limit(50);

    // Get job counts for each company
    const companiesWithJobCounts = await Promise.all(
      companies.map(async (company) => {
        const jobCount = await Job.countDocuments({
          company: company._id,
          status: 'active',
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
          ]
        });

        return {
          ...company.toObject(),
          jobCount,
          rating: 4.0 + Math.random() * 1.0 // Mock rating for now
        };
      })
    );

    res.json({
      success: true,
      data: companiesWithJobCounts
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies'
    });
  }
});

// GET /api/companies/:id - Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company'
    });
  }
});

// GET /api/jobs/company/:companyId - Get jobs by company
router.get('/company/:companyId', async (req, res) => {
  try {
    const jobs = await Job.find({
      company: req.params.companyId,
      status: 'active',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .populate('company', 'name logo')
    .sort('-postedAt');

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company jobs'
    });
  }
});

export default router;
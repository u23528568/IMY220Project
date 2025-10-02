const express = require('express');
const jwt = require('jsonwebtoken');
const Checkin = require('../models/Checkin');
const Project = require('../models/Project');
const User = require('../models/User');
const multer = require('multer');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'repofox-secret-key-2024';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Check INTO a project (start working on it)
router.post('/:projectId/check-in', auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if already checked out by someone else
    if (project.isCheckedOut && project.checkedOutBy.toString() !== req.userId) {
      const checkedOutUser = await User.findById(project.checkedOutBy);
      return res.status(400).json({ 
        error: `Project is already checked out by ${checkedOutUser.username}` 
      });
    }

    // Check into the project
    project.isCheckedOut = true;
    project.checkedOutBy = req.userId;
    project.checkedOutAt = new Date();
    // Initialize session changes tracking
    project.sessionChanges = {
      added: [],
      modified: [],
      deleted: []
    };
    await project.save();

    await project.populate('checkedOutBy', 'username profile.name');
    
    res.json({
      message: 'Successfully checked into project',
      project: {
        _id: project._id,
        name: project.name,
        isCheckedOut: project.isCheckedOut,
        checkedOutBy: project.checkedOutBy,
        checkedOutAt: project.checkedOutAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check OUT of project (save your work and create a checkin record)
router.post('/:projectId/check-out', auth, upload.array('files'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify user is checked into this project
    if (!project.isCheckedOut || project.checkedOutBy.toString() !== req.userId) {
      return res.status(400).json({ 
        error: 'You must check into the project before checking out' 
      });
    }

    // Require a message for checkout
    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        error: 'A message describing your work is required for checkout' 
      });
    }

    // Calculate time spent working
    const timeSpent = new Date() - new Date(project.checkedOutAt);
    const hoursSpent = Math.round(timeSpent / (1000 * 60 * 60) * 100) / 100; // Round to 2 decimals

    // Get latest version
    const latestCheckin = await Checkin.findOne({ project: projectId })
      .sort({ version: -1 });
    
    const version = latestCheckin ? latestCheckin.version + 1 : 1;

    // Create checkin record
    const checkin = new Checkin({
      project: projectId,
      user: req.userId,
      message: message.trim(),
      version,
      files: req.files ? req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/${file.filename}`,
        size: file.size
      })) : [],
      changes: project.sessionChanges || { added: [], modified: [], deleted: [] },
      checkedInAt: project.checkedOutAt,
      checkedOutAt: new Date(),
      timeSpent: hoursSpent
    });

    await checkin.save();

    // Update project - clear checkout status and session changes
    project.isCheckedOut = false;
    project.checkedOutBy = null;
    project.checkedOutAt = null;
    project.sessionChanges = { added: [], modified: [], deleted: [] }; // Clear session changes
    project.updatedAt = new Date();
    await project.save();

    await checkin.populate('user', 'username profile.name');
    
    res.status(201).json({
      message: 'Successfully checked out of project',
      checkin: checkin,
      timeSpent: `${hoursSpent} hours`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy route - keep for backward compatibility
router.post('/:projectId/checkin', auth, upload.array('files'), async (req, res) => {
  // Redirect to the new check-out route
  return router.handle({ 
    ...req, 
    url: req.url.replace('/checkin', '/check-out'),
    route: { path: '/:projectId/check-out' }
  }, res);
});

// Get project checkins
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const checkins = await Checkin.find({ project: projectId })
      .populate('user', 'username profile.name')
      .sort({ version: -1 });

    res.json(checkins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search check-in messages
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const checkins = await Checkin.find({
      message: searchRegex
    })
    .populate('user', 'username profile.name profile.avatar')
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(checkins);
  } catch (error) {
    console.error('Checkin search error:', error);
    res.status(500).json({ error: 'Failed to search check-in messages' });
  }
});

// Test route: Get ALL checkins (for testing/verification purposes)
router.get('/test/all', async (req, res) => {
  try {
    const checkins = await Checkin.find({})
      .populate('user', 'username profile.name')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json({
      total: checkins.length,
      checkins: checkins
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
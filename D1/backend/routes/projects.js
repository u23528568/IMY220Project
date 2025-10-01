const express = require('express');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const Checkin = require('../models/Checkin');
const multer = require('multer');
const path = require('path');

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

// Create project
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, type, hashtags } = req.body;
    
    const project = new Project({
      name,
      description,
      type: type || 'public',
      hashtags: hashtags ? hashtags.split(',') : [],
      owner: req.userId,
      members: [{
        user: req.userId,
        role: 'admin'
      }],
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });

    await project.save();
    await project.populate('owner', 'username profile.name');
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId },
        { type: 'public' }
      ]
    })
    .populate('owner', 'username profile.name')
    .populate('members.user', 'username profile.name')
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username profile.name')
      .populate('members.user', 'username profile.name')
      .populate('checkedOutBy', 'username profile.name');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
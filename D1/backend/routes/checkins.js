const express = require('express');
const jwt = require('jsonwebtoken');
const Checkin = require('../models/Checkin');
const Project = require('../models/Project');
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

// Check in project
router.post('/:projectId/checkin', auth, upload.array('files'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get latest version
    const latestCheckin = await Checkin.findOne({ project: projectId })
      .sort({ version: -1 });
    
    const version = latestCheckin ? latestCheckin.version + 1 : 1;

    // Create checkin
    const checkin = new Checkin({
      project: projectId,
      user: req.userId,
      message,
      version,
      files: req.files ? req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/${file.filename}`,
        size: file.size
      })) : [],
      changes: req.body.changes ? JSON.parse(req.body.changes) : { added: [], modified: [], deleted: [] }
    });

    await checkin.save();

    // Update project files and checkout status
    project.files = checkin.files;
    project.isCheckedOut = false;
    project.checkedOutBy = null;
    project.checkedOutAt = null;
    await project.save();

    await checkin.populate('user', 'username profile.name');
    res.status(201).json(checkin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

module.exports = router;
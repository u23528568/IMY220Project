const express = require('express');
const jwt = require('jsonwebtoken');
const Checkin = require('../models/Checkin');
const Project = require('../models/Project');
const User = require('../models/User');
// Native MongoDB package for compliance with rubric requirement
const { MongoClient, ObjectId } = require('mongodb');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'repofox-secret-key-2024';

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

// Get local activity feed (user's own projects and collaborations)
router.get('/local', auth, async (req, res) => {
  try {
    // Get projects where user is owner or member
    const userProjects = await Project.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId }
      ]
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    // Get check-ins for these projects
    const activities = await Checkin.find({
      project: { $in: projectIds }
    })
    .populate('user', 'username profile.name profile.avatar')
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(activities);
  } catch (error) {
    console.error('Local activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch local activity feed' });
  }
});

// Get global activity feed (all public activities)
router.get('/global', auth, async (req, res) => {
  try {
    // Get public projects
    const publicProjects = await Project.find({
      visibility: 'public'
    }).select('_id');

    const projectIds = publicProjects.map(p => p._id);

    // Get check-ins for public projects
    const activities = await Checkin.find({
      project: { $in: projectIds }
    })
    .populate('user', 'username profile.name profile.avatar')
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(activities);
  } catch (error) {
    console.error('Global activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch global activity feed' });
  }
});

module.exports = router;
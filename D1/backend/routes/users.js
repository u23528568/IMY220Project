const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('friends', 'username profile.name');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          'profile.name': name,
          'profile.bio': bio,
          'profile.avatar': avatar
        }
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('username profile.name profile.avatar profile.bio');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { 'profile.name': { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.userId }
    }).select('username profile.name profile.avatar');

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send friend request
router.post('/friend-request/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingRequest = targetUser.friendRequests.find(
      request => request.from.toString() === req.userId
    );

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    targetUser.friendRequests.push({
      from: req.userId,
      status: 'pending'
    });

    await targetUser.save();
    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
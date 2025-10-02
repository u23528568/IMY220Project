const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Project = require('../models/Project');
const Checkin = require('../models/Checkin');

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

// Configure multer to store files in memory for Base64 conversion
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload profile picture (store as Base64 in database)
router.post('/profile/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  console.log('Upload route hit:', {
    userId: req.userId,
    hasFile: !!req.file,
    fileInfo: req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file'
  });
  
  try {
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert file buffer to Base64
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    console.log('Converting to base64, size:', base64Data.length);
    
    // Create data URL for direct use in img src
    const avatarDataUrl = `data:${mimeType};base64,${base64Data}`;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        $set: { 
          'profile.avatar': avatarDataUrl,
          'profile.avatarData': base64Data,
          'profile.avatarMimeType': mimeType
        } 
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile picture updated successfully',
      avatar: avatarDataUrl,
      user: user
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user favorites
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: 'favorites',
        populate: {
          path: 'owner',
          select: 'username profile.name profile.avatar'
        }
      });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add project to favorites
router.post('/favorites/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already favorited
    if (user.favorites.includes(projectId)) {
      return res.status(400).json({ error: 'Project already in favorites' });
    }

    user.favorites.push(projectId);
    await user.save();

    res.json({ message: 'Project added to favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove project from favorites
router.delete('/favorites/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.favorites = user.favorites.filter(fav => fav.toString() !== projectId);
    await user.save();

    res.json({ message: 'Project removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user profile (account deletion)
router.delete('/profile', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find the user first to ensure they exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 1. Delete all projects owned by the user
    await Project.deleteMany({ owner: userId });

    // 2. Remove user from all projects they're a member of
    await Project.updateMany(
      { 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );

    // 3. Remove all friend requests involving the user (from friendRequests subdocuments)
    await User.updateMany(
      { 'friendRequests.from': userId },
      { $pull: { friendRequests: { from: userId } } }
    );

    // 4. Remove user from all other users' friends lists
    await User.updateMany(
      { friends: userId },
      { $pull: { friends: userId } }
    );

    // 5. Delete all checkins by the user
    await Checkin.deleteMany({ user: userId });

    // 6. Remove user from favorites lists
    await User.updateMany(
      {},
      { $pull: { favorites: { $in: await Project.find({ owner: userId }).distinct('_id') } } }
    );

    // 7. Finally, delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ 
      message: 'Account deleted successfully',
      deleted: true
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
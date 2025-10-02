const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'repofox-secret-key-2024';

// Auth middleware
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

// Get user profile by ID or username
router.get('/profile/:identifier', auth, async (req, res) => {
  try {
    const { identifier } = req.params;
    console.log('Fetching profile for identifier:', identifier);
    
    // Check if identifier is a valid ObjectId format, otherwise treat as username
    let user = null;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Identifier is ObjectId format, searching by ID');
      // It's a valid ObjectId, try finding by ID
      user = await User.findById(identifier).select('-password');
    }
    
    if (!user) {
      console.log('Searching by username:', identifier);
      // If not found by ID or identifier is not ObjectId format, try by username
      user = await User.findOne({ username: identifier }).select('-password');
    }

    console.log('Found user:', user ? user.username : 'null');

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    console.log('Fetching projects for user:', user._id);
    // Get user's projects
    const projects = await Project.find({ owner: user._id })
      .select('name description type createdAt visibility files')
      .sort({ createdAt: -1 });

    console.log('Found projects:', projects.length);

    // Check if current user is friends with this user
    const currentUser = await User.findById(req.userId);
    console.log('Current user:', req.userId);
    const isFriend = currentUser.friends.includes(user._id);
    const hasPendingRequest = currentUser.friendRequests.some(
      request => request.from.toString() === user._id.toString() && request.status === 'pending'
    );    const responseData = {
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          profile: user.profile,
          createdAt: user.createdAt,
          projectCount: projects.length,
          friendCount: user.friends.length
        },
        projects: projects.filter(p => p.visibility === 'public' || isFriend),
        relationship: {
          isFriend,
          hasPendingRequest,
          isOwn: user._id.toString() === req.userId
        }
      },
      message: 'User profile retrieved successfully'
    };
    
    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user profile' 
    });
  }
});

// Send friend request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.userId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(req.userId);

    // Check if already friends (use proper ObjectId comparison)
    const alreadyFriends = currentUser.friends.some(
      friendId => friendId.toString() === userId.toString()
    );
    if (alreadyFriends) {
      return res.status(400).json({ 
        success: false,
        error: 'Already friends with this user' 
      });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      request => request.from.toString() === req.userId && request.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ 
        success: false,
        error: 'Friend request already sent' 
      });
    }

    // Check if the target user has already sent a request to current user (mutual interest)
    const mutualRequest = currentUser.friendRequests.find(
      request => request.from.toString() === userId.toString() && request.status === 'pending'
    );

    if (mutualRequest) {
      // Both want to be friends - automatically accept and make them friends
      mutualRequest.status = 'accepted';
      
      // Add each other as friends (with duplicate check)
      const currentUserAlreadyHasFriend = currentUser.friends.some(
        friendId => friendId.toString() === userId.toString()
      );
      if (!currentUserAlreadyHasFriend) {
        currentUser.friends.push(userId);
      }
      
      const targetUserAlreadyHasFriend = targetUser.friends.some(
        friendId => friendId.toString() === req.userId.toString()
      );
      if (!targetUserAlreadyHasFriend) {
        targetUser.friends.push(req.userId);
      }
      
      await currentUser.save();
      await targetUser.save();
      
      return res.json({
        success: true,
        message: 'Mutual friend request detected - you are now friends!'
      });
    }

    // Add friend request
    targetUser.friendRequests.push({
      from: req.userId,
      status: 'pending'
    });

    await targetUser.save();

    res.json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send friend request' 
    });
  }
});

// Accept/reject friend request
router.post('/request/:requestId/:action', auth, async (req, res) => {
  try {
    const { requestId, action } = req.params;
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid action' 
      });
    }

    const currentUser = await User.findById(req.userId);
    const request = currentUser.friendRequests.id(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ 
        success: false,
        error: 'Friend request not found' 
      });
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected';

    if (action === 'accept') {
      // Add each other as friends (check for duplicates first)
      const fromUser = await User.findById(request.from);
      
      // Only add if not already friends (use proper ObjectId comparison)
      const currentUserAlreadyHasFriend = currentUser.friends.some(
        friendId => friendId.toString() === request.from.toString()
      );
      if (!currentUserAlreadyHasFriend) {
        currentUser.friends.push(request.from);
      }
      
      const fromUserAlreadyHasFriend = fromUser.friends.some(
        friendId => friendId.toString() === currentUser._id.toString()
      );
      if (!fromUserAlreadyHasFriend) {
        fromUser.friends.push(currentUser._id);
      }
      
      await fromUser.save();
    }

    await currentUser.save();

    res.json({
      success: true,
      message: `Friend request ${action}ed successfully`,
      data: { action }
    });
  } catch (error) {
    console.error('Error handling friend request:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to handle friend request' 
    });
  }
});

// Get friend requests (incoming)
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friendRequests.from', 'username profile')
      .select('friendRequests');

    const pendingRequests = user.friendRequests
      .filter(request => request.status === 'pending')
      .map(request => ({
        _id: request._id,
        from: request.from,
        createdAt: request.createdAt
      }));

    res.json({
      success: true,
      data: pendingRequests,
      message: 'Friend requests retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch friend requests' 
    });
  }
});

// Get friends list
router.get('/list', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', 'username profile createdAt')
      .select('friends');

    res.json({
      success: true,
      data: user.friends,
      message: 'Friends list retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching friends list:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch friends list' 
    });
  }
});

// Remove friend
router.delete('/:friendId', auth, async (req, res) => {
  try {
    const { friendId } = req.params;

    const currentUser = await User.findById(req.userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from both users' friends lists
    currentUser.friends.pull(friendId);
    friend.friends.pull(req.userId);

    await currentUser.save();
    await friend.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'repofox-secret-key-2024';

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    const user = new User({
      username,
      email,
      password,
      profile: profile
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create a clean user object without circular references and large data
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      profile: {
        name: user.profile?.name || '',
        bio: user.profile?.bio || '',
        avatar: user.profile?.avatar || '',
        // Don't include avatarData in signup response to prevent localStorage quota issues
        // avatarData: user.profile?.avatarData || '',
        avatarMimeType: user.profile?.avatarMimeType || ''
      },
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordLength: password?.length });

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', email);
    
    // Create a clean user object without circular references and large data
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      profile: {
        name: user.profile?.name || '',
        bio: user.profile?.bio || '',
        avatar: user.profile?.avatar || '',
        // Don't include avatarData in login response to prevent localStorage quota issues
        // avatarData: user.profile?.avatarData || '',
        avatarMimeType: user.profile?.avatarMimeType || ''
      },
      createdAt: user.createdAt
    };
    
    console.log('Clean user response created (without avatarData)');
    
    res.json({
      success: true,
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // Since we're using stateless JWT tokens, logout is handled on frontend
  // But we can use this endpoint for any server-side cleanup if needed
  res.json({ message: 'Logout successful' });
});

// Test route to check all users in database (for debugging)
router.get('/test/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      total: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
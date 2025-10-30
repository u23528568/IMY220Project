const express = require('express');
const jwt = require('jsonwebtoken');
const Comment = require('../models/Comment');
const Project = require('../models/Project');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'repofox-secret-key-2024';

// Middleware to verify JWT token
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

// GET /api/comments/:projectId - Get all comments for a project
router.get('/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all comments for this project, sorted by creation date (oldest first for threaded display)
    const comments = await Comment.find({ project: projectId })
      .populate('user', 'username profile')
      .populate({
        path: 'parent',
        select: 'user content',
        populate: {
          path: 'user',
          select: 'username'
        }
      })
      .sort({ createdAt: 1 }); // Oldest first for better threading

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/comments/:projectId - Create a new comment
router.post('/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, parent } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // If it's a reply, verify parent comment exists
    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
      if (parentComment.project.toString() !== projectId) {
        return res.status(400).json({ error: 'Parent comment belongs to different project' });
      }
    }

    // Create comment
    const comment = new Comment({
      project: projectId,
      user: req.userId,
      content: content.trim(),
      parent: parent || null
    });

    await comment.save();

    // Populate user info before returning
    await comment.populate('user', 'username profile');
    if (comment.parent) {
      await comment.populate({
        path: 'parent',
        select: 'user content',
        populate: {
          path: 'user',
          select: 'username'
        }
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/comments/:commentId - Edit a comment
router.put('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Verify user owns the comment
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    // Update comment
    comment.content = content.trim();
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();

    // Populate user info
    await comment.populate('user', 'username profile');
    if (comment.parent) {
      await comment.populate({
        path: 'parent',
        select: 'user content',
        populate: {
          path: 'user',
          select: 'username'
        }
      });
    }

    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/comments/:commentId - Delete a comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Get project to check if user is admin/owner
    const project = await Project.findById(comment.project);
    const isOwner = comment.user.toString() === req.userId;
    const isProjectOwner = project.owner.toString() === req.userId;

    // User must be comment owner or project owner
    if (!isOwner && !isProjectOwner) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parent: commentId });

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

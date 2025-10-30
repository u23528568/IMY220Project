const express = require('express');
const adminAuth = require('../middleware/admin');
const User = require('../models/User');
const Project = require('../models/Project');
const Checkin = require('../models/Checkin');

const router = express.Router();

// =====================
// PROJECT MANAGEMENT
// =====================

// Get all projects (admin view)
router.get('/projects', adminAuth, async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('owner', 'username profile.name profile.avatar email')
      .populate('members.user', 'username profile.name profile.avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Admin get all projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Edit any project (admin)
router.put('/projects/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, visibility, license } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update project fields
    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (visibility) project.visibility = visibility;
    if (license) project.license = license;
    project.updatedAt = new Date();

    await project.save();

    // Return updated project with populated fields
    const updatedProject = await Project.findById(id)
      .populate('owner', 'username profile.name profile.avatar email')
      .populate('members.user', 'username profile.name profile.avatar');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Admin edit project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete any project (admin)
router.delete('/projects/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete all associated checkins
    await Checkin.deleteMany({ project: id });

    // Remove project from all users' favorites
    await User.updateMany(
      { favorites: id },
      { $pull: { favorites: id } }
    );

    // Delete the project
    await Project.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Project deleted successfully',
      data: { deletedProjectId: id }
    });
  } catch (error) {
    console.error('Admin delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Edit project files/content (admin)
router.put('/projects/:projectId/files/:fileId', adminAuth, async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const { content, name } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const file = project.files.id(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.type !== 'file') {
      return res.status(400).json({ error: 'Cannot update folder content' });
    }

    // Update file
    if (content !== undefined) {
      file.content = content;
      file.size = Buffer.byteLength(content, 'utf8');
    }
    if (name) {
      file.name = name;
    }
    file.updatedAt = new Date();

    await project.save();

    res.json({
      success: true,
      message: 'File updated successfully',
      data: file
    });
  } catch (error) {
    console.error('Admin edit file error:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// Delete project file (admin)
router.delete('/projects/:projectId/files/:fileId', adminAuth, async (req, res) => {
  try {
    const { projectId, fileId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const file = project.files.id(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // If it's a folder, delete all files in it recursively
    if (file.type === 'folder') {
      const folderPath = file.path === '/' ? `/${file.name}` : `${file.path}/${file.name}`;
      project.files = project.files.filter(f => !f.path.startsWith(folderPath) && f._id.toString() !== fileId);
    }

    // Remove the file/folder
    project.files.pull(fileId);

    await project.save();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// =====================
// USER MANAGEMENT
// =====================

// Get all users (admin view)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Admin get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Edit any user account (admin)
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, profile, isAdmin } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (profile) {
      if (profile.name) user.profile.name = profile.name;
      if (profile.bio !== undefined) user.profile.bio = profile.bio;
      if (profile.avatar !== undefined) user.profile.avatar = profile.avatar;
    }
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    await user.save();

    const updatedUser = await User.findById(id).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Admin edit user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete any user account (admin)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    // 1. Delete all projects owned by the user
    await Project.deleteMany({ owner: id });

    // 2. Remove user from all projects they're a member of
    await Project.updateMany(
      { 'members.user': id },
      { $pull: { members: { user: id } } }
    );

    // 3. Remove all friend requests involving the user
    await User.updateMany(
      { 'friendRequests.from': id },
      { $pull: { friendRequests: { from: id } } }
    );

    // 4. Remove user from all other users' friends lists
    await User.updateMany(
      { friends: id },
      { $pull: { friends: id } }
    );

    // 5. Delete all checkins by the user
    await Checkin.deleteMany({ user: id });

    // 6. Remove user from favorites lists
    const userProjects = await Project.find({ owner: id }).distinct('_id');
    await User.updateMany(
      {},
      { $pull: { favorites: { $in: userProjects } } }
    );

    // 7. Finally, delete the user account
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User account deleted successfully',
      data: { deletedUserId: id }
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

// =====================
// DISCUSSION/CHECKIN MANAGEMENT
// =====================

// Get all checkins/discussions (admin view)
router.get('/checkins', adminAuth, async (req, res) => {
  try {
    const checkins = await Checkin.find({})
      .populate('user', 'username profile.name profile.avatar')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: checkins
    });
  } catch (error) {
    console.error('Admin get all checkins error:', error);
    res.status(500).json({ error: 'Failed to fetch checkins' });
  }
});

// Edit any checkin/discussion (admin)
router.put('/checkins/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const checkin = await Checkin.findById(id);
    if (!checkin) {
      return res.status(404).json({ error: 'Checkin not found' });
    }

    // Update checkin message
    if (message) checkin.message = message;

    await checkin.save();

    const updatedCheckin = await Checkin.findById(id)
      .populate('user', 'username profile.name profile.avatar')
      .populate('project', 'name');

    res.json({
      success: true,
      message: 'Checkin updated successfully',
      data: updatedCheckin
    });
  } catch (error) {
    console.error('Admin edit checkin error:', error);
    res.status(500).json({ error: 'Failed to update checkin' });
  }
});

// Delete any checkin/discussion (admin)
router.delete('/checkins/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const checkin = await Checkin.findById(id);
    if (!checkin) {
      return res.status(404).json({ error: 'Checkin not found' });
    }

    await Checkin.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Checkin deleted successfully',
      data: { deletedCheckinId: id }
    });
  } catch (error) {
    console.error('Admin delete checkin error:', error);
    res.status(500).json({ error: 'Failed to delete checkin' });
  }
});

// =====================
// STATISTICS
// =====================

// Get admin dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalCheckins = await Checkin.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });

    const recentUsers = await User.find({})
      .select('username email createdAt profile.name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentProjects = await Project.find({})
      .select('name owner createdAt')
      .populate('owner', 'username profile.name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalProjects,
          totalCheckins,
          adminUsers
        },
        recentUsers,
        recentProjects
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;

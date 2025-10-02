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

// Helper function to track changes during checkout session
const trackSessionChange = async (project, operation, fileName) => {
  try {
    console.log(`Tracking session change - Operation: ${operation}, FileName: ${fileName}`);
    
    if (!fileName || !project.sessionChanges) {
      console.log('No fileName or sessionChanges not initialized');
      return;
    }

    // Determine if it's a folder based on filename ending with '/'
    const isFolder = fileName.endsWith('/');
    const displayName = isFolder ? fileName.slice(0, -1) : fileName; // Remove trailing slash for display
    
    // Initialize sessionChanges if not present
    if (!project.sessionChanges) {
      project.sessionChanges = { added: [], modified: [], deleted: [] };
    }

    // Remove from other arrays first to avoid duplicates
    project.sessionChanges.added = project.sessionChanges.added.filter(f => f !== displayName);
    project.sessionChanges.modified = project.sessionChanges.modified.filter(f => f !== displayName);
    project.sessionChanges.deleted = project.sessionChanges.deleted.filter(f => f !== displayName);
    
    // Add to appropriate array based on operation
    switch (operation) {
      case 'add':
        if (!project.sessionChanges.added.includes(displayName)) {
          project.sessionChanges.added.push(displayName);
        }
        break;
      case 'update':
        if (!project.sessionChanges.modified.includes(displayName)) {
          project.sessionChanges.modified.push(displayName);
        }
        break;
      case 'delete':
        if (!project.sessionChanges.deleted.includes(displayName)) {
          project.sessionChanges.deleted.push(displayName);
        }
        break;
    }
    
    console.log('Updated session changes:', project.sessionChanges);
  } catch (error) {
    console.error('Error tracking session change:', error);
  }
};

// Helper function to generate README content based on template
const generateReadmeContent = (projectName, description, template, license) => {
  let content = `# ${projectName}\n\n`;
  
  if (description) {
    content += `${description}\n\n`;
  }

  content += `## Getting Started\n\n`;

  switch (template) {
    case 'web':
      content += `This is a web application project.\n\n### Prerequisites\n- A modern web browser\n- Basic knowledge of HTML, CSS, and JavaScript\n\n### Installation\n1. Clone the repository\n2. Open index.html in your browser\n\n`;
      break;
    case 'react':
      content += `This is a React application.\n\n### Prerequisites\n- Node.js (v14 or higher)\n- npm or yarn\n\n### Installation\n1. Clone the repository\n2. Run \`npm install\`\n3. Run \`npm start\`\n\n`;
      break;
    case 'node':
      content += `This is a Node.js project.\n\n### Prerequisites\n- Node.js (v14 or higher)\n- npm or yarn\n\n### Installation\n1. Clone the repository\n2. Run \`npm install\`\n3. Run \`npm start\`\n\n`;
      break;
    case 'python':
      content += `This is a Python project.\n\n### Prerequisites\n- Python 3.7+\n- pip\n\n### Installation\n1. Clone the repository\n2. Create a virtual environment: \`python -m venv venv\`\n3. Activate the virtual environment\n4. Install dependencies: \`pip install -r requirements.txt\`\n\n`;
      break;
    case 'java':
      content += `This is a Java project.\n\n### Prerequisites\n- Java 11+\n- Maven 3.6+\n\n### Installation\n1. Clone the repository\n2. Run \`mvn clean install\`\n3. Run \`mvn exec:java\`\n\n`;
      break;
    default:
      content += `Welcome to ${projectName}!\n\nThis project is ready for your code.\n\n`;
  }

  content += `## Usage\n\nDescribe how to use your project here.\n\n## Contributing\n\nContributions are welcome! Please feel free to submit a Pull Request.\n\n`;

  if (license && license !== 'none') {
    content += `## License\n\nThis project is licensed under the ${license.toUpperCase()} License.\n\n`;
  }

  return content;
};

// Helper function to get template files
const getTemplateFiles = (template, projectName, description, license, userId) => {
  const files = [];
  
  switch (template) {
    case 'web':
      files.push({
        name: 'index.html',
        path: '/',
        type: 'file',
        content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${projectName}</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <h1>Welcome to ${projectName}</h1>\n    <p>${description || 'Your web application starts here!'}</p>\n    <script src="script.js"></script>\n</body>\n</html>`,
        mimeType: 'text/html',
        createdBy: userId
      });
      files.push({
        name: 'styles.css',
        path: '/',
        type: 'file',
        content: `/* ${projectName} Styles */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f4f4f4;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}\n\np {\n    text-align: center;\n    color: #666;\n}`,
        mimeType: 'text/css',
        createdBy: userId
      });
      files.push({
        name: 'script.js',
        path: '/',
        type: 'file',
        content: `// ${projectName} JavaScript\nconsole.log('Welcome to ${projectName}!');\n\n// Add your JavaScript code here`,
        mimeType: 'application/javascript',
        createdBy: userId
      });
      break;
    case 'react':
      files.push({
        name: 'package.json',
        path: '/',
        type: 'file',
        content: JSON.stringify({
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          private: true,
          dependencies: {
            '@testing-library/jest-dom': '^5.16.4',
            '@testing-library/react': '^13.3.0',
            '@testing-library/user-event': '^13.5.0',
            'react': '^18.2.0',
            'react-dom': '^18.2.0',
            'react-scripts': '5.0.1',
            'web-vitals': '^2.1.4'
          },
          scripts: {
            start: 'react-scripts start',
            build: 'react-scripts build',
            test: 'react-scripts test',
            eject: 'react-scripts eject'
          }
        }, null, 2),
        mimeType: 'application/json',
        createdBy: userId
      });
      break;
    case 'python':
      files.push({
        name: 'requirements.txt',
        path: '/',
        type: 'file',
        content: `# ${projectName} Requirements\n# Add your Python dependencies here\n# Example:\n# requests==2.28.1\n# flask==2.2.2`,
        mimeType: 'text/plain',
        createdBy: userId
      });
      files.push({
        name: 'main.py',
        path: '/',
        type: 'file',
        content: `#!/usr/bin/env python3\n"""\n${projectName}\n${description || 'Python application'}\n"""\n\ndef main():\n    print("Welcome to ${projectName}!")\n    # Add your code here\n    pass\n\nif __name__ == "__main__":\n    main()`,
        mimeType: 'text/x-python',
        createdBy: userId
      });
      break;
  }
  
  return files;
};

// Create project with file system initialization
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      visibility, 
      template, 
      license, 
      initializeWithReadme, 
      hashtags 
    } = req.body;

    // Validate project name uniqueness for the user
    const existingProject = await Project.findOne({ 
      name: name, 
      owner: req.userId 
    });
    
    if (existingProject) {
      return res.status(400).json({ error: 'A project with this name already exists' });
    }

    // Create the project
    const project = new Project({
      name,
      description: description || '',
      visibility: visibility || 'public',
      template: template || 'blank',
      license: license || 'none',
      initializeWithReadme: initializeWithReadme !== false,
      hashtags: hashtags ? (Array.isArray(hashtags) ? hashtags : hashtags.split(',')) : [],
      owner: req.userId,
      members: [{
        user: req.userId,
        role: 'admin'
      }],
      image: req.file ? `/uploads/${req.file.filename}` : '',
      files: []
    });

    // Initialize with README if requested
    if (project.initializeWithReadme) {
      const readmeContent = generateReadmeContent(name, description, template, license);
      project.files.push({
        name: 'README.md',
        path: '/',
        type: 'file',
        content: readmeContent,
        mimeType: 'text/markdown',
        createdBy: req.userId
      });
    }

    // Add template files
    const templateFiles = getTemplateFiles(template, name, description, license, req.userId);
    project.files.push(...templateFiles);

    // Add license file if requested
    if (license && license !== 'none') {
      // You can add actual license content here based on the license type
      project.files.push({
        name: 'LICENSE',
        path: '/',
        type: 'file',
        content: `${license.toUpperCase()} License\n\nCopyright (c) ${new Date().getFullYear()} ${name}\n\n[License content would go here]`,
        mimeType: 'text/plain',
        createdBy: req.userId
      });
    }

    await project.save();
    await project.populate('owner', 'username profile.name profile.avatar');
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId },
        { visibility: 'public' }
      ]
    })
    .populate('owner', 'username profile.name profile.avatar')
    .populate('members.user', 'username profile.name profile.avatar')
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search projects
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const projects = await Project.find({
      $and: [
        { owner: req.userId }, // Only return projects owned by the current user
        {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { tags: { $in: [searchRegex] } }
          ]
        }
      ]
    })
    .populate('owner', 'username profile.name profile.avatar')
    .populate('members.user', 'username profile.name profile.avatar')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(projects);
  } catch (error) {
    console.error('Project search error:', error);
    res.status(500).json({ error: 'Failed to search projects' });
  }
});

// Get user's own projects (only projects where user is the owner)
// This must come BEFORE the /:id route to avoid route conflicts
router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.userId })
      .populate('owner', 'username profile.name profile.avatar')
      .populate('members.user', 'username profile.name profile.avatar')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username profile.name profile.avatar')
      .populate('members.user', 'username profile.name profile.avatar')
      .populate('checkedOutBy', 'username profile.name profile.avatar');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, visibility, license } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the project owner can edit this project' });
    }

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Update project fields
    project.name = name.trim();
    project.description = description?.trim() || '';
    project.visibility = visibility || 'public';
    project.license = license || 'none';
    project.updatedAt = new Date();

    await project.save();

    // Return updated project with populated fields
    const updatedProject = await Project.findById(id)
      .populate('owner', 'username profile.name profile.avatar')
      .populate('members.user', 'username profile.name profile.avatar')
      .populate('checkedOutBy', 'username profile.name profile.avatar');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File Management Routes

// Upload file to project
router.post('/:projectId/files', auth, upload.single('file'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { path = '/', name, content } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has permission to upload files
    const isMember = project.owner.toString() === req.userId || 
                     project.members.some(member => member.user.toString() === req.userId);
    
    if (!isMember) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    let fileData;

    if (req.file) {
      // File upload via multipart/form-data
      const fs = require('fs').promises;
      const fileContent = await fs.readFile(req.file.path, 'utf8');
      
      fileData = {
        name: req.file.originalname,
        path: path,
        type: 'file',
        content: fileContent,
        mimeType: req.file.mimetype,
        size: req.file.size,
        createdBy: req.userId
      };

      // Clean up uploaded file
      await fs.unlink(req.file.path);
    } else if (name && content !== undefined) {
      // Text content upload via JSON
      fileData = {
        name,
        path,
        type: 'file',
        content,
        mimeType: 'text/plain',
        size: Buffer.byteLength(content, 'utf8'),
        createdBy: req.userId
      };
    } else {
      return res.status(400).json({ error: 'No file or content provided' });
    }

    // Check if file already exists
    const existingFile = project.files.find(f => 
      f.name === fileData.name && f.path === fileData.path && f.type === 'file'
    );

    if (existingFile) {
      // Update existing file
      Object.assign(existingFile, {
        ...fileData,
        updatedAt: new Date()
      });
    } else {
      // Add new file
      project.files.push(fileData);
    }

    // Track session changes if user is checked out
    if (project.isCheckedOut && project.checkedOutBy.toString() === req.userId) {
      const operation = existingFile ? 'update' : 'add';
      await trackSessionChange(project, operation, fileData.name);
    }
    
    await project.save();
    
    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileData
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Create folder in project
router.post('/:projectId/folders', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, path = '/' } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has permission
    const isMember = project.owner.toString() === req.userId || 
                     project.members.some(member => member.user.toString() === req.userId);
    
    if (!isMember) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Check if folder already exists
    const existingFolder = project.files.find(f => 
      f.name === name && f.path === path && f.type === 'folder'
    );

    if (existingFolder) {
      return res.status(400).json({ error: 'Folder already exists' });
    }

    const folderData = {
      name,
      path,
      type: 'folder',
      content: '',
      mimeType: 'inode/directory',
      size: 0,
      createdBy: req.userId
    };

    project.files.push(folderData);
    
    // Track session changes if user is checked out  
    if (project.isCheckedOut && project.checkedOutBy.toString() === req.userId) {
      await trackSessionChange(project, 'add', `${folderData.name}/`);
    }
    
    await project.save();
    
    res.status(201).json({
      message: 'Folder created successfully',
      folder: folderData
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update file content
router.put('/:projectId/files/:fileId', auth, async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const { content, name } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has permission
    const isMember = project.owner.toString() === req.userId || 
                     project.members.some(member => member.user.toString() === req.userId);
    
    if (!isMember) {
      return res.status(403).json({ error: 'Permission denied' });
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

    // Track session changes if user is checked out
    if (project.isCheckedOut && project.checkedOutBy.toString() === req.userId) {
      await trackSessionChange(project, 'update', file.name);
    }
    
    await project.save();
    
    res.json({
      message: 'File updated successfully',
      file
    });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// Delete file or folder
router.delete('/:projectId/files/:fileId', auth, async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has permission
    const isMember = project.owner.toString() === req.userId || 
                     project.members.some(member => member.user.toString() === req.userId);
    
    if (!isMember) {
      return res.status(403).json({ error: 'Permission denied' });
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

    // Store file name before deletion for change tracking
    const fileName = file.name;
    
    // Remove the file/folder
    project.files.pull(fileId);
    
    // Track session changes if user is checked out
    if (project.isCheckedOut && project.checkedOutBy.toString() === req.userId) {
      await trackSessionChange(project, 'delete', fileName);
    }
    
    await project.save();
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file content
router.get('/:projectId/files/:fileId', auth, async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has permission (allow public projects to be viewed by anyone)
    if (project.visibility === 'private') {
      const isMember = project.owner.toString() === req.userId || 
                       project.members.some(member => member.user.toString() === req.userId);
      
      if (!isMember) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }

    const file = project.files.id(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ file });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
});

// Test route to check all projects in database (for debugging)
router.get('/test/all', async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('owner', 'username profile.name')
      .sort({ createdAt: -1 });
    
    res.json({
      total: projects.length,
      projects: projects
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invite collaborator to project
router.post('/:projectId/invite', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role = 'collaborator' } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }

    // Check if user is project owner
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only project owners can invite collaborators' 
      });
    }

    // Check if user to invite exists
    const User = require('../models/User');
    const userToInvite = await User.findById(userId);
    if (!userToInvite) {
      return res.status(404).json({ 
        success: false, 
        error: 'User to invite not found' 
      });
    }

    // Check if user is already a member
    const isAlreadyMember = project.members.some(
      member => member.user.toString() === userId
    );
    if (isAlreadyMember) {
      return res.status(400).json({ 
        success: false, 
        error: 'User is already a collaborator on this project' 
      });
    }

    // Add user directly as collaborator
    project.members.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });

    await project.save();

    res.json({
      success: true,
      message: 'Collaborator added successfully',
      data: {
        project: {
          _id: project._id,
          name: project.name,
        },
        newCollaborator: {
          _id: userToInvite._id,
          username: userToInvite.username,
          profile: userToInvite.profile,
          role: role
        }
      }
    });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to invite collaborator' 
    });
  }
});

// Remove collaborator from project  
router.delete('/:projectId/members/:memberId', auth, async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }

    // Check if user is project owner or removing themselves
    const memberToRemove = project.members.find(
      member => member.user.toString() === memberId
    );
    
    if (!memberToRemove) {
      return res.status(404).json({ 
        success: false, 
        error: 'Member not found in project' 
      });
    }

    const isOwner = project.owner.toString() === req.userId;
    const isRemovingSelf = memberId === req.userId;

    if (!isOwner && !isRemovingSelf) {
      return res.status(403).json({ 
        success: false, 
        error: 'Permission denied' 
      });
    }

    // Remove member
    project.members = project.members.filter(
      member => member.user.toString() !== memberId
    );

    await project.save();

    res.json({
      success: true,
      message: isRemovingSelf ? 'Left project successfully' : 'Collaborator removed successfully',
      data: {
        project: {
          _id: project._id,
          name: project.name,
          membersCount: project.members.length
        }
      }
    });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove collaborator' 
    });
  }
});

// Download project files as JSON (for client-side ZIP creation)
router.get('/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id)
      .populate('owner', 'username profile.name profile.avatar')
      .populate('members.user', 'username profile.name profile.avatar');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access (owner or collaborator)
    const isOwner = project.owner._id.toString() === req.userId;
    const isCollaborator = project.members.some(member => 
      member.user._id.toString() === req.userId
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prepare project data for download
    const downloadData = {
      projectName: project.name,
      description: project.description,
      owner: project.owner.profile?.name || project.owner.username,
      createdAt: project.createdAt,
      files: project.files.map(file => ({
        name: file.name,
        path: file.path,
        content: file.content,
        language: file.language,
        size: file.size,
        lastModified: file.lastModified
      }))
    };

    res.json({
      success: true,
      data: downloadData
    });
  } catch (error) {
    console.error('Download project error:', error);
    res.status(500).json({ error: 'Failed to prepare project download' });
  }
});

module.exports = router;
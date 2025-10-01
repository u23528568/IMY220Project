const mongoose = require('mongoose');

// Enhanced file system schema for GitHub-like functionality
const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true,
    default: '/'
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  mimeType: {
    type: String,
    default: 'text/plain'
  },
  size: {
    type: Number,
    default: 0
  },
  encoding: {
    type: String,
    default: 'utf8'
  },
  isReadonly: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'collaborator', 'viewer'],
      default: 'collaborator'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  files: [fileSchema],
  image: {
    type: String,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  template: {
    type: String,
    enum: ['blank', 'web', 'react', 'node', 'python', 'java'],
    default: 'blank'
  },
  license: {
    type: String,
    enum: ['none', 'mit', 'apache', 'gpl', 'bsd'],
    default: 'none'
  },
  initializeWithReadme: {
    type: Boolean,
    default: true
  },
  hashtags: [String],
  isCheckedOut: {
    type: Boolean,
    default: false
  },
  checkedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checkedOutAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
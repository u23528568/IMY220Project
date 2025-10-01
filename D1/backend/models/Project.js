const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  size: Number,
  uploadedAt: {
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
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
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
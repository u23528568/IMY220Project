const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null // null means top-level comment, otherwise it's a reply
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
commentSchema.index({ project: 1, createdAt: -1 });
commentSchema.index({ parent: 1 });

module.exports = mongoose.model('Comment', commentSchema);

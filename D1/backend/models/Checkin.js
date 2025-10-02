const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  files: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number
  }],
  version: {
    type: Number,
    required: true
  },
  changes: {
    added: [String],
    modified: [String],
    deleted: [String]
  },
  checkedInAt: {
    type: Date
  },
  checkedOutAt: {
    type: Date
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Checkin', checkinSchema);
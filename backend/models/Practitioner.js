const mongoose = require('mongoose');

const practitionerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  type: {
    type: String,
    enum: ['Ayurvedic', 'Unani', 'Siddha', 'TCM', 'Modern', 'Nutritionist']
  },
  specialization: [{
    type: String,
    trim: true
  }],
  licenseNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  authorityLevel: {
    type: String,
    enum: ['Viewer', 'Editor', 'Approver'],
    default: 'Viewer'
  },
  role: {
    type: String,
    enum: ['practitioner', 'admin'],
    default: 'practitioner'
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
practitionerSchema.index({ email: 1 });
practitionerSchema.index({ licenseNumber: 1 });
practitionerSchema.index({ verified: 1 });

module.exports = mongoose.model('Practitioner', practitionerSchema);

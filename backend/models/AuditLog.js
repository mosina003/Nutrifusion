const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  entity: {
    type: String,
    enum: ['DietPlan', 'Food', 'User', 'Practitioner', 'Recipe', 'HealthProfile'],
    required: [true, 'Entity type is required']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID is required']
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'ARCHIVE', 'VERIFY'],
    required: [true, 'Action is required']
  },
  changes: {
    type: mongoose.Schema.Types.Mixed
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Performer ID is required']
  },
  performedByModel: {
    type: String,
    enum: ['User', 'Practitioner', 'System'],
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Index for faster queries
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

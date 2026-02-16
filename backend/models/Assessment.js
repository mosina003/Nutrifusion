const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  framework: {
    type: String,
    enum: ['ayurveda', 'unani', 'tcm', 'modern'],
    required: true
  },
  responses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  scores: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  healthProfile: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  nutritionInputs: {
    type: mongoose.Schema.Types.Mixed
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
assessmentSchema.index({ userId: 1, framework: 1 });
assessmentSchema.index({ isActive: 1 });

// Method to deactivate previous assessments
assessmentSchema.statics.deactivatePreviousAssessments = async function(userId, framework) {
  await this.updateMany(
    { userId, framework, isActive: true },
    { isActive: false }
  );
};

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;

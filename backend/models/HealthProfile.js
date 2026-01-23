const mongoose = require('mongoose');

const healthProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  bmi: {
    type: Number,
    min: 0
  },
  chronicConditions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalCondition'
  }],
  lifestyle: {
    activityLevel: {
      type: String,
      enum: ['Sedentary', 'Moderate', 'Active'],
      default: 'Moderate'
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24
    },
    stressLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    }
  },
  digestionIndicators: {
    appetite: {
      type: String,
      enum: ['Low', 'Normal', 'High'],
      default: 'Normal'
    },
    bowelRegularity: {
      type: String,
      enum: ['Irregular', 'Regular'],
      default: 'Regular'
    },
    bloating: {
      type: Boolean,
      default: false
    },
    acidReflux: {
      type: Boolean,
      default: false
    }
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
healthProfileSchema.index({ userId: 1, recordedAt: -1 });

module.exports = mongoose.model('HealthProfile', healthProfileSchema);

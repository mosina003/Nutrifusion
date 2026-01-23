const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  planName: {
    type: String,
    trim: true,
    default: 'My Diet Plan'
  },
  meals: [{
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'],
      required: true
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    },
    portion: {
      type: Number,
      min: 0.1,
      default: 1
    },
    scheduledTime: String
  }],
  rulesApplied: [{
    type: String,
    trim: true
  }],
  nutrientSnapshot: {
    calories: {
      type: Number,
      min: 0
    },
    protein: {
      type: Number,
      min: 0
    },
    carbs: {
      type: Number,
      min: 0
    },
    fat: {
      type: Number,
      min: 0
    },
    fiber: {
      type: Number,
      min: 0
    }
  },
  doshaBalance: {
    vata: Number,
    pitta: Number,
    kapha: Number
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Completed', 'Archived'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel'
  },
  createdByModel: {
    type: String,
    enum: ['User', 'Practitioner', 'System'],
    default: 'System'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner'
  },
  approvedAt: Date,
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
dietPlanSchema.index({ userId: 1, validFrom: -1 });
dietPlanSchema.index({ status: 1 });
dietPlanSchema.index({ createdBy: 1 });

module.exports = mongoose.model('DietPlan', dietPlanSchema);

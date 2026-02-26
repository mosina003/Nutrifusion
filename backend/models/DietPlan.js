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
  planType: {
    type: String,
    enum: ['ayurveda', 'unani', 'tcm', 'modern', 'custom'],
    default: 'custom'
  },
  meals: [{
    day: Number,                    // Day number (1-7) for weekly plans
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'],
      required: true
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
      // Not required anymore - can use foods array for auto-generated plans
    },
    foods: [String],                // Food names (for auto-generated plans without recipes)
    portion: {
      type: Number,
      min: 0.1,
      default: 1
    },
    timing: String,                 // e.g., "7:00 AM - 8:00 AM"
    scheduledTime: String,
    notes: String                   // Additional meal notes
  }],
  rulesApplied: [mongoose.Schema.Types.Mixed],  // Flexible for different frameworks
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
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

const mongoose = require('mongoose');

const mealCompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dietPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DietPlan',
    required: false  // Optional since we might not have a saved diet plan
  },
  date: {
    type: String,  // ISO date string "2026-02-26"
    required: true,
    index: true
  },
  day: {
    type: Number,  // Day number 1-7
    required: true
  },
  completedMeals: [{
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dayCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, {
  timestamps: true
});

// Compound index for efficient queries
mealCompletionSchema.index({ userId: 1, date: 1 }, { unique: true });
mealCompletionSchema.index({ userId: 1, dietPlanId: 1 });

module.exports = mongoose.model('MealCompletion', mealCompletionSchema);

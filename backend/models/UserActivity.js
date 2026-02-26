const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  activities: {
    login: {
      type: Boolean,
      default: false
    },
    mealLogged: {
      type: Boolean,
      default: false
    },
    assessmentCompleted: {
      type: Boolean,
      default: false
    },
    exerciseLogged: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    loginCount: {
      type: Number,
      default: 0
    },
    mealsLoggedCount: {
      type: Number,
      default: 0
    },
    totalCalories: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
userActivitySchema.index({ userId: 1, date: -1 });

// Static method to record daily login
userActivitySchema.statics.recordLogin = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activity = await this.findOneAndUpdate(
    {
      userId,
      date: today
    },
    {
      $set: {
        'activities.login': true
      },
      $inc: {
        'metadata.loginCount': 1
      }
    },
    {
      upsert: true,
      new: true
    }
  );
  
  return activity;
};

// Static method to calculate current streak
userActivitySchema.statics.calculateStreak = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all activities sorted by date descending
  const activities = await this.find({ userId })
    .sort({ date: -1 })
    .lean();
  
  if (activities.length === 0) {
    return 0;
  }
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const activity of activities) {
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);
    
    // Check if activity is from current streak date
    if (currentDate.getTime() === activityDate.getTime()) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }
  }
  
  return streak;
};

// Static method to get user stats
userActivitySchema.statics.getUserStats = async function(userId, days = 30) {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const activities = await this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
  
  const totalDays = activities.length;
  const loginDays = activities.filter(a => a.activities.login).length;
  const mealLoggedDays = activities.filter(a => a.activities.mealLogged).length;
  const currentStreak = await this.calculateStreak(userId);
  
  return {
    totalDaysTracked: totalDays,
    loginDays,
    mealLoggedDays,
    currentStreak,
    adherence: totalDays > 0 ? Math.round((mealLoggedDays / totalDays) * 100) : 0
  };
};

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;

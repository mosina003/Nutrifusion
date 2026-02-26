const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  configKey: {
    type: String,
    required: true,
    unique: true,
    default: 'default'
  },
  ruleWeights: {
    ayurveda: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 2.0
    },
    unani: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 2.0
    },
    tcm: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 2.0
    },
    modern: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 2.0
    },
    safety: {
      type: Number,
      default: 1.5,
      min: 0,
      max: 2.0
    }
  },
  conflictResolution: {
    priorityOrder: {
      type: [String],
      default: ['safety', 'medicalCondition', 'practitionerOverride', 'dominantSystem', 'aggregateScore']
    }
  },
  cacheSettings: {
    userProfileTTL: {
      type: Number,
      default: 300
    },
    recommendationTTL: {
      type: Number,
      default: 600
    },
    enableCaching: {
      type: Boolean,
      default: true
    }
  },
  scoringRules: {
    minScore: {
      type: Number,
      default: 0
    },
    maxScore: {
      type: Number,
      default: 100
    },
    baseScore: {
      type: Number,
      default: 50
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create a default config if none exists
systemConfigSchema.statics.getConfig = async function() {
  try {
    let config = await this.findOneAndUpdate(
      { configKey: 'default', isActive: true },
      { $setOnInsert: { configKey: 'default', isActive: true } },
      { upsert: true, new: true }
    );
    
    return config;
  } catch (error) {
    console.error('Error in getConfig:', error);
    // If there's still an error, try to find existing
    const existing = await this.findOne({ configKey: 'default', isActive: true });
    if (existing) return existing;
    throw error;
  }
};

// Update config
systemConfigSchema.statics.updateConfig = async function(updates) {
  const config = await this.getConfig();
  Object.assign(config, updates);
  await config.save();
  return config;
};

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

module.exports = SystemConfig;

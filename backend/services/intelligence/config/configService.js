/**
 * Config Service - Rule Weight Management
 * Manages system-wide configuration including rule weights
 */

const SystemConfig = require('../../../models/SystemConfig');

// Default configuration
const DEFAULT_CONFIG = {
  ruleWeights: {
    ayurveda: 1.0,
    unani: 1.0,
    tcm: 1.0,
    modern: 1.0,
    safety: 1.5  // Safety has higher priority
  },
  conflictResolution: {
    priorityOrder: ['safety', 'medicalCondition', 'practitionerOverride', 'dominantSystem', 'aggregateScore']
  },
  cacheSettings: {
    userProfileTTL: 300,      // 5 minutes
    recommendationTTL: 600,    // 10 minutes
    enableCaching: true
  },
  scoringRules: {
    minScore: 0,
    maxScore: 100,
    baseScore: 50
  }
};

/**
 * Get current configuration
 */
const getConfig = async () => {
  try {
    const config = await SystemConfig.getConfig();
    
    return {
      ruleWeights: config.ruleWeights || DEFAULT_CONFIG.ruleWeights,
      conflictResolution: config.conflictResolution || DEFAULT_CONFIG.conflictResolution,
      cacheSettings: config.cacheSettings || DEFAULT_CONFIG.cacheSettings,
      scoringRules: config.scoringRules || DEFAULT_CONFIG.scoringRules
    };
  } catch (error) {
    console.error('Error fetching config, using defaults:', error);
    return DEFAULT_CONFIG;
  }
};

/**
 * Update configuration
 */
const updateConfig = async (updates) => {
  try {
    const config = await SystemConfig.updateConfig(updates);
    
    return {
      ruleWeights: config.ruleWeights || DEFAULT_CONFIG.ruleWeights,
      conflictResolution: config.conflictResolution || DEFAULT_CONFIG.conflictResolution,
      cacheSettings: config.cacheSettings || DEFAULT_CONFIG.cacheSettings,
      scoringRules: config.scoringRules || DEFAULT_CONFIG.scoringRules
    };
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
};

/**
 * Get rule weights
 */
const getRuleWeights = async () => {
  const config = await getConfig();
  return config.ruleWeights || DEFAULT_CONFIG.ruleWeights;
};

/**
 * Apply weights to system scores
 */
const applyWeights = (systemScores, weights) => {
  const weighted = {};
  
  Object.keys(systemScores).forEach(system => {
    const weight = weights[system] || 1.0;
    weighted[system] = systemScores[system] * weight;
  });

  return weighted;
};

/**
 * Get conflict resolution policy
 */
const getConflictPolicy = async () => {
  const config = await getConfig();
  return config.conflictResolution || DEFAULT_CONFIG.conflictResolution;
};

module.exports = {
  getConfig,
  updateConfig,
  getRuleWeights,
  applyWeights,
  getConflictPolicy,
  DEFAULT_CONFIG
};

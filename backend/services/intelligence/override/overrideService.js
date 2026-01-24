/**
 * Practitioner Override Service
 * Allows practitioners to override recommendation scores with clinical judgment
 */

const AuditLog = require('../../models/AuditLog');

/**
 * Create a practitioner override
 * @param {Object} params - { foodId, recipeId, userId, practitionerId, action, reason, originalScore, newScore }
 * @returns {Object} - Override record
 */
const createOverride = async (params) => {
  const {
    foodId,
    recipeId,
    userId,
    practitionerId,
    action, // 'approve' or 'reject'
    reason,
    originalScore,
    newScore
  } = params;

  // Create audit log entry
  const auditEntry = await AuditLog.create({
    userId: practitionerId,
    action: 'PRACTITIONER_OVERRIDE',
    collection: foodId ? 'Food' : 'Recipe',
    documentId: foodId || recipeId,
    changes: {
      targetUser: userId,
      overrideAction: action,
      reason,
      scoring: {
        original: originalScore,
        overridden: newScore
      }
    },
    timestamp: new Date()
  });

  return {
    overrideId: auditEntry._id,
    action,
    reason,
    appliedBy: practitionerId,
    appliedAt: new Date()
  };
};

/**
 * Apply override to recommendation score
 * @param {Object} recommendation - Original recommendation
 * @param {Object} override - Override data
 * @returns {Object} - Modified recommendation
 */
const applyOverride = (recommendation, override) => {
  return {
    ...recommendation,
    finalScore: override.newScore !== undefined ? override.newScore : recommendation.finalScore,
    overridden: true,
    overrideInfo: {
      action: override.action,
      reason: override.reason,
      appliedBy: override.practitionerId,
      appliedAt: override.appliedAt,
      originalScore: recommendation.finalScore
    },
    reasons: [
      ...recommendation.reasons,
      `⚕️ Practitioner Override: ${override.reason}`
    ]
  };
};

/**
 * Get overrides for a specific user
 * @param {String} userId - User ID
 * @returns {Array} - List of overrides
 */
const getUserOverrides = async (userId) => {
  const overrides = await AuditLog.find({
    action: 'PRACTITIONER_OVERRIDE',
    'changes.targetUser': userId
  }).sort({ timestamp: -1 }).limit(50);

  return overrides.map(log => ({
    overrideId: log._id,
    action: log.changes.overrideAction,
    reason: log.changes.reason,
    itemId: log.documentId,
    itemType: log.collection,
    appliedBy: log.userId,
    appliedAt: log.timestamp,
    scoring: log.changes.scoring
  }));
};

/**
 * Check if override exists
 * @param {String} userId - User ID
 * @param {String} itemId - Food or Recipe ID
 * @returns {Object|null} - Override info or null
 */
const getOverride = async (userId, itemId) => {
  const override = await AuditLog.findOne({
    action: 'PRACTITIONER_OVERRIDE',
    'changes.targetUser': userId,
    documentId: itemId
  }).sort({ timestamp: -1 });

  if (!override) return null;

  return {
    overrideId: override._id,
    action: override.changes.overrideAction,
    reason: override.changes.reason,
    appliedBy: override.userId,
    appliedAt: override.timestamp,
    scoring: override.changes.scoring
  };
};

module.exports = {
  createOverride,
  applyOverride,
  getUserOverrides,
  getOverride
};

// Export all models from a single file
const User = require('./User');
const HealthProfile = require('./HealthProfile');
const Practitioner = require('./Practitioner');
const Food = require('./Food');
const Recipe = require('./Recipe');
const DietPlan = require('./DietPlan');
const AuditLog = require('./AuditLog');
const MedicalCondition = require('./MedicalCondition');
const SystemConfig = require('./SystemConfig');

module.exports = {
  User,
  HealthProfile,
  Practitioner,
  Food,
  Recipe,
  DietPlan,
  AuditLog,
  MedicalCondition,
  SystemConfig
};

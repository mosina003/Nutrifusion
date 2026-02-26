/**
 * Intelligence Service - Main Export
 * 
 * Exports organized diet services for all medical frameworks:
 * - Ayurveda: Dosha-based diet planning
 * - Unani: Mizaj-based diet planning
 * - TCM: Yin-Yang and Five Elements diet planning
 * - Modern: Evidence-based clinical nutrition
 * 
 * Each framework follows the same pattern:
 * - DietEngine: Food scoring logic
 * - DietPlanService: Orchestration and preferences
 * - MealPlan: 7-day meal plan generation
 * 
 * Version: 2.0
 * Last Updated: 2026-02-24
 */

// Ayurveda Diet Services
const AyurvedaDietEngine = require('./diet/ayurvedaDietEngine');
const AyurvedaDietPlanService = require('./diet/ayurvedaDietPlanService');
const AyurvedaMealPlan = require('./diet/ayurvedaMealPlan');

// Unani Diet Services
const UnaniDietEngine = require('./diet/unaniDietEngine');
const UnaniDietPlanService = require('./diet/unaniDietPlanService');
const UnaniMealPlan = require('./diet/unaniMealPlan');

// TCM Diet Services
const TcmDietEngine = require('./diet/tcmDietEngine');
const TcmDietPlanService = require('./diet/tcmDietPlanService');
const TcmMealPlan = require('./diet/tcmMealPlan');

// Modern Clinical Diet Services
const ModernDietEngine = require('./diet/modernDietEngine');
const ModernDietPlanService = require('./diet/modernDietPlanService');
const ModernMealPlan = require('./diet/modernMealPlan');

module.exports = {
  // Ayurveda Diet Services
  AyurvedaDiet: {
    Engine: AyurvedaDietEngine,
    PlanService: AyurvedaDietPlanService,
    MealPlan: AyurvedaMealPlan
  },
  
  // Unani Diet Services
  UnaniDiet: {
    Engine: UnaniDietEngine,
    PlanService: UnaniDietPlanService,
    MealPlan: UnaniMealPlan
  },
  
  // TCM Diet Services
  TcmDiet: {
    Engine: TcmDietEngine,
    PlanService: TcmDietPlanService,
    MealPlan: TcmMealPlan
  },
  
  // Modern Clinical Diet Services
  ModernDiet: {
    Engine: ModernDietEngine,
    PlanService: ModernDietPlanService,
    MealPlan: ModernMealPlan
  }
};

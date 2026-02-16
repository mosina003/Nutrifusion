/**
 * Assessment Engine Factory
 * Dynamically loads the appropriate assessment engine based on framework
 */

const ayurvedaEngine = require('./ayurveda');
const unaniEngine = require('./unani');
const tcmEngine = require('./tcm');
const modernEngine = require('./modern');

class AssessmentEngineFactory {
  /**
   * Get the appropriate assessment engine for a framework
   * @param {string} framework - The medical framework identifier
   * @returns {Object} Assessment engine instance
   */
  static getEngine(framework) {
    const engines = {
      ayurveda: ayurvedaEngine,
      unani: unaniEngine,
      tcm: tcmEngine,
      modern: modernEngine
    };

    const engine = engines[framework];
    if (!engine) {
      throw new Error(`Unknown assessment framework: ${framework}`);
    }

    return engine;
  }

  /**
   * Get list of available frameworks
   * @returns {Array} List of framework identifiers
   */
  static getAvailableFrameworks() {
    return [
      {
        id: 'ayurveda',
        label: 'Ayurveda',
        description: 'Ancient Indian system focusing on constitutional balance (Doshas)'
      },
      {
        id: 'unani',
        label: 'Unani',
        description: 'Greco-Arabic medicine focusing on temperament (Mizaj)'
      },
      {
        id: 'tcm',
        label: 'Traditional Chinese Medicine',
        description: 'Chinese system focusing on energy patterns and balance'
      },
      {
        id: 'modern',
        label: 'Modern Clinical Nutrition',
        description: 'Evidence-based nutrition with clinical calculations'
      }
    ];
  }

  /**
   * Process a complete assessment
   * @param {string} framework - The medical framework
   * @param {Object} responses - User responses
   * @param {Object} userInfo - Additional user information
   * @returns {Object} Complete assessment result
   */
  static async processAssessment(framework, responses, userInfo = {}) {
    const engine = this.getEngine(framework);

    // Get question bank to validate against
    const questionBank = require('./questionBanks')[framework];
    const requiredQuestions = questionBank.questions.map(q => q.id);

    // Validate responses
    const validation = engine.validateResponses(responses, requiredQuestions);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Score the assessment
    const scores = engine.score(responses);

    // Generate health profile
    const healthProfile = engine.generateHealthProfile(scores, responses);

    // Generate nutrition inputs
    const nutritionInputs = engine.generateNutritionInputs(scores, healthProfile);

    return {
      framework,
      scores,
      healthProfile,
      nutritionInputs,
      completedAt: new Date()
    };
  }
}

module.exports = AssessmentEngineFactory;

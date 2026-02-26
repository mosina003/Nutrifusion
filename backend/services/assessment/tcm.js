/**
 * Traditional Chinese Medicine (TCM) Assessment Engine
 * Pattern-based diagnosis focusing on:
 * - Cold/Heat patterns
 * - Qi deficiency/excess
 * - Dampness/Dryness
 * - Liver Qi stagnation/Heat
 */

class TCMEngine {
  constructor() {
    this.patternTypes = [
      'Cold Pattern',
      'Heat Pattern',
      'Qi Deficiency',
      'Qi Excess',
      'Dampness',
      'Dryness',
      'Liver Qi Stagnation',
      'Liver Heat',
      'Yin Deficiency',
      'Yang Deficiency'
    ];
  }

  /**
   * Score TCM assessment responses based on pattern recognition
   * @param {Object} responses - User responses with question IDs and answers
   * @returns {Object} Pattern analysis with primary/secondary patterns
   */
  score(responses) {
    const patternCounts = {
      cold: 0,
      heat: 0,
      qi_deficiency: 0,
      qi_excess: 0,
      dampness: 0,
      dryness: 0,
      qi_stagnation: 0,
      liver_heat: 0,
      balanced: 0
    };

    const sectionScores = {
      A: { cold: 0, heat: 0, balanced: 0 },
      B: { qi_deficiency: 0, qi_excess: 0, heat: 0, balanced: 0 },
      C: { dampness: 0, heat: 0, balanced: 0 },
      D: { qi_stagnation: 0, heat: 0, qi_deficiency: 0, cold: 0, balanced: 0 }
    };

    // Process each response
    Object.entries(responses).forEach(([questionId, answer]) => {
      if (!answer || !answer.pattern || !answer.weight) return;

      const pattern = answer.pattern;
      const weight = answer.weight;
      const section = answer.section || this._getSection(questionId);

      // Increment pattern count
      if (patternCounts.hasOwnProperty(pattern)) {
        patternCounts[pattern] += weight;
      }

      // Track by section for detailed analysis
      if (section && sectionScores[section]) {
        if (sectionScores[section].hasOwnProperty(pattern)) {
          sectionScores[section][pattern] += weight;
        }
      }
    });

    // Determine Cold/Heat tendency (Section A)
    const coldHeatResult = this._determineColdHeat(sectionScores.A);

    // Determine Qi pattern (Section B)
    const qiPattern = this._determineQiPattern(sectionScores.B);

    // Determine Dampness pattern (Section C)
    const dampnessPattern = this._determineDampnessPattern(sectionScores.C);

    // Determine Liver pattern (Section D)
    const liverPattern = this._determineLiverPattern(sectionScores.D);

    // Aggregate all patterns to find primary and secondary
    const aggregatedPatterns = {
      'Cold Pattern': patternCounts.cold,
      'Heat Pattern': patternCounts.heat,
      'Qi Deficiency': patternCounts.qi_deficiency,
      'Qi Excess': patternCounts.qi_excess || patternCounts.heat, // Heat can indicate Qi excess
      'Dampness': patternCounts.dampness,
      'Dryness': patternCounts.heat, // Heat often causes dryness
      'Liver Qi Stagnation': patternCounts.qi_stagnation,
      'Liver Heat': patternCounts.heat, // From section D
      'Yin Deficiency': Math.max(patternCounts.heat, 0),
      'Yang Deficiency': patternCounts.cold + patternCounts.qi_deficiency
    };

    // Sort patterns by score
    const sortedPatterns = Object.entries(aggregatedPatterns)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0);

    const primaryPattern = sortedPatterns[0] ? sortedPatterns[0][0] : 'Balanced';
    const primaryScore = sortedPatterns[0] ? sortedPatterns[0][1] : 0;
    const secondaryPattern = sortedPatterns[1] ? sortedPatterns[1][0] : null;
    const secondaryScore = sortedPatterns[1] ? sortedPatterns[1][1] : 0;

    // Calculate severity (1-3 scale)
    const scoreDifference = primaryScore - secondaryScore;
    let severity = 1; // Mild
    if (scoreDifference >= 5) severity = 3; // Strong
    else if (scoreDifference >= 3) severity = 2; // Moderate

    return {
      primary_pattern: primaryPattern,
      secondary_pattern: secondaryPattern,
      cold_heat: coldHeatResult,
      severity: severity,
      pattern_scores: aggregatedPatterns,
      section_analysis: {
        cold_heat: coldHeatResult,
        qi: qiPattern,
        dampness: dampnessPattern,
        liver: liverPattern
      },
      score_difference: scoreDifference,
      balance_indicator: this._getSeverityLabel(severity)
    };
  }

  /**
   * Get section from question ID
   */
  _getSection(questionId) {
    const qNum = parseInt(questionId.replace('tcm_q', ''));
    if (qNum >= 1 && qNum <= 5) return 'A';
    if (qNum >= 6 && qNum <= 10) return 'B';
    if (qNum >= 11 && qNum <= 15) return 'C';
    if (qNum >= 16 && qNum <= 20) return 'D';
    return null;
  }

  /**
   * Determine Cold/Heat pattern from Section A
   */
  _determineColdHeat(sectionA) {
    const { cold, heat, balanced } = sectionA;
    
    if (balanced > cold && balanced > heat) return 'Balanced';
    if (cold > heat) return 'Cold';
    if (heat > cold) return 'Heat';
    return 'Balanced';
  }

  /**
   * Determine Qi pattern from Section B
   */
  _determineQiPattern(sectionB) {
    const { qi_deficiency, heat, balanced } = sectionB;
    const qi_excess = heat; // Heat symptoms in section B indicate Qi excess
    
    if (balanced > qi_deficiency && balanced > qi_excess) return 'Balanced';
    if (qi_deficiency > qi_excess) return 'Qi Deficiency';
    if (qi_excess > qi_deficiency) return 'Qi Excess';
    return 'Balanced';
  }

  /**
   * Determine Dampness pattern from Section C
   */
  _determineDampnessPattern(sectionC) {
    const { dampness, heat, balanced } = sectionC;
    
    if (balanced > dampness && balanced > heat) return 'Balanced';
    if (dampness > heat) return 'Dampness';
    if (heat > dampness) return 'Heat/Dryness';
    return 'Balanced';
  }

  /**
   * Determine Liver pattern from Section D
   */
  _determineLiverPattern(sectionD) {
    const { qi_stagnation, heat, balanced } = sectionD;
    
    if (balanced > qi_stagnation && balanced > heat) return 'Balanced';
    if (qi_stagnation > heat) return 'Liver Qi Stagnation';
    if (heat > qi_stagnation) return 'Liver Heat';
    return 'Balanced';
  }

  /**
   * Get severity label
   */
  _getSeverityLabel(severity) {
    const labels = { 1: 'mild', 2: 'moderate', 3: 'strong' };
    return labels[severity] || 'mild';
  }

  /**
   * Generate health profile from scores
   */
  generateHealthProfile(scores, userInfo) {
    const profile = {
      framework: 'tcm',
      pattern: {
        primary: scores.primary_pattern,
        secondary: scores.secondary_pattern,
        cold_heat_tendency: scores.cold_heat,
        severity: scores.severity,
        balance_status: scores.balance_indicator
      },
      section_analysis: scores.section_analysis,
      detailed_patterns: scores.pattern_scores,
      recommendations: this._generateRecommendations(scores),
      timestamp: new Date().toISOString()
    };

    return profile;
  }

  /**
   * Generate basic recommendations based on patterns
   */
  _generateRecommendations(scores) {
    const recommendations = [];

    // Cold/Heat recommendations
    if (scores.cold_heat === 'Cold') {
      recommendations.push('Focus on warming foods and avoid cold/raw foods');
      recommendations.push('Prefer cooked, warm meals over salads and cold beverages');
    } else if (scores.cold_heat === 'Heat') {
      recommendations.push('Focus on cooling foods and avoid hot/spicy foods');
      recommendations.push('Include more cool-natured vegetables and fruits');
    }

    // Qi recommendations
    if (scores.primary_pattern === 'Qi Deficiency') {
      recommendations.push('Eat Qi-tonifying foods like whole grains, root vegetables, and lean proteins');
      recommendations.push('Avoid overeating and eat regular, moderate meals');
    }

    // Dampness recommendations
    if (scores.primary_pattern === 'Dampness') {
      recommendations.push('Reduce sweet, greasy, and dairy-heavy foods');
      recommendations.push('Increase dampness-resolving foods like barley, adzuki beans, and bitter greens');
    }

    // Liver recommendations
    if (scores.section_analysis.liver === 'Liver Qi Stagnation') {
      recommendations.push('Include Qi-moving foods like citrus, radish, and aromatic herbs');
      recommendations.push('Practice stress management and regular physical activity');
    }

    return recommendations;
  }
}

module.exports = new TCMEngine();

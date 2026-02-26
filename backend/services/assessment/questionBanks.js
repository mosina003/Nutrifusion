/**
 * Assessment Question Banks
 * Comprehensive question sets for all four medical frameworks
 */

module.exports = {
  /**
   * AYURVEDA QUESTION BANK
   * 18 questions across 3 sections
   * Section A: Body & Constitution (Q1-Q6)
   * Section B: Digestion & Metabolism (Q7-Q12)
   * Section C: Mental & Emotional Tendencies (Q13-Q18)
   */
  ayurveda: {
    framework: 'ayurveda',
    totalQuestions: 18,
    categories: {
      body_constitution: { name: 'Body & Constitution', questionIds: ['ay_q1', 'ay_q2', 'ay_q3', 'ay_q4', 'ay_q5', 'ay_q6'] },
      digestion_metabolism: { name: 'Digestion & Metabolism', questionIds: ['ay_q7', 'ay_q8', 'ay_q9', 'ay_q10', 'ay_q11', 'ay_q12'] },
      mental_emotional: { name: 'Mental & Emotional Tendencies', questionIds: ['ay_q13', 'ay_q14', 'ay_q15', 'ay_q16', 'ay_q17', 'ay_q18'] }
    },
    questions: [
      // SECTION A — Body & Constitution (6 Questions)
      {
        id: 'ay_q1',
        category: 'body_constitution',
        section: 'A',
        question: 'My body frame is:',
        options: [
          { text: 'Thin, light, small bones', dosha: 'vata', weight: 1 },
          { text: 'Medium build, athletic', dosha: 'pitta', weight: 1 },
          { text: 'Broad, solid, heavy', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q2',
        category: 'body_constitution',
        section: 'A',
        question: 'My skin is usually:',
        options: [
          { text: 'Dry, rough, cool', dosha: 'vata', weight: 1 },
          { text: 'Warm, slightly oily, prone to redness', dosha: 'pitta', weight: 1 },
          { text: 'Smooth, moist, thick', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q3',
        category: 'body_constitution',
        section: 'A',
        question: 'My hair is:',
        options: [
          { text: 'Dry, thin, frizzy', dosha: 'vata', weight: 1 },
          { text: 'Fine, straight, may gray early', dosha: 'pitta', weight: 1 },
          { text: 'Thick, oily, wavy', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q4',
        category: 'body_constitution',
        section: 'A',
        question: 'I gain weight:',
        options: [
          { text: 'Very difficult to gain', dosha: 'vata', weight: 1 },
          { text: 'Moderate, depends on diet', dosha: 'pitta', weight: 1 },
          { text: 'Easily and hard to lose', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q5',
        category: 'body_constitution',
        section: 'A',
        question: 'My natural energy pattern is:',
        options: [
          { text: 'High bursts, then crash', dosha: 'vata', weight: 1 },
          { text: 'Steady and strong', dosha: 'pitta', weight: 1 },
          { text: 'Slow but long-lasting', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q6',
        category: 'body_constitution',
        section: 'A',
        question: 'My body temperature:',
        options: [
          { text: 'Feel cold easily', dosha: 'vata', weight: 1 },
          { text: 'Feel hot easily', dosha: 'pitta', weight: 1 },
          { text: 'Comfortable but dislike damp cold', dosha: 'kapha', weight: 1 }
        ]
      },

      // SECTION B — Digestion & Metabolism (6 Questions)
      {
        id: 'ay_q7',
        category: 'digestion_metabolism',
        section: 'B',
        question: 'My appetite is:',
        options: [
          { text: 'Irregular', dosha: 'vata', weight: 1 },
          { text: 'Strong and sharp', dosha: 'pitta', weight: 1 },
          { text: 'Slow but steady', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q8',
        category: 'digestion_metabolism',
        section: 'B',
        question: 'If I skip a meal:',
        options: [
          { text: 'I feel anxious or shaky', dosha: 'vata', weight: 1 },
          { text: 'I get irritable or angry', dosha: 'pitta', weight: 1 },
          { text: 'I feel fine', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q9',
        category: 'digestion_metabolism',
        section: 'B',
        question: 'After eating I usually feel:',
        options: [
          { text: 'Bloated or gassy', dosha: 'vata', weight: 1 },
          { text: 'Hot or acidic', dosha: 'pitta', weight: 1 },
          { text: 'Heavy or sleepy', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q10',
        category: 'digestion_metabolism',
        section: 'B',
        question: 'My bowel movement is:',
        options: [
          { text: 'Dry, irregular', dosha: 'vata', weight: 1 },
          { text: 'Loose or frequent', dosha: 'pitta', weight: 1 },
          { text: 'Well-formed but slow', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q11',
        category: 'digestion_metabolism',
        section: 'B',
        question: 'I crave:',
        options: [
          { text: 'Warm, salty foods', dosha: 'vata', weight: 1 },
          { text: 'Cool, sweet foods', dosha: 'pitta', weight: 1 },
          { text: 'Spicy, stimulating foods', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q12',
        category: 'digestion_metabolism',
        section: 'B',
        question: 'My digestion feels:',
        options: [
          { text: 'Unpredictable', dosha: 'vata', weight: 1 },
          { text: 'Fast and intense', dosha: 'pitta', weight: 1 },
          { text: 'Slow but stable', dosha: 'kapha', weight: 1 }
        ]
      },

      // SECTION C — Mental & Emotional Tendencies (6 Questions)
      {
        id: 'ay_q13',
        category: 'mental_emotional',
        section: 'C',
        question: 'Under stress I become:',
        options: [
          { text: 'Anxious or fearful', dosha: 'vata', weight: 1 },
          { text: 'Irritated or angry', dosha: 'pitta', weight: 1 },
          { text: 'Withdrawn or lethargic', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q14',
        category: 'mental_emotional',
        section: 'C',
        question: 'My thinking style:',
        options: [
          { text: 'Creative but scattered', dosha: 'vata', weight: 1 },
          { text: 'Sharp and focused', dosha: 'pitta', weight: 1 },
          { text: 'Slow but steady', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q15',
        category: 'mental_emotional',
        section: 'C',
        question: 'My sleep:',
        options: [
          { text: 'Light and interrupted', dosha: 'vata', weight: 1 },
          { text: 'Moderate and vivid dreams', dosha: 'pitta', weight: 1 },
          { text: 'Deep and long', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q16',
        category: 'mental_emotional',
        section: 'C',
        question: 'My speech pattern:',
        options: [
          { text: 'Fast and enthusiastic', dosha: 'vata', weight: 1 },
          { text: 'Precise and direct', dosha: 'pitta', weight: 1 },
          { text: 'Calm and slow', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q17',
        category: 'mental_emotional',
        section: 'C',
        question: 'I prefer weather that is:',
        options: [
          { text: 'Warm', dosha: 'vata', weight: 1 },
          { text: 'Cool', dosha: 'pitta', weight: 1 },
          { text: 'Dry and warm', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q18',
        category: 'mental_emotional',
        section: 'C',
        question: 'My memory:',
        options: [
          { text: 'Quick to learn, quick to forget', dosha: 'vata', weight: 1 },
          { text: 'Moderate learning, good retention', dosha: 'pitta', weight: 1 },
          { text: 'Slow to learn, long retention', dosha: 'kapha', weight: 1 }
        ]
      }
    ]
  },

  /**
   * UNANI QUESTION BANK
   * 20 questions across 4 sections
   * Based on Mizaj (Hot/Cold + Moist/Dry) and Akhlat (Four Humors)
   * Section A: Heat & Cold Dominance (Q1-Q5)
   * Section B: Moisture & Dryness Patterns (Q6-Q10)
   * Section C: Humor-Specific Symptoms (Q11-Q15)
   * Section D: Digestive & Organ Strength (Q16-Q20)
   * 
   * Scoring Map:
   * A = Dam (Hot + Moist)
   * B = Safra (Hot + Dry)
   * C = Balgham (Cold + Moist)
   * D = Sauda (Cold + Dry)
   */
  unani: {
    framework: 'unani',
    totalQuestions: 20,
    categories: {
      heat_cold_dominance: { name: 'Heat & Cold Dominance', questionIds: ['un_q1', 'un_q2', 'un_q3', 'un_q4', 'un_q5'] },
      moisture_dryness: { name: 'Moisture & Dryness Patterns', questionIds: ['un_q6', 'un_q7', 'un_q8', 'un_q9', 'un_q10'] },
      humor_symptoms: { name: 'Humor-Specific Symptoms', questionIds: ['un_q11', 'un_q12', 'un_q13', 'un_q14', 'un_q15'], weight: 2 },
      digestive_organ: { name: 'Digestive & Organ Strength', questionIds: ['un_q16', 'un_q17', 'un_q18', 'un_q19', 'un_q20'], weight: 2 }
    },
    questions: [
      // SECTION A — Heat & Cold Dominance (5 Questions)
      {
        id: 'un_q1',
        category: 'heat_cold_dominance',
        section: 'A',
        question: 'My body generally feels:',
        options: [
          { text: 'Warm and lively', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Hot and intense', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Cool and heavy', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Cold and tense', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q2',
        category: 'heat_cold_dominance',
        section: 'A',
        question: 'I usually prefer:',
        options: [
          { text: 'Cool drinks occasionally', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Very cold drinks', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Warm drinks', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Hot drinks', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q3',
        category: 'heat_cold_dominance',
        section: 'A',
        question: 'In summer I:',
        options: [
          { text: 'Feel slightly uncomfortable', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Feel extremely irritated', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Feel comfortable', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Feel weak but stable', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q4',
        category: 'heat_cold_dominance',
        section: 'A',
        question: 'In winter I:',
        options: [
          { text: 'Feel comfortable', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Feel energized and warm', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Feel very sluggish', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Feel stiff and uncomfortable', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q5',
        category: 'heat_cold_dominance',
        section: 'A',
        question: 'My hands and feet are usually:',
        options: [
          { text: 'Warm', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Hot', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Cool', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Cold', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },

      // SECTION B — Moisture & Dryness Patterns (5 Questions)
      {
        id: 'un_q6',
        category: 'moisture_dryness',
        section: 'B',
        question: 'My skin tends to be:',
        options: [
          { text: 'Slightly moist', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Dry but warm', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Oily or clammy', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Very dry', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q7',
        category: 'moisture_dryness',
        section: 'B',
        question: 'My lips and mouth:',
        options: [
          { text: 'Normal', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Often dry', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Moist or excessive saliva', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Very dry and cracked', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q8',
        category: 'moisture_dryness',
        section: 'B',
        question: 'My stool consistency:',
        options: [
          { text: 'Balanced', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Loose due to heat', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Sticky or mucus-like', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Hard and dry', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q9',
        category: 'moisture_dryness',
        section: 'B',
        question: 'I experience mucus congestion:',
        options: [
          { text: 'Rarely', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Rarely', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Frequently', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Almost never', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q10',
        category: 'moisture_dryness',
        section: 'B',
        question: 'My joints:',
        options: [
          { text: 'Flexible', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Inflamed occasionally', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Heavy or stiff', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Dry and cracking', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },

      // SECTION C — Humor-Specific Symptoms (5 Questions, Weight: 2x)
      {
        id: 'un_q11',
        category: 'humor_symptoms',
        section: 'C',
        question: 'I tend to develop:',
        options: [
          { text: 'Redness or fullness', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Acidity or burning', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Cold, cough, sinus', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Dark circles or constipation', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q12',
        category: 'humor_symptoms',
        section: 'C',
        question: 'My emotional tendency:',
        options: [
          { text: 'Optimistic', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Easily angered', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Lazy or calm', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Worried or melancholic', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q13',
        category: 'humor_symptoms',
        section: 'C',
        question: 'When sick, I usually have:',
        options: [
          { text: 'Fever with redness', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'High fever with dryness', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Phlegm and heaviness', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Weakness and dryness', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q14',
        category: 'humor_symptoms',
        section: 'C',
        question: 'My sleep:',
        options: [
          { text: 'Good and refreshing', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Disturbed due to heat', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Excessive and heavy', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Light and overthinking', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q15',
        category: 'humor_symptoms',
        section: 'C',
        question: 'My body odor:',
        options: [
          { text: 'Moderate', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Strong and sharp', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Mild', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Very little', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },

      // SECTION D — Digestive & Organ Strength (5 Questions, Weight: 2x)
      {
        id: 'un_q16',
        category: 'digestive_organ',
        section: 'D',
        question: 'After meals I feel:',
        options: [
          { text: 'Comfortable', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Heat or burning', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Heavy and sluggish', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Bloated and dry', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q17',
        category: 'digestive_organ',
        section: 'D',
        question: 'I tolerate fatty foods:',
        options: [
          { text: 'Well', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Causes heat', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Causes heaviness', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Causes discomfort', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q18',
        category: 'digestive_organ',
        section: 'D',
        question: 'I feel thirsty:',
        options: [
          { text: 'Normally', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Excessively', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Rarely', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Mildly but frequently', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q19',
        category: 'digestive_organ',
        section: 'D',
        question: 'My urine color is usually:',
        options: [
          { text: 'Normal yellow', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Dark yellow', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Pale', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Scanty and dark', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      },
      {
        id: 'un_q20',
        category: 'digestive_organ',
        section: 'D',
        question: 'My mental focus:',
        options: [
          { text: 'Active and social', humor: 'dam', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Sharp but impatient', humor: 'safra', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Slow but calm', humor: 'balgham', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Deep but serious', humor: 'sauda', heat: 0, cold: 1, dry: 1, moist: 0 }
        ]
      }
    ]
  },

  /**
   * TCM QUESTION BANK
   * 18 questions across 5 pattern categories
   */
  /**
   * TCM (Traditional Chinese Medicine) QUESTION BANK
   * 20 questions across 4 sections
   * Section A: Cold vs Heat Pattern (Q1-Q5)
   * Section B: Qi & Energy (Q6-Q10)
   * Section C: Dampness & Phlegm (Q11-Q15)
   * Section D: Liver & Emotional Pattern (Q16-Q20)
   */
  tcm: {
    framework: 'tcm',
    totalQuestions: 20,
    categories: {
      cold_heat_pattern: { name: 'Cold vs Heat Pattern', questionIds: ['tcm_q1', 'tcm_q2', 'tcm_q3', 'tcm_q4', 'tcm_q5'] },
      qi_energy: { name: 'Qi & Energy', questionIds: ['tcm_q6', 'tcm_q7', 'tcm_q8', 'tcm_q9', 'tcm_q10'] },
      dampness_phlegm: { name: 'Dampness & Phlegm', questionIds: ['tcm_q11', 'tcm_q12', 'tcm_q13', 'tcm_q14', 'tcm_q15'] },
      liver_emotional: { name: 'Liver & Emotional Pattern', questionIds: ['tcm_q16', 'tcm_q17', 'tcm_q18', 'tcm_q19', 'tcm_q20'] }
    },
    questions: [
      // SECTION A — Cold vs Heat Pattern (Q1-Q5)
      {
        id: 'tcm_q1',
        category: 'cold_heat_pattern',
        section: 'A',
        question: 'My body usually feels:',
        options: [
          { text: 'Cold easily', pattern: 'cold', weight: 2 },
          { text: 'Hot easily', pattern: 'heat', weight: 2 },
          { text: 'Normal', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q2',
        category: 'cold_heat_pattern',
        section: 'A',
        question: 'I prefer drinks that are:',
        options: [
          { text: 'Hot', pattern: 'cold', weight: 1 },
          { text: 'Cold', pattern: 'heat', weight: 1 },
          { text: 'Room temperature', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q3',
        category: 'cold_heat_pattern',
        section: 'A',
        question: 'My face complexion tends to be:',
        options: [
          { text: 'Pale', pattern: 'cold', weight: 2 },
          { text: 'Red', pattern: 'heat', weight: 2 },
          { text: 'Normal', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q4',
        category: 'cold_heat_pattern',
        section: 'A',
        question: 'My hands and feet are:',
        options: [
          { text: 'Cold', pattern: 'cold', weight: 2 },
          { text: 'Warm/Hot', pattern: 'heat', weight: 2 },
          { text: 'Neutral', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q5',
        category: 'cold_heat_pattern',
        section: 'A',
        question: 'I feel better with:',
        options: [
          { text: 'Warm environment', pattern: 'cold', weight: 2 },
          { text: 'Cool environment', pattern: 'heat', weight: 2 },
          { text: 'Either', pattern: 'balanced', weight: 0 }
        ]
      },

      // SECTION B — Qi & Energy (Q6-Q10)
      {
        id: 'tcm_q6',
        category: 'qi_energy',
        section: 'B',
        question: 'My energy level is:',
        options: [
          { text: 'Easily tired', pattern: 'qi_deficiency', weight: 2 },
          { text: 'Restless and wired', pattern: 'heat', weight: 1 },
          { text: 'Balanced', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q7',
        category: 'qi_energy',
        section: 'B',
        question: 'After meals I feel:',
        options: [
          { text: 'Heavy and bloated', pattern: 'dampness', weight: 2 },
          { text: 'Burning or acid', pattern: 'heat', weight: 2 },
          { text: 'Comfortable', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q8',
        category: 'qi_energy',
        section: 'B',
        question: 'My voice is:',
        options: [
          { text: 'Soft or weak', pattern: 'qi_deficiency', weight: 2 },
          { text: 'Loud and forceful', pattern: 'heat', weight: 1 },
          { text: 'Normal', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q9',
        category: 'qi_energy',
        section: 'B',
        question: 'I sweat:',
        options: [
          { text: 'Easily with little effort', pattern: 'qi_deficiency', weight: 2 },
          { text: 'Excessively with heat', pattern: 'heat', weight: 2 },
          { text: 'Normally', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q10',
        category: 'qi_energy',
        section: 'B',
        question: 'My breathing feels:',
        options: [
          { text: 'Short or weak', pattern: 'qi_deficiency', weight: 2 },
          { text: 'Strong but sometimes hot', pattern: 'heat', weight: 1 },
          { text: 'Normal', pattern: 'balanced', weight: 0 }
        ]
      },

      // SECTION C — Dampness & Phlegm (Q11-Q15)
      {
        id: 'tcm_q11',
        category: 'dampness_phlegm',
        section: 'C',
        question: 'I experience:',
        options: [
          { text: 'Frequent mucus', pattern: 'dampness', weight: 2 },
          { text: 'Dry throat', pattern: 'heat', weight: 1 },
          { text: 'Neither', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q12',
        category: 'dampness_phlegm',
        section: 'C',
        question: 'My body feels:',
        options: [
          { text: 'Heavy', pattern: 'dampness', weight: 2 },
          { text: 'Dry', pattern: 'heat', weight: 1 },
          { text: 'Balanced', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q13',
        category: 'dampness_phlegm',
        section: 'C',
        question: 'My digestion:',
        options: [
          { text: 'Slow with loose stool', pattern: 'dampness', weight: 2 },
          { text: 'Fast with burning', pattern: 'heat', weight: 2 },
          { text: 'Regular', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q14',
        category: 'dampness_phlegm',
        section: 'C',
        question: 'I gain weight:',
        options: [
          { text: 'Easily', pattern: 'dampness', weight: 2 },
          { text: 'Rarely', pattern: 'heat', weight: 1 },
          { text: 'Moderately', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q15',
        category: 'dampness_phlegm',
        section: 'C',
        question: 'I have:',
        options: [
          { text: 'Swelling or water retention', pattern: 'dampness', weight: 2 },
          { text: 'Thirst and dryness', pattern: 'heat', weight: 2 },
          { text: 'Neither', pattern: 'balanced', weight: 0 }
        ]
      },

      // SECTION D — Liver & Emotional Pattern (Q16-Q20)
      {
        id: 'tcm_q16',
        category: 'liver_emotional',
        section: 'D',
        question: 'Under stress I:',
        options: [
          { text: 'Feel stuck or frustrated', pattern: 'qi_stagnation', weight: 2 },
          { text: 'Explode with anger', pattern: 'heat', weight: 2 },
          { text: 'Stay calm', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q17',
        category: 'liver_emotional',
        section: 'D',
        question: 'I experience:',
        options: [
          { text: 'Mood swings', pattern: 'qi_stagnation', weight: 2 },
          { text: 'Irritability with heat', pattern: 'heat', weight: 2 },
          { text: 'Stable mood', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q18',
        category: 'liver_emotional',
        section: 'D',
        question: 'My sleep:',
        options: [
          { text: 'Light and easily disturbed', pattern: 'qi_deficiency', weight: 2 },
          { text: 'Disturbed by heat or vivid dreams', pattern: 'heat', weight: 2 },
          { text: 'Restful', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q19',
        category: 'liver_emotional',
        section: 'D',
        question: 'My menstrual/digestive cramps:',
        options: [
          { text: 'Dull and better with warmth', pattern: 'cold', weight: 2 },
          { text: 'Sharp and worse with heat', pattern: 'heat', weight: 2 },
          { text: 'None', pattern: 'balanced', weight: 0 }
        ]
      },
      {
        id: 'tcm_q20',
        category: 'liver_emotional',
        section: 'D',
        question: 'My appetite:',
        options: [
          { text: 'Low', pattern: 'qi_deficiency', weight: 2 },
          { text: 'Strong with thirst', pattern: 'heat', weight: 2 },
          { text: 'Balanced', pattern: 'balanced', weight: 0 }
        ]
      }
    ]
  },

  /**
   * MODERN CLINICAL QUESTION BANK
   * 21 questions organized into 6 scoring domains
   * 
   * SECTION 1: Anthropometric & Energy Calculation (6 questions)
   * SECTION 2: Metabolic Risk Score (3 questions)
   * SECTION 3: Dietary Restriction Filter (2 questions)
   * SECTION 4: Lifestyle Load Score (7 questions)
   * SECTION 5: Digestive Function Score (1 question)
   * SECTION 6: Goal-Based Macro Strategy (2 questions)
   */
  modern: {
    framework: 'modern',
    totalQuestions: 21,
    scoringDomains: {
      anthropometric: {
        name: 'Anthropometric & Energy Calculation',
        questionIds: ['age', 'gender', 'height', 'weight', 'activity_level', 'lifestyle_context'],
        computations: {
          bmi: 'weight / (height/100)^2',
          bmr: 'Mifflin-St Jeor equation',
          tdee: 'BMR × activity_multiplier',
          weight_classification: '<18.5=Underweight, 18.5-24.9=Normal, 25-29.9=Overweight, 30+=Obese'
        },
        activityMultipliers: {
          sedentary: 1.2,
          lightly_active: 1.375,
          moderately_active: 1.55,
          very_active: 1.725,
          extremely_active: 1.9
        }
      },
      metabolic_risk: {
        name: 'Metabolic Risk Score',
        questionIds: ['medical_conditions', 'medications', 'waist_circumference'],
        riskPoints: {
          medical_conditions: {
            diabetes: 3,
            hypertension: 2,
            heart_disease: 3,
            kidney_disease: 3,
            liver_disease: 2,
            pcos: 2,
            anemia: 1,
            osteoporosis: 1
          },
          medications: {
            diabetes_meds: 2,
            blood_pressure_meds: 1,
            cholesterol_meds: 1,
            steroids: 2
          },
          waist_circumference: {
            male_high_risk: 102,
            female_high_risk: 88
          }
        },
        classification: {
          low: '0-2',
          moderate: '3-5',
          high: '6+'
        }
      },
      dietary_restriction: {
        name: 'Dietary Restriction Filter',
        questionIds: ['allergies', 'dietary_preference'],
        purpose: 'Creates hard constraints for food filtering',
        output: ['restricted_food_groups', 'diet_type']
      },
      lifestyle_load: {
        name: 'Lifestyle Load Score',
        questionIds: ['sleep_quality', 'sleep_duration', 'stress_level', 'hydration', 'meal_frequency', 'eating_patterns'],
        scorePoints: {
          sleep_duration: {
            '<5': 2,
            '5-6': 2,
            '6-7': 1,
            '7-8': 0,
            '8-9': 0,
            '>9': 1
          },
          stress_level: {
            very_low: 0,
            low: 0,
            moderate: 1,
            high: 2,
            very_high: 3
          },
          hydration: {
            '<4': 2,
            '4-6': 1,
            '6-8': 0,
            '8-10': 0,
            '>10': 0
          },
          eating_patterns: {
            late_night_eating: 2,
            binge_eating: 3,
            emotional_eating: 2,
            irregular_timing: 1
          }
        },
        classification: {
          stable: '0-2',
          moderate_dysregulation: '3-6',
          high_dysregulation: '7+'
        },
        influences: ['inflammatory_food_penalty', 'ultra_processed_penalty']
      },
      digestive_function: {
        name: 'Digestive Function Score',
        questionIds: ['digestive_issues'],
        scorePoints: {
          bloating: 1,
          gas: 1,
          constipation: 2,
          diarrhea: 2,
          heartburn: 2,
          nausea: 1
        },
        classification: {
          normal: 0,
          mild_sensitivity: '1-2',
          moderate_dysfunction: '3-4',
          high_instability: '5+'
        },
        impacts: ['high_fat_penalty', 'high_fodmap_penalty', 'fiber_adjustment']
      },
      goal_strategy: {
        name: 'Goal-Based Macro Strategy',
        questionIds: ['goals', 'supplements', 'physical_limitations'],
        macroStrategies: {
          weight_loss: {
            calorie_adjustment: -0.20,
            protein_per_kg: 1.8,
            carb_percentage: 35,
            fat_percentage: 25,
            fiber_target: 'high'
          },
          weight_gain: {
            calorie_adjustment: 0.15,
            protein_per_kg: 1.6,
            carb_percentage: 45,
            fat_percentage: 30
          },
          muscle_gain: {
            calorie_adjustment: 0.10,
            protein_per_kg: 2.0,
            carb_percentage: 40,
            fat_percentage: 30
          },
          maintain_weight: {
            calorie_adjustment: 0,
            protein_per_kg: 1.4,
            carb_percentage: 40,
            fat_percentage: 30
          },
          athletic_performance: {
            calorie_adjustment: 0.05,
            protein_per_kg: 1.6,
            carb_percentage: 50,
            fat_percentage: 25
          },
          general_health: {
            calorie_adjustment: 0,
            protein_per_kg: 1.2,
            carb_percentage: 40,
            fat_percentage: 30
          }
        }
      }
    },
    questions: [
      // ═══════════════════════════════════════════════════════════════
      // SECTION 1: ANTHROPOMETRIC & ENERGY CALCULATION (6 Questions)
      // Output: BMI, BMR, TDEE, Weight Classification
      // ═══════════════════════════════════════════════════════════════
      
      // Demographics
      {
        id: 'age',
        category: 'demographics',
        section: 1,
        question: 'What is your age?',
        type: 'number',
        validation: { min: 16, max: 120 },
        unit: 'years',
        required: true
      },
      {
        id: 'gender',
        category: 'demographics',
        section: 1,
        question: 'What is your biological sex?',
        type: 'select',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other/Prefer not to say' }
        ],
        required: true
      },
      {
        id: 'height',
        category: 'anthropometric',
        section: 1,
        question: 'What is your height?',
        type: 'number',
        validation: { min: 100, max: 250 },
        unit: 'cm',
        required: true
      },
      {
        id: 'weight',
        category: 'anthropometric',
        section: 1,
        question: 'What is your current weight?',
        type: 'number',
        validation: { min: 30, max: 300 },
        unit: 'kg',
        required: true
      },
      {
        id: 'waist_circumference',
        category: 'anthropometric',
        section: 1,
        question: 'What is your waist circumference? (Measure at navel level)',
        type: 'number',
        validation: { min: 50, max: 200 },
        unit: 'cm',
        required: false,
        helpText: 'Critical for metabolic syndrome risk assessment. Measure around your waist at navel level.'
      },

      // Activity Level
      {
        id: 'activity_level',
        category: 'lifestyle',
        section: 1,
        question: 'What is your typical activity level?',
        type: 'select',
        options: [
          { value: 'sedentary', label: 'Sedentary (little or no exercise, desk job)' },
          { value: 'lightly_active', label: 'Lightly Active (light exercise 1-3 days/week)' },
          { value: 'moderately_active', label: 'Moderately Active (moderate exercise 3-5 days/week)' },
          { value: 'very_active', label: 'Very Active (hard exercise 6-7 days/week)' },
          { value: 'extremely_active', label: 'Extremely Active (athlete, physical job + exercise)' }
        ],
        required: true
      },
      
      // Lifestyle Context
      {
        id: 'lifestyle_context',
        category: 'lifestyle',
        section: 1,
        question: 'What best describes your typical day?',
        type: 'select',
        options: [
          { value: 'sedentary_work', label: 'Mostly sitting (office work, studying)' },
          { value: 'standing_work', label: 'Mostly standing (retail, teaching)' },
          { value: 'physical_work', label: 'Physical labor (construction, nursing)' },
          { value: 'mixed', label: 'Mixed activities' },
          { value: 'retired_home', label: 'Retired/Home-based' },
          { value: 'student', label: 'Student' }
        ],
        required: true
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 2: METABOLIC RISK SCORE (3 Questions)
      // Output: metabolic_risk_level, risk_flags[]
      // Classification: Low (0-2), Moderate (3-5), High (6+)
      // ═══════════════════════════════════════════════════════════════

      // Medical Conditions
      {
        id: 'medical_conditions',
        category: 'medical',
        section: 2,
        question: 'Do you have any of the following medical conditions? (Select all that apply)',
        type: 'multiselect',
        options: [
          { value: 'diabetes', label: 'Diabetes or Prediabetes' },
          { value: 'hypertension', label: 'High Blood Pressure' },
          { value: 'heart_disease', label: 'Heart Disease' },
          { value: 'kidney_disease', label: 'Kidney Disease' },
          { value: 'liver_disease', label: 'Liver Disease' },
          { value: 'thyroid_disorder', label: 'Thyroid Disorder' },
          { value: 'digestive_disorder', label: 'Digestive Disorder (IBS, IBD, etc.)' },
          { value: 'pcos', label: 'PCOS' },
          { value: 'osteoporosis', label: 'Osteoporosis' },
          { value: 'anemia', label: 'Anemia' },
          { value: 'other', label: 'Other (please specify)' },
          { value: 'none', label: 'None of the above' }
        ],
        allowCustomInput: true,
        required: true
      },
      
      // Medications
      {
        id: 'medications',
        category: 'medical',
        section: 2,
        question: 'Are you currently taking any medications that might affect nutrition? (Select all that apply)',
        type: 'multiselect',
        options: [
          { value: 'diabetes_meds', label: 'Diabetes medications' },
          { value: 'blood_pressure_meds', label: 'Blood pressure medications' },
          { value: 'cholesterol_meds', label: 'Cholesterol medications' },
          { value: 'thyroid_meds', label: 'Thyroid medications' },
          { value: 'steroids', label: 'Steroids/Corticosteroids' },
          { value: 'antidepressants', label: 'Antidepressants' },
          { value: 'other', label: 'Other (please specify)' },
          { value: 'none', label: 'None' },
          { value: 'prefer_not_say', label: 'Prefer not to say' }
        ],
        allowCustomInput: true,
        required: false
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 3: DIETARY RESTRICTION FILTER (2 Questions)
      // Output: restricted_food_groups[], diet_type
      // Purpose: Creates hard constraints for food filtering
      // ═══════════════════════════════════════════════════════════════
      
      // Food Allergies
      {
        id: 'allergies',
        section: 3,
        category: 'dietary',
        question: 'Do you have any food allergies or intolerances? (Select all that apply)',
        type: 'multiselect',
        options: [
          { value: 'gluten', label: 'Gluten/Celiac Disease' },
          { value: 'dairy', label: 'Dairy/Lactose Intolerance' },
          { value: 'nuts', label: 'Tree Nuts' },
          { value: 'peanuts', label: 'Peanuts' },
          { value: 'shellfish', label: 'Shellfish' },
          { value: 'soy', label: 'Soy' },
          { value: 'eggs', label: 'Eggs' },
          { value: 'fish', label: 'Fish' },
          { value: 'other', label: 'Other (please specify)' },
          { value: 'none', label: 'None' }
        ],
        allowCustomInput: true,
        required: true
      },

      // Dietary Preference
      {
        id: 'dietary_preference',
        category: 'dietary',
        section: 3,
        question: 'What is your dietary preference?',
        type: 'select',
        options: [
          { value: 'balanced', label: 'Balanced/No specific diet' },
          { value: 'vegetarian', label: 'Vegetarian' },
          { value: 'vegan', label: 'Vegan' },
          { value: 'pescatarian', label: 'Pescatarian' },
          { value: 'keto', label: 'Ketogenic' },
          { value: 'low_carb', label: 'Low Carb' },
          { value: 'high_protein', label: 'High Protein' },
          { value: 'mediterranean', label: 'Mediterranean' },
          { value: 'paleo', label: 'Paleo' },
          { value: 'other', label: 'Other (please specify)' }
        ],
        allowCustomInput: true,
        required: true
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 4: LIFESTYLE LOAD SCORE (7 Questions)
      // Output: lifestyle_load_score, classification
      // Classification: Stable (0-2), Moderate (3-6), High (7+)
      // Influences: Inflammatory food penalty, Ultra-processed penalty
      // ═══════════════════════════════════════════════════════════════
      
      // Sleep Quality
      {
        id: 'sleep_quality',
        category: 'lifestyle',
        section: 4,
        question: 'How would you rate your sleep quality?',
        type: 'select',
        options: [
          { value: 'very_poor', label: 'Very Poor (frequent insomnia/disruption)' },
          { value: 'poor', label: 'Poor (often disrupted)' },
          { value: 'fair', label: 'Fair (sometimes disrupted)' },
          { value: 'good', label: 'Good (mostly restful)' },
          { value: 'excellent', label: 'Excellent (consistently restful)' }
        ],
        required: true
      },

      // Sleep Duration
      {
        id: 'sleep_duration',
        category: 'lifestyle',
        section: 4,
        question: 'How many hours of sleep do you typically get per night?',
        type: 'select',
        options: [
          { value: '<5', label: 'Less than 5 hours' },
          { value: '5-6', label: '5-6 hours' },
          { value: '6-7', label: '6-7 hours' },
          { value: '7-8', label: '7-8 hours' },
          { value: '8-9', label: '8-9 hours' },
          { value: '>9', label: 'More than 9 hours' }
        ],
        required: true
      },

      // Stress Level
      {
        id: 'stress_level',
        category: 'lifestyle',
        section: 4,
        question: 'How would you rate your current stress level?',
        type: 'select',
        options: [
          { value: 'very_low', label: 'Very Low - Minimal stress' },
          { value: 'low', label: 'Low - Occasional mild stress' },
          { value: 'moderate', label: 'Moderate - Regular manageable stress' },
          { value: 'high', label: 'High - Frequent significant stress' },
          { value: 'very_high', label: 'Very High - Constant overwhelming stress' }
        ],
        required: true
      },

      // Hydration
      {
        id: 'hydration',
        category: 'lifestyle',
        section: 4,
        question: 'How many glasses (250ml) of water do you drink per day?',
        type: 'select',
        options: [
          { value: '<4', label: 'Less than 4 glasses' },
          { value: '4-6', label: '4-6 glasses' },
          { value: '6-8', label: '6-8 glasses' },
          { value: '8-10', label: '8-10 glasses' },
          { value: '>10', label: 'More than 10 glasses' }
        ],
        required: true
      },

      // Meal Frequency
      {
        id: 'meal_frequency',
        category: 'eating_habits',
        section: 4,
        question: 'How many meals do you typically eat per day?',
        type: 'select',
        options: [
          { value: '1-2', label: '1-2 meals' },
          { value: '3', label: '3 meals' },
          { value: '4-5', label: '4-5 small meals' },
          { value: '6+', label: '6 or more meals/snacks' }
        ],
        required: true
      },

      // Eating Patterns
      {
        id: 'eating_patterns',
        category: 'eating_habits',
        section: 4,
        question: 'Do you experience any of these eating patterns? (Select all that apply)',
        type: 'multiselect',
        options: [
          { value: 'skip_breakfast', label: 'Frequently skip breakfast' },
          { value: 'late_night_eating', label: 'Eat late at night (after 9pm)' },
          { value: 'emotional_eating', label: 'Emotional eating' },
          { value: 'binge_eating', label: 'Occasional binge eating' },
          { value: 'irregular_timing', label: 'Irregular meal times' },
          { value: 'none', label: 'None of these' }
        ],
        required: true
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 5: DIGESTIVE FUNCTION SCORE (1 Question)
      // Output: digestive_score, classification
      // Classification: Normal (0), Mild (1-2), Moderate (3-4), High (5+)
      // Impacts: High-fat penalty, High-FODMAP penalty, Fiber adjustment
      // ═══════════════════════════════════════════════════════════════
      
      // Digestion
      {
        id: 'digestive_issues',
        section: 5,
        category: 'digestion',
        question: 'Do you experience any digestive issues? (Select all that apply)',
        type: 'multiselect',
        options: [
          { value: 'bloating', label: 'Bloating' },
          { value: 'gas', label: 'Excessive gas' },
          { value: 'constipation', label: 'Constipation' },
          { value: 'diarrhea', label: 'Diarrhea' },
          { value: 'heartburn', label: 'Heartburn/Acid reflux' },
          { value: 'nausea', label: 'Nausea' },
          { value: 'none', label: 'None' }
        ],
        required: true
      },

      // ═══════════════════════════════════════════════════════════════
      // SECTION 6: GOAL-BASED MACRO STRATEGY (3 Questions)
      // Output: calorie_target, macro_targets, supplement_context
      // Maps goals to specific calorie adjustments and macro ratios
      // ═══════════════════════════════════════════════════════════════
      
      // Health Goals
      {
        id: 'goals',
        section: 6,
        category: 'goals',
        question: 'What are your primary health/nutrition goals? (Select all that apply)',
        type: 'multiselect',
        options: [
          { value: 'weight_loss', label: 'Weight/Fat Loss' },
          { value: 'weight_gain', label: 'Weight/Mass Gain' },
          { value: 'muscle_gain', label: 'Muscle Building' },
          { value: 'maintain_weight', label: 'Maintain Current Weight' },
          { value: 'improve_energy', label: 'Improve Energy Levels' },
          { value: 'better_digestion', label: 'Better Digestion' },
          { value: 'manage_condition', label: 'Manage Medical Condition' },
          { value: 'athletic_performance', label: 'Athletic Performance' },
          { value: 'general_health', label: 'General Health & Wellness' },
          { value: 'other', label: 'Other (please specify)' }
        ],
        allowCustomInput: true,
        required: true
      },

      // Supplements
      {
        id: 'supplements',
        category: 'supplements',
        section: 6,
        question: 'Do you currently take any supplements? (Select all that apply)',
        type: 'multiselect',
        options: [
          { value: 'multivitamin', label: 'Multivitamin' },
          { value: 'vitamin_d', label: 'Vitamin D' },
          { value: 'omega_3', label: 'Omega-3/Fish Oil' },
          { value: 'protein_powder', label: 'Protein Powder' },
          { value: 'probiotics', label: 'Probiotics' },
          { value: 'iron', label: 'Iron' },
          { value: 'calcium', label: 'Calcium' },
          { value: 'b_vitamins', label: 'B-Vitamins' },
          { value: 'other', label: 'Other (please specify)' },
          { value: 'none', label: 'None' }
        ],
        allowCustomInput: true,
        required: false
      },

      // Physical Limitations
      {
        id: 'physical_limitations',
        category: 'physical',
        section: 6,
        question: 'Do you have any physical limitations that affect your activity? (Select all that apply)',
        type: 'multiselect',
        options: [
          { value: 'joint_pain', label: 'Joint pain/Arthritis' },
          { value: 'back_pain', label: 'Back pain' },
          { value: 'mobility_issues', label: 'Mobility issues' },
          { value: 'chronic_fatigue', label: 'Chronic fatigue' },
          { value: 'recent_surgery', label: 'Recent surgery/injury' },
          { value: 'other', label: 'Other (please specify)' },
          { value: 'none', label: 'None' }
        ],
        allowCustomInput: true,
        required: false
      }
    ]
  }
};

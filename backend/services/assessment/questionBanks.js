/**
 * Assessment Question Banks
 * Comprehensive question sets for all four medical frameworks
 */

module.exports = {
  /**
   * AYURVEDA QUESTION BANK
   * 18 questions across 5 categories
   */
  ayurveda: {
    framework: 'ayurveda',
    totalQuestions: 18,
    categories: {
      body_structure: { weight: 2 },
      digestion: { weight: 2 },
      energy: { weight: 1 },
      emotional: { weight: 1 },
      sleep_climate: { weight: 1 }
    },
    questions: [
      // Body Structure (weight 2)
      {
        id: 'ay_q1',
        category: 'body_structure',
        weight: 2,
        question: 'How would you describe your body frame?',
        options: [
          { text: 'Thin, light frame with prominent bones', dosha: 'vata', weight: 2 },
          { text: 'Medium build with good muscle development', dosha: 'pitta', weight: 2 },
          { text: 'Large, solid, well-built frame', dosha: 'kapha', weight: 2 }
        ]
      },
      {
        id: 'ay_q2',
        category: 'body_structure',
        weight: 2,
        question: 'What is your natural body weight tendency?',
        options: [
          { text: 'Difficulty gaining weight, stays thin easily', dosha: 'vata', weight: 2 },
          { text: 'Moderate weight, can gain or lose with effort', dosha: 'pitta', weight: 2 },
          { text: 'Gains weight easily, difficult to lose', dosha: 'kapha', weight: 2 }
        ]
      },
      {
        id: 'ay_q3',
        category: 'body_structure',
        weight: 2,
        question: 'How is your skin typically?',
        options: [
          { text: 'Dry, rough, thin, cool to touch', dosha: 'vata', weight: 2 },
          { text: 'Warm, oily, prone to redness/inflammation', dosha: 'pitta', weight: 2 },
          { text: 'Thick, moist, smooth, cool', dosha: 'kapha', weight: 2 }
        ]
      },

      // Digestion & Metabolism (weight 2)
      {
        id: 'ay_q4',
        category: 'digestion',
        weight: 2,
        question: 'How would you describe your appetite?',
        options: [
          { text: 'Variable - sometimes hungry, sometimes not', dosha: 'vata', weight: 2 },
          { text: 'Strong and regular - gets irritable if meal is missed', dosha: 'pitta', weight: 2 },
          { text: 'Steady but can skip meals without discomfort', dosha: 'kapha', weight: 2 }
        ]
      },
      {
        id: 'ay_q5',
        category: 'digestion',
        weight: 2,
        question: 'What is your typical digestion like?',
        options: [
          { text: 'Irregular - sometimes good, often gas/bloating', dosha: 'vata', weight: 2 },
          { text: 'Strong, quick - prone to acidity/heartburn', dosha: 'pitta', weight: 2 },
          { text: 'Slow and steady - may feel heavy after meals', dosha: 'kapha', weight: 2 }
        ]
      },
      {
        id: 'ay_q6',
        category: 'digestion',
        weight: 2,
        question: 'How is your bowel movement pattern?',
        options: [
          { text: 'Irregular, tends toward constipation, dry', dosha: 'vata', weight: 2 },
          { text: 'Regular, 2-3 times daily, may be loose', dosha: 'pitta', weight: 2 },
          { text: 'Slow but regular, heavy, well-formed', dosha: 'kapha', weight: 2 }
        ]
      },

      // Energy Pattern (weight 1)
      {
        id: 'ay_q7',
        category: 'energy',
        weight: 1,
        question: 'How would you describe your energy levels throughout the day?',
        options: [
          { text: 'Comes in bursts - high energy then suddenly tired', dosha: 'vata', weight: 1 },
          { text: 'Consistent and strong throughout the day', dosha: 'pitta', weight: 1 },
          { text: 'Steady and enduring, slow to start', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q8',
        category: 'energy',
        weight: 1,
        question: 'How do you handle physical exertion?',
        options: [
          { text: 'Quick bursts of activity, tire easily', dosha: 'vata', weight: 1 },
          { text: 'Moderate endurance with focused intensity', dosha: 'pitta', weight: 1 },
          { text: 'Good stamina and endurance, slow but steady', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q9',
        category: 'energy',
        weight: 1,
        question: 'What is your body temperature preference?',
        options: [
          { text: 'Feel cold easily, prefer warmth', dosha: 'vata', weight: 1 },
          { text: 'Run warm, prefer cool environments', dosha: 'pitta', weight: 1 },
          { text: 'Comfortable in most temperatures, slight preference for warmth', dosha: 'kapha', weight: 1 }
        ]
      },

      // Emotional Traits (weight 1)
      {
        id: 'ay_q10',
        category: 'emotional',
        weight: 1,
        question: 'How would you describe your mental tendencies?',
        options: [
          { text: 'Quick thinking, creative, easily distracted', dosha: 'vata', weight: 1 },
          { text: 'Sharp intellect, focused, perfectionist', dosha: 'pitta', weight: 1 },
          { text: 'Calm, methodical, steady learner', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q11',
        category: 'emotional',
        weight: 1,
        question: 'How do you typically handle stress?',
        options: [
          { text: 'Become anxious, worried, overwhelmed', dosha: 'vata', weight: 1 },
          { text: 'Become irritated, angry, frustrated', dosha: 'pitta', weight: 1 },
          { text: 'Become withdrawn, sluggish, depressed', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q12',
        category: 'emotional',
        weight: 1,
        question: 'What is your natural emotional disposition?',
        options: [
          { text: 'Enthusiastic, changeable, sometimes fearful', dosha: 'vata', weight: 1 },
          { text: 'Determined, passionate, sometimes aggressive', dosha: 'pitta', weight: 1 },
          { text: 'Calm, loving, sometimes possessive', dosha: 'kapha', weight: 1 }
        ]
      },

      // Sleep & Climate (weight 1)
      {
        id: 'ay_q13',
        category: 'sleep_climate',
        weight: 1,
        question: 'What is your typical sleep pattern?',
        options: [
          { text: 'Light sleeper, interrupted sleep, difficulty falling asleep', dosha: 'vata', weight: 1 },
          { text: 'Moderate sleep, usually sound, may wake from dreams', dosha: 'pitta', weight: 1 },
          { text: 'Deep, long sleep, hard to wake up', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q14',
        category: 'sleep_climate',
        weight: 1,
        question: 'How many hours of sleep do you naturally need?',
        options: [
          { text: '5-7 hours, often restless', dosha: 'vata', weight: 1 },
          { text: '6-8 hours, usually sound', dosha: 'pitta', weight: 1 },
          { text: '8-10+ hours, love sleeping', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q15',
        category: 'sleep_climate',
        weight: 1,
        question: 'Which weather affects you most negatively?',
        options: [
          { text: 'Cold, dry, windy weather', dosha: 'vata', weight: 1 },
          { text: 'Hot, humid weather', dosha: 'pitta', weight: 1 },
          { text: 'Cold, damp, cloudy weather', dosha: 'kapha', weight: 1 }
        ]
      },

      // Additional comprehensive questions
      {
        id: 'ay_q16',
        category: 'body_structure',
        weight: 2,
        question: 'How is your hair typically?',
        options: [
          { text: 'Dry, thin, brittle', dosha: 'vata', weight: 2 },
          { text: 'Fine, oily, straight, early graying', dosha: 'pitta', weight: 2 },
          { text: 'Thick, oily, wavy, lustrous', dosha: 'kapha', weight: 2 }
        ]
      },
      {
        id: 'ay_q17',
        category: 'emotional',
        weight: 1,
        question: 'What best describes your speech pattern?',
        options: [
          { text: 'Fast, talkative, jumps topics', dosha: 'vata', weight: 1 },
          { text: 'Sharp, precise, argumentative', dosha: 'pitta', weight: 1 },
          { text: 'Slow, melodious, thoughtful', dosha: 'kapha', weight: 1 }
        ]
      },
      {
        id: 'ay_q18',
        category: 'energy',
        weight: 1,
        question: 'How do you approach new activities or learning?',
        options: [
          { text: 'Learn quickly but forget easily', dosha: 'vata', weight: 1 },
          { text: 'Learn at moderate pace, good retention', dosha: 'pitta', weight: 1 },
          { text: 'Learn slowly but never forget', dosha: 'kapha', weight: 1 }
        ]
      }
    ]
  },

  /**
   * UNANI QUESTION BANK
   * 16 questions across 5 categories
   */
  unani: {
    framework: 'unani',
    totalQuestions: 16,
    questions: [
      // Thermal Tendency
      {
        id: 'un_q1',
        category: 'thermal',
        question: 'How does your body typically feel temperature-wise?',
        options: [
          { text: 'I feel warm/hot most of the time', heat: 1, cold: 0, dry: 0, moist: 0 },
          { text: 'I feel cool/cold most of the time', heat: 0, cold: 1, dry: 0, moist: 0 },
          { text: 'I feel comfortable at normal temperatures', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },
      {
        id: 'un_q2',
        category: 'thermal',
        question: 'What type of weather do you prefer?',
        options: [
          { text: 'Cool weather - I dislike heat', heat: 1, cold: 0, dry: 0, moist: 0 },
          { text: 'Warm weather - I dislike cold', heat: 0, cold: 1, dry: 0, moist: 0 },
          { text: 'Moderate weather', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },
      {
        id: 'un_q3',
        category: 'thermal',
        question: 'How is your thirst level?',
        options: [
          { text: 'Very thirsty, drink cold water frequently', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Moderate thirst', heat: 0, cold: 0, dry: 0, moist: 0 },
          { text: 'Low thirst, prefer warm drinks', heat: 0, cold: 1, dry: 0, moist: 0 }
        ]
      },
      {
        id: 'un_q4',
        category: 'thermal',
        question: 'How is your complexion?',
        options: [
          { text: 'Reddish, flushed, warm skin', heat: 1, cold: 0, dry: 0, moist: 0 },
          { text: 'Pale, cool skin', heat: 0, cold: 1, dry: 0, moist: 0 },
          { text: 'Normal, balanced complexion', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },

      // Moisture Tendency
      {
        id: 'un_q5',
        category: 'moisture',
        question: 'How is your skin\'s moisture level?',
        options: [
          { text: 'Oily, moist skin', heat: 0, cold: 0, dry: 0, moist: 1 },
          { text: 'Dry, rough skin', heat: 0, cold: 0, dry: 1, moist: 0 },
          { text: 'Normal, balanced', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },
      {
        id: 'un_q6',
        category: 'moisture',
        question: 'How is your perspiration?',
        options: [
          { text: 'Sweat profusely and easily', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Rarely sweat, skin stays dry', heat: 0, cold: 1, dry: 1, moist: 0 },
          { text: 'Moderate sweating', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },
      {
        id: 'un_q7',
        category: 'moisture',
        question: 'How is your nasal/throat condition?',
        options: [
          { text: 'Prone to mucus, phlegm, congestion', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Dry nose/throat, minimal mucus', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Normal, no issues', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },

      // Digestive Strength
      {
        id: 'un_q8',
        category: 'digestion',
        question: 'How is your appetite and hunger?',
        options: [
          { text: 'Strong appetite, hungry frequently', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Weak appetite, eat small amounts', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Normal, regular appetite', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },
      {
        id: 'un_q9',
        category: 'digestion',
        question: 'What is your digestive speed?',
        options: [
          { text: 'Fast digestion, frequent elimination', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Slow digestion, feel heavy after meals', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Moderate, comfortable digestion', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },
      {
        id: 'un_q10',
        category: 'digestion',
        question: 'How is your bowel movement?',
        options: [
          { text: 'Loose or frequent stools', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Tends toward constipation, dry stools', heat: 0, cold: 0, dry: 1, moist: 0 },
          { text: 'Regular, well-formed', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },

      // Emotional Nature
      {
        id: 'un_q11',
        category: 'emotional',
        question: 'What is your typical emotional state?',
        options: [
          { text: 'Quick-tempered, passionate, intense', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Calm, slow to anger, patient', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Balanced emotional responses', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },
      {
        id: 'un_q12',
        category: 'emotional',
        question: 'How do you handle stress?',
        options: [
          { text: 'Become agitated, restless, irritable', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Become withdrawn, sad, lethargic', heat: 0, cold: 1, dry: 1, moist: 0 },
          { text: 'Stay relatively calm and composed', heat: 0, cold: 0, dry: 0, moist: 1 }
        ]
      },
      {
        id: 'un_q13',
        category: 'emotional',
        question: 'What is your social tendency?',
        options: [
          { text: 'Outgoing, cheerful, sociable', heat: 1, cold: 0, dry: 0, moist: 1 },
          { text: 'Reserved, contemplative, introverted', heat: 0, cold: 1, dry: 1, moist: 0 },
          { text: 'Balanced social interaction', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },

      // Sleep Pattern
      {
        id: 'un_q14',
        category: 'sleep',
        question: 'What is your sleep quality?',
        options: [
          { text: 'Light sleep, wake easily', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: 'Heavy sleep, hard to wake', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Moderate, restful sleep', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },
      {
        id: 'un_q15',
        category: 'sleep',
        question: 'How much sleep do you need?',
        options: [
          { text: 'Less than 7 hours, wake early naturally', heat: 1, cold: 0, dry: 1, moist: 0 },
          { text: '8-10+ hours, love sleeping', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: '7-8 hours, balanced', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      },
      {
        id: 'un_q16',
        category: 'sleep',
        question: 'How do you feel upon waking?',
        options: [
          { text: 'Alert and energetic immediately', heat: 1, cold: 0, dry: 0, moist: 0 },
          { text: 'Groggy, need time to fully wake', heat: 0, cold: 1, dry: 0, moist: 1 },
          { text: 'Refreshed after adequate sleep', heat: 0, cold: 0, dry: 0, moist: 0 }
        ]
      }
    ]
  },

  /**
   * TCM QUESTION BANK
   * 18 questions across 5 pattern categories
   */
  tcm: {
    framework: 'tcm',
    totalQuestions: 18,
    questions: [
      // Temperature Sensitivity
      {
        id: 'tcm_q1',
        category: 'temperature',
        question: 'How do your hands and feet typically feel?',
        options: [
          { text: 'Hot palms and soles, especially at night', yin: 2, yang: 0, heat: 1, damp: 0, qi_deficiency: 0 },
          { text: 'Cold hands and feet most of the time', yin: 0, yang: 2, heat: 0, damp: 0, qi_deficiency: 1 },
          { text: 'Normal temperature', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q2',
        category: 'temperature',
        question: 'Do you experience night sweats or afternoon low-grade fever?',
        options: [
          { text: 'Yes, frequently', yin: 2, yang: 0, heat: 1, damp: 0, qi_deficiency: 0 },
          { text: 'No, but I feel cold easily', yin: 0, yang: 2, heat: 0, damp: 0, qi_deficiency: 0 },
          { text: 'Neither', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q3',
        category: 'temperature',
        question: 'What is your face color and temperature preference?',
        options: [
          { text: 'Red face, prefer cold drinks and air conditioning', yin: 1, yang: 0, heat: 2, damp: 0, qi_deficiency: 0 },
          { text: 'Pale face, prefer warm drinks and environment', yin: 0, yang: 2, heat: 0, damp: 1, qi_deficiency: 1 },
          { text: 'Normal complexion, comfortable in most temperatures', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },

      // Fluid Retention / Dryness
      {
        id: 'tcm_q4',
        category: 'fluid',
        question: 'How is your mouth and throat?',
        options: [
          { text: 'Dry mouth/throat, especially at night', yin: 2, yang: 0, heat: 1, damp: 0, qi_deficiency: 0 },
          { text: 'Excessive saliva or phlegm', yin: 0, yang: 0, heat: 0, damp: 2, qi_deficiency: 1 },
          { text: 'Normal moisture', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q5',
        category: 'fluid',
        question: 'Do you experience bloating or water retention?',
        options: [
          { text: 'Yes, often feel heavy and bloated', yin: 0, yang: 1, heat: 0, damp: 2, qi_deficiency: 1 },
          { text: 'No, tend toward dryness and constipation', yin: 2, yang: 0, heat: 1, damp: 0, qi_deficiency: 0 },
          { text: 'Neither issue', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q6',
        category: 'fluid',
        question: 'How is your body feel and weight?',
        options: [
          { text: 'Heavy feeling, easy weight gain, swelling', yin: 0, yang: 1, heat: 0, damp: 2, qi_deficiency: 1 },
          { text: 'Thin, dry skin, difficult to gain weight', yin: 2, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 },
          { text: 'Normal weight, no heaviness', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },

      // Energy & Fatigue
      {
        id: 'tcm_q7',
        category: 'energy',
        question: 'How are your energy levels throughout the day?',
        options: [
          { text: 'Constantly tired, lack energy even with rest', yin: 0, yang: 2, heat: 0, damp: 1, qi_deficiency: 2 },
          { text: 'Restless energy at night, tired during day', yin: 2, yang: 0, heat: 1, damp: 0, qi_deficiency: 0 },
          { text: 'Good, consistent energy', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q8',
        category: 'energy',
        question: 'How is your breathing and voice?',
        options: [
          { text: 'Short of breath, weak voice, tire easily when talking', yin: 0, yang: 1, heat: 0, damp: 0, qi_deficiency: 2 },
          { text: 'Normal breathing and voice strength', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 },
          { text: 'Strong voice, no breathing issues', yin: 0, yang: 1, heat: 1, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q9',
        category: 'energy',
        question: 'Do you catch colds frequently?',
        options: [
          { text: 'Yes, get sick easily and take long to recover', yin: 0, yang: 1, heat: 0, damp: 1, qi_deficiency: 2 },
          { text: 'Rarely get sick', yin: 0, yang: 1, heat: 0, damp: 0, qi_deficiency: 0 },
          { text: 'Normal immune function', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },

      // Emotional Pattern
      {
        id: 'tcm_q10',
        category: 'emotional',
        question: 'What is your emotional tendency?',
        options: [
          { text: 'Anxious, restless, insomnia', yin: 2, yang: 0, heat: 1, damp: 0, qi_deficiency: 0 },
          { text: 'Irritable, angry, impatient', yin: 0, yang: 0, heat: 2, damp: 0, qi_deficiency: 0 },
          { text: 'Depressed, worried, overthinking', yin: 0, yang: 1, heat: 0, damp: 1, qi_deficiency: 2 }
        ]
      },
      {
        id: 'tcm_q11',
        category: 'emotional',
        question: 'How is your mental clarity?',
        options: [
          { text: 'Foggy thinking, difficulty concentrating', yin: 0, yang: 1, heat: 0, damp: 2, qi_deficiency: 1 },
          { text: 'Clear mind but restless', yin: 1, yang: 0, heat: 2, damp: 0, qi_deficiency: 0 },
          { text: 'Good mental clarity and focus', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q12',
        category: 'emotional',
        question: 'How is your sleep quality?',
        options: [
          { text: 'Difficulty falling asleep, wake frequently', yin: 2, yang: 0, heat: 1, damp: 0, qi_deficiency: 0 },
          { text: 'Sleep heavily but don\'t feel rested', yin: 0, yang: 1, heat: 0, damp: 2, qi_deficiency: 1 },
          { text: 'Sleep well and feel refreshed', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },

      // Digestive Pattern
      {
        id: 'tcm_q13',
        category: 'digestion',
        question: 'What is your appetite like?',
        options: [
          { text: 'Poor appetite, feel full quickly', yin: 0, yang: 1, heat: 0, damp: 1, qi_deficiency: 2 },
          { text: 'Strong appetite, hungry soon after eating', yin: 1, yang: 0, heat: 2, damp: 0, qi_deficiency: 0 },
          { text: 'Normal, regular appetite', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q14',
        category: 'digestion',
        question: 'How are your stools?',
        options: [
          { text: 'Loose, unformed, or frequent diarrhea', yin: 0, yang: 1, heat: 0, damp: 2, qi_deficiency: 1 },
          { text: 'Dry, difficult to pass, constipation', yin: 2, yang: 0, heat: 2, damp: 0, qi_deficiency: 0 },
          { text: 'Normal, regular bowel movements', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q15',
        category: 'digestion',
        question: 'Do you experience digestive discomfort?',
        options: [
          { text: 'Bloating, heaviness after meals', yin: 0, yang: 1, heat: 0, damp: 2, qi_deficiency: 1 },
          { text: 'Burning sensation, acid reflux', yin: 1, yang: 0, heat: 2, damp: 0, qi_deficiency: 0 },
          { text: 'No significant discomfort', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },

      // Additional Physical Signs
      {
        id: 'tcm_q16',
        category: 'physical',
        question: 'How is your skin condition?',
        options: [
          { text: 'Rashes, acne, redness, inflammation', yin: 0, yang: 0, heat: 2, damp: 1, qi_deficiency: 0 },
          { text: 'Dry, flaky, dull skin', yin: 2, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 },
          { text: 'Healthy, clear skin', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q17',
        category: 'physical',
        question: 'How is your urine?',
        options: [
          { text: 'Dark yellow, strong odor, burning', yin: 1, yang: 0, heat: 2, damp: 0, qi_deficiency: 0 },
          { text: 'Clear, frequent urination', yin: 0, yang: 2, heat: 0, damp: 1, qi_deficiency: 1 },
          { text: 'Normal color and frequency', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      },
      {
        id: 'tcm_q18',
        category: 'physical',
        question: 'Do you have back or knee weakness?',
        options: [
          { text: 'Yes, weak lower back and knees, cold sensation', yin: 0, yang: 2, heat: 0, damp: 0, qi_deficiency: 1 },
          { text: 'Sometimes soreness but no weakness', yin: 1, yang: 0, heat: 0, damp: 1, qi_deficiency: 0 },
          { text: 'No weakness or pain', yin: 0, yang: 0, heat: 0, damp: 0, qi_deficiency: 0 }
        ]
      }
    ]
  },

  /**
   * MODERN CLINICAL QUESTION BANK
   * 20 questions covering clinical nutrition assessment
   */
  modern: {
    framework: 'modern',
    totalQuestions: 20,
    questions: [
      // Demographics
      {
        id: 'age',
        category: 'demographics',
        question: 'What is your age?',
        type: 'number',
        validation: { min: 16, max: 120 },
        unit: 'years',
        required: true
      },
      {
        id: 'gender',
        category: 'demographics',
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
        question: 'What is your height?',
        type: 'number',
        validation: { min: 100, max: 250 },
        unit: 'cm',
        required: true
      },
      {
        id: 'weight',
        category: 'anthropometric',
        question: 'What is your current weight?',
        type: 'number',
        validation: { min: 30, max: 300 },
        unit: 'kg',
        required: true
      },

      // Activity Level
      {
        id: 'activity_level',
        category: 'lifestyle',
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

      // Medical Conditions
      {
        id: 'medical_conditions',
        category: 'medical',
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
          { value: 'none', label: 'None of the above' }
        ],
        required: true
      },

      // Food Allergies
      {
        id: 'allergies',
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
          { value: 'none', label: 'None' }
        ],
        required: true
      },

      // Dietary Preference
      {
        id: 'dietary_preference',
        category: 'dietary',
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
          { value: 'paleo', label: 'Paleo' }
        ],
        required: true
      },

      // Health Goals
      {
        id: 'goals',
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
          { value: 'general_health', label: 'General Health & Wellness' }
        ],
        required: true
      },

      // Sleep Quality
      {
        id: 'sleep_quality',
        category: 'lifestyle',
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

      // Digestion
      {
        id: 'digestive_issues',
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

      // Supplements
      {
        id: 'supplements',
        category: 'supplements',
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
          { value: 'none', label: 'None' }
        ],
        required: false
      },

      // Physical Limitations
      {
        id: 'physical_limitations',
        category: 'physical',
        question: 'Do you have any physical limitations that affect your activity? (Select all that apply)',
        type: 'multiselect',
        options: [
          { value: 'joint_pain', label: 'Joint pain/Arthritis' },
          { value: 'back_pain', label: 'Back pain' },
          { value: 'mobility_issues', label: 'Mobility issues' },
          { value: 'chronic_fatigue', label: 'Chronic fatigue' },
          { value: 'recent_surgery', label: 'Recent surgery/injury' },
          { value: 'none', label: 'None' }
        ],
        required: false
      },

      // Medications
      {
        id: 'medications',
        category: 'medical',
        question: 'Are you currently taking any medications that might affect nutrition? (Select all that apply)',
        type: 'multiselect',
        options: [
          { value: 'diabetes_meds', label: 'Diabetes medications' },
          { value: 'blood_pressure_meds', label: 'Blood pressure medications' },
          { value: 'cholesterol_meds', label: 'Cholesterol medications' },
          { value: 'thyroid_meds', label: 'Thyroid medications' },
          { value: 'steroids', label: 'Steroids/Corticosteroids' },
          { value: 'antidepressants', label: 'Antidepressants' },
          { value: 'none', label: 'None' },
          { value: 'prefer_not_say', label: 'Prefer not to say' }
        ],
        required: false
      },

      // Lifestyle Context
      {
        id: 'lifestyle_context',
        category: 'lifestyle',
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
      }
    ]
  }
};

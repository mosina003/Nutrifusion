const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const HealthProfile = require('../models/HealthProfile');
const DietPlan = require('../models/DietPlan');
const Assessment = require('../models/Assessment');
const UserActivity = require('../models/UserActivity');
const recommendFoodService = require('../services/intelligence/recommendation/recommendFoods');

// Initialize Groq LLM for recommendations (FREE - Llama 3.3)
let groqApiKey = null;
if (process.env.GROQ_API_KEY) {
  groqApiKey = process.env.GROQ_API_KEY.trim(); // Remove any spaces
  console.log('✅ Groq LLM (Llama 3.3) initialized for dashboard recommendations');
  console.log('🔑 API Key loaded (first 10 chars):', groqApiKey.substring(0, 10) + '...');
  console.log('🔑 API Key length:', groqApiKey.length);
  console.log('🔑 API Key last 10 chars:', '...' + groqApiKey.substring(groqApiKey.length - 10));
} else {
  console.warn('⚠️ No Groq API key found, using assessment-based recommendations');
  console.warn('   Get free API key at: https://console.groq.com/keys');
}

/**
 * Helper to get user's dominant dosha from assessment or user profile
 */
const getDominantDosha = (assessment, userPrakriti) => {
  // Priority 1: Use assessment data if available (framework-specific)
  if (assessment && assessment.scores) {
    if (assessment.framework === 'ayurveda') {
      // Use vikriti (current state) as dominant
      const vikriti = assessment.scores.vikriti;
      if (vikriti && vikriti.dominant) {
        const doshaName = vikriti.dominant.charAt(0).toUpperCase() + vikriti.dominant.slice(1);
        const percentage = vikriti.scores ? vikriti.scores[vikriti.dominant] : 0;
        return { name: doshaName, percentage, source: 'assessment' };
      }
      // Fallback to prakriti if vikriti not available
      const prakriti = assessment.scores.prakriti;
      if (prakriti && prakriti.primary) {
        const doshaName = prakriti.primary.charAt(0).toUpperCase() + prakriti.primary.slice(1);
        const percentage = prakriti.percentages ? prakriti.percentages[prakriti.primary] : 0;
        return { name: doshaName, percentage, source: 'assessment' };
      }
    } else if (assessment.framework === 'unani') {
      const mizaj = assessment.scores.primary_mizaj || assessment.scores.mizaj;
      return { name: mizaj || 'Unknown', percentage: 0, source: 'assessment' };
    } else if (assessment.framework === 'tcm') {
      const pattern = assessment.scores.primary_pattern;
      return { name: pattern || 'Unknown', percentage: 0, source: 'assessment' };
    }
  }
  
  // Priority 2: Use user profile prakriti (legacy)
  if (userPrakriti && userPrakriti.vata) {
    const doshas = [
      { name: 'Vata', value: userPrakriti.vata || 0 },
      { name: 'Pitta', value: userPrakriti.pitta || 0 },
      { name: 'Kapha', value: userPrakriti.kapha || 0 }
    ];
    
    const dominant = doshas.reduce((prev, current) => 
      (prev.value > current.value) ? prev : current
    );
    
    return { name: dominant.name, percentage: dominant.value, source: 'user_profile' };
  }
  
  return { name: 'Unknown', percentage: 0, source: 'none' };
};

/**
 * Helper to get health insights based on user profile
 */
const getHealthInsights = (user, healthProfile, latestAssessment) => {
  const insights = [];
  
  // Dosha-based insights
  const dominant = getDominantDosha(latestAssessment, user.prakriti);
  
  if (dominant.name !== 'Unknown') {
    
    if (dominant.name === 'Pitta' && dominant.percentage > 40) {
      insights.push({
        type: 'warning',
        title: 'High Pitta Today',
        description: 'Your Pitta is elevated. Focus on cooling foods like coconut, cucumber, and milk-based drinks.',
        icon: 'AlertCircle',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700'
      });
    } else if (dominant.name === 'Vata' && dominant.percentage > 40) {
      insights.push({
        type: 'warning',
        title: 'High Vata Today',
        description: 'Your Vata is elevated. Focus on warm, grounding foods and maintain regular meal times.',
        icon: 'AlertCircle',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      });
    } else if (dominant.name === 'Kapha' && dominant.percentage > 40) {
      insights.push({
        type: 'warning',
        title: 'High Kapha Today',
        description: 'Your Kapha is elevated. Focus on light, spicy foods and increase physical activity.',
        icon: 'AlertCircle',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700'
      });
    }
  }
  
  // Fiber intake insights
  if (healthProfile?.digestionIndicators?.fiberIntake === 'Low') {
    insights.push({
      type: 'tip',
      title: 'Increase Fiber Intake',
      description: 'Your fiber consumption is below target. Add leafy greens and whole grains to your meals.',
      icon: 'Lightbulb',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    });
  }
  
  // Hydration insights
  if (healthProfile?.lifestyle?.waterIntake >= 8) {
    insights.push({
      type: 'success',
      title: 'Great Hydration',
      description: "You're maintaining excellent water intake. Keep it up for optimal digestion!",
      icon: 'CheckCircle',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700'
    });
  } else if (healthProfile?.lifestyle?.waterIntake < 6) {
    insights.push({
      type: 'tip',
      title: 'Increase Hydration',
      description: 'Try to drink at least 8 glasses of water daily for optimal health.',
      icon: 'Lightbulb',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    });
  }
  
  // Sleep insights
  if (!healthProfile?.lifestyle?.sleepHours || healthProfile.lifestyle.sleepHours < 7) {
    insights.push({
      type: 'tip',
      title: 'Sleep Quality Matters',
      description: 'Try going to bed by 10 PM to align with your natural circadian rhythm.',
      icon: 'Lightbulb',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700'
    });
  }
  
  // Default to 4 insights
  while (insights.length < 4) {
    const defaultInsights = [
      {
        type: 'tip',
        title: 'Mindful Eating',
        description: 'Eat slowly and chew thoroughly to improve digestion and nutrient absorption.',
        icon: 'Lightbulb',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700'
      },
      {
        type: 'tip',
        title: 'Hydration Matters',
        description: 'Drink warm water throughout the day to support metabolism and flush toxins from your system.',
        icon: 'Droplets',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      },
      {
        type: 'tip',
        title: 'Morning Routine',
        description: 'Start your day with tongue scraping and warm lemon water to kickstart digestion and detoxification.',
        icon: 'Sun',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700'
      },
      {
        type: 'tip',
        title: 'Spice It Up',
        description: 'Add ginger, turmeric, and cumin to meals to enhance digestion and reduce inflammation naturally.',
        icon: 'Flame',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700'
      }
    ];
    
    insights.push(defaultInsights[insights.length % defaultInsights.length]);
  }
  
  return insights.slice(0, 4);
};

/**
 * Helper to get yoga recommendations based on dosha
 */
const getYogaRecommendations = (assessment, prakriti) => {
  const dominant = getDominantDosha(assessment, prakriti);
  
  const yogaByDosha = {
    Pitta: [
      { name: 'Child\'s Pose', duration: '2 min', benefit: 'Calming & Cooling' },
      { name: 'Warrior I', duration: '1 min each side', benefit: 'Grounding & Strengthening' },
      { name: 'Moon Salutation', duration: '5 min', benefit: 'Cooling sequence' }
    ],
    Vata: [
      { name: 'Mountain Pose', duration: '3 min', benefit: 'Grounding & Stability' },
      { name: 'Tree Pose', duration: '2 min each side', benefit: 'Balance & Focus' },
      { name: 'Seated Forward Bend', duration: '5 min', benefit: 'Calming & Centering' }
    ],
    Kapha: [
      { name: 'Sun Salutation', duration: '5 min', benefit: 'Energizing & Warming' },
      { name: 'Warrior II', duration: '1 min each side', benefit: 'Strength & Energy' },
      { name: 'Camel Pose', duration: '2 min', benefit: 'Opening & Stimulating' }
    ]
  };
  
  return yogaByDosha[dominant.name] || yogaByDosha.Pitta;
};

/**
 * Helper to generate lifestyle tips based on dosha
 */
const getLifestyleTips = (assessment, prakriti) => {
  const dominant = getDominantDosha(assessment, prakriti);
  
  const tipsByDosha = {
    Pitta: {
      sleep: [
        'Maintain consistent sleep schedule (10 PM - 6 AM)',
        'Practice deep breathing 10 minutes before bed',
        'Avoid heavy meals 3 hours before sleep',
        'Keep bedroom cool and dark'
      ],
      stress: [
        'Practice 10 minutes of meditation daily',
        'Perform Nadi Shodhana (alternate nostril breathing)',
        'Take mindful walks in nature',
        'Journaling for mental clarity'
      ]
    },
    Vata: {
      sleep: [
        'Maintain regular sleep schedule (9:30 PM - 6 AM)',
        'Warm oil massage before bed',
        'Warm milk with cardamom',
        'Create a calming bedtime routine'
      ],
      stress: [
        'Practice grounding meditation',
        'Gentle, slow-paced yoga',
        'Warm baths with essential oils',
        'Listen to calming music'
      ]
    },
    Kapha: {
      sleep: [
        'Wake up early (5:30 AM - 6 AM)',
        'Avoid daytime naps',
        'Light dinner before 7 PM',
        'Regular exercise routine'
      ],
      stress: [
        'Vigorous exercise daily',
        'Try new activities and experiences',
        'Social interactions',
        'Stimulating breathing exercises'
      ]
    }
  };
  
  return tipsByDosha[dominant.name] || tipsByDosha.Pitta;
};

/**
 * Helper to calculate progress data
 */
const calculateProgressData = async (user, dietPlans, assessments, userStats) => {
  const today = new Date();
  
  return {
    charts: {
      calories: {
        title: 'Weekly Calorie Trend',
        value: '1,450',
        unit: 'avg/day',
        trend: '+5%',
        bars: [65, 72, 68, 75, 80, 85, 90],
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      weight: {
        title: 'Weight Trend',
        value: user.weight || '72.5',
        unit: 'kg',
        trend: '-2.5 kg',
        bars: [85, 84.5, 84, 83, 82, user.weight || 72.5, user.weight || 72.5],
        days: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
      },
      doshaBalance: {
        title: 'Dosha Balance',
        value: '68%',
        unit: 'balanced',
        trend: '+8%',
        bars: [45, 50, 55, 62, 65, 67, 68],
        days: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today']
      },
      compliance: {
        title: 'Compliance Rate',
        value: `${userStats.adherence}%`,
        unit: 'adherence',
        trend: '+3%',
        bars: [72, 78, 85, 88, 90, 91, userStats.adherence],
        days: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
      }
    },
    summary: {
      totalDaysTracked: userStats.totalDaysTracked,
      adherence: userStats.adherence,
      weightLost: 12.5, // This would come from weight history tracking
      streak: userStats.currentStreak
    }
  };
};

/**
 * Generate personalized foods to avoid based on assessment (WITHOUT LLM)
 * @param {Object} assessment - User's latest assessment
 * @param {Object} healthProfile - User's health profile
 * @returns {Array<string>} - List of 4 foods to avoid
 */
const getPersonalizedFoodsToAvoid = (assessment, healthProfile) => {
  if (!assessment || !assessment.scores) {
    return ['Spicy Foods', 'Red Meat', 'Caffeine', 'Fried Items'];
  }

  const framework = assessment.framework;
  
  if (framework === 'ayurveda') {
    const dominantDosha = assessment.scores.dominant_dosha || assessment.scores.vikriti?.dominant;
    const severity = assessment.scores.severity || 1;
    
    if (dominantDosha === 'vata') {
      return severity >= 2 
        ? ['Dry Crackers', 'Raw Vegetables', 'Cold Beverages', 'Beans & Lentils']
        : ['Iced Drinks', 'Raw Salads', 'Crackers', 'Popcorn'];
    } else if (dominantDosha === 'pitta') {
      return severity >= 2
        ? ['Spicy Curries', 'Hot Peppers', 'Sour Pickles', 'Alcohol']
        : ['Spicy Foods', 'Citrus Fruits', 'Tomatoes', 'Yogurt'];
    } else if (dominantDosha === 'kapha') {
      return severity >= 2
        ? ['Ice Cream', 'Cheese', 'Fried Snacks', 'Sweet Desserts']
        : ['Heavy Dairy', 'Sweet Foods', 'Cold Foods', 'Oily Foods'];
    }
  } else if (framework === 'unani') {
    const dominantHumor = assessment.scores.dominant_humor;
    
    if (dominantHumor === 'dam') {
      return ['Heavy Meats', 'Rich Sweets', 'Oily Foods', 'Excessive Dairy'];
    } else if (dominantHumor === 'safra') {
      return ['Spicy Foods', 'Hot Peppers', 'Sour Foods', 'Red Meat'];
    } else if (dominantHumor === 'balgham') {
      return ['Cold Drinks', 'Dairy Products', 'Sweet Foods', 'Fatty Foods'];
    } else if (dominantHumor === 'sauda') {
      return ['Dried Foods', 'Stale Foods', 'Cold Foods', 'Heavy Meats'];
    }
  } else if (framework === 'tcm') {
    const primaryPattern = assessment.scores.primary_pattern;
    
    if (primaryPattern?.includes('heat')) {
      return ['Spicy Foods', 'Fried Foods', 'Alcohol', 'Red Meat'];
    } else if (primaryPattern?.includes('cold')) {
      return ['Raw Foods', 'Cold Drinks', 'Ice Cream', 'Salads'];
    } else if (primaryPattern?.includes('damp')) {
      return ['Dairy Products', 'Sweet Foods', 'Greasy Foods', 'Alcohol'];
    }
  }
  
  // Modern framework or default
  const conditions = healthProfile?.medicalConditions || [];
  if (conditions.includes('Diabetes')) {
    return ['Refined Sugar', 'White Bread', 'Sugary Drinks', 'Pastries'];
  } else if (conditions.includes('Hypertension')) {
    return ['Salty Snacks', 'Processed Foods', 'Pickles', 'Canned Soups'];
  } else if (conditions.includes('High Cholesterol')) {
    return ['Fried Foods', 'Butter', 'Red Meat', 'Full-Fat Dairy'];
  }
  
  return ['Spicy Foods', 'Red Meat', 'Caffeine', 'Fried Items'];
};

/**
 * Generate personalized foods to avoid using LLM
 * @param {Object} assessment - User's latest assessment
 * @param {Object} healthProfile - User's health profile
 * @returns {Promise<Array<string>>} - List of 4 foods to avoid
 */
const generateFoodsToAvoidWithLLM = async (assessment, healthProfile) => {
  // If no LLM available, return personalized fallback
  if (!groqApiKey) {
    return getPersonalizedFoodsToAvoid(assessment, healthProfile);
  }
  
  try {
    // Build prompt based on assessment framework
    let assessmentContext = '';
    
    if (assessment && assessment.scores) {
      if (assessment.framework === 'ayurveda') {
        const { prakriti, vikriti, agni, dominant_dosha, severity } = assessment.scores;
        const severityText = severity === 3 ? 'severe' : severity === 2 ? 'moderate' : 'mild';
        
        assessmentContext = `
**Ayurveda Assessment Results:**
- Constitution (Prakriti): ${prakriti?.dosha_type || 'Unknown'}
- Current Imbalance (Vikriti): ${vikriti?.dominant || dominant_dosha} elevated (${severityText} imbalance)
- Digestive Fire (Agni): ${typeof agni === 'object' ? agni.name : agni}
- Dominant Dosha: ${dominant_dosha?.charAt(0).toUpperCase() + dominant_dosha?.slice(1)}
`;
      } else if (assessment.framework === 'unani') {
        const { primary_mizaj, dominant_humor } = assessment.scores;
        assessmentContext = `
**Unani Assessment Results:**
- Primary Temperament (Mizaj): ${primary_mizaj}
- Dominant Humor: ${dominant_humor}
`;
      } else if (assessment.framework === 'tcm') {
        const { primary_pattern, organ_systems } = assessment.scores;
        assessmentContext = `
**TCM Assessment Results:**
- Primary Pattern: ${primary_pattern}
- Affected Organ Systems: ${organ_systems?.join(', ') || 'None'}
`;
      } else if (assessment.framework === 'modern') {
        const { bmi_category, activity_level } = assessment.scores;
        assessmentContext = `
**Modern Clinical Assessment Results:**
- BMI Category: ${bmi_category}
- Activity Level: ${activity_level}
`;
      }
    }
    
    // Add health conditions if available
    let healthContext = '';
    if (healthProfile) {
      const conditions = healthProfile.medicalConditions || [];
      const allergies = healthProfile.allergies || [];
      
      if (conditions.length > 0) {
        healthContext += `\n**Medical Conditions:** ${conditions.map(c => c.name || c).join(', ')}`;
      }
      if (allergies.length > 0) {
        healthContext += `\n**Allergies:** ${allergies.join(', ')}`;
      }
    }
    
    const prompt = `You are a nutritionist providing dietary guidance. Based on the following health assessment, list exactly 4 specific foods or food categories that this person should AVOID today.

${assessmentContext}${healthContext}

**Requirements:**
1. List exactly 4 foods/food categories
2. Be specific (e.g., "Fried Foods" instead of "Unhealthy Foods")
3. Consider the assessment results and any medical conditions
4. Focus on commonly available foods
5. Return ONLY the 4 food names, one per line, no numbering, no explanations

Example output format:
Spicy Curries
Red Meat
Caffeinated Beverages
Deep Fried Snacks`;

    console.log('🤖 Calling Groq API (Llama 3.3) to generate foods to avoid...');
    
    // Call Groq API (OpenAI-compatible, FREE!)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',  // FREE Llama 3.3 model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful nutritionist assistant. Provide concise, specific recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Groq API error response:', errorBody);
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content.trim();
    
    // Parse the response - split by newlines and clean up
    const foods = responseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+[\.)]/)) // Remove numbered lines
      .slice(0, 4); // Take only first 4
    
    if (foods.length === 4) {
      console.log('✅ Groq LLM (Llama 3.3) generated foods to avoid:', foods);
      return foods;
    } else {
      console.warn('⚠️ LLM returned invalid format, using personalized fallback');
      return getPersonalizedFoodsToAvoid(assessment, healthProfile);
    }
    
  } catch (error) {
    console.error('Error generating foods to avoid with LLM:', error.message);
    console.log('📋 Using personalized non-LLM fallback based on assessment');
    return getPersonalizedFoodsToAvoid(assessment, healthProfile);
  }
};

/**
 * @route   GET /api/dashboard
 * @desc    Get comprehensive dashboard data for user
 * @access  Private/User
 */
router.get('/', protect, authorize('user'), async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Fetch all required data
    const user = await User.findById(userId)
      .populate('chronicConditions')
      .select('-password');
      
    const healthProfile = await HealthProfile.findOne({ userId })
      .populate('chronicConditions')
      .sort({ recordedAt: -1 });
      
    const activeDietPlan = await DietPlan.findOne({ 
      userId, 
      status: 'Active',
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() }
    }).populate('meals.recipeId');
    
    const latestAssessment = await Assessment.findOne({ userId, isActive: true })
      .sort({ submittedAt: -1 });
      
    const allDietPlans = await DietPlan.find({ userId });
    const allAssessments = await Assessment.find({ userId });
    
    // Get user activity stats for real tracking
    const userStats = await UserActivity.getUserStats(userId, 30);
    
    // Build user profile for recommendations
    const userProfile = {
      ...user.toObject(),
      medicalConditions: healthProfile?.medicalConditions || [],
      allergies: healthProfile?.allergies || [],
      dietaryPreferences: healthProfile?.dietaryPreferences || [],
      digestionIssues: healthProfile?.digestiveIssues || 'Normal',
      activityLevel: healthProfile?.lifestyle?.activity || 'Moderate'
    };
    
    // If we have a recent assessment, use its scores for prakriti/dosha data
    if (latestAssessment && latestAssessment.scores) {
      if (latestAssessment.framework === 'ayurveda') {
        userProfile.prakriti = latestAssessment.scores.prakriti?.percentages || user.prakriti;
        userProfile.vikriti = latestAssessment.scores.vikriti?.scores;
        userProfile.assessmentData = latestAssessment.scores;
      } else if (latestAssessment.framework === 'unani') {
        userProfile.unaniAssessment = latestAssessment.scores;
      } else if (latestAssessment.framework === 'tcm') {
        userProfile.tcmAssessment = latestAssessment.scores;
      } else if (latestAssessment.framework === 'modern') {
        userProfile.modernAssessment = latestAssessment.scores;
      }
    }
    
    console.log('🔍 User profile for recommendations:', {
      hasPrakriti: !!userProfile.prakriti,
      prakriti: userProfile.prakriti,
      hasAssessmentData: !!userProfile.assessmentData,
      assessmentFramework: latestAssessment?.framework,
      medicalConditions: userProfile.medicalConditions.length,
      allergies: userProfile.allergies.length
    });
    
    // Get food recommendations
    let recommendedFoods = [];
    let foodsToAvoid = [];
    
    try {
      console.log('🍽️ Calling recommendation service...');
      const foodRecs = await recommendFoodService.getPersonalizedRecommendations(userProfile, {
        limit: 4,
        minScore: 55  // Lowered from 70 to get actual scored foods
      });
      console.log('✅ Got food recommendations:', foodRecs.recommendations.length);
      console.log('📊 Sample scores:', foodRecs.recommendations.slice(0, 3).map(f => ({ name: f.name, score: f.finalScore })));
      
      recommendedFoods = foodRecs.recommendations.map(food => ({
        name: food.name,
        tags: [
          food.ayurveda?.taste?.[0] || 'Balanced',
          food.ayurveda?.quality?.[0] || 'Nourishing'
        ],
        score: Math.round(food.finalScore)
      }));
      
      // Get foods to avoid (foods with low scores or contraindications)
      const avoidRecs = await recommendFoodService.getPersonalizedRecommendations(userProfile, {
        limit: 20,
        minScore: 0
      });
      
      console.log('📉 Total foods evaluated:', avoidRecs.recommendations.length);
      console.log('📉 Low score foods:', avoidRecs.recommendations.filter(f => f.finalScore < 48).length);
      console.log('📉 Score range:', avoidRecs.recommendations.length > 0 ? `${Math.min(...avoidRecs.recommendations.map(f => f.finalScore))}-${Math.max(...avoidRecs.recommendations.map(f => f.finalScore))}` : 'none');
      
      foodsToAvoid = avoidRecs.recommendations
        .filter(food => food.finalScore < 48 || (food.warnings && food.warnings.length > 0))
        .slice(0, 4)
        .map(food => food.name);
      
      console.log('⚠️ Foods to avoid from scoring:', foodsToAvoid.length, foodsToAvoid);
      
      // If not enough foods from recommendation service, check cache or use LLM
      if (foodsToAvoid.length < 4) {
        // Check if we have valid cached LLM results
        const isCacheValid = user.llmCache && 
                            user.llmCache.foodsToAvoid && 
                            user.llmCache.foodsToAvoid.length === 4 &&
                            user.llmCache.expiresAt > new Date() &&
                            user.llmCache.assessmentId?.toString() === latestAssessment?._id?.toString();
        
        if (isCacheValid) {
          console.log('✅ Using cached LLM foods to avoid (expires:', user.llmCache.expiresAt, ')');
          foodsToAvoid = user.llmCache.foodsToAvoid;
        } else {
          console.log('🤖 Using LLM to generate foods to avoid...');
          foodsToAvoid = await generateFoodsToAvoidWithLLM(latestAssessment, healthProfile);
          
          // Cache the LLM results for 24 hours
          user.llmCache = {
            foodsToAvoid: foodsToAvoid,
            generatedAt: new Date(),
            assessmentId: latestAssessment?._id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          };
          
          // Save cache to database (async, don't wait)
          user.save().catch(err => console.error('Failed to cache LLM results:', err.message));
          
          console.log('💾 Cached LLM results, expires in 24 hours');
        }
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      console.error('Error details:', error.message, error.stack);
      // Fallback data
      recommendedFoods = [
        { name: 'Coconut Water', tags: ['Cooling', 'Hydrating'], score: 92 },
        { name: 'Cucumber Salad', tags: ['Low Carb', 'Cooling'], score: 88 },
        { name: 'Basmati Rice', tags: ['Easy Digest', 'Balanced'], score: 85 },
        { name: 'Ghee', tags: ['Nourishing', 'Grounding'], score: 82 }
      ];
      
      // Check cache first, then use LLM as last resort
      const isCacheValid = user.llmCache && 
                          user.llmCache.foodsToAvoid && 
                          user.llmCache.foodsToAvoid.length === 4 &&
                          user.llmCache.expiresAt > new Date();
      
      if (isCacheValid) {
        console.log('✅ Using cached LLM foods to avoid (from error fallback)');
        foodsToAvoid = user.llmCache.foodsToAvoid;
      } else {
        console.log('🤖 Calling LLM for foods to avoid (error fallback)');
        foodsToAvoid = await generateFoodsToAvoidWithLLM(latestAssessment, healthProfile);
        
        // Cache the results
        user.llmCache = {
          foodsToAvoid: foodsToAvoid,
          generatedAt: new Date(),
          assessmentId: latestAssessment?._id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        user.save().catch(err => console.error('Failed to cache LLM results:', err.message));
      }
    }
    
    // Ensure we always have fallback data if recommendations are empty
    if (recommendedFoods.length === 0) {
      console.log('No recommendations found, using fallback data');
      recommendedFoods = [
        { name: 'Coconut Water', tags: ['Cooling', 'Hydrating'], score: 92 },
        { name: 'Cucumber Salad', tags: ['Low Carb', 'Cooling'], score: 88 },
        { name: 'Basmati Rice', tags: ['Easy Digest', 'Balanced'], score: 85 },
        { name: 'Ghee', tags: ['Nourishing', 'Grounding'], score: 82 }
      ];
    }
    
    // If foodsToAvoid is still empty, use LLM as final fallback
    if (foodsToAvoid.length === 0) {
      console.log('🤖 Using LLM as final fallback for foods to avoid...');
      foodsToAvoid = await generateFoodsToAvoidWithLLM(latestAssessment, healthProfile);
    }
    
    // Calculate summary cards data
    const dominant = getDominantDosha(latestAssessment, user.prakriti);
    const conditionsCount = (user.chronicConditions || []).length;
    
    console.log('📊 Dominant dosha calculation:', {
      name: dominant.name,
      percentage: dominant.percentage,
      source: dominant.source,
      hasAssessment: !!latestAssessment,
      assessmentFramework: latestAssessment?.framework
    });
    
    // Calculate daily calorie target (basic formula based on weight, age, gender)
    let calorieTarget = 2000; // Default for adult
    
    if (user.weight && user.age && user.gender) {
      // Mifflin-St Jeor Equation (more accurate)
      let bmr;
      if (user.gender === 'Male') {
        bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + 5;
      } else {
        bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161;
      }
      // Multiply by activity factor (assuming light activity = 1.375)
      calorieTarget = Math.round(bmr * 1.375);
    } else if (user.weight) {
      // Fallback: simple formula
      calorieTarget = Math.round(user.weight * 24 * 1.5);
    }
    
    // TODO: Calculate from UserActivity collection (food logging)
    // For now, use 0 until food logging is implemented
    const caloriesConsumed = 0; // Will be calculated from logged meals
    
    // Format dosha percentage/trend display
    let doshaTrend = '';
    if (dominant.source === 'assessment' && dominant.percentage > 0) {
      // If from assessment, show percentage if it's actually a percentage
      doshaTrend = dominant.percentage > 10 ? `${Math.round(dominant.percentage)}%` : '';
    }
    
    // Framework-specific label for constitution card
    const framework = latestAssessment?.framework || 'ayurveda';
    let constitutionLabel = 'Dominant Dosha';
    if (framework === 'unani') {
      constitutionLabel = 'Dominant Humor';
    } else if (framework === 'tcm') {
      constitutionLabel = 'Primary Pattern';
    }
    
    const summaryCards = {
      dosha: {
        value: dominant.name,
        label: constitutionLabel,
        trend: doshaTrend,
        bgColor: 'bg-gradient-to-br from-orange-400 to-orange-500',
        framework: framework
      },
      conditions: {
        value: conditionsCount,
        label: 'Chronic Conditions',
        bgColor: 'bg-gradient-to-br from-red-400 to-red-500'
      },
      calories: {
        value: `${calorieTarget} cal`,
        label: `Daily Target vs ${caloriesConsumed} consumed`,
        bgColor: 'bg-gradient-to-br from-blue-400 to-blue-500'
      },
      status: {
        value: caloriesConsumed <= calorieTarget ? 'On Track' : 'Over Target',
        label: "Today's Diet Status",
        trend: '✓',
        bgColor: 'bg-gradient-to-br from-green-400 to-green-500'
      }
    };
    
    // Get health insights
    const healthInsights = getHealthInsights(user, healthProfile, latestAssessment);
    
    // Get yoga recommendations
    const yogaPoses = getYogaRecommendations(latestAssessment, user.prakriti);
    const lifestyleTips = getLifestyleTips(latestAssessment, user.prakriti);
    
    // Calculate progress data
    const progressData = await calculateProgressData(user, allDietPlans, allAssessments, userStats);
    
    // Compile complete dashboard data
    const dashboardData = {
      user: {
        name: user.name,
        email: user.email
      },
      summaryCards,
      recommendations: {
        foods: recommendedFoods,
        avoid: foodsToAvoid
      },
      healthInsights,
      yoga: {
        poses: yogaPoses,
        sleepTips: lifestyleTips.sleep,
        stressTips: lifestyleTips.stress
      },
      progress: progressData
    };
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard/dosha-balance
 * @desc    Get real-time constitution balance (dosha/humor/pattern) based on assessment
 * @access  Private
 */
router.get('/dosha-balance', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user and latest assessment (any framework)
    const user = await User.findById(userId);
    const assessment = await Assessment.findOne({ 
      userId,
      isActive: true 
    }).sort({ completedAt: -1 });

    if (!assessment || !assessment.scores) {
      return res.status(404).json({
        success: false,
        error: 'No active assessment found'
      });
    }

    const framework = assessment.framework;

    // Handle Ayurveda framework
    if (framework === 'ayurveda') {
      // Get base constitution from assessment
      const prakriti = assessment.scores.prakriti;
      const vikriti = assessment.scores.vikriti;

      // Start with base prakriti percentages
      let vataBalance = prakriti?.percentages?.vata || 33;
      let pittaBalance = prakriti?.percentages?.pitta || 33;
      let kaphaBalance = prakriti?.percentages?.kapha || 33;

      // Apply current state (vikriti) influence
      if (vikriti && vikriti.scores) {
        vataBalance = (vataBalance * 0.4) + (vikriti.scores.vata * 0.6);
        pittaBalance = (pittaBalance * 0.4) + (vikriti.scores.pitta * 0.6);
        kaphaBalance = (kaphaBalance * 0.4) + (vikriti.scores.kapha * 0.6);
      }

      // Normalize to ensure total is reasonable
      const total = vataBalance + pittaBalance + kaphaBalance;
      if (total > 0) {
        vataBalance = (vataBalance / total) * 100;
        pittaBalance = (pittaBalance / total) * 100;
        kaphaBalance = (kaphaBalance / total) * 100;
      }

      return res.json({
        success: true,
        data: {
          framework: 'ayurveda',
          vata: Math.round(vataBalance * 10) / 10,
          pitta: Math.round(pittaBalance * 10) / 10,
          kapha: Math.round(kaphaBalance * 10) / 10,
          dominant: vataBalance > pittaBalance && vataBalance > kaphaBalance ? 'Vata'
                    : pittaBalance > kaphaBalance ? 'Pitta' : 'Kapha',
          source: 'real-time',
          lastUpdated: new Date()
        }
      });
    }
    
    // Handle Unani framework
    else if (framework === 'unani') {
      const scores = assessment.scores;
      
      return res.json({
        success: true,
        data: {
          framework: 'unani',
          primary_mizaj: scores.primary_mizaj || 'Unknown',
          secondary_mizaj: scores.secondary_mizaj || null,
          dominant_humor: scores.dominant_humor || scores.primary_mizaj || 'Unknown',
          thermal_tendency: scores.thermal_tendency || 'Balanced',
          moisture_tendency: scores.moisture_tendency || 'Balanced',
          digestive_strength: scores.digestive_strength || 'Moderate',
          dominant: (scores.dominant_humor || scores.primary_mizaj || 'Unknown').charAt(0).toUpperCase() + 
                    (scores.dominant_humor || scores.primary_mizaj || '').slice(1),
          source: 'assessment',
          lastUpdated: new Date()
        }
      });
    }
    
    // Handle TCM framework
    else if (framework === 'tcm') {
      const scores = assessment.scores;
      
      return res.json({
        success: true,
        data: {
          framework: 'tcm',
          primary_pattern: scores.primary_pattern || 'Unknown',
          secondary_pattern: scores.secondary_pattern || null,
          cold_heat: scores.cold_heat || 'Balanced',
          severity: scores.severity || 'Mild',
          dominant: scores.primary_pattern || 'Unknown',
          source: 'assessment',
          lastUpdated: new Date()
        }
      });
    }
    
    // Unknown framework
    else {
      return res.status(400).json({
        success: false,
        error: `Unsupported framework: ${framework}`
      });
    }

  } catch (error) {
    console.error('Error calculating constitution balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate constitution balance'
    });
  }
});

module.exports = router;

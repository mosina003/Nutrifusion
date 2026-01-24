require('dotenv').config();
const { enhanceWithLLM, buildExplanation } = require('../services/intelligence/explainability/explanationBuilder');

async function testLLMEnhancement() {
  console.log('🧪 Testing LLM Explanation Enhancement\n');
  console.log('=' .repeat(70));

  // Sample recommendation data
  const sampleScoreData = {
    finalScore: 85,
    reasons: [
      'Cooling potency balances Pitta dosha',
      'Low-fat content safe for acid reflux',
      'High water content aids hydration'
    ],
    warnings: [
      'May cause gas if consumed in large quantities'
    ],
    systemScores: {
      ayurveda: +20,
      unani: +10,
      tcm: +5,
      modern: +10,
      safety: 0
    }
  };

  // Build base explanation
  console.log('\n📝 BASE EXPLANATION (Rule-based):');
  console.log('-'.repeat(70));
  const baseExplanation = buildExplanation(sampleScoreData, 'Cucumber');
  console.log(baseExplanation);

  // Enhance with LLM
  console.log('\n\n✨ LLM-ENHANCED EXPLANATION (Gemini 2.5 Flash):');
  console.log('-'.repeat(70));
  
  try {
    const enhancedExplanation = await enhanceWithLLM(baseExplanation, sampleScoreData);
    console.log(enhancedExplanation);
    
    console.log('\n\n' + '='.repeat(70));
    console.log('✅ SUCCESS! LLM enhancement working!');
    console.log('\n💡 To use in API: Add ?llm=true to recommendations endpoint');
    console.log('   Example: GET /api/recommendations/foods?llm=true');
    
  } catch (error) {
    console.error('\n❌ LLM Enhancement Error:', error.message);
    console.log('\n💡 If rate limit error, wait 1 minute and try again');
    console.log('   Free tier: 15 requests/minute');
  }
}

testLLMEnhancement();

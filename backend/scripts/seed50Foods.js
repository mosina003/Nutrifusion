const mongoose = require('mongoose');
require('dotenv').config();
const Food = require('../models/Food');
const ayurvedaFoods = require('../data/ayurveda_food_constitution.json');

// Estimated modern nutrition data for 50 foods
const nutritionData = {
  'Idli': { calories: 39, protein: 2, carbs: 8, fat: 0.1, fiber: 0.6 },
  'Dosa': { calories: 86, protein: 2.6, carbs: 16, fat: 1.2, fiber: 0.8 },
  'Upma': { calories: 115, protein: 3.2, carbs: 18, fat: 3.8, fiber: 1.2 },
  'Poha': { calories: 76, protein: 1.4, carbs: 17, fat: 0.2, fiber: 1.1 },
  'Paratha': { calories: 258, protein: 6, carbs: 35, fat: 10, fiber: 2 },
  'Pongal': { calories: 150, protein: 5, carbs: 25, fat: 3, fiber: 2.5 },
  'Biryani': { calories: 290, protein: 8, carbs: 45, fat: 9, fiber: 3 },
  'Fried Rice': { calories: 228, protein: 4.7, carbs: 37, fat: 6, fiber: 1.5 },
  'Oatmeal': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7 },
  'Bread Toast': { calories: 79, protein: 2.7, carbs: 15, fat: 1, fiber: 0.8 },
  'Chapati': { calories: 71, protein: 3, carbs: 15, fat: 0.4, fiber: 2.4 },
  'Cornflakes': { calories: 357, protein: 7.5, carbs: 84, fat: 0.4, fiber: 3 },
  'Dal Tadka': { calories: 104, protein: 7, carbs: 17, fat: 1.5, fiber: 4 },
  'Chole': { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },
  'Rajma': { calories: 127, protein: 8.7, carbs: 22, fat: 0.5, fiber: 6.4 },
  'Hummus': { calories: 166, protein: 7.9, carbs: 14, fat: 10, fiber: 6 },
  'Sprout Salad': { calories: 30, protein: 4, carbs: 4, fat: 0.5, fiber: 2 },
  'Paneer Butter Masala': { calories: 265, protein: 12, carbs: 8, fat: 21, fiber: 1.5 },
  'Curd': { calories: 60, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
  'Cheese Sandwich': { calories: 250, protein: 11, carbs: 28, fat: 10, fiber: 2 },
  'Chicken Curry': { calories: 135, protein: 12, carbs: 5, fat: 7, fiber: 1 },
  'Fish Fry': { calories: 206, protein: 20, carbs: 8, fat: 10, fiber: 0.5 },
  'Egg Omelette': { calories: 154, protein: 11, carbs: 1, fat: 12, fiber: 0 },
  'Grilled Chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  'Apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  'Mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
  'Banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  'Orange Juice': { calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2 },
  'Tea': { calories: 1, protein: 0, carbs: 0.3, fat: 0, fiber: 0 },
  'Coffee': { calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
  'Lassi': { calories: 62, protein: 2.7, carbs: 9, fat: 1.5, fiber: 0 },
  'Coconut Water': { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 1.1 },
  'Carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  'Spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  'Potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
  'Tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  'Onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  'Cumin': { calories: 375, protein: 18, carbs: 44, fat: 22, fiber: 11 },
  'Turmeric': { calories: 312, protein: 10, carbs: 67, fat: 3.3, fiber: 23 },
  'Black Pepper': { calories: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 25 },
  'Olive Oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  'Coconut Oil': { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  'Butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
  'Ghee': { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  'Milk': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  'Tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  'Falafel': { calories: 333, protein: 13, carbs: 32, fat: 18, fiber: 5 },
  'Pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
  'Pizza': { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3 },
  'Sushi Rice': { calories: 130, protein: 2.4, carbs: 29, fat: 0.2, fiber: 0.3 }
};

// Helper functions to map Ayurveda properties
const mapCategory = (category) => {
  const categoryMap = {
    'grain': 'Grain',
    'legume': 'Legume',
    'vegetable': 'Vegetable',
    'fruit': 'Fruit',
    'spice': 'Spice',
    'dairy': 'Dairy',
    'meat': 'Meat',
    'oil': 'Oil',
    'beverage': 'Beverage'
  };
  return categoryMap[category.toLowerCase()] || 'Grain';
};

const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const mapRasa = (rasaArray) => {
  const rasaMap = {
    'sweet': 'Sweet',
    'sour': 'Sour',
    'salty': 'Salty',
    'pungent': 'Pungent',
    'bitter': 'Bitter',
    'astringent': 'Astringent'
  };
  return rasaArray.map(r => rasaMap[r.toLowerCase()] || capitalizeFirst(r));
};

const mapGuna = (gunaArray) => {
  const gunaMap = {
    'heavy': 'Heavy',
    'light': 'Light',
    'oily': 'Oily',
    'dry': 'Dry',
    'hot': 'Hot',
    'cold': 'Cold',
    'soft': 'Heavy', // Mapped to Heavy as it's not in enum
    'sharp': 'Hot',  // Mapped to Hot
    'stable': 'Stable',
    'mobile': 'Mobile'
  };
  return gunaArray.map(g => gunaMap[g.toLowerCase()] || 'Light');
};

const mapVirya = (virya) => {
  const viryaMap = {
    'cooling': 'Cold',
    'heating': 'Hot',
    'cold': 'Cold',
    'hot': 'Hot'
  };
  return viryaMap[virya.toLowerCase()] || 'Hot';
};

const mapVipaka = (vipaka) => {
  return capitalizeFirst(vipaka);
};

const mapDoshaEffect = (effect) => {
  if (effect > 0) return 'Increase';
  if (effect < 0) return 'Decrease';
  return 'Neutral';
};

const mapUnaniTemperament = (virya) => {
  // Based on Ayurveda's virya
  return virya === 'Cold' ? 'Cold' : 'Hot';
};

const mapUnaniMoisture = (gunaArray) => {
  // Check if oily/heavy or dry
  if (gunaArray.some(g => ['oily', 'heavy', 'soft'].includes(g.toLowerCase()))) {
    return 'Moist';
  }
  return 'Dry';
};

const mapUnaniDigestion = (digestibilityScore) => {
  if (digestibilityScore <= 2) return 'Easy';
  if (digestibilityScore <= 4) return 'Moderate';
  return 'Heavy';
};

const mapTCMThermal = (virya) => {
  const thermalMap = {
    'Cold': 'Cool',
    'Hot': 'Warm'
  };
  return thermalMap[virya] || 'Neutral';
};

const mapTCMMeridian = (category) => {
  const meridianMap = {
    'Grain': ['Spleen', 'Stomach'],
    'Legume': ['Spleen', 'Kidney'],
    'Vegetable': ['Liver', 'Stomach'],
    'Fruit': ['Lung', 'Stomach'],
    'Spice': ['Spleen', 'Stomach'],
    'Dairy': ['Spleen', 'Stomach'],
    'Meat': ['Spleen', 'Kidney'],
    'Oil': ['Spleen', 'Liver'],
    'Beverage': ['Stomach', 'Kidney']
  };
  return meridianMap[category] || ['Spleen'];
};

const mapTCMFlavor = (rasaArray) => {
  const flavorMap = {
    'Sweet': 'Sweet',
    'Sour': 'Sour',
    'Salty': 'Salty',
    'Pungent': 'Pungent',
    'Bitter': 'Bitter',
    'Astringent': 'Bitter' // Map astringent to bitter
  };
  return rasaArray.map(r => flavorMap[r] || 'Sweet');
};

const transformFood = (ayurvedaFood) => {
  const nutrition = nutritionData[ayurvedaFood.food_name] || { calories: 100, protein: 2, carbs: 20, fat: 2, fiber: 1 };
  const mappedCategory = mapCategory(ayurvedaFood.category);
  const mappedRasa = mapRasa(ayurvedaFood.rasa);
  const mappedGuna = mapGuna(ayurvedaFood.guna);
  const mappedVirya = mapVirya(ayurvedaFood.virya);

  return {
    name: ayurvedaFood.food_name,
    aliases: [],
    category: mappedCategory,
    modernNutrition: {
      perUnit: '100g',
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber
    },
    ayurveda: {
      rasa: mappedRasa,
      guna: mappedGuna,
      virya: mappedVirya,
      vipaka: mapVipaka(ayurvedaFood.vipaka),
      doshaEffect: {
        vata: mapDoshaEffect(ayurvedaFood.vata_effect),
        pitta: mapDoshaEffect(ayurvedaFood.pitta_effect),
        kapha: mapDoshaEffect(ayurvedaFood.kapha_effect)
      }
    },
    unani: {
      temperament: {
        heat: mapUnaniTemperament(mappedVirya),
        moisture: mapUnaniMoisture(ayurvedaFood.guna)
      },
      digestionEase: mapUnaniDigestion(ayurvedaFood.digestibility_score)
    },
    tcm: {
      thermalNature: mapTCMThermal(mappedVirya),
      meridian: mapTCMMeridian(mappedCategory),
      flavor: mapTCMFlavor(mappedRasa)
    },
    seasonality: ['All Seasons'],
    source: 'Literature',
    verified: true
  };
};

async function seed50Foods() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Delete all existing foods
    const deletedCount = await Food.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCount.deletedCount} existing foods from database`);

    // Transform and insert 50 foods
    const transformedFoods = ayurvedaFoods.map(transformFood);
    
    console.log(`\n🌱 Seeding ${transformedFoods.length} foods from Ayurveda Constitution Database...`);
    
    const insertedFoods = await Food.insertMany(transformedFoods);
    console.log(`✅ Successfully seeded ${insertedFoods.length} foods!`);

    // Display summary by category
    const categories = {};
    insertedFoods.forEach(food => {
      categories[food.category] = (categories[food.category] || 0) + 1;
    });

    console.log('\n📊 Foods by Category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    console.log('\n✅ Database seeding complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seed50Foods();

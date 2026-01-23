require('dotenv').config();
const mongoose = require('mongoose');
const Food = require('../models/Food');
const Recipe = require('../models/Recipe');

const seedRecipes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Create individual food items (only if not already exist)
    console.log('\n📦 Checking food items...');
    
    const existingFoodsCount = await Food.countDocuments();
    let createdFoods = [];
    
    if (existingFoodsCount > 0) {
      console.log(`Found ${existingFoodsCount} existing food items, skipping food creation`);
      createdFoods = await Food.find();
    } else {
      console.log('No foods found, creating...');
    
    const foods = [
      // Grains
      { name: 'Rice', category: 'Grain', modernNutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 } },
      { name: 'Wheat Flour', category: 'Grain', modernNutrition: { calories: 340, protein: 10, carbs: 72, fat: 1.5, fiber: 2.5 } },
      { name: 'Oats', category: 'Grain', modernNutrition: { calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7 } },
      
      // Legumes
      { name: 'Moong Dal', category: 'Legume', modernNutrition: { calories: 105, protein: 7, carbs: 19, fat: 0.4, fiber: 5 } },
      
      // Vegetables
      { name: 'Mixed Vegetables', category: 'Vegetable', modernNutrition: { calories: 50, protein: 2, carbs: 10, fat: 0.2, fiber: 3 } },
      { name: 'Carrot', category: 'Vegetable', modernNutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 } },
      { name: 'Pumpkin', category: 'Vegetable', modernNutrition: { calories: 26, protein: 1, carbs: 7, fat: 0.1, fiber: 0.5 } },
      { name: 'Bottle Gourd', category: 'Vegetable', modernNutrition: { calories: 14, protein: 0.6, carbs: 3.4, fat: 0, fiber: 0.5 } },
      { name: 'Cabbage', category: 'Vegetable', modernNutrition: { calories: 25, protein: 1.3, carbs: 6, fat: 0.1, fiber: 2.5 } },
      { name: 'Broccoli', category: 'Vegetable', modernNutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 } },
      { name: 'Beans', category: 'Vegetable', modernNutrition: { calories: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 2.7 } },
      { name: 'Spinach', category: 'Vegetable', modernNutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, micronutrients: { iron: 2.7 } } },
      { name: 'Beetroot', category: 'Vegetable', modernNutrition: { calories: 43, protein: 1.6, carbs: 10, fat: 0.2, fiber: 2.8, micronutrients: { iron: 0.8 } } },
      
      // Dairy
      { name: 'Curd', aliases: ['Yogurt'], category: 'Dairy', modernNutrition: { calories: 60, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 } },
      { name: 'Milk', category: 'Dairy', modernNutrition: { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0 } },
      { name: 'Ghee', category: 'Dairy', modernNutrition: { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 } },
      
      // Spices
      { name: 'Turmeric', category: 'Spice', modernNutrition: { calories: 312, protein: 10, carbs: 67, fat: 3, fiber: 22 } },
      { name: 'Salt', category: 'Spice', modernNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } },
      { name: 'Cumin', category: 'Spice', modernNutrition: { calories: 375, protein: 18, carbs: 44, fat: 22, fiber: 11 } },
      { name: 'Ginger', category: 'Spice', modernNutrition: { calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2 } },
      { name: 'Coriander', category: 'Spice', modernNutrition: { calories: 23, protein: 2.1, carbs: 3.7, fat: 0.5, fiber: 2.8 } },
      { name: 'Mustard Seeds', category: 'Spice', modernNutrition: { calories: 508, protein: 26, carbs: 28, fat: 36, fiber: 12 } },
      { name: 'Pepper', category: 'Spice', modernNutrition: { calories: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 25 } },
      
      // Oils
      { name: 'Coconut Oil', category: 'Oil', modernNutrition: { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 } },
      { name: 'Oil', category: 'Oil', modernNutrition: { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 } },
      
      // Fruits & Others
      { name: 'Coconut (grated)', category: 'Nut', modernNutrition: { calories: 354, protein: 3.3, carbs: 15, fat: 33, fiber: 9 } },
      { name: 'Jaggery', category: 'Grain', modernNutrition: { calories: 383, protein: 0.4, carbs: 98, fat: 0.1, fiber: 0 } },
      { name: 'Seeds Mix', category: 'Nut', modernNutrition: { calories: 500, protein: 20, carbs: 20, fat: 40, fiber: 10 } },
      { name: 'Apple', category: 'Fruit', modernNutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 } },
      { name: 'Lemon Juice', category: 'Fruit', modernNutrition: { calories: 22, protein: 0.4, carbs: 7, fat: 0.2, fiber: 0.3, micronutrients: { vitaminC: 39 } } },
      { name: 'Water', category: 'Beverage', modernNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } },
      { name: 'Vegetable Soup Base', category: 'Beverage', modernNutrition: { calories: 20, protein: 1, carbs: 4, fat: 0.5, fiber: 1 } },
      { name: 'Steamed Vegetables', category: 'Vegetable', modernNutrition: { calories: 40, protein: 2, carbs: 8, fat: 0.3, fiber: 3 } },
    ];

    // Only create foods if they don't exist
    if (existingFoodsCount === 0) {
      createdFoods = await Food.insertMany(foods);
      console.log(`✅ Created ${createdFoods.length} food items`);
    }
    } // Close the else block that started at line 21

    // Create a map for easy lookup
    const foodMap = {};
    createdFoods.forEach(food => {
      foodMap[food.name.toLowerCase()] = food._id;
    });

    // Step 2: Create recipes
    console.log('\n🍽️ Creating recipes...');

    const recipes = [
      {
        name: 'Plain Steamed Rice',
        description: 'Simple steamed rice, easy to digest',
        ingredients: [
          { foodId: foodMap['rice'], quantity: 100, unit: 'g' },
          { foodId: foodMap['water'], quantity: 200, unit: 'ml' }
        ],
        cookingMethod: {
          type: 'Boiled',
          description: 'Boil rice with water until cooked',
          duration: 20
        },
        nutrientSnapshot: {
          servingSize: 300,
          servingUnit: 'g',
          calories: 130,
          protein: 2.7,
          carbs: 28,
          fat: 0.3,
          fiber: 0.4
        },
        tags: ['Vegan', 'Gluten-Free', 'Easy-Digestion'],
        difficulty: 'Easy',
        prepTime: 5,
        cookTime: 20,
        createdBy: {
          type: 'System'
        },
        isPublic: true
      },
      {
        name: 'Soft Chapati',
        description: 'Soft whole wheat flatbread',
        ingredients: [
          { foodId: foodMap['wheat flour'], quantity: 60, unit: 'g' },
          { foodId: foodMap['water'], quantity: 40, unit: 'ml' }
        ],
        cookingMethod: {
          type: 'Baked',
          description: 'Roasted on tawa',
          duration: 10
        },
        nutrientSnapshot: {
          servingSize: 100,
          servingUnit: 'g',
          calories: 240,
          protein: 6.5,
          carbs: 48,
          fat: 1.2,
          fiber: 2
        },
        tags: ['Vegetarian', 'Indian-Bread'],
        difficulty: 'Medium',
        prepTime: 15,
        cookTime: 10,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Moong Dal (Boiled)',
        description: 'Simple boiled moong dal with turmeric',
        ingredients: [
          { foodId: foodMap['moong dal'], quantity: 60, unit: 'g' },
          { foodId: foodMap['water'], quantity: 250, unit: 'ml' },
          { foodId: foodMap['turmeric'], quantity: 1, unit: 'g' },
          { foodId: foodMap['salt'], quantity: 1, unit: 'g' }
        ],
        cookingMethod: {
          type: 'Boiled',
          description: 'Boil moong dal with turmeric and salt',
          duration: 25
        },
        nutrientSnapshot: {
          servingSize: 312,
          servingUnit: 'g',
          calories: 105,
          protein: 7,
          carbs: 19,
          fat: 0.4,
          fiber: 5
        },
        tags: ['Vegan', 'Protein-Rich', 'Easy-Digestion'],
        difficulty: 'Easy',
        prepTime: 5,
        cookTime: 25,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Curd Rice',
        description: 'Cooling rice mixed with curd',
        ingredients: [
          { foodId: foodMap['rice'], quantity: 80, unit: 'g' },
          { foodId: foodMap['curd'], quantity: 120, unit: 'g' },
          { foodId: foodMap['water'], quantity: 150, unit: 'ml' },
          { foodId: foodMap['salt'], quantity: 1, unit: 'g' }
        ],
        cookingMethod: {
          type: 'Boiled',
          description: 'Boil rice, cool and mix with curd',
          duration: 25
        },
        nutrientSnapshot: {
          servingSize: 351,
          servingUnit: 'g',
          calories: 176,
          protein: 6.6,
          carbs: 28.4,
          fat: 4.3,
          fiber: 0.3
        },
        tags: ['Vegetarian', 'Probiotic', 'Cooling'],
        difficulty: 'Easy',
        prepTime: 5,
        cookTime: 25,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Vegetable Khichdi',
        description: 'Wholesome one-pot meal with rice, dal and vegetables',
        ingredients: [
          { foodId: foodMap['rice'], quantity: 50, unit: 'g' },
          { foodId: foodMap['moong dal'], quantity: 40, unit: 'g' },
          { foodId: foodMap['mixed vegetables'], quantity: 60, unit: 'g' },
          { foodId: foodMap['ghee'], quantity: 5, unit: 'g' },
          { foodId: foodMap['turmeric'], quantity: 1, unit: 'g' },
          { foodId: foodMap['cumin'], quantity: 1, unit: 'g' },
          { foodId: foodMap['water'], quantity: 300, unit: 'ml' }
        ],
        cookingMethod: {
          type: 'Boiled',
          description: 'Cook rice, dal and vegetables together with spices',
          duration: 30
        },
        nutrientSnapshot: {
          servingSize: 457,
          servingUnit: 'g',
          calories: 220,
          protein: 8,
          carbs: 38,
          fat: 5.5,
          fiber: 7
        },
        tags: ['Vegetarian', 'One-Pot', 'Balanced-Meal'],
        difficulty: 'Easy',
        prepTime: 10,
        cookTime: 30,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Vata Balancing Vegetable Soup',
        description: 'Warm grounding soup for Vata constitution',
        ingredients: [
          { foodId: foodMap['carrot'], quantity: 50, unit: 'g' },
          { foodId: foodMap['pumpkin'], quantity: 50, unit: 'g' },
          { foodId: foodMap['ginger'], quantity: 3, unit: 'g' },
          { foodId: foodMap['ghee'], quantity: 5, unit: 'g' },
          { foodId: foodMap['water'], quantity: 300, unit: 'ml' }
        ],
        cookingMethod: {
          type: 'Boiled',
          description: 'Boil vegetables with ginger, blend and add ghee',
          duration: 25
        },
        nutrientSnapshot: {
          servingSize: 408,
          servingUnit: 'ml',
          calories: 95,
          protein: 1.6,
          carbs: 14,
          fat: 5.2,
          fiber: 2.8
        },
        tags: ['Vegan', 'Vata-Balancing', 'Warming'],
        difficulty: 'Easy',
        prepTime: 10,
        cookTime: 25,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Warm Oats Porridge',
        description: 'Nourishing warm porridge with milk and jaggery',
        ingredients: [
          { foodId: foodMap['oats'], quantity: 50, unit: 'g' },
          { foodId: foodMap['milk'], quantity: 150, unit: 'ml' },
          { foodId: foodMap['water'], quantity: 100, unit: 'ml' },
          { foodId: foodMap['jaggery'], quantity: 5, unit: 'g' }
        ],
        cookingMethod: {
          type: 'Boiled',
          description: 'Cook oats with milk and water, add jaggery',
          duration: 10
        },
        nutrientSnapshot: {
          servingSize: 305,
          servingUnit: 'g',
          calories: 150,
          protein: 6.5,
          carbs: 24,
          fat: 2.9,
          fiber: 1.7
        },
        tags: ['Vegetarian', 'Breakfast', 'Energy-Boosting'],
        difficulty: 'Easy',
        prepTime: 2,
        cookTime: 10,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Pitta Soothing Khichdi',
        description: 'Cooling khichdi for Pitta balance',
        ingredients: [
          { foodId: foodMap['rice'], quantity: 50, unit: 'g' },
          { foodId: foodMap['moong dal'], quantity: 40, unit: 'g' },
          { foodId: foodMap['bottle gourd'], quantity: 60, unit: 'g' },
          { foodId: foodMap['ghee'], quantity: 5, unit: 'g' },
          { foodId: foodMap['coriander'], quantity: 2, unit: 'g' },
          { foodId: foodMap['water'], quantity: 300, unit: 'ml' }
        ],
        cookingMethod: {
          type: 'Boiled',
          description: 'Cook rice, dal and bottle gourd with cooling spices',
          duration: 30
        },
        nutrientSnapshot: {
          servingSize: 457,
          servingUnit: 'g',
          calories: 200,
          protein: 8,
          carbs: 35,
          fat: 5.3,
          fiber: 5.5
        },
        tags: ['Vegetarian', 'Pitta-Balancing', 'Cooling'],
        difficulty: 'Easy',
        prepTime: 10,
        cookTime: 30,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Coconut Vegetable Stir Fry',
        description: 'Light stir fry with coconut',
        ingredients: [
          { foodId: foodMap['mixed vegetables'], quantity: 100, unit: 'g' },
          { foodId: foodMap['coconut (grated)'], quantity: 20, unit: 'g' },
          { foodId: foodMap['coconut oil'], quantity: 5, unit: 'g' },
          { foodId: foodMap['mustard seeds'], quantity: 1, unit: 'g' }
        ],
        cookingMethod: {
          type: 'Sauteed',
          description: 'Stir fry vegetables with mustard seeds and coconut',
          duration: 15
        },
        nutrientSnapshot: {
          servingSize: 126,
          servingUnit: 'g',
          calories: 210,
          protein: 3.5,
          carbs: 13,
          fat: 17,
          fiber: 6
        },
        tags: ['Vegan', 'Quick-Cook', 'South-Indian'],
        difficulty: 'Easy',
        prepTime: 10,
        cookTime: 15,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Kapha Light Stir Fry',
        description: 'Light and warming stir fry for Kapha',
        ingredients: [
          { foodId: foodMap['cabbage'], quantity: 80, unit: 'g' },
          { foodId: foodMap['carrot'], quantity: 40, unit: 'g' },
          { foodId: foodMap['ginger'], quantity: 3, unit: 'g' },
          { foodId: foodMap['mustard seeds'], quantity: 1, unit: 'g' },
          { foodId: foodMap['oil'], quantity: 5, unit: 'g' }
        ],
        cookingMethod: {
          type: 'Sauteed',
          description: 'Quick stir fry with warming spices',
          duration: 12
        },
        nutrientSnapshot: {
          servingSize: 129,
          servingUnit: 'g',
          calories: 80,
          protein: 1.8,
          carbs: 12,
          fat: 5.3,
          fiber: 4.5
        },
        tags: ['Vegan', 'Kapha-Balancing', 'Light'],
        difficulty: 'Easy',
        prepTime: 10,
        cookTime: 12,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Steamed Vegetables with Spices',
        description: 'Healthy steamed vegetables',
        ingredients: [
          { foodId: foodMap['broccoli'], quantity: 60, unit: 'g' },
          { foodId: foodMap['beans'], quantity: 40, unit: 'g' },
          { foodId: foodMap['carrot'], quantity: 40, unit: 'g' },
          { foodId: foodMap['pepper'], quantity: 1, unit: 'g' }
        ],
        cookingMethod: {
          type: 'Steamed',
          description: 'Steam vegetables and season with pepper',
          duration: 15
        },
        nutrientSnapshot: {
          servingSize: 141,
          servingUnit: 'g',
          calories: 48,
          protein: 3.2,
          carbs: 10,
          fat: 0.4,
          fiber: 5.6
        },
        tags: ['Vegan', 'Low-Calorie', 'Healthy'],
        difficulty: 'Easy',
        prepTime: 10,
        cookTime: 15,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Diabetic-Friendly Breakfast Bowl',
        description: 'Low glycemic breakfast with oats and seeds',
        ingredients: [
          { foodId: foodMap['oats'], quantity: 40, unit: 'g' },
          { foodId: foodMap['seeds mix'], quantity: 15, unit: 'g' },
          { foodId: foodMap['apple'], quantity: 50, unit: 'g' },
          { foodId: foodMap['curd'], quantity: 80, unit: 'g' }
        ],
        cookingMethod: {
          type: 'Raw',
          description: 'Mix all ingredients, can soak oats if preferred',
          duration: 5
        },
        nutrientSnapshot: {
          servingSize: 185,
          servingUnit: 'g',
          calories: 260,
          protein: 11,
          carbs: 27,
          fat: 11,
          fiber: 8
        },
        tags: ['Vegetarian', 'Diabetic-Friendly', 'High-Fiber'],
        difficulty: 'Easy',
        prepTime: 5,
        cookTime: 0,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Acid Reflux Soothing Meal',
        description: 'Gentle meal for acid reflux',
        ingredients: [
          { foodId: foodMap['rice'], quantity: 60, unit: 'g' },
          { foodId: foodMap['bottle gourd'], quantity: 80, unit: 'g' },
          { foodId: foodMap['cumin'], quantity: 1, unit: 'g' },
          { foodId: foodMap['ghee'], quantity: 5, unit: 'g' },
          { foodId: foodMap['water'], quantity: 250, unit: 'ml' }
        ],
        cookingMethod: {
          type: 'Boiled',
          description: 'Cook rice and bottle gourd with mild spices',
          duration: 25
        },
        nutrientSnapshot: {
          servingSize: 396,
          servingUnit: 'g',
          calories: 135,
          protein: 2.4,
          carbs: 20,
          fat: 5.2,
          fiber: 0.8
        },
        tags: ['Vegetarian', 'Gentle', 'Easy-Digestion'],
        difficulty: 'Easy',
        prepTime: 5,
        cookTime: 25,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Light Dinner for Digestion',
        description: 'Light evening meal for better digestion',
        ingredients: [
          { foodId: foodMap['vegetable soup base'], quantity: 150, unit: 'ml' },
          { foodId: foodMap['steamed vegetables'], quantity: 80, unit: 'g' },
          { foodId: foodMap['ginger'], quantity: 2, unit: 'g' }
        ],
        cookingMethod: {
          type: 'Boiled',
          description: 'Heat soup with vegetables and ginger',
          duration: 10
        },
        nutrientSnapshot: {
          servingSize: 232,
          servingUnit: 'g',
          calories: 72,
          protein: 3,
          carbs: 14,
          fat: 0.7,
          fiber: 4
        },
        tags: ['Vegan', 'Low-Calorie', 'Light-Dinner'],
        difficulty: 'Easy',
        prepTime: 5,
        cookTime: 10,
        createdBy: { type: 'System' },
        isPublic: true
      },
      {
        name: 'Iron-Rich Vegetable Bowl',
        description: 'Nutrient-dense bowl with iron-rich vegetables',
        ingredients: [
          { foodId: foodMap['spinach'], quantity: 80, unit: 'g' },
          { foodId: foodMap['beetroot'], quantity: 50, unit: 'g' },
          { foodId: foodMap['lemon juice'], quantity: 5, unit: 'ml' },
          { foodId: foodMap['oil'], quantity: 5, unit: 'g' }
        ],
        cookingMethod: {
          type: 'Sauteed',
          description: 'Light sauté spinach and beetroot, add lemon',
          duration: 10
        },
        nutrientSnapshot: {
          servingSize: 140,
          servingUnit: 'g',
          calories: 90,
          protein: 3.8,
          carbs: 11,
          fat: 5.5,
          fiber: 4.5
        },
        tags: ['Vegan', 'Iron-Rich', 'Nutrient-Dense'],
        difficulty: 'Easy',
        prepTime: 10,
        cookTime: 10,
        createdBy: { type: 'System' },
        isPublic: true
      }
    ];

    // Clear existing recipes (optional)
    // await Recipe.deleteMany({});
    
    const createdRecipes = await Recipe.insertMany(recipes);
    console.log(`✅ Created ${createdRecipes.length} recipes`);

    console.log('\n✨ Database seeded successfully!');
    console.log(`\nSummary:`);
    console.log(`  - Foods: ${createdFoods.length}`);
    console.log(`  - Recipes: ${createdRecipes.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedRecipes();

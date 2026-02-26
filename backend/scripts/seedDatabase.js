const mongoose = require('mongoose');
const connectDB = require('../config/database');
require('dotenv').config();

// Import all models
const {
  User,
  HealthProfile,
  Practitioner,
  Food,
  Recipe,
  DietPlan,
  AuditLog,
  MedicalCondition
} = require('../models');

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log('\n🔄 Starting database initialization...\n');

    // Create collections explicitly (Mongoose does this automatically, but being explicit)
    const collections = [
      { name: 'users', model: User },
      { name: 'healthprofiles', model: HealthProfile },
      { name: 'practitioners', model: Practitioner },
      { name: 'foods', model: Food },
      { name: 'recipes', model: Recipe },
      { name: 'dietplans', model: DietPlan },
      { name: 'auditlogs', model: AuditLog },
      { name: 'medicalconditions', model: MedicalCondition }
    ];

    for (const collection of collections) {
      await collection.model.createCollection();
      console.log(`✅ Created collection: ${collection.name}`);
    }

    console.log('\n🎉 Database initialization completed successfully!\n');

    // Optional: Seed some initial data
    await seedInitialData();

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
};

const seedInitialData = async () => {
  try {
    console.log('\n🌱 Seeding initial data...\n');

    // Seed Medical Conditions
    const conditionsCount = await MedicalCondition.countDocuments();
    if (conditionsCount === 0) {
      const medicalConditions = [
        {
          name: 'Diabetes Mellitus Type 2',
          category: 'Metabolic',
          description: 'A chronic condition affecting the way the body processes blood sugar (glucose)',
          commonSymptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision'],
          dietaryRestrictions: ['Refined sugars', 'High glycemic foods', 'Processed carbohydrates'],
          traditionalPerspectives: {
            ayurveda: {
              doshaImbalance: ['Kapha', 'Pitta'],
              recommendations: 'Focus on bitter and astringent foods, avoid sweet and heavy foods'
            },
            unani: {
              mizajDisorder: 'Excess heat and moisture imbalance',
              recommendations: 'Use cooling herbs, avoid hot temperament foods'
            }
          }
        },
        {
          name: 'Hypertension',
          category: 'Cardiac',
          description: 'High blood pressure condition',
          commonSymptoms: ['Headaches', 'Dizziness', 'Chest pain'],
          dietaryRestrictions: ['High sodium foods', 'Caffeine', 'Alcohol'],
          traditionalPerspectives: {
            ayurveda: {
              doshaImbalance: ['Pitta', 'Vata'],
              recommendations: 'Calming foods, reduce salt and spices'
            }
          }
        },
        {
          name: 'Irritable Bowel Syndrome',
          category: 'Digestive',
          description: 'A common disorder affecting the large intestine',
          commonSymptoms: ['Abdominal pain', 'Bloating', 'Gas', 'Diarrhea or constipation'],
          dietaryRestrictions: ['High FODMAP foods', 'Dairy', 'Gluten', 'Spicy foods'],
          traditionalPerspectives: {
            ayurveda: {
              doshaImbalance: ['Vata'],
              recommendations: 'Warm, cooked foods; avoid raw and cold foods'
            }
          }
        },
        {
          name: 'Hypothyroidism',
          category: 'Hormonal',
          description: 'Underactive thyroid gland condition',
          commonSymptoms: ['Fatigue', 'Weight gain', 'Cold sensitivity', 'Constipation'],
          dietaryRestrictions: ['Goitrogenic foods in excess', 'Soy products', 'Cruciferous vegetables raw']
        },
        {
          name: 'PCOD/PCOS',
          category: 'Hormonal',
          description: 'Polycystic Ovary Syndrome - hormonal disorder in women',
          commonSymptoms: ['Irregular periods', 'Weight gain', 'Acne', 'Hair growth'],
          dietaryRestrictions: ['Refined carbohydrates', 'Sugary foods', 'Processed foods'],
          traditionalPerspectives: {
            ayurveda: {
              doshaImbalance: ['Kapha', 'Pitta'],
              recommendations: 'Light, warm foods; increase fiber; reduce dairy'
            }
          }
        }
      ];

      await MedicalCondition.insertMany(medicalConditions);
      console.log(`✅ Seeded ${medicalConditions.length} medical conditions`);
    }

    // Seed Sample Foods
    const foodsCount = await Food.countDocuments();
    if (foodsCount === 0) {
      const sampleFoods = [
        {
          name: 'Rice (White)',
          aliases: ['Chawal', 'Akki'],
          category: 'Grain',
          modernNutrition: {
            perUnit: '100g',
            calories: 130,
            protein: 2.7,
            carbs: 28,
            fat: 0.3,
            fiber: 0.4
          },
          ayurveda: {
            rasa: ['Sweet'],
            guna: ['Heavy', 'Oily'],
            virya: 'Cold',
            vipaka: 'Sweet',
            doshaEffect: {
              vata: 'Decrease',
              pitta: 'Decrease',
              kapha: 'Increase'
            }
          },
          unani: {
            temperament: {
              heat: 'Cold',
              moisture: 'Moist'
            },
            digestionEase: 'Easy'
          },
          tcm: {
            thermalNature: 'Neutral',
            meridian: ['Spleen', 'Stomach'],
            flavor: ['Sweet']
          },
          seasonality: ['All Seasons'],
          source: 'USDA',
          verified: true
        },
        {
          name: 'Spinach',
          aliases: ['Palak', 'Soppu'],
          category: 'Vegetable',
          modernNutrition: {
            perUnit: '100g',
            calories: 23,
            protein: 2.9,
            carbs: 3.6,
            fat: 0.4,
            fiber: 2.2,
            micronutrients: {
              iron: 2.7,
              calcium: 99,
              vitaminC: 28
            }
          },
          ayurveda: {
            rasa: ['Sweet', 'Astringent'],
            guna: ['Light', 'Dry'],
            virya: 'Cold',
            vipaka: 'Sweet',
            doshaEffect: {
              vata: 'Increase',
              pitta: 'Decrease',
              kapha: 'Decrease'
            }
          },
          unani: {
            temperament: {
              heat: 'Cold',
              moisture: 'Moist'
            },
            digestionEase: 'Moderate'
          },
          tcm: {
            thermalNature: 'Cool',
            meridian: ['Liver', 'Large Intestine'],
            flavor: ['Sweet']
          },
          seasonality: ['Winter', 'Spring'],
          source: 'USDA',
          verified: true
        },
        {
          name: 'Turmeric',
          aliases: ['Haldi', 'Arishina'],
          category: 'Spice',
          modernNutrition: {
            perUnit: '100g',
            calories: 354,
            protein: 7.8,
            carbs: 65,
            fat: 10,
            fiber: 21
          },
          ayurveda: {
            rasa: ['Bitter', 'Pungent'],
            guna: ['Light', 'Dry'],
            virya: 'Hot',
            vipaka: 'Pungent',
            doshaEffect: {
              vata: 'Decrease',
              pitta: 'Neutral',
              kapha: 'Decrease'
            }
          },
          unani: {
            temperament: {
              heat: 'Hot',
              moisture: 'Dry'
            },
            digestionEase: 'Easy'
          },
          tcm: {
            thermalNature: 'Warm',
            meridian: ['Spleen', 'Liver'],
            flavor: ['Bitter', 'Pungent']
          },
          seasonality: ['All Seasons'],
          source: 'AYUSH',
          verified: true
        },
        {
          name: 'Ghee',
          aliases: ['Clarified Butter', 'Nei'],
          category: 'Oil',
          modernNutrition: {
            perUnit: '100g',
            calories: 900,
            protein: 0,
            carbs: 0,
            fat: 100,
            fiber: 0
          },
          ayurveda: {
            rasa: ['Sweet'],
            guna: ['Oily', 'Heavy'],
            virya: 'Cold',
            vipaka: 'Sweet',
            doshaEffect: {
              vata: 'Decrease',
              pitta: 'Decrease',
              kapha: 'Increase'
            }
          },
          unani: {
            temperament: {
              heat: 'Hot',
              moisture: 'Moist'
            },
            digestionEase: 'Easy'
          },
          tcm: {
            thermalNature: 'Warm',
            meridian: ['Spleen'],
            flavor: ['Sweet']
          },
          seasonality: ['All Seasons'],
          source: 'AYUSH',
          verified: true
        },
        {
          name: 'Ginger',
          aliases: ['Adrak', 'Shunti'],
          category: 'Spice',
          modernNutrition: {
            perUnit: '100g',
            calories: 80,
            protein: 1.8,
            carbs: 18,
            fat: 0.8,
            fiber: 2
          },
          ayurveda: {
            rasa: ['Pungent', 'Sweet'],
            guna: ['Light', 'Oily'],
            virya: 'Hot',
            vipaka: 'Sweet',
            doshaEffect: {
              vata: 'Decrease',
              pitta: 'Increase',
              kapha: 'Decrease'
            }
          },
          unani: {
            temperament: {
              heat: 'Hot',
              moisture: 'Dry'
            },
            digestionEase: 'Easy'
          },
          tcm: {
            thermalNature: 'Hot',
            meridian: ['Lung', 'Spleen', 'Stomach'],
            flavor: ['Pungent']
          },
          seasonality: ['All Seasons'],
          source: 'AYUSH',
          verified: true
        },
        {
          name: 'Coconut Water',
          aliases: ['Nariyal Pani', 'Tender Coconut Water'],
          category: 'Beverage',
          modernNutrition: {
            perUnit: '100ml',
            calories: 19,
            protein: 0.7,
            carbs: 3.7,
            fat: 0.2,
            fiber: 1.1
          },
          ayurveda: {
            rasa: ['Sweet'],
            guna: ['Light', 'Cold'],
            virya: 'Cold',
            vipaka: 'Sweet',
            doshaEffect: {
              vata: 'Neutral',
              pitta: 'Decrease',
              kapha: 'Neutral'
            }
          },
          unani: {
            temperament: {
              heat: 'Cold',
              moisture: 'Moist'
            },
            digestionEase: 'Easy'
          },
          tcm: {
            thermalNature: 'Cool',
            meridian: ['Heart', 'Stomach'],
            flavor: ['Sweet']
          },
          seasonality: ['Summer', 'Spring'],
          source: 'Traditional',
          verified: true
        },
        {
          name: 'Cucumber',
          aliases: ['Kheera', 'Soutekayi'],
          category: 'Vegetable',
          modernNutrition: {
            perUnit: '100g',
            calories: 15,
            protein: 0.7,
            carbs: 3.6,
            fat: 0.1,
            fiber: 0.5
          },
          ayurveda: {
            rasa: ['Sweet'],
            guna: ['Light', 'Cold'],
            virya: 'Cold',
            vipaka: 'Sweet',
            doshaEffect: {
              vata: 'Neutral',
              pitta: 'Decrease',
              kapha: 'Decrease'
            }
          },
          unani: {
            temperament: {
              heat: 'Cold',
              moisture: 'Moist'
            },
            digestionEase: 'Easy'
          },
          tcm: {
            thermalNature: 'Cool',
            meridian: ['Bladder', 'Stomach'],
            flavor: ['Sweet']
          },
          seasonality: ['Summer'],
          source: 'USDA',
          verified: true
        },
        {
          name: 'Basmati Rice',
          aliases: ['Basmati Chawal'],
          category: 'Grain',
          modernNutrition: {
            perUnit: '100g',
            calories: 121,
            protein: 3.5,
            carbs: 25,
            fat: 0.4,
            fiber: 0.6
          },
          ayurveda: {
            rasa: ['Sweet'],
            guna: ['Light'],
            virya: 'Cold',
            vipaka: 'Sweet',
            doshaEffect: {
              vata: 'Decrease',
              pitta: 'Decrease',
              kapha: 'Neutral'
            }
          },
          unani: {
            temperament: {
              heat: 'Cold',
              moisture: 'Moist'
            },
            digestionEase: 'Easy'
          },
          tcm: {
            thermalNature: 'Neutral',
            meridian: ['Spleen', 'Stomach'],
            flavor: ['Sweet']
          },
          seasonality: ['All Seasons'],
          source: 'Traditional',
          verified: true
        }
      ];

      await Food.insertMany(sampleFoods);
      console.log(`✅ Seeded ${sampleFoods.length} sample foods`);
    }

    console.log('\n✅ Initial data seeding completed!\n');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Run initialization
initializeDatabase();

const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  aliases: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Grain', 'Vegetable', 'Fruit', 'Dairy', 'Meat', 'Spice', 'Oil', 'Legume', 'Nut', 'Beverage'],
    required: [true, 'Category is required']
  },
  modernNutrition: {
    perUnit: {
      type: String,
      default: '100g'
    },
    calories: {
      type: Number,
      min: 0
    },
    protein: {
      type: Number,
      min: 0
    },
    carbs: {
      type: Number,
      min: 0
    },
    fat: {
      type: Number,
      min: 0
    },
    fiber: {
      type: Number,
      min: 0
    },
    micronutrients: {
      iron: Number,
      calcium: Number,
      vitaminC: Number,
      vitaminD: Number,
      vitaminB12: Number,
      magnesium: Number,
      potassium: Number,
      zinc: Number
    }
  },
  ayurveda: {
    rasa: [{
      type: String,
      enum: ['Sweet', 'Sour', 'Salty', 'Pungent', 'Bitter', 'Astringent']
    }],
    guna: [{
      type: String,
      enum: ['Heavy', 'Light', 'Oily', 'Dry', 'Hot', 'Cold', 'Stable', 'Mobile']
    }],
    virya: {
      type: String,
      enum: ['Hot', 'Cold']
    },
    vipaka: {
      type: String,
      enum: ['Sweet', 'Sour', 'Pungent']
    },
    doshaEffect: {
      vata: {
        type: String,
        enum: ['Increase', 'Decrease', 'Neutral']
      },
      pitta: {
        type: String,
        enum: ['Increase', 'Decrease', 'Neutral']
      },
      kapha: {
        type: String,
        enum: ['Increase', 'Decrease', 'Neutral']
      }
    }
  },
  unani: {
    // Temperament Levels (0-4 scale for granular scoring)
    temperament: {
      hot_level: {
        type: Number,
        min: 0,
        max: 4,
        default: 0
      },
      cold_level: {
        type: Number,
        min: 0,
        max: 4,
        default: 0
      },
      moist_level: {
        type: Number,
        min: 0,
        max: 4,
        default: 0
      },
      dry_level: {
        type: Number,
        min: 0,
        max: 4,
        default: 0
      },
      // Legacy fields for backward compatibility
      heat: {
        type: String,
        enum: ['Hot', 'Cold', 'Neutral']
      },
      moisture: {
        type: String,
        enum: ['Moist', 'Dry', 'Neutral']
      }
    },
    // Effect on Four Humors (Akhlat)
    humorEffects: {
      dam: {
        type: Number,
        enum: [-1, 0, 1],
        default: 0
      },
      safra: {
        type: Number,
        enum: [-1, 0, 1],
        default: 0
      },
      balgham: {
        type: Number,
        enum: [-1, 0, 1],
        default: 0
      },
      sauda: {
        type: Number,
        enum: [-1, 0, 1],
        default: 0
      }
    },
    // Digestive Properties
    digestibility_level: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    flatulence_potential: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    // Legacy field for backward compatibility
    digestionEase: {
      type: String,
      enum: ['Easy', 'Moderate', 'Heavy']
    }
  },
  tcm: {
    // Thermal Nature
    thermalNature: {
      type: String,
      enum: ['Hot', 'Warm', 'Neutral', 'Cool', 'Cold']
    },
    // Meridian Targets
    meridian: [{
      type: String,
      enum: ['Lung', 'Large Intestine', 'Stomach', 'Spleen', 'Heart', 'Small Intestine', 'Bladder', 'Kidney', 'Pericardium', 'Triple Burner', 'Gallbladder', 'Liver']
    }],
    // Five Flavors
    flavor: [{
      type: String,
      enum: ['Sweet', 'Sour', 'Bitter', 'Pungent', 'Salty']
    }],
    // Pattern-Specific Properties
    tonifies_qi: {
      type: Boolean,
      default: false
    },
    nourishes_yin: {
      type: Boolean,
      default: false
    },
    warms_yang: {
      type: Boolean,
      default: false
    },
    clears_heat: {
      type: Boolean,
      default: false
    },
    resolves_dampness: {
      type: Boolean,
      default: false
    },
    moves_qi: {
      type: Boolean,
      default: false
    },
    nourishes_blood: {
      type: Boolean,
      default: false
    },
    // Additional Clinical Properties
    damp_forming: {
      type: Boolean,
      default: false
    }
  },
  seasonality: [{
    type: String,
    enum: ['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter', 'All Seasons']
  }],
  source: {
    type: String,
    enum: ['USDA', 'AYUSH', 'Literature', 'Practitioner', 'Research'],
    default: 'Literature'
  },
  version: {
    type: String,
    default: '1.0'
  },
  verified: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner'
  },
  reviewedAt: Date
}, {
  timestamps: true
});

// Text index for search functionality
foodSchema.index({ name: 'text', aliases: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ verified: 1 });

module.exports = mongoose.model('Food', foodSchema);

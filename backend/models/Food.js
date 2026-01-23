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
    temperament: {
      heat: {
        type: String,
        enum: ['Hot', 'Cold']
      },
      moisture: {
        type: String,
        enum: ['Moist', 'Dry']
      }
    },
    digestionEase: {
      type: String,
      enum: ['Easy', 'Moderate', 'Heavy']
    }
  },
  tcm: {
    thermalNature: {
      type: String,
      enum: ['Hot', 'Warm', 'Neutral', 'Cool', 'Cold']
    },
    meridian: [{
      type: String,
      enum: ['Lung', 'Large Intestine', 'Stomach', 'Spleen', 'Heart', 'Small Intestine', 'Bladder', 'Kidney', 'Pericardium', 'Triple Burner', 'Gallbladder', 'Liver']
    }],
    flavor: [{
      type: String,
      enum: ['Sweet', 'Sour', 'Bitter', 'Pungent', 'Salty']
    }]
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

const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Recipe name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ingredients: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['g', 'ml', 'piece', 'cup', 'tbsp', 'tsp'],
      required: true
    }
  }],
  cookingMethod: {
    type: {
      type: String,
      enum: ['Boiled', 'Steamed', 'Fried', 'Raw', 'Baked', 'Grilled', 'Sauteed'],
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    duration: {
      type: Number,
      min: 0
    }
  },
  nutrientSnapshot: {
    perServing: {
      type: Boolean,
      default: true
    },
    servingSize: {
      type: Number,
      required: true
    },
    servingUnit: {
      type: String,
      enum: ['g', 'ml', 'piece'],
      required: true
    },
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  prepTime: {
    type: Number,
    min: 0
  },
  cookTime: {
    type: Number,
    min: 0
  },
  servings: {
    type: Number,
    min: 1,
    default: 1
  },
  createdBy: {
    type: {
      type: String,
      enum: ['User', 'Practitioner', 'System'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdBy.type'
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text index for search
recipeSchema.index({ name: 'text', tags: 'text' });
recipeSchema.index({ 'createdBy.type': 1, 'createdBy.id': 1 });

module.exports = mongoose.model('Recipe', recipeSchema);

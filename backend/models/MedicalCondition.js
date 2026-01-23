const mongoose = require('mongoose');

const medicalConditionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Condition name is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Metabolic', 'Digestive', 'Cardiac', 'Hormonal', 'Respiratory', 'Neurological', 'Autoimmune', 'Other'],
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    trim: true
  },
  commonSymptoms: [{
    type: String,
    trim: true
  }],
  dietaryRestrictions: [{
    type: String,
    trim: true
  }],
  recommendedFoods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food'
  }],
  avoidFoods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food'
  }],
  severity: {
    type: String,
    enum: ['Mild', 'Moderate', 'Severe'],
    default: 'Moderate'
  },
  traditionalPerspectives: {
    ayurveda: {
      doshaImbalance: [{
        type: String,
        enum: ['Vata', 'Pitta', 'Kapha']
      }],
      recommendations: String
    },
    unani: {
      mizajDisorder: String,
      recommendations: String
    },
    tcm: {
      organAffected: [{
        type: String
      }],
      recommendations: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text index for search
medicalConditionSchema.index({ name: 'text', description: 'text' });
medicalConditionSchema.index({ category: 1 });

module.exports = mongoose.model('MedicalCondition', medicalConditionSchema);

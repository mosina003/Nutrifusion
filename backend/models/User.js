const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  age: {
    type: Number,
    min: 0
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  height: {
    type: Number,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  dietaryPreference: {
    type: String,
    enum: ['Vegetarian', 'NonVegetarian', 'Vegan', 'Eggetarian'],
    default: 'Vegetarian'
  },
  allergies: [{
    type: String,
    trim: true
  }],
  chronicConditions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalCondition'
  }],
  prakriti: {
    status: {
      type: String,
      enum: ['Unassessed', 'Estimated', 'Confirmed'],
      default: 'Unassessed'
    },
    vata: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    pitta: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    kapha: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    source: {
      type: String,
      enum: ['Questionnaire', 'Practitioner'],
      default: 'Questionnaire'
    },
    assessedAt: Date
  },
  mizaj: {
    heat: {
      type: String,
      enum: ['Hot', 'Cold', 'Balanced'],
      default: 'Balanced'
    },
    moisture: {
      type: String,
      enum: ['Dry', 'Moist', 'Balanced'],
      default: 'Balanced'
    }
  },
  medicinePreference: [{
    type: String,
    enum: ['Ayurveda', 'Unani', 'Siddha', 'TCM', 'Modern']
  }],
  consent: {
    traditionalMedicine: {
      type: Boolean,
      default: false
    },
    modernMedicine: {
      type: Boolean,
      default: false
    },
    dataUsage: {
      type: Boolean,
      default: false
    }
  },
  assignedPractitioner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner'
  },
  hasCompletedAssessment: {
    type: Boolean,
    default: false
  },
  preferredMedicalFramework: {
    type: String,
    enum: ['ayurveda', 'unani', 'tcm', 'modern'],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

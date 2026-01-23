const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { protect, authorize, authorizeAuthority, requireVerified } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

/**
 * @route   POST /api/foods
 * @desc    Create food item (Admin/Approver only)
 * @access  Private/Practitioner (Admin or Approver)
 */
router.post(
  '/',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Approver'), // Admin bypass happens automatically in middleware
  auditLog('Food'),
  async (req, res) => {
    try {
      const {
        name,
        aliases,
        category,
        modernNutrition,
        ayurveda,
        tcm,
        unani
      } = req.body;

      // Validation
      if (!name || !category) {
        return res.status(400).json({
          success: false,
          message: 'Please provide food name and category'
        });
      }

      // Check if food already exists (case-insensitive)
      const existingFood = await Food.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
      });

      if (existingFood) {
        return res.status(400).json({
          success: false,
          message: `Food "${name}" already exists`
        });
      }

      // Create food
      const food = await Food.create({
        name,
        aliases: aliases || [],
        category,
        modernNutrition: modernNutrition || {},
        ayurveda: ayurveda || {},
        tcm: tcm || {},
        unani: unani || {}
      });

      res.status(201).json({
        success: true,
        message: 'Food item created successfully',
        data: food
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating food item',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/foods
 * @desc    Get all foods
 * @access  Private (All authenticated users)
 */
router.get('/', protect, async (req, res) => {
  try {
    const { category, search } = req.query;

    const filter = {};
    
    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Search by name or aliases
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { aliases: { $regex: search, $options: 'i' } }
      ];
    }

    const foods = await Food.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching foods',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/foods/categories
 * @desc    Get all food categories
 * @access  Private (All authenticated users)
 */
router.get('/categories', protect, async (req, res) => {
  try {
    const categories = await Food.distinct('category');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/foods/:id
 * @desc    Get single food
 * @access  Private (All authenticated users)
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    res.status(200).json({
      success: true,
      data: food
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/foods/:id
 * @desc    Update food item (Admin/Approver only)
 * @access  Private/Practitioner (Admin or Approver)
 */
router.put(
  '/:id',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Approver'), // Admin bypass happens automatically
  auditLog('Food'),
  async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);

      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food not found'
        });
      }

      const {
        name,
        aliases,
        category,
        modernNutrition,
        ayurveda,
        tcm,
        unani
      } = req.body;

      // Check if new name conflicts with existing food
      if (name && name.toLowerCase() !== food.name.toLowerCase()) {
        const existingFood = await Food.findOne({ 
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          _id: { $ne: req.params.id }
        });

        if (existingFood) {
          return res.status(400).json({
            success: false,
            message: `Food "${name}" already exists`
          });
        }
      }

      // Update fields
      if (name) food.name = name;
      if (aliases) food.aliases = aliases;
      if (category) food.category = category;
      
      // Deep merge for nested objects to preserve existing nested fields
      if (modernNutrition) {
        food.modernNutrition = {
          ...food.modernNutrition.toObject(),
          ...modernNutrition,
          micronutrients: {
            ...(food.modernNutrition.micronutrients || {}),
            ...(modernNutrition.micronutrients || {})
          }
        };
      }
      if (ayurveda) {
        food.ayurveda = {
          ...food.ayurveda.toObject(),
          ...ayurveda,
          doshaEffect: {
            ...(food.ayurveda.doshaEffect || {}),
            ...(ayurveda.doshaEffect || {})
          }
        };
      }
      if (tcm) {
        food.tcm = { ...food.tcm.toObject(), ...tcm };
      }
      if (unani) {
        food.unani = {
          ...food.unani.toObject(),
          ...unani,
          temperament: {
            ...(food.unani.temperament || {}),
            ...(unani.temperament || {})
          }
        };
      }

      await food.save();

      res.status(200).json({
        success: true,
        message: 'Food item updated successfully',
        data: food
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating food item',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/foods/:id
 * @desc    Delete food item (Admin/Approver only)
 * @access  Private/Practitioner (Admin or Approver)
 */
router.delete(
  '/:id',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Approver'), // Admin bypass happens automatically
  auditLog('Food'),
  async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);

      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food not found'
        });
      }

      // Check if food is used in any recipes
      const Recipe = require('../models/Recipe');
      const recipesUsingFood = await Recipe.countDocuments({
        'ingredients.foodId': req.params.id
      });

      if (recipesUsingFood > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete food. It is used in ${recipesUsingFood} recipe(s)`,
          recipesCount: recipesUsingFood
        });
      }

      await food.deleteOne();

      res.status(200).json({
        success: true,
        message: 'Food item deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting food item',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/foods/bulk
 * @desc    Bulk create foods (Admin/Approver only)
 * @access  Private/Practitioner (Admin or Approver)
 */
router.post(
  '/bulk',
  protect,
  authorize('practitioner'),
  requireVerified,
  authorizeAuthority('Approver'),
  auditLog('Food'),
  async (req, res) => {
    try {
      const { foods } = req.body;

      if (!foods || !Array.isArray(foods) || foods.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of foods'
        });
      }

      // Validate each food
      for (const food of foods) {
        if (!food.name || !food.category) {
          return res.status(400).json({
            success: false,
            message: 'Each food must have name and category'
          });
        }
      }

      // Check for duplicates
      const names = foods.map(f => f.name);
      const existing = await Food.find({ 
        name: { $in: names.map(n => new RegExp(`^${n}$`, 'i')) }
      });

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some foods already exist',
          existingFoods: existing.map(f => f.name)
        });
      }

      // Create all foods
      const createdFoods = await Food.insertMany(foods);

      res.status(201).json({
        success: true,
        message: `${createdFoods.length} food items created successfully`,
        count: createdFoods.length,
        data: createdFoods
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error bulk creating foods',
        error: error.message
      });
    }
  }
);

module.exports = router;

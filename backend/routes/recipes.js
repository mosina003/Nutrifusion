const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Food = require('../models/Food');
const { protect, authorize, authorizeAuthority, requireVerified } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

/**
 * Calculate recipe nutrients from ingredients
 */
const calculateRecipeNutrients = async (ingredients, servings = 1) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const ingredient of ingredients) {
    const food = await Food.findById(ingredient.foodId);
    if (food && food.modernNutrition) {
      // Assuming perUnit is 100g, adjust based on quantity
      const factor = ingredient.quantity / 100;
      
      totalCalories += (food.modernNutrition.calories || 0) * factor;
      totalProtein += (food.modernNutrition.protein || 0) * factor;
      totalCarbs += (food.modernNutrition.carbs || 0) * factor;
      totalFat += (food.modernNutrition.fat || 0) * factor;
      totalFiber += (food.modernNutrition.fiber || 0) * factor;
    }
  }

  return {
    perServing: true,
    servingSize: Math.round((ingredients.reduce((sum, i) => sum + i.quantity, 0)) / servings),
    servingUnit: 'g',
    calories: Math.round(totalCalories / servings),
    protein: Math.round((totalProtein / servings) * 10) / 10,
    carbs: Math.round((totalCarbs / servings) * 10) / 10,
    fat: Math.round((totalFat / servings) * 10) / 10,
    fiber: Math.round((totalFiber / servings) * 10) / 10
  };
};

/**
 * @route   POST /api/recipes
 * @desc    Create recipe (Practitioner or User)
 * @access  Private
 */
router.post('/', protect, auditLog('Recipe'), async (req, res) => {
  try {
    const {
      name,
      description,
      ingredients,
      cookingMethod,
      tags,
      difficulty,
      prepTime,
      cookTime,
      servings,
      isPublic
    } = req.body;

    // Validation
    if (!name || !ingredients || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipe name and at least one ingredient'
      });
    }

    // Validate all food items exist
    for (const ingredient of ingredients) {
      const food = await Food.findById(ingredient.foodId);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: `Food not found: ${ingredient.foodId}`
        });
      }
    }

    // Calculate nutrients
    const nutrientSnapshot = await calculateRecipeNutrients(ingredients, servings || 1);

    // Create recipe
    const recipe = await Recipe.create({
      name,
      description,
      ingredients,
      cookingMethod: cookingMethod || { type: 'Raw' },
      nutrientSnapshot,
      tags: tags || [],
      difficulty: difficulty || 'Medium',
      prepTime,
      cookTime,
      servings: servings || 1,
      createdBy: {
        type: req.userRole === 'user' ? 'User' : 'Practitioner',
        id: req.user?._id || req.practitioner?._id
      },
      isPublic: isPublic || false
    });

    await recipe.populate('ingredients.foodId');

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating recipe',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recipes
 * @desc    Get all recipes
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { isPublic, tags, difficulty } = req.query;

    const filter = {};
    
    // Users can only see public recipes and their own
    if (req.userRole === 'user') {
      filter.$or = [
        { isPublic: true },
        { 'createdBy.type': 'User', 'createdBy.id': req.user._id }
      ];
    }

    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    if (tags) filter.tags = { $in: tags.split(',') };
    if (difficulty) filter.difficulty = difficulty;

    const recipes = await Recipe.find(filter)
      .populate('ingredients.foodId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recipes',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/recipes/:id
 * @desc    Get single recipe
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('ingredients.foodId');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Check access
    if (!recipe.isPublic && req.userRole === 'user') {
      if (recipe.createdBy.type !== 'User' || recipe.createdBy.id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this recipe'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recipe',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/recipes/:id
 * @desc    Update recipe
 * @access  Private (Creator only)
 */
router.put('/:id', protect, auditLog('Recipe'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Authorization check
    const creatorId = recipe.createdBy.id.toString();
    const currentUserId = (req.user?._id || req.practitioner?._id).toString();
    
    if (creatorId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recipe'
      });
    }

    const {
      name,
      description,
      ingredients,
      cookingMethod,
      tags,
      difficulty,
      prepTime,
      cookTime,
      servings,
      isPublic
    } = req.body;

    // Update fields
    if (name) recipe.name = name;
    if (description) recipe.description = description;
    if (cookingMethod) recipe.cookingMethod = cookingMethod;
    if (tags) recipe.tags = tags;
    if (difficulty) recipe.difficulty = difficulty;
    if (prepTime !== undefined) recipe.prepTime = prepTime;
    if (cookTime !== undefined) recipe.cookTime = cookTime;
    if (servings) recipe.servings = servings;
    if (isPublic !== undefined) recipe.isPublic = isPublic;

    // Recalculate nutrients if ingredients changed
    if (ingredients) {
      recipe.ingredients = ingredients;
      recipe.nutrientSnapshot = await calculateRecipeNutrients(ingredients, recipe.servings);
    }

    await recipe.save();
    await recipe.populate('ingredients.foodId');

    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully',
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating recipe',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/recipes/:id
 * @desc    Delete recipe
 * @access  Private (Creator only)
 */
router.delete('/:id', protect, auditLog('Recipe'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Authorization check
    const creatorId = recipe.createdBy.id.toString();
    const currentUserId = (req.user?._id || req.practitioner?._id).toString();
    
    if (creatorId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
    }

    await recipe.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting recipe',
      error: error.message
    });
  }
});

module.exports = router;

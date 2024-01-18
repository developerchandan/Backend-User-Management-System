const { QuizCategory } = require('../models/quiz-category');
const express = require('express');
const router = express.Router();

// Get all categories
router.get('/api/categories', async (req, res) => {
  try {
    const categories = await QuizCategory.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new category
router.post('/api/categories', async (req, res) => {
  const uniqueCategoryName = req.body.name.replace(/\s+/g, '-');

  try {
    const { name, description } = req.body;
    const newCategory = new QuizCategory({ name, description, uniqueCategoryName });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
});

// Create a new subcategory within a category
router.post('/api/categories/:categoryId/subcategories', async (req, res) => {
  const uniqueSubCategoryName = req.body.name.replace(/\s+/g, '-');
  
  try {
    const { categoryId } = req.params;
    const category = await QuizCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    category.subcategories.push({
      name: req.body.name,
      description: req.body.description,
      uniqueSubCategoryName,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory.subcategories[savedCategory.subcategories.length - 1]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a category by its ID
router.delete('/api/categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find the category by its ID and remove it from the database
    const deletedCategory = await QuizCategory.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found!' });
    }

    res.status(200).json({ success: true, message: 'Category deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE a subcategory by its ID
router.delete('/api/categories/:categoryId/subcategories/:subcategoryId', async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.params;
    const category = await QuizCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found!' });
    }

    // Find the subcategory by its ID and remove it from the category's subcategories array
    const deletedSubcategory = category.subcategories.id(subcategoryId).remove();
    await category.save();

    if (!deletedSubcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found!' });
    }

    res.status(200).json({ success: true, message: 'Subcategory deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

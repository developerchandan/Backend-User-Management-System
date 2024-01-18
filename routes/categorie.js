const { Category, Subcategory } = require('../models/category');
const express = require('express');
const router = express.Router();

// Get all categories
router.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate('subcategories');
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
    const newCategory = new Category({ name, description, uniqueCategoryName });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
})

// Get all subcategories
router.get('/api/subcategories', async (req, res) => {
  try {
    const subcategories = await Subcategory.find();
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/api/categories/:categoryId/subcategories', async (req, res) => {
  console.log(req.body)
  const uniqueSubCategoryName = req.body.name.replace(/\s+/g, '-');
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subcategory = new Subcategory({
      name: req.body.name,
      description: req.body.description,
      uniqueSubCategoryName,
    });

    const savedSubcategory = await subcategory.save();

    // Add the subcategory's ObjectId to the category's subcategories array
    category.subcategories.push(savedSubcategory._id);
    await category.save();

    res.status(201).json(savedSubcategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// DELETE a category by its ID
router.delete('/api/categories/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Find the category by its ID and remove it from the database
    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found!' });
    }

    res.status(200).json({ success: true, message: 'Category deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE a subcategory by its ID
router.delete('/api/subcategories/:subcategoryId', async (req, res) => {
  try {
    const subcategoryId = req.params.subcategoryId;

    // Find the subcategory by its ID and remove it from the database
    const deletedSubcategory = await Subcategory.findByIdAndDelete(subcategoryId);

    if (!deletedSubcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found!' });
    }

    res.status(200).json({ success: true, message: 'Subcategory deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  uniqueSubCategoryName: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  uniqueCategoryName: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subcategories: [subcategorySchema], // Embedding subcategorySchema within the category schema
});

const QuizCategory = mongoose.model('QuizCategory', categorySchema);

module.exports = { QuizCategory };

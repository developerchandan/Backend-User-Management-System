
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
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }], // Array of ObjectIds referencing Subcategory model
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
const Category = mongoose.model('Category', categorySchema);

module.exports = { Category, Subcategory };


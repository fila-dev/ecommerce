const Category = require('../models/categoryModel');

// Get all categories with optional tag filtering
const getAllCategories = async (req, res) => {
  try {
    const { tags, search } = req.query;
    let query = { active: true };

    // Add tag filtering if provided
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }

    const categories = await Category.find(query);
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single category
const getSingleCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a category with tags
const createCategory = async (req, res) => {
  const { name, description, tags } = req.body;

  try {
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if category already exists
    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    // Process tags if provided
    const processedTags = tags ? tags.map(tag => tag.trim().toLowerCase()) : [];

    const category = await Category.create({ 
      name, 
      description,
      tags: processedTags
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if category exists
    const exists = await Category.findById(id);
    if (!exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // If updating name, check for duplicates
    if (req.body.name) {
      const nameExists = await Category.findOne({ 
        name: req.body.name,
        _id: { $ne: id } 
      });
      if (nameExists) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
    }

    const category = await Category.findByIdAndUpdate(
      id, 
      { ...req.body }, 
      { new: true, runValidators: true }
    );
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findByIdAndUpdate(
      id, 
      { active: false }, 
      { new: true }
    );
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update category tags
const updateCategoryTags = async (req, res) => {
  const { id } = req.params;
  const { tags } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Process and update tags
    const processedTags = tags.map(tag => tag.trim().toLowerCase());
    category.tags = processedTags;
    await category.save();

    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryTags
};
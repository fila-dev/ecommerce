const Card = require('../models/cardModel');
const Category = require('../models/categoryModel');

// Search across cards and categories
const searchAll = async (req, res) => {
  try {
    const { 
      query, 
      category,
      tags,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12 
    } = req.query;

    let searchQuery = { availability: true };

    // Find matching categories first
    let categoryQuery = {};
    if (category) {
      categoryQuery.name = { $regex: category, $options: 'i' };
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      categoryQuery.tags = { $in: tagArray };
    }

    const matchingCategories = await Category.find(categoryQuery);
    const categoryIds = matchingCategories.map(cat => cat._id);

    // Build card search query
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { store: { $regex: query, $options: 'i' } },
        { size: { $regex: query, $options: 'i' } }
      ];
    }

    // Add category filter if categories were found
    if (categoryIds.length > 0) {
      searchQuery.category = { $in: categoryIds };
    }

    // Add price range if specified
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
    }

    // Execute search with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const cards = await Card.find(searchQuery)
      .populate({
        path: 'category',
        select: 'name tags'
      })
      .populate({
        path: 'rating',
        select: 'rating'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Card.countDocuments(searchQuery);

    res.status(200).json({
      results: cards,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Search suggestions (autocomplete)
const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Get category suggestions
    const categoryResults = await Category.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name tags')
    .limit(5);

    // Get product name suggestions
    const productResults = await Card.find({
      name: { $regex: query, $options: 'i' }
    })
    .select('name')
    .limit(5);

    const suggestions = {
      categories: categoryResults,
      products: productResults,
      tags: Array.from(new Set(categoryResults.flatMap(cat => 
        cat.tags.filter(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        )
      )))
    };

    res.json({ suggestions });

  } catch (error) {
    console.error('Suggestion error:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  searchAll,
  getSearchSuggestions
};

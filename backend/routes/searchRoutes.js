const express = require('express');
const router = express.Router();
const { 
  searchAll, 
  getSearchSuggestions 
} = require('../controllers/searchController');

// Search routes
router.get('/search', searchAll);
router.get('/suggestions', getSearchSuggestions);

module.exports = router;

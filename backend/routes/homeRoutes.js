const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary').v2;

// Import with EXACT same names as exported
const { 
    getAllCards, 
    getCardsByCategory, 
    subtractFromStock  // This must match the exported name
} = require('../controllers/homeController')

const { requireAuth } = require('../middleware/requireAuth')

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// get all cards
router.get('/', getAllCards)

// get cards by category
router.get('/category', getCardsByCategory)

// subtract from stock after successful payment
router.post('/stock/:cardId', subtractFromStock)  // Use exact function name

module.exports = router
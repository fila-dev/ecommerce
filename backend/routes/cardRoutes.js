const express = require('express')
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path')

const {
    createCard,
    getAllCards,
    getSingleCard,
    deleteCard,
    updateCard,
    provider,
    getCardInfo,
    updateQuantities,
    getCards
} = require('../controllers/cardController') 

const requireAuth = require('../middleware/requireAuth')

// Cloudinary config
const { cloudinaryConnect } = require('../config/cloudinary');
cloudinaryConnect();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cards',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'auto'
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router() 

// require auth for all card routes
router.use(requireAuth)

// get all cards
router.get('/', getAllCards)
   
// Create new card with multiple images
router.post('/', upload.array('images', 5), createCard)

// get a single card
router.get('/:id', getSingleCard) 

// delete a card  
router.delete('/:id', deleteCard)
    
// update a card
router.patch('/:id', upload.array('images', 5), updateCard) 

// get card info
router.get('/:id/info', getCardInfo)    

// Add this new route
router.post('/update-quantities', updateQuantities);

// get all cards
router.get('/cards/all', getCards);

module.exports = router
const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

//Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/profiles'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
    }
})

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!'
        return cb(new Error('Only image files are allowed!'), false)
    }
    cb(null, true)
}

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
})

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size is too large. Max size is 5MB.' });
        }
    }
    next(err);
};

//controller functions 

const {
    getProfile,
    updateProfile
} = require('../controllers/profileController')

const router = express.Router()

// Protected routes - add requireAuth middleware 
router.use(requireAuth)

// Get logged in user's profile
router.get('/me', getProfile) 

router.patch('/update-details', 
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'idImage', maxCount: 1 }
    ]),
    handleMulterError,
    updateProfile
)

module.exports = router
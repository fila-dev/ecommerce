const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')


const {
    signupUser, 
    loginUser,
   updateUserDetails,
    verifyEmail
} = require('../controllers/userController')

const router = express.Router()

// Public routes
router.post('/login', loginUser)  
router.post('/signup', signupUser) 


// Protected routes - add requireAuth middleware
router.use(requireAuth)
//router.get('/getProfile/:id,getProfile')
router.post('/verify-email', verifyEmail)
router.post('/update-details', updateUserDetails)


module.exports = router
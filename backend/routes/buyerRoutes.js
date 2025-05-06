const express = require('express')
const router = express.Router()

const {
    // getAllBuyers,
    // getSingleBuyer,
    getUsersByProvider
} = require('../controllers/buyerController')


// Buyer routes
//router.get('/', getAllBuyers)
//router.get('/:id', getSingleBuyer)
router.get('/provider/:providerId', getUsersByProvider)





module.exports = router

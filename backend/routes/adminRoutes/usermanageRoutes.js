const express = require('express')
const router = express.Router()

const {
    getAllBuyers,
    getSingleBuyer,
    updateBuyer,
    deleteBuyer,
    getAllProviders,
    getSingleProvider,
    updateProvider,
    deleteProvider
} = require('../../controllers/adminController/usermanageController')

// Buyer routes
router.get('/buyers', getAllBuyers)
router.get('/buyers/:id', getSingleBuyer)
router.put('/buyers/:id', updateBuyer)
router.delete('/buyers/:id', deleteBuyer)

// Provider routes
router.get('/providers', getAllProviders)
router.get('/providers/:id', getSingleProvider)
router.put('/providers/:id', updateProvider)
router.delete('/providers/:id', deleteProvider)

module.exports = router


const express = require('express')

const {
    getAllContact,
    getContactById,
    createContact,
    getProviderByEmail,
    createContactByEmail,
    markContactAsSeen,
    deleteContact
}  = require('../controllers/contactController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router()
router.get('/', getAllContact)
// router.get('/:id', markContactAsSeen)
// Apply requireAuth middleware to protected routes
router.use(requireAuth)


router.get('/:id/ids', getContactById)
router.post('/', createContact) 


router.get('/:email', getProviderByEmail)
router.post('/:email', createContactByEmail)
router.patch('/:id', markContactAsSeen)
router.delete('/:id', deleteContact)

module.exports = router

const mongoose = require('mongoose');
const User = require('../models/userModel');
const PurchaseHistory = require('../models/purchaseHistory');
const Card = require('../models/cardModel');

const getUsersByProvider = async (req, res) => {
    try {
        const providerId = req.params.providerId;
        
        // Validate provider ID
        if (!providerId || !mongoose.Types.ObjectId.isValid(providerId)) {
            return res.status(400).json({ error: 'Invalid provider ID' });
        }

        // Find all cards posted by this provider
        const cards = await Card.find({ user: providerId }).select('_id');
        console.log('Cards found:', cards);
        if (!cards || cards.length === 0) {
            console.log('No cards found for provider:', providerId);
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }

        const cardIds = cards.map(card => card._id);
        console.log('Card IDs:', cardIds);


        // Find purchases containing these cards
        const purchases = await PurchaseHistory.find({
            'items.id': { $in: cardIds }
        }).distinct('userId');
        console.log('Purchases found:', purchases);


        // Find users who made these purchases
        const users = await User.find({
            _id: { $in: purchases }
        }).select('name email phone')
        .sort({ createdAt: -1 });
        console.log('Users found:', users);


        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error in getUsersByProvider:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error while fetching users'
        });
    }
}




module.exports = {
    getUsersByProvider
}

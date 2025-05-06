const Card = require('../models/cardModel');
const Category = require('../models/categoryModel');
const RatingAndReview = require('../models/ratingAndReview');

// GET all cards 
const getAllCards = async (req, res) => {
    try {
        const cards = await Card.find({})
            .populate('category')
            .populate('user', 'profile.idVerified')
            .sort({createdAt: -1});

        // Add average rating and provider verification to each card
        const cardsWithRatings = await Promise.all(cards.map(async (card) => {
            const stats = await RatingAndReview.getCardStats(card._id);
            return {
                ...card.toObject(),
                rating: stats.average || 0,
                isVerifiedProvider: card.user?.profile?.idVerified || false
            };
        }));

        res.status(200).json(cardsWithRatings);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

// GET cards by category
const getCardsByCategory = async (req, res) => {
    const { category } = req.query;

    try {
        if (!category) {
            return res.status(400).json({ error: 'Category parameter is required' });
        }

        // First find the category by name
        const categoryDoc = await Category.findOne({ 
            name: { $regex: new RegExp(`^${category}$`, 'i') }  // Case-insensitive exact match
        });

        if (!categoryDoc) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Then find all cards with that category ID
        const cards = await Card.find({ 
            category: categoryDoc._id 
        })
        .populate('category')
        .populate('user', 'profile.idVerified')
        .sort({ createdAt: -1 });

        // Add average rating and provider verification to each card
        const cardsWithRatings = await Promise.all(cards.map(async (card) => {
            const stats = await RatingAndReview.getCardStats(card._id);
            return {
                ...card.toObject(),
                rating: stats.average || 0,
                isVerifiedProvider: card.user?.profile?.idVerified || false
            };
        }));

        console.log('Found cards:', cards.length, 'for category:', categoryDoc.name);
        res.status(200).json(cardsWithRatings);
    } catch (error) {
        console.error('Error in getCardsByCategory:', error);
        res.status(400).json({ error: error.message });
    }
};  

// SUBTRACT FROM STOCK
const subtractFromStock = async (req, res) => {
    const {cardId} = req.params;
    const {quantity} = req.body;

    try {
        // Find the card
        const card = await Card.findById(cardId);
        
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // Check if enough quantity available
        if (card.quantity < quantity) {
            return res.status(400).json({ 
                error: 'Not enough stock available',
                availableQuantity: card.quantity 
            });
        }

        // Update card quantity and availability
        const updatedCard = await Card.findByIdAndUpdate(
            cardId,
            { 
                $inc: { quantity: -quantity },  // Decrease quantity
                availability: (card.quantity - quantity) > 0  // Set availability based on remaining stock
            },
            { new: true }  // Return updated document
        );

        res.status(200).json(updatedCard);
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = { getAllCards, getCardsByCategory, subtractFromStock };
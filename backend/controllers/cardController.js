const Card = require('../models/cardModel') 
const RatingAndReview = require('../models/ratingAndReview')
const mongoose = require('mongoose')
const User = require('../models/userModel') // Add this line
const { cloudinaryConnect } = require('../config/cloudinary');
const cloudinary = require('cloudinary').v2;

// GET all cards 
const getAllCards = async (req, res) => {
    try {
        // Get user ID from req.user (set by auth middleware)
        const user_id = req.user._id;

        // Find only cards associated with the logged-in user
        const cards = await Card.find({ user: user_id })
            .populate('category')
            .sort({ createdAt: -1 });

        // Add average rating to each card
        const cardsWithRatings = await Promise.all(cards.map(async (card) => {
            const stats = await RatingAndReview.getCardStats(card._id);
            return {
                ...card.toObject(),
                rating: stats.average || 0
            };
        }));

        res.status(200).json(cardsWithRatings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

//experment 
const provider = async (req, res) => {
    try {
        const imageUrl = req.file ? req.file.path : null;
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image is required' });
        }
        const cardData = {
            ...req.body,
            image: imageUrl,
            user: req.user._id
        };
        // Create new card in database
        const card = await Card.create(cardData);
        res.status(201).json(card); // Return the created card
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// GET a single card
const getSingleCard = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such card' });
    }
    
    try {
        const card = await Card.findOne({ 
            _id: id,
            user: req.user._id
        });
        
        if (!card) {
            return res.status(404).json({ error: 'Card not found or unauthorized' });
        }
        
        res.status(200).json(card);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a new card
const createCard = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'At least one image is required', emptyFields: ['images'] });
        }

        // Upload all images to Cloudinary
        const uploadPromises = req.files.map(file => 
            cloudinary.uploader.upload(file.path, {
                folder: 'cards',
                resource_type: 'auto'
            })
        );

        const uploadResults = await Promise.all(uploadPromises);
        const imageUrls = uploadResults.map(result => result.secure_url);

        // Create initial rating
        const initialRating = new RatingAndReview({
            user: req.user._id,
            rating: 1,
            comment: "Initial rating",
            reportType: "none"
        });

        // Create card data with Cloudinary URLs
        const cardData = {
            name: req.body.name,
            size: req.body.size,
            price: req.body.price,
            images: imageUrls,
            discount: req.body.discount || '0',
            quantity: parseInt(req.body.quantity) || 0,
            availability: req.body.availability === 'true',
            fastDelivery: req.body.fastDelivery === 'true',
            store: req.body.store.trim(),
            category: req.body.category,
            user: req.user._id,
            reviews: 0,
            rating: initialRating._id
        };

        // Create the card
        const card = await Card.create(cardData);

        // Update the rating with the card reference and save
        initialRating.card = card._id;
        await initialRating.save();

        res.status(201).json({
            success: true,
            message: 'Product added successfully!',
            card: await Card.findById(card._id)
                .populate('category', 'name')
                .lean()
        });

    } catch (error) {
        console.error('Error in createCard:', error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// DELETE a card 
const deleteCard = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Find card and verify ownership
        const card = await Card.findOneAndDelete({ 
            _id: id,
            user: req.user._id // Only delete if card belongs to user
        });

        if (!card) {
            return res.status(404).json({ error: 'Card not found or unauthorized' });
        }
        
        res.status(200).json(card);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// UPDATE a card 
const updateCard = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid card ID' });
    }

    try {
        // Parse the form data
        const updates = {
            name: req.body.name,
            price: Number(req.body.price),
            discount: req.body.discount,
            quantity: Number(req.body.quantity),
            store: req.body.store,
            availability: req.body.availability === 'true',
            fastDelivery: req.body.fastDelivery === 'true'
        };
        
        // If there are new images uploaded, upload them to Cloudinary
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => 
                cloudinary.uploader.upload(file.path, {
                    folder: 'cards',
                    resource_type: 'auto'
                })
            );

            const uploadResults = await Promise.all(uploadPromises);
            const newImageUrls = uploadResults.map(result => result.secure_url);

            // If there are existing images in the request, combine them with new ones
            if (req.body.existingImages) {
                const existingImages = Array.isArray(req.body.existingImages) 
                    ? req.body.existingImages 
                    : [req.body.existingImages];
                updates.images = [...existingImages, ...newImageUrls];
            } else {
                updates.images = newImageUrls;
            }
        }

        // Find and update the card, ensuring it belongs to the user
        const card = await Card.findOneAndUpdate(
            { 
                _id: id,
                user: req.user._id
            },
            updates,
            { 
                new: true,
                runValidators: true 
            }
        ).populate('category');

        if (!card) {
            return res.status(404).json({ error: 'Card not found or unauthorized' });
        }

        // Get rating statistics
        const stats = await RatingAndReview.getCardStats(card._id);
        const cardWithRating = {
            ...card.toObject(),
            rating: stats.average || 0
        };
        
        res.status(200).json(cardWithRating);
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ error: error.message });
    }
};

const getCards = async (req, res) => {
    const { category } = req.query;
    
    try {
        let query = {};
        if (category) {
            query.category = category;
        }
        
        const cards = await Card.find(query)
            .populate('category')
            .sort({ createdAt: -1 });

        // Add average rating to each card
        const cardsWithRatings = await Promise.all(cards.map(async (card) => {
            const stats = await RatingAndReview.getCardStats(card._id);
            return {
                ...card.toObject(),
                rating: stats.average || 0
            };
        }));

        res.status(200).json(cardsWithRatings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get card info by ID
const getCardInfo = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid card ID' });
    }

    try {
        // Get the card details with populated user
        const card = await Card.findById(id)
            .populate('user', 'email accountType profile')
            .lean();
        
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // Get rating statistics using the static method
        const ratingStats = await RatingAndReview.getCardStats(id);

        // Format the response
        const response = {
            ...card,
            provider: card.user && card.user.accountType === 'provider' ? {
                name: card.user.profile?.name || card.user.email,
                email: card.user.email,
                store: card.store
            } : null,
            rating: {
                average: ratingStats.average,
                total: ratingStats.total,
                distribution: ratingStats.distribution
            },
            reviews: await RatingAndReview.find({ card: id })
                .populate('user', 'email')
                .sort({ createdAt: -1 })
                .lean()
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error in getCardInfo:', error);
        res.status(500).json({ error: 'Error fetching card information' });
    }
};

// Add this new function to handle quantity updates
const updateQuantities = async (req, res) => {
    try {
        const { items } = req.body;

        // Process each item in parallel
        const updatePromises = items.map(async (item) => {
            const card = await Card.findById(item.id);
            if (!card) {
                throw new Error(`Product not found: ${item.id}`);
            }

            // Check if there's enough quantity
            if (card.quantity < item.quantity) {
                throw new Error(`Insufficient quantity for product: ${card.name}`);
            }

            // Update the quantity
            const newQuantity = card.quantity - item.quantity;
            
            // Update the card and check availability
            const updatedCard = await Card.findByIdAndUpdate(
                item.id,
                { 
                    quantity: newQuantity,
                    availability: newQuantity > 0
                },
                { new: true }
            );

            return updatedCard;
        });

        await Promise.all(updatePromises);

        res.status(200).json({ message: 'Quantities updated successfully' });
    } catch (error) {
        console.error('Error updating quantities:', error);
        res.status(400).json({ error: error.message });
    }
};

cloudinaryConnect();

module.exports ={
    createCard,
    getAllCards,
    getSingleCard,
    deleteCard,
    updateCard,
    provider,
    getCards,
    getCardInfo,
    updateQuantities
}
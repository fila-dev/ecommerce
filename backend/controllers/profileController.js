const Profile = require('../models/profileModel')
const User = require('../models/userModel')
const { cloudinaryConnect } = require('../config/cloudinary');
const cloudinary = require('cloudinary').v2;

// Create new profile


        // Create profile with basic details
   
// Get logged in user's profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('profile email accountType');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Format the profile data with proper image paths
        const formattedProfile = {
            ...user.profile.toObject(),
            profileImage: user.profile.profileImage || null,
            idImage: user.profile.idImage || null
        };

        res.status(200).json({
            success: true,
            profile: formattedProfile,
            email: user.email,
            accountType: user.accountType
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get all profiles (admin only)
const getAllProfiles = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.accountType !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' })
        }

        const profiles = await Profile.find().populate('user', 'email accountType')
        res.status(200).json({ profiles })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Get specific profile by ID
const getProfileById = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id).populate('user', 'email accountType')
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' })
        }
        res.status(200).json({ profile })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Add provider-specific details
const updateProfile = async (req, res) => {
    try {
        console.log('Received files:', req.files);
        console.log('Received body:', req.body);

        const { name, fatherName, phoneNumber, address, idNumber, tinNumber } = req.body;
        
        const updates = {
            profile: {
                name,
                fatherName,
                phoneNumber,
                address,
                idNumber,
                tinNumber,
                profileImage: req.user.profile?.profileImage,
                idImage: req.user.profile?.idImage
            }
        };

        // Handle file uploads if present
        if (req.files) {
            if (req.files.profileImage) {
                const profileImage = req.files.profileImage[0];
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(profileImage.path, {
                    folder: 'profiles',
                    resource_type: 'auto'
                });
                updates.profile.profileImage = result.secure_url;
            }
            
            if (req.files.idImage) {
                const idImage = req.files.idImage[0];
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(idImage.path, {
                    folder: 'profiles',
                    resource_type: 'auto'
                });
                updates.profile.idImage = result.secure_url;
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Format the response
        const formattedProfile = {
            ...user.profile.toObject(),
            profileImage: user.profile.profileImage || null,
            idImage: user.profile.idImage || null
        };

        res.status(200).json({
            success: true,
            user: {
                email: user.email,
                accountType: user.accountType,
                profile: formattedProfile
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    
    getProfile,
    getAllProfiles,
    getProfileById,
    updateProfile
}

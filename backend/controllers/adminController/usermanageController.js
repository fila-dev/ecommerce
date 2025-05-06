const User = require('../../models/userModel')
const { sendEmail, getVerificationConfirmationEmail } = require('../../utility/sendEmail')

// Retrieve all users with buyer account type, sorted by creation date descending
const getAllBuyers  = async (req, res) => {
    try {
        const users = await User.find({accountType: 'buyer'}).sort({createdAt: -1})
        res.status(200).json(users)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// Retrieve a single buyer user by ID
const getSingleBuyer = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// [Commented out] Create a new buyer user
// const createBuyer = async (req, res) => {
//     const { email, password } = req.body
//     try {
//         const user = await User.create({ email, password, accountType: 'buyer' })
//         res.status(201).json(user)
//     } catch (error) {
//         res.status(400).json({error: error.message})
//     }
// }

// Update a buyer user's information by ID
const updateBuyer = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findByIdAndUpdate(id, req.body, { new: true })
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({error: error.message})
        }
}

// Remove a buyer user from the database by ID
const deleteBuyer = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findByIdAndDelete(id)
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }
        res.status(200).json({message: 'User deleted successfully'})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}  

// Retrieve all users with provider account type, sorted by creation date descending
const getAllProviders = async (req, res) => {
    try {
        const users = await User.find({ accountType: 'provider' })
            .select('email profile.name profile.profileImage profile.idImage emailVerified active warnings reported')
            .sort({ createdAt: -1 });

        // Format the response with proper image URLs
        const formattedUsers = users.map(user => ({
            _id: user._id,
            email: user.email,
            name: user.profile?.name || user.email.split('@')[0],
            profileImage: user.profile?.profileImage ? 
                `${process.env.URLPATH}/${user.profile.profileImage}` : 
                'default-avatar.png',
            idImage: user.profile?.idImage ? 
                `${process.env.URLPATH}/${user.profile.idImage}` : null,
            isVerified: user.emailVerified,
            active: user.active,
            warnings: user.warnings || 0,
            reported: user.reported || 0
        }));

        res.status(200).json(formattedUsers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Retrieve a single provider user by ID
const getSingleProvider = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id)
            .select('email profile emailVerified active warnings reported phoneNumber');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Format the response with all profile fields
        const formattedUser = {
            _id: user._id,
            email: user.email,
            name: user.profile?.name,
            profile: {
                name: user.profile?.name,
                fatherName: user.profile?.fatherName,
                phoneNumber: user.profile?.phoneNumber,
                address: user.profile?.address,
                idNumber: user.profile?.idNumber,
                tinNumber: user.profile?.tinNumber,
                idVerified: user.profile?.idVerified,
                verificationDate: user.profile?.verificationDate,
                profileImage: user.profile?.profileImage ? 
                    `${process.env.URLPATH}/${user.profile.profileImage}` : null,
                idImage: user.profile?.idImage ? 
                    `${process.env.URLPATH}/${user.profile.idImage}` : null
            },
            isVerified: user.emailVerified,
            active: user.active,
            warnings: user.warnings || 0,
            reported: user.reported || 0
        };

        res.status(200).json(formattedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// [Commented out] Create a new provider user
// const createProvider = async (req, res) => {
//     const { email, password } = req.body
//     try {
//         const user = await User.create({ email, password, accountType: 'provider' })
//         res.status(201).json(user)
//     } catch (error) {
//         res.status(400).json({error: error.message})
//     }
// }

// Update a provider user's information by ID
// const updateProvider = async (req, res) => {
//     const { id } = req.params
//     try {
//         const user = await User.findByIdAndUpdate(id, req.body, { new: true })
//         if (!user) {
//             return res.status(404).json({error: 'User not found'})
//         }
//         res.status(200).json(user)
//     } catch (error) {
//         res.status(400).json({error: error.message})
//     }
// }

// Update a provider user's information by ID
const updateProvider = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Handle verification if it's a verification request
        if (req.body.verifyProvider) {
            user.profile.idVerified = true;
            user.profile.verificationDate = new Date();

            // Send verification confirmation email
            try {
                const mailOptions = getVerificationConfirmationEmail(
                    user.profile?.name || user.email.split('@')[0],
                    user.email
                );
                await sendEmail(mailOptions);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                // Continue with the update even if email fails
            }
        }

        // Update other fields
        Object.assign(user, req.body);
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



// Remove a provider user from the database by ID
const deleteProvider = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findByIdAndDelete(id)
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }
        res.status(200).json({message: 'User deleted successfully'})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// Update provider verification status
// const updateProviderVerification = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const user = await User.findById(id);

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Update verification status
//         user.profile.idVerified = true;
//         user.profile.verificationDate = new Date();
//         await user.save();

//         // Send verification confirmation email
//         try {
//             const mailOptions = getVerificationConfirmationEmail(
//                 user.profile?.name || user.email.split('@')[0],
//                 user.email
//             );
//             await sendEmail(mailOptions);
//         } catch (emailError) {
//             console.error('Failed to send verification email:', emailError);
//             // Continue with the response even if email fails
//         }

//         res.status(200).json({
//             message: 'Provider verified successfully',
//             user: {
//                 ...user.toObject(),
//                 profile: {
//                     ...user.profile.toObject(),
//                     idVerified: true,
//                     verificationDate: new Date()
//                 }
//             }
//         });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

module.exports = {
    getAllBuyers,
    getSingleBuyer,
    updateBuyer,
    deleteBuyer,
    getAllProviders,
    getSingleProvider,
    updateProvider,
    deleteProvider,
    // updateProviderVerification
}

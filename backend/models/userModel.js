const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const Otp = require('./otpModel')
const path = require('path')

const userSchema = new mongoose.Schema({
  
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    
    accountType: {
        type: String,
        enum: ['admin', 'provider', 'buyer'],
        required: true,
        default: 'buyer'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true,
    },
    approved: {
        type: Boolean,
        default: true,  /// false
    },
    image: {
        type: String,
        default: 'default-avatar.png'
    },
    token: {
        type: String
    },
    resetPasswordTokenExpires: {
        type: Date
    },
    cards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card'
    }],
    profile: {
        name: {
            type: String,
            trim: true
        },
        fatherName: {
            type: String,
            trim: true
        },
        phoneNumber: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        profileImage: {
            type: String,
            default: null
        },
        idImage: {
            type: String,
            default: null
        },
        idNumber: {
            type: String,
            trim: true
        },
        tinNumber: {
            type: String,
            trim: true
        },
        idVerified: {
            type: Boolean,
            default: false
        },
        verificationDate: {
            type: Date,
            default: null
        }
    },
    warnings: {
        type: Number,
        default: 0
    },
    reported: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// static signup method
userSchema.statics.signupUser = async function(email, password, accountType) {
    if (!email || !password) {
        throw Error('Email and password are required')
    }
    if (!validator.isEmail(email)) {
        throw Error('Invalid email')
    }

    if (!validator.isStrongPassword(password)) {
        throw Error('Password not strong enough')
    }
    const exists = await this.findOne({ email })

    if (exists) {
        throw Error('Email already in use')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({
        email,
        password: hash,
        accountType,
        profile: {},
        emailVerified: false
    })

    return user
}

// Add a method for updating profile
userSchema.statics.updateProfile = async function(userId, profileData) {
    // If updating images, ensure paths are relative
    if (profileData.profile) {
        if (profileData.profile.profileImage && !profileData.profile.profileImage.startsWith('uploads/')) {
            profileData.profile.profileImage = `uploads/profiles/${path.basename(profileData.profile.profileImage)}`;
        }
        if (profileData.profile.idImage && !profileData.profile.idImage.startsWith('uploads/')) {
            profileData.profile.idImage = `uploads/profiles/${path.basename(profileData.profile.idImage)}`;
        }
    }

    const user = await this.findByIdAndUpdate(
        userId,
        { ...profileData },
        { new: true, runValidators: true }
    )

    if (!user) {
        throw Error('User not found')
    }

    return user
}

// static login method
userSchema.statics.loginUser = async function(email, password) {
    if (!email || !password) {
        throw Error('Email and password are required')
    }

    const user = await this.findOne({ email })
    if (!user) {
        throw Error('Incorrect email')
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
        throw Error('Incorrect Password')
    }

    // Return the full user object
    return user
}

// Add method to verify email
userSchema.statics.verifyEmail = async function(userId) {
    const user = await this.findByIdAndUpdate(
        userId,
        { emailVerified: true },
        { new: true }
    )
    if (!user) {
        throw Error('User not found')
    }
    return user
}

module.exports = mongoose.model('User', userSchema);

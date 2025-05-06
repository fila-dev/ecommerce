const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    fatherName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    photo: {
        type: String,
        default: 'default-profile.png'
    },
    tinNumber: {
        type: String,
        required: function() {
            return this.isProvider;
        },
        unique: true,
        sparse: true,
        trim: true
    },
    idPhoto: {
        type: String,
        required: function() {
            return this.isProvider;
        }
    },
    isProvider: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Profile', profileSchema)

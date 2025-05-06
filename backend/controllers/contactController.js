const Contact = require('../models/contactModel')
const ContactProvider = require('../models/contactProvider')
const User = require('../models/userModel')
const mongoose = require('mongoose')


////////thsi for the  contactModel only ////// 

const getAllContact = async (req, res) => {
    const contact = await Contact.find({}).sort({createdAt: -1})
    res.status(200).json(contact)
}

const markContactAsSeen = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such contact'});
    }

    try {
        const currentContact = await Contact.findById(id);
        if (!currentContact) {
            return res.status(404).json({error: 'No such contact'});
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            { $set: { unread: currentContact.unread ? 0 : 1 } },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({error: 'No such contact'});
        }

        res.status(200).json(contact);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

const getContactById = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such contact'})
    }
    const contact = await Contact.findById(id)
    if(!contact){
        return res.status(404).json({error: 'No such contact'})
    }
    res.status(200).json(contact)              
} 

const createContact = async (req, res) => {    
    const {name, email, message} = req.body
    try {
        const contact = await Contact.create({name, email, message})      
        res.status(201).json(contact)
    } catch (error) {
        res.status(400).json({error: error.message})
    }    
}


//////////////this is for the contactModel only  ///// 
const getProviderByEmail = async (req, res) => {
    const {email} = req.params
    try {
        const provider = await User.findOne({ email })
        if(!provider){
            return res.status(404).json({error: 'Provider not found'})
        }
        const contacts = await Contact.find({email}).sort({createdAt: -1})
        res.status(200).json(contacts)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const createContactByEmail = async (req, res) => {
   
    const {email} = req.params;
    const {message, card} = req.body;

    if (!email) {
        return res.status(400).json({error: "Email parameter is required"});
    }

    if (!message) {
        return res.status(400).json({error: "Message is required"});
    }

    try {
        const provider = await User.findOne({email});

        if (!provider) {
            return res.status(404).json({error: "Provider not found"});
        }

        // Create contact data object with required fields
        const contactData = {
            provider: provider._id,
            user: req.user._id,
            message
        };

        // Only add card if it exists
        if (card) {
            contactData.card = card;
        }

        const contact = await ContactProvider.create(contactData);

        res.status(201).json(contact);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}; 


const deleteContact = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such contact'});
    }

    try {
        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({error: 'No such contact'});
        }

        res.status(200).json(contact);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}


 


module.exports = {
    getAllContact,
    getContactById,
    createContact,
    getProviderByEmail,
    createContactByEmail,
    markContactAsSeen,
    deleteContact
}

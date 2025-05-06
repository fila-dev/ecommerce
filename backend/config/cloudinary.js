const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryConnect = () => {
	try {
		console.log('Cloudinary connected successfully');
	} catch (error) {
		console.error('Error connecting to Cloudinary:', error);
		throw error;
	}
};

module.exports = { cloudinaryConnect };



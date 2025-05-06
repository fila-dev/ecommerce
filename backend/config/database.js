const mongoose = require('mongoose')
require('dotenv').config() 

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to database successfully')
        return conn
    } catch (error) {
        console.log('Connection to database failed:', error.message)
        console.log('Retrying to connect to database...')
        // Retry connection after 3 seconds
        setTimeout(connectDB, 3000)
    }
}

module.exports = connectDB
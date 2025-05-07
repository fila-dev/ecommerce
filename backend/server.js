// Import and configure dotenv

const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const session = require('express-session');
const connectDB = require("./config/database");
const  {cloudinaryConnect}  = require("./config/cloudinary"); 
const multer = require('multer');

const cardRoutes = require("./routes/cardRoutes");
const homeRoutes = require("./routes/homeRoutes");
const userRoutes = require("./routes/userRoutes");
const otpRoutes = require("./routes/otpRoutes");
const ratingandreviewRoutes = require("./routes/ratingandreviewRoutes");
const purchasehistoryRoutes = require("./routes/purchasehistoryRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const profileRoutes = require("./routes/profileRoutes");
const contactRoutes = require("./routes/contactRoutes");
const ordertrackingRoutes = require("./routes/ordertrackingRoutes")
const transactionRoutes = require("./routes/transactionRoutes")
const chartRoutes = require("./routes/chartRoutes")
const buyerRoutes = require("./routes/buyerRoutes")
//const verifyRoutes = require("./routes/verifyRoutes");
// admin routes
const usermanageRoutes = require("./routes/adminRoutes/usermanageRoutes");

const { log } = require("console");

const paymentRoutes = require("./routes/paymentRoutes");

// express app
const app = express();

//middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://ecommerce-vaei.vercel.app' // Remove trailing slash
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(session({
  secret: process.env.SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

// route
app.use("/", homeRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/api/cards", cardRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/user", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/ratingandreview", ratingandreviewRoutes);
app.use("/api/purchasehistory", purchasehistoryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api/ordertracking', ordertrackingRoutes)
app.use('/api/transaction', transactionRoutes)
app.use('/api/chart', chartRoutes)
app.use('/api/buyers', buyerRoutes)
//app.use("/api/verify", verifyRoutes);
// admin routes
app.use("/api/admin", usermanageRoutes);

// Register payment routes
app.use("/api/payment", paymentRoutes);

// connect to db and start server
const startServer = async () => {
  try {
    await connectDB();

    // listen to port only after successful db connection
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Server startup failed:", error.message);
  }
};

startServer();

const PurchaseHistory = require("../models/purchaseHistory");
const puppeteer = require("puppeteer");
const Card = require("../models/cardModel");

// Get purchase history for a specific user
const getUserPurchaseHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(req.user._id);
    // Verify user is requesting their own purchase history
    if (req.user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this purchase history" });
    }

    const purchaseHistory = await PurchaseHistory.find({ userId }).sort({
      createdAt: -1,
    }); // Sort by date descending (newest first)

    res.status(200).json(purchaseHistory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create a new purchase history entry
const createPurchaseHistory = async (req, res) => {
  try {
    const purchaseData = req.body;
    
    // Ensure each item has store information
    if (purchaseData.items) {
      for (let item of purchaseData.items) {
        if (!item.store) {
          // If store is not provided, try to fetch it from the Card model
          const card = await Card.findById(item.id);
          if (card) {
            item.store = card.store;
          }
        }
      }
    }

    // Add userId from the authenticated user
    purchaseData.userId = req.user._id;

    // Check if order already exists
    const existingOrder = await PurchaseHistory.findOne({ orderId: purchaseData.orderId });
    if (existingOrder) {
      return res.status(400).json({ error: "Order already exists" });
    }

    // Validate required fields
    if (!purchaseData.orderId || !purchaseData.email || !purchaseData.items || !purchaseData.shippingAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new purchase history entry
    const newPurchase = new PurchaseHistory(purchaseData);

    // Save to database
    await newPurchase.save();

    res.status(201).json({ message: 'Purchase history created successfully', data: newPurchase });
  } catch (error) {
    console.error('Error creating purchase history:', error);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    
    // Send more detailed error message
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create purchase history',
      message: error.message
    });
  }
};

const getPurchaseHistoryDownload = async (req, res) => {
  try {
    const purchaseHistory = await PurchaseHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(purchaseHistory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Generate receipt PDF using Puppeteer
const generateReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the purchase
    const purchase = await PurchaseHistory.findOne({ orderId });

    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    // Launch browser with specific configurations
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();

    // Generate HTML content with SVG logo
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .order-details {
              margin: 20px 0;
              padding: 20px 0;
              border-top: 1px solid #eee;
              border-bottom: 1px solid #eee;
            }
            .items {
              margin: 20px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 5px 0;
              border-bottom: 1px solid #eee;
            }
            .total {
              text-align: right;
              font-weight: bold;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #333;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="logo-container">
            <svg width="80" height="80" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="white"/>
              <text x="50%" y="40%" font-family="Arial" font-size="40" font-weight="bold" fill="#333" text-anchor="middle">E-Shop</text>
              <path d="M50 70 H150 L170 130 H40 Z" fill="#ff6600" stroke="#333" stroke-width="5"/>
              <circle cx="60" cy="140" r="10" fill="#333"/>
              <circle cx="150" cy="140" r="10" fill="#333"/>
            </svg>
          </div>

          <div class="header">
            <h1 style="color: #333; margin: 0;">E-Shop Store</h1>
            <p style="color: #666;">Your One-Stop Shopping Destination</p>
          </div>

          <div class="order-details">
            <p><strong>Order ID:</strong> ${purchase.orderId}</p>
            <p><strong>Date:</strong> ${new Date(purchase.createdAt).toLocaleString()}</p>
            <p><strong>Email:</strong> ${purchase.email || 'N/A'}</p>
          </div>

          <div class="items">
            <h3>Items:</h3>
            ${purchase.items.map(item => `
              <div class="item">
                <span>${item.name} (x${item.quantity})</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div class="total">
            <p>Subtotal: $${(purchase.subtotal || 0).toFixed(2)}</p>
            <p>Tax: $${(purchase.tax || 0).toFixed(2)}</p>
            <p style="font-size: 1.2em;">Total: $${(purchase.total || 0).toFixed(2)}</p>
          </div>

          <div class="footer">
            <p>Thank you for shopping with E-Shop!</p>
            <p>Visit us again at www.eshop.com</p>
          </div>
        </body>
      </html>
    `;

    // Set content
    await page.setContent(html);

    // Generate PDF with better settings
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: ' ',
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `
    });

    // Close browser
    await browser.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${orderId}.pdf`);

    // Send PDF
    res.send(pdf);

  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ error: "Failed to generate receipt" });
  }
};




const getAllSales = async (req, res) => {
  try {
    const allSales = await PurchaseHistory.find().sort({ createdAt: -1 });
    res.status(200).json(allSales);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getProviderSales = async (req, res) => {}


module.exports = {
  getUserPurchaseHistory,
  createPurchaseHistory,
  getPurchaseHistoryDownload,
  generateReceipt,
  getAllSales,
  getProviderSales
};

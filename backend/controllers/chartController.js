const Order = require('../models/orderModel');
const PurchaseHistory = require('../models/purchaseHistory');
const User = require('../models/userModel');
const Card = require('../models/cardModel');
const Category = require('../models/categoryModel');

const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Card.countDocuments();
    
    const [orders, allPurchases] = await Promise.all([
      Order.find(),
      PurchaseHistory.find()
    ]);
    const orderRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const purchaseRevenue = allPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const totalRevenue = orderRevenue + purchaseRevenue;
    
    const currentDate = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(currentDate.getMonth() - 1);
    
    const currentMonthRevenue = [
      ...orders.filter(order => order.createdAt.getMonth() === currentDate.getMonth()),
      ...allPurchases.filter(purchase => purchase.createdAt.getMonth() === currentDate.getMonth())
    ].reduce((sum, item) => sum + (item.totalAmount || item.total), 0);
      
    const previousMonthRevenue = [
      ...orders.filter(order => order.createdAt.getMonth() === lastMonth.getMonth()),
      ...allPurchases.filter(purchase => purchase.createdAt.getMonth() === lastMonth.getMonth())
    ].reduce((sum, item) => sum + (item.totalAmount || item.total), 0);
      
    const revenueGrowth = previousMonthRevenue === 0 ? 0 : 
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

    const reportData = {
      totalSales: 0,
      totalRevenue,
      totalProducts,
      totalUsers,
      growth: {
        revenue: revenueGrowth
      }
    };

    res.status(200).json({
      success: true,
      data: reportData
    });
    
  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report data'
    });
  }
};  

const getCategoriesVisited = async (req, res) => {
  try {
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

    // Get all active categories first
    const activeCategories = await Category.find({ active: true });
    if (!activeCategories.length) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const categories = await PurchaseHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $unwind: "$items"
      },
      {
        $lookup: {
          from: 'cards',
          localField: 'items.id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: "$product"
      },
      // Filter only products with active categories
      {
        $match: {
          "product.category": { $in: activeCategories.map(cat => cat._id) }
        }
      },
      {
        $match: {
          "product.category": { $in: activeCategories.map(cat => cat._id) }
        }
      },
      {
        $group: {
          _id: {
            category: "$product.category",
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          purchaseCount: { $sum: 1 }
        }
      },
      // Add default zero values for months with no purchases
      {
        $group: {
          _id: "$_id.category",
          months: {
            $push: {
              month: "$_id.month",
              year: "$_id.year",
              purchaseCount: "$purchaseCount"
            }
          }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: "$category"
      },
      {
        $group: {
          _id: "$category._id",
          name: { $first: "$category.name" },
          months: {
            $push: {
              month: "$_id.month",
              year: "$_id.year",
              purchaseCount: "$purchaseCount"
            }
          }
        }
      },
      // Ensure we have data for all months
      {
        $project: {
          name: 1,
          months: {
            $map: {
              input: [1, 2, 3, 4, 5, 6],
              as: "month",
              in: {
                month: "$$month",
                purchaseCount: {
                  $sum: {
                    $filter: {
                      input: "$months",
                      as: "m",
                      cond: {
                        $and: [
                          { $eq: ["$$m.month", "$$month"] },
                          { $eq: ["$$m.year", currentDate.getFullYear()] }
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          months: {
            $map: {
              input: [1, 2, 3, 4, 5, 6],
              as: "month",
              in: {
                month: "$$month",
                purchaseCount: {
                  $sum: {
                    $filter: {
                      input: "$months",
                      as: "m",
                      cond: {
                        $and: [
                          { $eq: ["$$m.month", "$$month"] },
                          { $eq: ["$$m.year", currentDate.getFullYear()] }
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching category visits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category visits'
    });
  }
};

const getTotalCustommer = async (req, res) => {
  try {
    const providerId = req.query.providerId;
    const currentDate = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(currentDate.getMonth() - 1);

    const totalCustomers = await PurchaseHistory.countDocuments({ providerId });

    const totalRevenueResult = await PurchaseHistory.aggregate([
      { $match: { providerId } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const totalProductsResult = await PurchaseHistory.aggregate([
      { $match: { providerId } },
      { $unwind: "$items" },
      { $group: { _id: "$items.id" } },
      { $count: "total" }
    ]);
    const totalProducts = totalProductsResult[0]?.total || 0;

    const currentMonthRevenueResult = await PurchaseHistory.aggregate([
      { 
        $match: { 
          providerId,
          createdAt: { $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) }
        }
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const currentMonthRevenue = currentMonthRevenueResult[0]?.total || 0;

    const previousMonthRevenueResult = await PurchaseHistory.aggregate([
      { 
        $match: { 
          providerId,
          createdAt: { 
            $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
            $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const previousMonthRevenue = previousMonthRevenueResult[0]?.total || 0;

    const revenueGrowth = previousMonthRevenue === 0 ? 0 : 
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

    const reportData = {
      totalSales: 0,
      totalRevenue,
      totalProducts,
      totalUsers: totalCustomers,
      growth: {
        revenue: revenueGrowth
      }
    };

    res.status(200).json({
      success: true,
      data: reportData
    });
    
  } catch (error) {
    console.error('Error fetching provider report data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch provider report data'
    });
  }
};  

const getVisitorData = async (req, res) => {
  try {
    const currentTime = new Date();
    const twentyFourHoursAgo = new Date(currentTime.getTime() - (24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(currentTime.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Get new visitors (purchased in last 24 hours)
    const newVisitors = await PurchaseHistory.aggregate([
      {
        $match: {
          createdAt: {
            $gte: twentyFourHoursAgo,
            $lte: currentTime
          }
        }
      },
      {
        $group: {
          _id: '$userId'
        }
      },
      {
        $count: 'newVisitors'
      }
    ]);
    const newVisitorsCount = newVisitors[0]?.newVisitors || 0;

    // Get returning visitors (purchased in last 7 days but not in last 24 hours)
    const returningVisitors = await PurchaseHistory.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo,
            $lt: twentyFourHoursAgo
          }
        }
      },
      {
        $group: {
          _id: '$userId'
        }
      },
      {
        $count: 'returningVisitors'
      }
    ]);

    const returningVisitorsCount = returningVisitors[0]?.returningVisitors || 0;

    // If no users, return default values
    if (newVisitorsCount === 0 && returningVisitorsCount === 0) {
      return res.status(200).json({
        success: true,
        data: {
          newVisitors: 0,
          oldVisitors: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        newVisitors: newVisitorsCount,
        oldVisitors: returningVisitorsCount
      }
    });
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visitor data'
    });
  }
};

const getDailyRevenue = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const dailyRevenue = await PurchaseHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          totalRevenue: { $sum: "$total" },
          totalTax: { $sum: "$tax" }
        }
      },
      {
        $project: {
          day: {
            $arrayElemAt: [
              ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
              "$_id"
            ]
          },
          revenue: "$totalRevenue",
          tax: "$totalTax"
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: dailyRevenue
    });
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily revenue data'
    });
  }
};

module.exports = {
  getTotalUsers,
  getTotalCustommer,
  getCategoriesVisited,
  getVisitorData,
  getDailyRevenue
};

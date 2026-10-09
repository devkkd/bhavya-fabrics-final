const express = require("express");
const adminAuth = require("../middleware/adminAuth");

const Product = require("../models/Product");
const Order = require("../models/Order");
const ContactInquiry = require("../models/ContactInquiry.model");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Customer = require("../models/Customer");
const Review = require("../models/Review");
const Blog = require("../models/Blog");
const Catalogue = require("../models/Catalogue");
const SaleNotifySubscriber = require("../models/SaleNotifySubscriber");
const HeroSetting = require("../models/HeroSetting");

const router = express.Router();

router.get("/admin/summary", adminAuth, async (req, res) => {
  try {
    const [
      products,
      orders,
      enquiries,
      customers,
      categories,
      subcategories,
      reviews,
      blogs,
      catalogues,
      saleSubscribers,
      pendingOrders,
      pendingEnquiries,
      paidRevenueResult,
      recentOrders,
      recentEnquiries,
      heroSettings,
    ] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({}),
      ContactInquiry.countDocuments({}),
      Customer.countDocuments({}),
      Category.countDocuments({}),
      SubCategory.countDocuments({}),
      Review.countDocuments({}),
      Blog.countDocuments({}),
      Catalogue.countDocuments({}),
      SaleNotifySubscriber.countDocuments({}),
      Order.countDocuments({ status: "pending_approval" }),
      ContactInquiry.countDocuments({ status: "new" }),
      Order.aggregate([
        { $match: { "payment.status": "paid", status: { $nin: ["cancelled", "returned"] } } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .select("orderNumber orderId status pricing.total payment.status customer createdAt")
        .lean(),
      ContactInquiry.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .select("name email phone fabric status requestType createdAt")
        .lean(),
      HeroSetting.countDocuments({}),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          products,
          orders,
          enquiries,
          customers,
          categories,
          subcategories,
          reviews,
          blogs,
          catalogues,
          saleSubscribers,
          pendingOrders,
          pendingEnquiries,
          revenue: Number(paidRevenueResult?.[0]?.total || 0),
          heroSettings,
        },
        recentOrders,
        recentEnquiries,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary.",
    });
  }
});

module.exports = router;

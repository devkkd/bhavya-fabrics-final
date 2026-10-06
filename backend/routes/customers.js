const express = require("express");

const adminAuth    = require("../middleware/adminAuth");
const Customer     = require("../models/Customer");
const { sanitizeCustomer } = require("../utils/customer");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL CUSTOMERS
| GET /api/customers
|--------------------------------------------------------------------------
*/
router.get("/", adminAuth, async (req, res) => {
  try {
    const search = String(req.query?.search || "").trim();
    const status = String(req.query?.status || "").trim();   // "active" | "blocked" | "pending" | ""
    const page   = Math.max(1, Number(req.query?.page  || 1));
    const limit  = Math.min(100, Math.max(1, Number(req.query?.limit || 20)));

    const filter = {};

    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status && ["active", "blocked", "pending"].includes(status)) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Customer.countDocuments(filter),
    ]);

    /* summary counts for filter badges */
    const [totalAll, totalActive, totalBlocked, totalPending] = await Promise.all([
      Customer.countDocuments({}),
      Customer.countDocuments({ status: "active" }),
      Customer.countDocuments({ status: "blocked" }),
      Customer.countDocuments({ status: "pending" }),
    ]);

    return res.json({
      success: true,
      customers: customers.map(sanitizeCustomer),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      counts: {
        all:     totalAll,
        active:  totalActive,
        blocked: totalBlocked,
        pending: totalPending,
      },
    });
  } catch (error) {
    console.error("Get Customers Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load customers" });
  }
});

/*
|--------------------------------------------------------------------------
| GET CUSTOMER BY ID
| GET /api/customers/:id
|--------------------------------------------------------------------------
*/
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    return res.json({ success: true, customer: sanitizeCustomer(customer) });
  } catch (error) {
    console.error("Get Customer Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load customer" });
  }
});

/*
|--------------------------------------------------------------------------
| BLOCK CUSTOMER
| PATCH /api/customers/:id/block
|--------------------------------------------------------------------------
*/
router.patch("/:id/block", adminAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    if (customer.status === "blocked") {
      return res.status(400).json({ success: false, message: "Customer is already blocked" });
    }

    customer.status = "blocked";
    await customer.save();

    return res.json({
      success: true,
      message: `${customer.name} has been blocked`,
      customer: sanitizeCustomer(customer),
    });
  } catch (error) {
    console.error("Block Customer Error:", error);
    return res.status(500).json({ success: false, message: "Unable to block customer" });
  }
});

/*
|--------------------------------------------------------------------------
| UNBLOCK CUSTOMER
| PATCH /api/customers/:id/unblock
|--------------------------------------------------------------------------
*/
router.patch("/:id/unblock", adminAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    if (customer.status !== "blocked") {
      return res.status(400).json({ success: false, message: "Customer is not blocked" });
    }

    customer.status = "active";
    await customer.save();

    return res.json({
      success: true,
      message: `${customer.name} has been unblocked`,
      customer: sanitizeCustomer(customer),
    });
  } catch (error) {
    console.error("Unblock Customer Error:", error);
    return res.status(500).json({ success: false, message: "Unable to unblock customer" });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER  (hard delete — admin only)
| DELETE /api/customers/:id
|--------------------------------------------------------------------------
*/
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    return res.json({ success: true, message: `${customer.name} has been deleted` });
  } catch (error) {
    console.error("Delete Customer Error:", error);
    return res.status(500).json({ success: false, message: "Unable to delete customer" });
  }
});

module.exports = router;

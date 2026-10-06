const express = require("express");
const Address = require("../models/Address");
const customerAuth = require("../middleware/customerAuth");

const router = express.Router();

/* =====================================================
   GET - List all addresses for customer
===================================================== */

router.get("/", customerAuth, async (req, res) => {
  try {
    const addresses = await Address.find({
      customerId: req.customer._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
});

/* =====================================================
   POST - Create new address
===================================================== */

router.post("/", customerAuth, async (req, res) => {
  try {
    const {
      type,
      fullName,
      phone,
      email,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      isDefault,
    } = req.body;

    // Validation
    if (!fullName || !phone || !email || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const address = new Address({
      customerId: req.customer._id,
      type: type || "shipping",
      fullName,
      phone,
      email,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country: country || "India",
      isDefault: isDefault || false,
    });

    await address.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create address",
    });
  }
});

/* =====================================================
   PATCH - Update address
===================================================== */

router.patch("/:addressId", customerAuth, async (req, res) => {
  try {
    const { addressId } = req.params;

    // Verify address belongs to customer
    const address = await Address.findOne({
      _id: addressId,
      customerId: req.customer._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Update allowed fields
    const allowedFields = [
      "fullName",
      "phone",
      "email",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "country",
      "isDefault",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });

    await address.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update address",
    });
  }
});

/* =====================================================
   DELETE - Remove address
===================================================== */

router.delete("/:addressId", customerAuth, async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await Address.findOneAndDelete({
      _id: addressId,
      customerId: req.customer._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
});

/* =====================================================
   GET - Get default address by type
===================================================== */

router.get("/default/:type", customerAuth, async (req, res) => {
  try {
    const { type } = req.params;

    if (!["shipping", "billing"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address type",
      });
    }

    const address = await Address.findOne({
      customerId: req.customer._id,
      type,
      isDefault: true,
    });

    res.json({
      success: true,
      address: address || null,
    });
  } catch (error) {
    console.error("Error fetching default address:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch default address",
    });
  }
});

module.exports = router;

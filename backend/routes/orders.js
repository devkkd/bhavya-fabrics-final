"use strict";
const express = require("express");
const axios = require("axios");
const Order = require("../models/Order");
const customerAuth = require("../middleware/customerAuth");
const adminAuth = require("../middleware/adminAuth");
const router = express.Router();

const SHIPROCKET_BASE_URL =
  process.env.SHIPROCKET_API_BASE_URL ||
  "https://apiv2.shiprocket.in/v1/external";

let shiprocketToken = null;
let shiprocketTokenExpiresAt = 0;

const cleanString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
};

const getAdminIdentifier = (req) => {
  return (
    req.admin?.email ||
    req.admin?._id?.toString() ||
    req.admin?.id?.toString() ||
    "admin"
  );
};

const getShiprocketToken = async () => {
  const now = Date.now();

  if (
    shiprocketToken &&
    shiprocketTokenExpiresAt > now + 60 * 1000
  ) {
    return shiprocketToken;
  }

  if (
    !process.env.SHIPROCKET_EMAIL ||
    !process.env.SHIPROCKET_PASSWORD
  ) {
    throw new Error(
      "Shiprocket credentials are not configured."
    );
  }

  const response = await axios.post(
    `${SHIPROCKET_BASE_URL}/auth/login`,
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  if (!response.data || !response.data.token) {
    throw new Error(
      "Shiprocket authentication failed. Token was not returned."
    );
  }

  shiprocketToken = response.data.token;
  shiprocketTokenExpiresAt =
    now + 9 * 24 * 60 * 60 * 1000;

  return shiprocketToken;
};

const shiprocketRequest = async (
  method,
  path,
  data = null
) => {
  const token = await getShiprocketToken();

  try {
    const response = await axios({
      method,
      url: `${SHIPROCKET_BASE_URL}${path}`,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      shiprocketToken = null;
      shiprocketTokenExpiresAt = 0;
    }

    throw error;
  }
};

const getShiprocketErrorMessage = (error) => {
  if (error?.response?.data) {
    if (typeof error.response.data === "string") {
      return error.response.data;
    }

    if (error.response.data.message) {
      return String(error.response.data.message);
    }

    try {
      return JSON.stringify(error.response.data);
    } catch {
      return "Shiprocket API request failed.";
    }
  }

  return (
    error?.message ||
    "Shiprocket API request failed."
  );
};

const getPackageDetails = (order) => {
  let weight = 0;
  let length = 10;
  let breadth = 10;
  let height = 10;

  for (const item of order.items || []) {
    const variant = item.variantSnapshot || {};

    if (
      variant.weight !== undefined &&
      variant.weight !== null
    ) {
      weight +=
        Number(variant.weight) *
        Number(item.quantity || 1);
    }

    if (
      variant.length !== undefined &&
      variant.length !== null
    ) {
      length = Math.max(
        length,
        Number(variant.length)
      );
    }

    if (
      variant.breadth !== undefined &&
      variant.breadth !== null
    ) {
      breadth = Math.max(
        breadth,
        Number(variant.breadth)
      );
    }

    if (
      variant.height !== undefined &&
      variant.height !== null
    ) {
      height = Math.max(
        height,
        Number(variant.height)
      );
    }
  }

  if (!weight || weight <= 0) {
    weight = 0.5;
  }

  return {
    weight,
    length,
    breadth,
    height,
  };
};

const buildShiprocketPayload = (order) => {
  const address = order.shippingAddress || {};
  const customer = order.customerDetails || {};

  const fullName = cleanString(
    address.fullName || customer.name
  );

  const nameParts = fullName.split(/\s+/);

  const firstName =
    nameParts.shift() || "Customer";

  const lastName =
    nameParts.join(" ") || "";

  const orderItems = (order.items || []).map(
    (item) => {
      const color =
        item.selectedColor?.name || "";

      const size =
        item.selectedSize?.name || "";

      let displayName =
        item.productName || "Product";

      if (color) {
        displayName += ` - Colour: ${color}`;
      }

      if (size) {
        displayName += ` - Size: ${size}`;
      }

      return {
        name: displayName,
        sku:
          item.sku ||
          `SKU-${item.productId}`,
        units: Number(item.quantity || 1),
        selling_price: Number(item.price || 0),
        discount: 0,
        tax: 0,
        hsn: "",
      };
    }
  );

  const packageDetails = getPackageDetails(order);

  const pickupLocation =
  process.env.SHIPROCKET_PICKUP_LOCATION ||
  "Home";

  return {
    order_id: order.orderNumber,

    order_date: new Date(
      order.createdAt || Date.now()
    )
      .toISOString()
      .replace("T", " ")
      .substring(0, 19),

    pickup_location: pickupLocation,

    channel_id: "",

    comment:
      `Bhavya Fabrics Order ${order.orderNumber}`,

    billing_customer_name: firstName,

    billing_last_name: lastName,

    billing_address: cleanString(
      address.addressLine1
    ),

    billing_address_2: cleanString(
      address.addressLine2
    ),

    billing_city: cleanString(
      address.city
    ),

    billing_pincode: cleanString(
      address.pincode
    ),

    billing_state: cleanString(
      address.state
    ),

    billing_country: cleanString(
      address.country || "India"
    ),

    billing_email: cleanString(
      address.email || customer.email
    ),

    billing_phone: cleanString(
      address.phone || customer.phone
    ),

    shipping_is_billing: true,

    shipping_customer_name: firstName,

    shipping_last_name: lastName,

    shipping_address: cleanString(
      address.addressLine1
    ),

    shipping_address_2: cleanString(
      address.addressLine2
    ),

    shipping_city: cleanString(
      address.city
    ),

    shipping_pincode: cleanString(
      address.pincode
    ),

    shipping_country: cleanString(
      address.country || "India"
    ),

    shipping_state: cleanString(
      address.state
    ),

    shipping_email: cleanString(
      address.email || customer.email
    ),

    shipping_phone: cleanString(
      address.phone || customer.phone
    ),

    order_items: orderItems,

    payment_method:
      order.payment?.method === "cod"
        ? "COD"
        : "Prepaid",

    sub_total: Number(
      order.pricing?.subtotal || 0
    ),

    length: packageDetails.length,
    breadth: packageDetails.breadth,
    height: packageDetails.height,
    weight: packageDetails.weight,
  };
};

const findNestedValue = (
  value,
  keys,
  depth = 0
) => {
  if (
    value === null ||
    value === undefined ||
    depth > 6
  ) {
    return "";
  }

  if (typeof value !== "object") {
    return "";
  }

  for (const key of keys) {
    const candidate = value?.[key];

    if (
      candidate !== undefined &&
      candidate !== null &&
      candidate !== ""
    ) {
      return candidate;
    }
  }

  for (const child of Object.values(value)) {
    if (
      child &&
      typeof child === "object"
    ) {
      const found = findNestedValue(
        child,
        keys,
        depth + 1
      );

      if (
        found !== undefined &&
        found !== null &&
        found !== ""
      ) {
        return found;
      }
    }
  }

  return "";
};

const createShiprocketOrder = async (order) => {
  const payload =
    buildShiprocketPayload(order);

  console.log(
    "Creating Shiprocket order:",
    {
      orderNumber:
        order.orderNumber,
      items:
        payload.order_items?.length,
      total:
        order.pricing?.total,
    }
  );

  console.log(
    "SHIPROCKET CREATE PAYLOAD:",
    JSON.stringify(
      payload,
      null,
      2
    )
  );

  const result =
    await shiprocketRequest(
      "POST",
      "/orders/create/adhoc",
      payload
    );

  console.log(
    "SHIPROCKET CREATE RAW RESPONSE:",
    JSON.stringify(
      result,
      null,
      2
    )
  );

  const shiprocketOrderId =
    findNestedValue(
      result,
      [
        "order_id",
        "orderId",
      ]
    );

  const shiprocketShipmentId =
    findNestedValue(
      result,
      [
        "shipment_id",
        "shipmentId",
      ]
    );

  if (
    !shiprocketOrderId &&
    !shiprocketShipmentId
  ) {
    const status =
      findNestedValue(
        result,
        [
          "status",
          "status_code",
          "statusCode",
        ]
      );

    const message =
      findNestedValue(
        result,
        [
          "message",
          "msg",
          "error",
          "errors",
        ]
      );

    throw new Error(
      [
        "Shiprocket order creation returned no order/shipment ID.",
        status
          ? `Status: ${status}`
          : "",
        message
          ? `Message: ${
              typeof message ===
              "object"
                ? JSON.stringify(
                    message
                  )
                : message
            }`
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    );
  }

  return {
    response: result,

    shiprocketOrderId:
      String(
        shiprocketOrderId || ""
      ),

    shiprocketShipmentId:
      String(
        shiprocketShipmentId || ""
      ),
  };
};

const assignShiprocketAwb =
  async (shipmentId) => {
    if (!shipmentId) {
      throw new Error(
        "Shiprocket shipment ID is missing; cannot assign AWB."
      );
    }

    const result =
      await shiprocketRequest(
        "POST",
        "/courier/assign/awb",
        {
          shipment_id:
            Number(shipmentId),
        }
      );

    console.log(
      "SHIPROCKET AWB RAW RESPONSE:",
      JSON.stringify(
        result,
        null,
        2
      )
    );

    const awb =
      findNestedValue(
        result,
        [
          "awb_code",
          "awbCode",
          "awb",
        ]
      );

    const carrier =
      findNestedValue(
        result,
        [
          "courier_name",
          "courierName",
          "carrier",
        ]
      );

    const courierCompanyId =
      findNestedValue(
        result,
        [
          "courier_company_id",
          "courierCompanyId",
        ]
      );

    if (!awb) {
      const message =
        findNestedValue(
          result,
          [
            "message",
            "msg",
            "error",
            "errors",
          ]
        );

      throw new Error(
        [
          "Shiprocket order was created, but courier/AWB was not assigned.",
          message
            ? `Message: ${
                typeof message ===
                "object"
                  ? JSON.stringify(
                      message
                    )
                  : message
              }`
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      );
    }

    return {
      response: result,

      awb: String(awb),

      carrier:
        String(
          carrier || ""
        ),

      courierCompanyId:
        String(
          courierCompanyId ||
            ""
        ),
    };
  };

router.get(
  "/admin/approvals",
  adminAuth,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
      } = req.query;

      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );

      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 10,
            1
          ),
          100
        );

      const query = {
        status:
          "pending_approval",
        "approval.status":
          "pending",
      };

      const orders =
        await Order.find(query)
          .sort({
            createdAt: -1,
          })
          .limit(
            limitNumber
          )
          .skip(
            (pageNumber - 1) *
              limitNumber
          )
          .select(
            "-payment.razorpaySignature"
          );

      const total =
        await Order.countDocuments(
          query
        );

      return res.json({
        success: true,
        orders,
        totalOrders:
          total,
        totalPages:
          Math.ceil(
            total /
              limitNumber
          ),
        currentPage:
          pageNumber,
      });
    } catch (error) {
      console.error(
        "ADMIN APPROVALS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch approval orders.",
      });
    }
  }
);

router.get(
  "/admin/pending",
  adminAuth,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
      } = req.query;

      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );

      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 10,
            1
          ),
          100
        );

      const query = {};

      if (status) {
        query.status = status;
      } else {
        query.status = {
          $in: [
            "pending_approval",
            "confirmed",
            "packed",
            "shipped",
          ],
        };
      }

      const orders =
        await Order.find(query)
          .sort({
            createdAt: -1,
          })
          .limit(
            limitNumber
          )
          .skip(
            (pageNumber - 1) *
              limitNumber
          )
          .select(
            "-payment.razorpaySignature"
          );

      const total =
        await Order.countDocuments(
          query
        );

      return res.json({
        success: true,
        orders,
        totalOrders:
          total,
        totalPages:
          Math.ceil(
            total /
              limitNumber
          ),
        currentPage:
          pageNumber,
      });
    } catch (error) {
      console.error(
        "ADMIN ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch orders.",
      });
    }
  }
);

router.get(
  "/admin/requests",
  adminAuth,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        type,
      } = req.query;

      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );

      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 10,
            1
          ),
          100
        );

      const query = {};

      if (
        type ===
        "cancellation"
      ) {
        query[
          "cancellation.requestedAt"
        ] = {
          $exists: true,
        };

        query[
          "cancellation.status"
        ] = "pending";
      } else if (
        type === "return"
      ) {
        query[
          "return.requestedAt"
        ] = {
          $exists: true,
        };

        query[
          "return.status"
        ] = "pending";
      } else if (
        type ===
        "replacement"
      ) {
        query[
          "replacement.requestedAt"
        ] = {
          $exists: true,
        };

        query[
          "replacement.status"
        ] = "pending";
      } else {
        query.$or = [
          {
            "cancellation.status":
              "pending",
          },
          {
            "return.status":
              "pending",
          },
          {
            "replacement.status":
              "pending",
          },
        ];
      }

      const orders =
        await Order.find(query)
          .sort({
            createdAt: -1,
          })
          .limit(
            limitNumber
          )
          .skip(
            (pageNumber - 1) *
              limitNumber
          )
          .select(
            "-payment.razorpaySignature"
          );

      const total =
        await Order.countDocuments(
          query
        );

      const requests =
        orders.map(
          (order) => {
            const result = {
              _id:
                order._id,

              orderNumber:
                order.orderNumber,

              customerId:
                order.customerId,

              customerDetails:
                order.customerDetails,

              items:
                order.items,

              pricing:
                order.pricing,

              status:
                order.status,

              createdAt:
                order.createdAt,

              requests: [],
            };

            if (
              order.cancellation &&
              order.cancellation
                .requestedAt
            ) {
              result.requests.push({
                type:
                  "cancellation",

                requestedAt:
                  order
                    .cancellation
                    .requestedAt,

                reason:
                  order
                    .cancellation
                    .requestReason,

                status:
                  order
                    .cancellation
                    .status,
              });
            }

            if (
              order.return &&
              order.return
                .requestedAt
            ) {
              result.requests.push({
                type:
                  "return",

                requestedAt:
                  order.return
                    .requestedAt,

                reason:
                  order.return
                    .reason,

                status:
                  order.return
                    .status,
              });
            }

            if (
              order.replacement &&
              order.replacement
                .requestedAt
            ) {
              result.requests.push({
                type:
                  "replacement",

                requestedAt:
                  order
                    .replacement
                    .requestedAt,

                reason:
                  order
                    .replacement
                    .reason,

                status:
                  order
                    .replacement
                    .status,
              });
            }

            return result;
          }
        );

      return res.json({
        success: true,
        requests,
        totalRequests:
          total,
        totalPages:
          Math.ceil(
            total /
              limitNumber
          ),
        currentPage:
          pageNumber,
      });
    } catch (error) {
      console.error(
        "ADMIN REQUESTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch requests.",
      });
    }
  }
);

router.patch(
  "/admin/:orderId/approve",
  adminAuth,
  async (req, res) => {
    try {
      const orderId =
        req.params.orderId;

      const notes =
        cleanString(
          req.body?.notes
        );

      const order =
        await Order.findById(
          orderId
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        order.status !==
        "pending_approval"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Cannot approve order with status: ${order.status}`,
        });
      }

      order.approval =
        order.approval || {};

      order.shipping =
        order.shipping || {};

      order.status =
        "confirmed";

      order.approval.status =
        "approved";

      order.approval.approvedAt =
        new Date();

      order.approval.approvedBy =
        getAdminIdentifier(
          req
        );

      if (notes) {
        order.adminNotes =
          notes;
      }

      order.shipping.creationStatus =
        "pending";

      order.shipping.creationError =
        "";

      await order.save();

      try {
        const result =
          await createShiprocketOrder(
            order
          );

        order.shipping
          .shiprocketOrderId =
          result.shiprocketOrderId;

        order.shipping
          .shiprocketShipmentId =
          result.shiprocketShipmentId;

        order.shipping
          .shiprocketStatus =
          "created";

        order.shipping
          .creationStatus =
          "created";

        order.shipping
          .creationError =
          "";

        order.shipping
          .createdAt =
          new Date();

        await order.save();

        let awbMessage = "";

        if (
          result
            .shiprocketShipmentId
        ) {
          try {
            const awbResult =
              await assignShiprocketAwb(
                result
                  .shiprocketShipmentId
              );

            order.shipping.awb =
              awbResult.awb ||
              "";

            order.shipping
              .trackingNumber =
              awbResult.awb ||
              "";

            order.shipping
              .carrier =
              awbResult.carrier ||
              "";

            order.shipping
              .courierCompanyId =
              awbResult
                .courierCompanyId ||
              "";

            order.shipping
              .shiprocketStatus =
              "awb_assigned";

            order.shipping
              .creationError =
              "";
          } catch (
            awbError
          ) {
            awbMessage =
              getShiprocketErrorMessage(
                awbError
              );

            console.error(
              "SHIPROCKET AWB ERROR:",
              awbMessage
            );

            order.shipping
              .shiprocketStatus =
              "created";

            order.shipping
              .creationError =
              `Shiprocket order created, but AWB was not assigned: ${awbMessage}`;
          }

          await order.save();
        }

        return res.json({
          success: true,

          message:
            order.shipping
              .shiprocketStatus ===
            "awb_assigned"
              ? "Order approved and Shiprocket order + AWB created successfully."
              : "Order approved and Shiprocket order created. AWB can be assigned/retried separately.",

          order,

          shiprocket: {
            orderId:
              result
                .shiprocketOrderId,

            shipmentId:
              result
                .shiprocketShipmentId,

            awb:
              order.shipping.awb ||
              "",

            carrier:
              order.shipping.carrier ||
              "",

            awbMessage,
          },
        });
      } catch (
        shiprocketError
      ) {
        const errorMessage =
          getShiprocketErrorMessage(
            shiprocketError
          );

        console.error(
          "SHIPROCKET CREATE ERROR:",
          shiprocketError
        );

        console.error(
          "SHIPROCKET CREATE ERROR MESSAGE:",
          errorMessage
        );

        order.shipping
          .creationStatus =
          "failed";

        order.shipping
          .creationError =
          errorMessage;

        order.shipping
          .shiprocketStatus =
          "creation_failed";

        await order.save();

        return res.status(502).json({
          success: false,

          message:
            "Order was approved, but Shiprocket order creation failed. Check backend console and retry.",

          order,

          shiprocketError:
            errorMessage,
        });
      }
    } catch (error) {
      console.error(
        "ADMIN APPROVE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Failed to approve order.",
      });
    }
  }
);

router.patch(
  "/admin/:orderId/reject",
  adminAuth,
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      const {
        reason,
      } = req.body || {};

      const order =
        await Order.findById(
          orderId
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        order.status !==
        "pending_approval"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Cannot reject order with status: ${order.status}`,
        });
      }

      order.approval =
        order.approval || {};

      order.status =
        "cancelled";

      order.approval.status =
        "rejected";

      order.approval
        .rejectionReason =
        cleanString(
          reason
        ) ||
        "Rejected by admin.";

      order.approval.approvedBy =
        getAdminIdentifier(
          req
        );

      order.shipping =
        order.shipping || {};

      order.shipping.creationStatus =
        "not_created";

      await order.save();

      return res.json({
        success: true,

        message:
          "Order rejected successfully. It was not sent to Shiprocket.",

        order,
      });
    } catch (error) {
      console.error(
        "ADMIN REJECT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to reject order.",
      });
    }
  }
);

router.post(
  "/admin/:orderId/shiprocket-retry",
  adminAuth,
  async (req, res) => {
    try {
      const orderId =
        req.params.orderId;

      const order =
        await Order.findById(
          orderId
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        order.status !==
        "confirmed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only confirmed orders can be sent to Shiprocket.",
        });
      }

      if (
        order.approval?.status !==
        "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order has not been approved.",
        });
      }

      order.shipping =
        order.shipping || {};

      if (
        order.shipping
          .shiprocketOrderId &&
        order.shipping
          .shiprocketShipmentId
      ) {
        try {
          const awbResult =
            await assignShiprocketAwb(
              order.shipping
                .shiprocketShipmentId
            );

          order.shipping.awb =
            awbResult.awb ||
            "";

          order.shipping
            .trackingNumber =
            awbResult.awb ||
            "";

          order.shipping
            .carrier =
            awbResult.carrier ||
            "";

          order.shipping
            .courierCompanyId =
            awbResult
              .courierCompanyId ||
            "";

          order.shipping
            .shiprocketStatus =
            "awb_assigned";

          order.shipping
            .creationStatus =
            "created";

          order.shipping
            .creationError =
            "";

          await order.save();

          return res.json({
            success: true,

            message:
              "Shiprocket AWB assigned successfully.",

            order,

            shiprocket: {
              orderId:
                order.shipping
                  .shiprocketOrderId,

              shipmentId:
                order.shipping
                  .shiprocketShipmentId,

              awb:
                order.shipping.awb,

              carrier:
                order.shipping
                  .carrier,
            },
          });
        } catch (
          awbError
        ) {
          const errorMessage =
            getShiprocketErrorMessage(
              awbError
            );

          console.error(
            "SHIPROCKET AWB RETRY ERROR:",
            awbError
          );

          order.shipping
            .creationStatus =
            "created";

          order.shipping
            .shiprocketStatus =
            "created";

          order.shipping
            .creationError =
            `AWB assignment failed: ${errorMessage}`;

          await order.save();

          return res.status(502).json({
            success: false,

            message:
              "Shiprocket order exists, but AWB assignment failed.",

            error:
              errorMessage,

            order,
          });
        }
      }

      order.shipping
        .creationStatus =
        "pending";

      order.shipping
        .creationError =
        "";

      await order.save();

      try {
        const result =
          await createShiprocketOrder(
            order
          );

        order.shipping
          .shiprocketOrderId =
          result
            .shiprocketOrderId;

        order.shipping
          .shiprocketShipmentId =
          result
            .shiprocketShipmentId;

        order.shipping
          .shiprocketStatus =
          "created";

        order.shipping
          .creationStatus =
          "created";

        order.shipping
          .creationError =
          "";

        order.shipping
          .createdAt =
          new Date();

        await order.save();

        if (
          result
            .shiprocketShipmentId
        ) {
          try {
            const awbResult =
              await assignShiprocketAwb(
                result
                  .shiprocketShipmentId
              );

            order.shipping.awb =
              awbResult.awb ||
              "";

            order.shipping
              .trackingNumber =
              awbResult.awb ||
              "";

            order.shipping
              .carrier =
              awbResult.carrier ||
              "";

            order.shipping
              .courierCompanyId =
              awbResult
                .courierCompanyId ||
              "";

            order.shipping
              .shiprocketStatus =
              "awb_assigned";

            order.shipping
              .creationError =
              "";
          } catch (
            awbError
          ) {
            const awbMessage =
              getShiprocketErrorMessage(
                awbError
              );

            console.error(
              "SHIPROCKET AWB ERROR:",
              awbMessage
            );

            order.shipping
              .shiprocketStatus =
              "created";

            order.shipping
              .creationError =
              `Shiprocket order created, but AWB was not assigned: ${awbMessage}`;
          }

          await order.save();
        }

        return res.json({
          success: true,

          message:
            order.shipping
              .shiprocketStatus ===
            "awb_assigned"
              ? "Shiprocket order + AWB created successfully."
              : "Shiprocket order created. AWB can be assigned/retried separately.",

          order,

          shiprocket: {
            orderId:
              result
                .shiprocketOrderId,

            shipmentId:
              result
                .shiprocketShipmentId,

            awb:
              order.shipping.awb ||
              "",

            carrier:
              order.shipping.carrier ||
              "",
          },
        });
      } catch (
        shiprocketError
      ) {
        const errorMessage =
          getShiprocketErrorMessage(
            shiprocketError
          );

        console.error(
          "SHIPROCKET RETRY CREATE ERROR:",
          shiprocketError
        );

        order.shipping
          .creationStatus =
          "failed";

        order.shipping
          .creationError =
          errorMessage;

        order.shipping
          .shiprocketStatus =
          "creation_failed";

        await order.save();

        return res.status(502).json({
          success: false,

          message:
            "Shiprocket order creation failed again.",

          error:
            errorMessage,

          order,
        });
      }
    } catch (error) {
      console.error(
        "SHIPROCKET RETRY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Failed to retry Shiprocket order.",
      });
    }
  }
);

router.get(
  "/",
  customerAuth,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
      } = req.query;

      const customerId =
        req.customer._id;

      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );

      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 10,
            1
          ),
          100
        );

      const query = {
        customerId,
      };

      if (status) {
        query.status =
          status;
      }

      const orders =
        await Order.find(query)
          .sort({
            createdAt: -1,
          })
          .limit(
            limitNumber
          )
          .skip(
            (pageNumber - 1) *
              limitNumber
          )
          .select(
            "-payment.razorpaySignature"
          );

      const total =
        await Order.countDocuments(
          query
        );

      return res.json({
        success: true,
        orders,
        totalOrders:
          total,
        totalPages:
          Math.ceil(
            total /
              limitNumber
          ),
        currentPage:
          pageNumber,
      });
    } catch (error) {
      console.error(
        "CUSTOMER ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch orders.",
      });
    }
  }
);

router.get(
  "/:orderId",
  customerAuth,
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      const customerId =
        req.customer._id;

      const order =
        await Order.findOne({
          _id:
            orderId,
          customerId,
        }).select(
          "-payment.razorpaySignature"
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      return res.json({
        success: true,
        order,
      });
    } catch (error) {
      console.error(
        "SINGLE ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch order.",
      });
    }
  }
);

router.patch(
  "/:orderId/status",
  adminAuth,
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      const {
        status,
        notes,
      } = req.body || {};

      const validStatuses = [
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ];

      if (
        !validStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid status. Valid statuses: ${validStatuses.join(", ")}`,
        });
      }

      const order =
        await Order.findById(
          orderId
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        order.status ===
        "pending_approval"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Approve or reject the order first.",
        });
      }

      if (
        status ===
        "shipped"
      ) {
        if (
          order.approval?.status !==
          "approved"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Order must be approved before shipping.",
          });
        }

        if (
          !order.shipping
            ?.shiprocketOrderId
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Shiprocket order has not been created yet.",
          });
        }
      }

      order.status =
        status;

      if (notes) {
        order.adminNotes =
          notes;
      }

      if (
        status ===
        "shipped"
      ) {
        order.shipping =
          order.shipping || {};

        order.shipping.shippedAt =
          new Date();
      }

      if (
        status ===
        "delivered"
      ) {
        order.shipping =
          order.shipping || {};

        order.shipping.deliveredAt =
          new Date();
      }

      await order.save();

      return res.json({
        success: true,
        message:
          `Order status updated to ${status}.`,
        order,
      });
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update order.",
      });
    }
  }
);

router.post(
  "/:orderId/request-cancellation",
  customerAuth,
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      const {
        reason,
      } = req.body || {};

      const customerId =
        req.customer._id;

      const order =
        await Order.findOne({
          _id:
            orderId,
          customerId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        [
          "shipped",
          "delivered",
          "cancelled",
        ].includes(
          order.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Cannot cancel order with status: ${order.status}`,
        });
      }

      order.cancellation = {
        requestedAt:
          new Date(),

        requestReason:
          reason ||
          "No reason provided",

        status:
          "pending",
      };

      await order.save();

      return res.json({
        success: true,
        message:
          "Cancellation request submitted.",
        order,
      });
    } catch (error) {
      console.error(
        "CANCELLATION REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to request cancellation.",
      });
    }
  }
);

router.post(
  "/:orderId/request-return",
  customerAuth,
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      const {
        reason,
      } = req.body || {};

      const customerId =
        req.customer._id;

      const order =
        await Order.findOne({
          _id:
            orderId,
          customerId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        order.status !==
        "delivered"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Return can only be requested after delivery.",
        });
      }

      if (
        order.return?.status ===
        "pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Return request is already pending.",
        });
      }

      order.return = {
        requestedAt:
          new Date(),

        reason:
          reason ||
          "No reason provided",

        status:
          "pending",
      };

      await order.save();

      return res.json({
        success: true,
        message:
          "Return request submitted.",
        order,
      });
    } catch (error) {
      console.error(
        "RETURN REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to request return.",
      });
    }
  }
);

router.post(
  "/:orderId/request-replacement",
  customerAuth,
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      const {
        reason,
      } = req.body || {};

      const customerId =
        req.customer._id;

      const order =
        await Order.findOne({
          _id:
            orderId,
          customerId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        order.status !==
        "delivered"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Replacement can only be requested after delivery.",
        });
      }

      if (
        order.replacement
          ?.status ===
        "pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Replacement request is already pending.",
        });
      }

      order.replacement = {
        requestedAt:
          new Date(),

        reason:
          reason ||
          "No reason provided",

        status:
          "pending",
      };

      await order.save();

      return res.json({
        success: true,
        message:
          "Replacement request submitted.",
        order,
      });
    } catch (error) {
      console.error(
        "REPLACEMENT REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to request replacement.",
      });
    }
  }
);

router.patch(
  "/:orderId/cancellation-decision",
  adminAuth,
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      const {
        decision,
        refundReason,
      } = req.body || {};

      if (
        ![
          "approved",
          "rejected",
        ].includes(
          decision
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Decision must be approved or rejected.",
        });
      }

      const order =
        await Order.findById(
          orderId
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        !order.cancellation ||
        !order.cancellation
          .requestedAt
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No cancellation request for this order.",
        });
      }

      order.cancellation
        .status =
        decision;

      order.cancellation
        .approvedAt =
        decision ===
        "approved"
          ? new Date()
          : null;

      if (
        decision ===
        "approved"
      ) {
        order.status =
          "cancelled";
      }

      if (refundReason) {
        order.adminNotes =
          refundReason;
      }

      await order.save();

      return res.json({
        success: true,
        message:
          `Cancellation ${decision}.`,
        order,
      });
    } catch (error) {
      console.error(
        "CANCELLATION DECISION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to process cancellation.",
      });
    }
  }
);

router.patch(
  "/:orderId/return-decision",
  adminAuth,
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      const {
        decision,
        adminNotes,
        refundAmount,
      } = req.body || {};

      if (
        ![
          "approved",
          "rejected",
        ].includes(
          decision
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Decision must be approved or rejected.",
        });
      }

      const order =
        await Order.findById(
          orderId
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        !order.return ||
        !order.return
          .requestedAt
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No return request for this order.",
        });
      }

      order.return.status =
        decision;

      order.return.approvedAt =
        decision ===
        "approved"
          ? new Date()
          : null;

      if (adminNotes) {
        order.return
          .adminNotes =
          adminNotes;
      }

      if (
        decision ===
          "approved" &&
        refundAmount !==
          undefined
      ) {
        order.return
          .refundAmount =
          Number(
            refundAmount
          ) || 0;
      }

      await order.save();

      return res.json({
        success: true,
        message:
          `Return request ${decision}.`,
        order,
      });
    } catch (error) {
      console.error(
        "RETURN DECISION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to process return.",
      });
    }
  }
);

router.patch(
  "/:orderId/replacement-decision",
  adminAuth,
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      const {
        decision,
        adminNotes,
        newOrderId,
      } = req.body || {};

      if (
        ![
          "approved",
          "rejected",
        ].includes(
          decision
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Decision must be approved or rejected.",
        });
      }

      const order =
        await Order.findById(
          orderId
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        !order.replacement ||
        !order.replacement
          .requestedAt
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No replacement request for this order.",
        });
      }

      order.replacement
        .status =
        decision;

      order.replacement
        .approvedAt =
        decision ===
        "approved"
          ? new Date()
          : null;

      if (adminNotes) {
        order.replacement
          .adminNotes =
          adminNotes;
      }

      if (
        decision ===
          "approved" &&
        newOrderId
      ) {
        order.replacement
          .newOrderId =
          newOrderId;
      }

      await order.save();

      return res.json({
        success: true,
        message:
          `Replacement request ${decision}.`,
        order,
      });
    } catch (error) {
      console.error(
        "REPLACEMENT DECISION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to process replacement.",
      });
    }
  }
);

module.exports = router;
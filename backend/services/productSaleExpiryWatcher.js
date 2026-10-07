"use strict";

/*
|--------------------------------------------------------------------------
| PRODUCT SALE EXPIRY WATCHER
|--------------------------------------------------------------------------
| This is intentionally SEPARATE from saleExpiryWatcher.js.
| The existing saleExpiryWatcher.js controls the Sale page countdown and
| subscriber/live-email system and is NOT changed by this feature.
|
| This watcher only removes individual products from sale when their own
| saleManagement.expiresAt is reached.
|--------------------------------------------------------------------------
*/

const Product = require("../models/Product");

const POLL_INTERVAL_MS = 60 * 1000;

async function expireProductSales() {
  try {
    const now = new Date();

    const products = await Product.find({
      showOnSale: true,
      "saleManagement.expiresAt": {
        $ne: null,
        $lte: now,
      },
    }).select("_id pricing options variants saleManagement");

    if (!products.length) return;

    for (const product of products) {
      if (product.pricing) {
        product.pricing.salePrice = null;
      }

      if (Array.isArray(product.options?.colors)) {
        product.options.colors.forEach((color) => {
          color.salePrice = null;
        });
      }

      if (Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          variant.salePrice = null;
        });
      }

      product.showOnSale = false;
      product.saleManagement.discountPercent = null;
      product.saleManagement.startsAt = null;
      product.saleManagement.expiresAt = null;
      product.saleManagement.pricingSnapshot = null;

      await product.save();
    }

    console.log(
      `[ProductSaleExpiryWatcher] Removed ${products.length} expired sale product(s).`
    );
  } catch (error) {
    console.error(
      "[ProductSaleExpiryWatcher] Error:",
      error.message
    );
  }
}

function startProductSaleExpiryWatcher() {
  console.log(
    "[ProductSaleExpiryWatcher] Started — checking every 60 seconds."
  );

  expireProductSales();
  setInterval(expireProductSales, POLL_INTERVAL_MS);
}

module.exports = {
  startProductSaleExpiryWatcher,
  expireProductSales,
};

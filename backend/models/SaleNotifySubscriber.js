const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| SALE NOTIFY SUBSCRIBER
|--------------------------------------------------------------------------
| Each document = one email address.
|
| subscribedForSale  — the saleKey (countdownDate ISO or "open") this
|                      subscriber signed up for. When admin resets or a
|                      new sale starts with a different date, this is
|                      cleared so the user can subscribe again.
|
| notifiedAt         — when the sale-live blast was sent to them.
| notifiedForSale    — which sale they were last notified about.
|--------------------------------------------------------------------------
*/

const saleNotifySubscriberSchema = new mongoose.Schema(
  {
    email: {
      type:     String,
      required: true,
      unique:   true,
      lowercase: true,
      trim:     true,
      index:    true,
    },

    /*
     * The saleKey this user subscribed for.
     * Format: ISO date string of countdownDate, e.g. "2026-10-01T12:00:00.000Z"
     * Empty string = not subscribed for any current sale.
     */
    subscribedForSale: {
      type:    String,
      default: "",
    },

    /* null = blast not yet sent */
    notifiedAt: {
      type:    Date,
      default: null,
    },

    notifiedForSale: {
      type:    String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SaleNotifySubscriber", saleNotifySubscriberSchema);

const mongoose = require("mongoose");

/* =========================================================
   SALE SETTINGS SCHEMA
========================================================= */

const saleSettingSchema =
  new mongoose.Schema(
    {
      /*
       * Singleton document.
       * Database me sirf "main" setting rahegi.
       */
      key: {
        type: String,
        required: true,
        unique: true,
        default: "main",
        immutable: true,
      },

      /*
       * Timer ON/OFF.
       */
      countdownEnabled: {
        type: Boolean,
        default: false,
      },

      /*
       * Countdown target date/time.
       *
       * Frontend se ISO date bhejna:
       * 2026-09-30T18:30:00.000Z
       */
      countdownDate: {
        type: Date,
        default: null,
      },

      /*
       * Hero banners shown on the public sale page.
       * Desktop and mobile can use different assets.
       */
      desktopHeroImage: {
        type: String,
        default: "",
      },

      mobileHeroImage: {
        type: String,
        default: "",
      },

      /*
       * Notification message type.
       * "auto"   = system-generated message
       * "custom" = admin-written message
       */
      notifyMessageType: {
        type: String,
        enum: ["auto", "custom"],
        default: "auto",
      },

      /*
       * Custom message written by admin.
       * Only used when notifyMessageType = "custom"
       */
      notifyMessage: {
        type: String,
        default: "",
        maxlength: 2000,
      },

      /*
       * Sale title shown on the public sale page hero and in emails.
       * e.g. "Summer Sale", "Super Sale", "End of Season Sale"
       * If blank → default "Special Offer" is used everywhere.
       */
      saleTitle: {
        type: String,
        default: "",
        maxlength: 120,
        trim: true,
      },

      /*
       * If true → when countdown expires, backend automatically
       * blasts all subscribers with the sale-live email.
       * Admin sets this via "Send notification email when I save" checkbox.
       */
      autoBlastOnExpiry: {
        type: Boolean,
        default: false,
      },

      /*
       * Tracks whether the auto-blast for the current countdownDate
       * has already been fired — prevents duplicate sends on restart.
       */
      autoBlastFiredFor: {
        type: String,   // ISO string of the countdownDate that was blasted
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "SaleSetting",
    saleSettingSchema
  );
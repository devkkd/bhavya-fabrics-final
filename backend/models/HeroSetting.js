const mongoose = require("mongoose");

const heroSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      index: true,
      default: "homepage-hero",
    },
    desktopHeroImage: { type: String, trim: true, default: "" },
    mobileHeroImage: { type: String, trim: true, default: "" },
    eyebrowText: {
      type: String,
      trim: true,
      maxlength: 180,
      default: "Jaipur, Rajasthan — Est. Since Years",
    },
    heading: {
      type: String,
      trim: true,
      maxlength: 240,
      default: "Premium Wholesale Fabrics for Global Fashion Brands",
    },
    subtext: {
      type: String,
      trim: true,
      maxlength: 1000,
      default:
        "Manufacturer of Premium Cotton, Linen, Rayon, Mulmul, Ajrakh, Block Print and Designer Fabrics for Bulk Orders Worldwide.",
    },
    primaryButtonText: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "Explore Collections",
    },
    secondaryButtonText: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "Request Catalogue",
    },
  },
  { timestamps: true, collection: "hero_settings" }
);

module.exports =
  mongoose.models.HeroSetting ||
  mongoose.model("HeroSetting", heroSettingSchema);

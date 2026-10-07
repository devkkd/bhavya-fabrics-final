const express = require("express");
const HeroSetting = require("../models/HeroSetting");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

const FALLBACKS = {
  desktopHeroImage: "/images/hero.png",
  mobileHeroImage: "/images/hero-mobile.png",
  eyebrowText: "Jaipur, Rajasthan — Est. Since Years",
  heading: "Premium Wholesale Fabrics for Global Fashion Brands",
  subtext:
    "Manufacturer of Premium Cotton, Linen, Rayon, Mulmul, Ajrakh, Block Print and Designer Fabrics for Bulk Orders Worldwide.",
  primaryButtonText: "Explore Collections",
  secondaryButtonText: "Request Catalogue",
};

function cleanSettings(settings) {
  const source = settings || {};

  return {
    desktopHeroImage:
      String(source.desktopHeroImage || "").trim() ||
      FALLBACKS.desktopHeroImage,
    mobileHeroImage:
      String(source.mobileHeroImage || "").trim() ||
      FALLBACKS.mobileHeroImage,
    eyebrowText:
      String(source.eyebrowText || "").trim() ||
      FALLBACKS.eyebrowText,
    heading:
      String(source.heading || "").trim() ||
      FALLBACKS.heading,
    subtext:
      String(source.subtext || "").trim() ||
      FALLBACKS.subtext,
    primaryButtonText:
      String(source.primaryButtonText || "").trim() ||
      FALLBACKS.primaryButtonText,
    secondaryButtonText:
      String(source.secondaryButtonText || "").trim() ||
      FALLBACKS.secondaryButtonText,
  };
}

router.get("/", async (req, res) => {
  try {
    const settings = await HeroSetting.findOne({
      key: "homepage-hero",
    }).lean();

    return res.status(200).json({
      success: true,
      settings: cleanSettings(settings),
    });
  } catch (error) {
    console.error("Hero settings public GET error:", error);
    return res.status(200).json({
      success: true,
      settings: FALLBACKS,
    });
  }
});

router.get("/admin", adminAuth, async (req, res) => {
  try {
    const settings = await HeroSetting.findOne({
      key: "homepage-hero",
    }).lean();

    return res.status(200).json({
      success: true,
      settings: {
        desktopHeroImage: settings?.desktopHeroImage || "",
        mobileHeroImage: settings?.mobileHeroImage || "",
        eyebrowText: settings?.eyebrowText || "",
        heading: settings?.heading || "",
        subtext: settings?.subtext || "",
        primaryButtonText: settings?.primaryButtonText || "",
        secondaryButtonText: settings?.secondaryButtonText || "",
      },
      fallbacks: FALLBACKS,
    });
  } catch (error) {
    console.error("Hero settings admin GET error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load hero settings.",
    });
  }
});

router.put("/admin", adminAuth, async (req, res) => {
  try {
    const body = req.body || {};

    const update = {
      key: "homepage-hero",
      desktopHeroImage: String(body.desktopHeroImage || "").trim(),
      mobileHeroImage: String(body.mobileHeroImage || "").trim(),
      eyebrowText: String(body.eyebrowText || "").trim(),
      heading: String(body.heading || "").trim(),
      subtext: String(body.subtext || "").trim(),
      primaryButtonText: String(body.primaryButtonText || "").trim(),
      secondaryButtonText: String(body.secondaryButtonText || "").trim(),
    };

    const settings = await HeroSetting.findOneAndUpdate(
      { key: "homepage-hero" },
      { $set: update },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Homepage hero settings saved successfully.",
      settings: cleanSettings(settings),
    });
  } catch (error) {
    console.error("Hero settings admin PUT error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to save hero settings.",
    });
  }
});

module.exports = router;

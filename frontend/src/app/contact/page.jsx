"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock3,
  ArrowRight,
  MessageCircle,
  Truck,
  Headphones,
  Heart,
} from "lucide-react";

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  darkCream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  ink: "#1A1A1A",
};

/* =========================================================
   HERO IMAGES
========================================================= */

const DESKTOP_HERO =
  "/images/contact/desktopHero.png";

const MOBILE_HERO =
  "/images/contact/mobileHero.png";

/* =========================================================
   GOOGLE MAP
========================================================= */

const MAP_QUERY =
  "Bhavya Fabrics, 38 Gupta Garden, Govind Nagar West, Amer Road, Jaipur, Rajasthan 302002";

const MAP_EMBED_URL =
  "https://www.google.com/maps?q=" +
  encodeURIComponent(MAP_QUERY) +
  "&output=embed";

const MAP_DIRECTION_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(MAP_QUERY);

/* =========================================================
   CONTACT DETAILS
========================================================= */

const CONTACT_DETAILS = [
  {
    icon: Phone,
    label: "PHONE",
    value: "+91 8302906190",
    href: "tel:+918302906190",
  },
  {
    icon: Mail,
    label: "EMAIL",
    value: "info@bhavyafabrics.com",
    href: "mailto:info@bhavyafabrics.com",
  },
  {
    icon: MapPin,
    label: "ADDRESS",
    value:
      "38 Gupta Garden, Govind Nagar West, Amar Road, Jaipur, Rajasthan – 302002",
  },
  {
    icon: Clock3,
    label: "BUSINESS HOURS",
    value:
      "Monday – Saturday · 9:30 AM – 7:00 PM",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    fabric: "",
    quantity: "",
    city: "",
    message: "",
  });

  const [submitted, setSubmitted] =
    useState(false);

  /* Mobile hero tap state */
  const [heroActive, setHeroActive] =
    useState(false);

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     FORM SUBMIT
  ========================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    /*
      Actual API / email integration
      baad me yahan add kar sakte ho.
    */

    setSubmitted(true);

    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      fabric: "",
      quantity: "",
      city: "",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <main
      className="contact-page"
      style={styles.page}
    >
      <style>{`
        /* =====================================================
           GLOBAL
        ===================================================== */

        .contact-page {
          width: 100%;
          min-width: 0;

          overflow-x: hidden;

          background: #FAF8F5;
        }

        /* =====================================================
           COMMON CONTAINER
        ===================================================== */

        .contact-container {
          width: 100%;
          max-width: 1400px;

          margin: 0 auto;

          padding: 0 32px;

          box-sizing: border-box;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .contact-hero {
          position: relative;

          width: 100%;

          height: 560px;

          overflow: hidden;

          background: #E8E0D5;
        }

        .contact-hero-image {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          object-position: center;

          display: block;
        }

        /* Mobile image hidden on desktop */
        .contact-hero-mobile-image {
          display: none;
        }

        .contact-hero-overlay {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(250,248,245,0.95) 0%,
              rgba(250,248,245,0.82) 30%,
              rgba(250,248,245,0.22) 64%,
              rgba(250,248,245,0.02) 100%
            );

          opacity: 0;

          pointer-events: none;

          transition:
            opacity 0.35s ease;
        }

        /* =====================================================
           HERO CONTENT
        ===================================================== */

        .contact-hero-content {
          position: absolute;

          inset: 0;

          z-index: 2;

          display: flex;

          align-items: center;

          pointer-events: none;
        }

        .contact-hero-inner {
          width: 100%;

          max-width: 1400px;

          margin: 0 auto;

          padding:
            42px 32px 0;

          box-sizing: border-box;
        }

        .contact-hero-copy {
          width: 100%;

          max-width: 610px;

          opacity: 0;

          transform:
            translateY(15px);

          transition:
            opacity 0.35s ease,
            transform 0.35s ease;
        }

        /* =====================================================
           DESKTOP HOVER
        ===================================================== */

        @media (hover: hover) and (pointer: fine) {
          .contact-hero:hover
            .contact-hero-overlay {
            opacity: 1;
          }

          .contact-hero:hover
            .contact-hero-copy {
            opacity: 1;

            transform:
              translateY(0);
          }
        }

        /* =====================================================
           HERO TEXT
        ===================================================== */

        .contact-hero-eyebrow {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 22px;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;

          font-weight: 500;

          letter-spacing: 4px;

          color: #3C3C3C;

          text-transform: uppercase;
        }

        .contact-hero-line {
          width: 36px;
          height: 1px;

          background:
            ${COLORS.gold};

          flex-shrink: 0;
        }

        .contact-hero-title {
          margin: 0;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 62px;

          font-weight: 600;

          line-height: 0.98;

          color:
            ${COLORS.teal};
        }

        .contact-hero-title-gold {
          display: block;

          color:
            ${COLORS.gold};
        }

        .contact-hero-description {
          width: 100%;

          max-width: 570px;

          margin:
            26px 0 0;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 15px;

          font-weight: 400;

          line-height: 1.7;

          color: #626262;
        }

        .contact-hero-signature {
          margin-top: 22px;

          color:
            ${COLORS.gold};

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 30px;

          font-style: italic;

          line-height: 1;
        }

        /* =====================================================
           CONTACT INFO SECTION
        ===================================================== */

        .contact-info-section {
          width: 100%;

          background:
            ${COLORS.cream};

          padding:
            42px 0 56px;
        }

        .contact-info-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);

          gap: 34px;

          align-items: start;

          box-sizing: border-box;
        }

        /* =====================================================
           LEFT CONTENT
        ===================================================== */

        .contact-left {
          width: 100%;
          min-width: 0;
        }

        .contact-section-eyebrow {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 14px;
        }

        .contact-section-eyebrow-line {
          width: 38px;
          height: 1px;

          display: inline-block;

          background:
            ${COLORS.gold};
        }

        .contact-section-title {
          margin: 0;

          color:
            ${COLORS.teal};

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 38px;

          font-weight: 600;

          line-height: 1.05;
        }

        .contact-left-description {
          width: 100%;

          max-width: 540px;

          margin:
            24px 0 20px;

          color: #686868;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 14px;

          font-weight: 400;

          line-height: 1.65;
        }

        /* =====================================================
           CONTACT DETAILS
        ===================================================== */

        .contact-details {
          width: 100%;

          display: flex;

          flex-direction: column;

          gap: 12px;
        }

        .contact-detail-card {
          width: 100%;

          display: flex;

          align-items: center;

          gap: 16px;

          padding: 15px;

          border-radius: 10px;

          background:
            rgba(255,255,255,0.80);

          border:
            1px solid
            rgba(41,92,101,0.06);

          box-sizing: border-box;

          text-decoration: none;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .contact-detail-card:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 8px 22px
            rgba(41,92,101,0.07);
        }

        .contact-detail-icon {
          width: 46px;
          height: 46px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            #E8EFEE;

          color:
            ${COLORS.teal};
        }

        .contact-detail-copy {
          min-width: 0;
        }

        .contact-detail-label {
          margin:
            0 0 3px;

          color:
            ${COLORS.gold};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 10px;

          font-weight: 600;

          letter-spacing: 2px;

          line-height: 1.2;
        }

        .contact-detail-value {
          margin: 0;

          color: #1B2D35;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 14px;

          font-weight: 400;

          line-height: 1.45;
        }

        /* =====================================================
           ACTION BUTTONS
        ===================================================== */

        .contact-actions {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(3, minmax(0,1fr));

          gap: 10px;

          margin-top: 16px;
        }

        .contact-action {
          min-height: 44px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          padding:
            10px 12px;

          border-radius: 999px;

          color: #FFFFFF;

          text-decoration: none;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;

          font-weight: 600;

          box-sizing: border-box;

          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .contact-action:hover {
          transform:
            translateY(-2px);

          opacity: 0.92;
        }

        .contact-call {
          background:
            ${COLORS.teal};
        }

        .contact-whatsapp {
          background: #16B957;
        }

        .contact-email {
          background:
            ${COLORS.gold};
        }

        /* =====================================================
           FORM CARD
        ===================================================== */

        .contact-form-card {
          width: 100%;

          background:
            rgba(255,255,255,0.90);

          border:
            1px solid
            rgba(41,92,101,0.06);

          border-radius: 14px;

          padding: 28px;

          box-sizing: border-box;

          box-shadow:
            0 5px 20px
            rgba(0,0,0,0.03);
        }

        .contact-form-title {
          margin: 0;

          color: #1B2D35;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 30px;

          font-weight: 600;

          line-height: 1.1;
        }

        .contact-form-line {
          width: 34px;
          height: 1px;

          margin:
            12px 0 20px;

          background:
            ${COLORS.gold};
        }

        .contact-form-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(2,minmax(0,1fr));

          column-gap: 18px;

          row-gap: 14px;
        }

        .contact-field {
          width: 100%;

          min-width: 0;
        }

        .contact-field-full {
          grid-column:
            1 / -1;
        }

        .contact-label {
          display: block;

          margin-bottom: 6px;

          color: #3A3A3A;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11.5px;

          font-weight: 500;

          line-height: 1.3;
        }

        .contact-input,
        .contact-textarea {
          width: 100%;

          display: block;

          border:
            1px solid
            #E2DDD6;

          border-radius: 8px;

          background:
            #FBFAF8;

          color: #333333;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;

          outline: none;

          box-sizing: border-box;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .contact-input {
          height: 42px;

          padding:
            0 13px;
        }

        .contact-textarea {
          min-height: 82px;

          padding:
            11px 13px;

          resize: vertical;
        }

        .contact-input::placeholder,
        .contact-textarea::placeholder {
          color: #999999;
        }

        .contact-input:focus,
        .contact-textarea:focus {
          border-color:
            ${COLORS.teal};

          background:
            #FFFFFF;

          box-shadow:
            0 0 0 3px
            rgba(41,92,101,0.07);
        }

        .contact-submit {
          width: 100%;

          height: 46px;

          margin-top: 18px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 8px;

          border: none;

          border-radius: 999px;

          background:
            ${COLORS.teal};

          color: #FFFFFF;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;

          font-weight: 600;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            filter 0.2s ease;
        }

        .contact-submit:hover {
          transform:
            translateY(-1px);

          filter:
            brightness(1.05);
        }

        .contact-success {
          margin:
            10px 0 0;

          text-align: center;

          color:
            ${COLORS.teal};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;

          font-weight: 500;
        }

        /* =====================================================
           STORE + MAP
        ===================================================== */

        .store-section {
          width: 100%;

          background:
            ${COLORS.darkCream};

          padding:
            42px 0 48px;
        }

        .store-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            minmax(0,0.85fr)
            minmax(0,1.15fr);

          gap: 40px;

          align-items: center;
        }

        .store-content {
          width: 100%;

          min-width: 0;
        }

        .store-title {
          margin: 0;

          color: #18333C;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 38px;

          font-weight: 600;

          line-height: 1.05;
        }

        .store-description {
          width: 100%;

          max-width: 440px;

          margin:
            18px 0 20px;

          color: #676767;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 13px;

          line-height: 1.65;
        }

        .store-button {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          padding:
            11px 19px;

          border:
            1px solid
            ${COLORS.gold};

          border-radius: 7px;

          background: transparent;

          color: #24353C;

          text-decoration: none;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;

          font-weight: 500;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .store-button:hover {
          background:
            ${COLORS.gold};

          color: #FFFFFF;
        }

        /* =====================================================
           LIVE MAP
        ===================================================== */

        .store-map {
          position: relative;

          width: 100%;

          height: 320px;

          overflow: hidden;

          border:
            1px solid
            rgba(41,92,101,0.12);

          border-radius: 10px;

          background: #E3E7E6;
        }

        .store-map iframe {
          width: 100%;
          height: 100%;

          display: block;

          border: 0;
        }

        /* =====================================================
           BENEFITS
           EQUAL LEFT/RIGHT SPACING
        ===================================================== */

        .benefits-section {
          width: 100%;

          background:
            ${COLORS.cream};

          border-top:
            1px solid
            rgba(41,92,101,0.06);

          padding:
            26px 0;
        }

        .benefits-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(3,minmax(0,1fr));

          gap: 0;
        }

        .benefit {
          min-height: 58px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 16px;

          padding:
            0 28px;

          border-right:
            1px solid
            #E5DED5;

          box-sizing: border-box;
        }

        .benefit:first-child {
          padding-left: 0;
        }

        .benefit:last-child {
          padding-right: 0;

          border-right: none;
        }

        .benefit-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          color:
            ${COLORS.gold};
        }

        .benefit-copy {
          min-width: 0;
        }

        .benefit-title {
          margin:
            0 0 4px;

          color: #1B2D35;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;

          font-weight: 600;

          line-height: 1.3;
        }

        .benefit-text {
          margin: 0;

          color: #777777;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 10.5px;

          font-weight: 400;

          line-height: 1.35;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1000px) {
          .contact-hero {
            height: 500px;
          }

          .contact-hero-title {
            font-size: 54px;
          }

          .contact-info-grid {
            grid-template-columns: 1fr;
          }

          .contact-left {
            max-width: 760px;
          }

          .contact-form-card {
            max-width: 760px;
          }

          .store-grid {
            grid-template-columns: 1fr;
          }

          .store-map {
            max-width: 760px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {
          /* ================================================
             CONTAINER
          ================================================ */

          .contact-container {
            width: 100%;
            max-width: 100%;

            margin: 0;

            padding:
              0 16px;
          }

          /* ================================================
             HERO
          ================================================ */

          .contact-hero {
            width: 100%;

            height: 80vh;

            min-height: 0;
            max-height: none;

            overflow: hidden;
          }

          .contact-hero-desktop-image {
            display: none;
          }

          .contact-hero-mobile-image {
            display: block;
          }

          /*
            Text hidden by default.
            User tap ke baad heroActive class
            ke through reveal hota hai.
          */

          .contact-hero.hero-active
            .contact-hero-overlay {
            opacity: 1;
          }

          .contact-hero.hero-active
            .contact-hero-copy {
            opacity: 1;

            transform:
              translateY(0);
          }

          .contact-hero-content {
            align-items: flex-start;

            pointer-events: auto;
          }

          .contact-hero-inner {
            width: 100%;

            max-width: 100%;

            padding:
              42px 16px 0;
          }

          .contact-hero-copy {
            max-width: 100%;
          }

          .contact-hero-eyebrow {
            font-size: 9px;

            letter-spacing: 3px;

            margin-bottom: 16px;
          }

          .contact-hero-line {
            width: 26px;
          }

          .contact-hero-title {
            font-size: 43px;

            line-height: 0.98;
          }

          .contact-hero-description {
            max-width: 330px;

            margin-top: 18px;

            font-size: 12.5px;

            line-height: 1.6;
          }

          .contact-hero-signature {
            margin-top: 17px;

            font-size: 25px;
          }

          /* ================================================
             CONTACT
          ================================================ */

          .contact-info-section {
            padding:
              36px 0 42px;
          }

          .contact-info-grid {
            gap: 28px;
          }

          .contact-section-title {
            font-size: 32px;
          }

          .contact-left-description {
            max-width: 100%;

            font-size: 12.5px;

            line-height: 1.6;

            margin:
              17px 0;
          }

          .contact-details {
            gap: 10px;
          }

          .contact-detail-card {
            padding: 12px;

            gap: 12px;

            border-radius: 9px;
          }

          .contact-detail-icon {
            width: 40px;
            height: 40px;
          }

          .contact-detail-label {
            font-size: 9px;

            letter-spacing: 1.7px;
          }

          .contact-detail-value {
            font-size: 11.5px;
          }

          /* ================================================
             ACTIONS
          ================================================ */

          .contact-actions {
            gap: 7px;

            margin-top: 12px;
          }

          .contact-action {
            min-height: 40px;

            padding:
              8px 7px;

            gap: 5px;

            font-size: 9px;
          }

          /* ================================================
             FORM
          ================================================ */

          .contact-form-card {
            width: 100%;

            max-width: 100%;

            padding:
              20px 16px;

            border-radius: 12px;
          }

          .contact-form-title {
            font-size: 28px;
          }

          .contact-form-line {
            margin:
              9px 0 17px;
          }

          .contact-form-grid {
            grid-template-columns:
              1fr;

            gap: 13px;
          }

          .contact-field-full {
            grid-column: auto;
          }

          .contact-label {
            font-size: 10.5px;
          }

          .contact-input {
            height: 40px;

            font-size: 11.5px;
          }

          .contact-textarea {
            min-height: 76px;

            font-size: 11.5px;
          }

          .contact-submit {
            height: 44px;

            margin-top: 15px;

            font-size: 11.5px;
          }

          /* ================================================
             STORE
          ================================================ */

          .store-section {
            padding:
              38px 0 42px;
          }

          .store-grid {
            gap: 24px;
          }

          .store-title {
            font-size: 32px;
          }

          .store-description {
            max-width: 100%;

            font-size: 12px;

            line-height: 1.6;

            margin:
              14px 0 17px;
          }

          .store-button {
            padding:
              10px 16px;

            font-size: 11px;
          }

          .store-map {
            width: 100%;

            height: 260px;

            max-width: 100%;

            border-radius: 9px;
          }

          /* ================================================
             BENEFITS
          ================================================ */

          .benefits-section {
            padding:
              18px 0;
          }

          .benefits-grid {
            grid-template-columns:
              1fr;
          }

          .benefit {
            min-height: 52px;

            justify-content:
              flex-start;

            padding:
              11px 0;

            border-right: none;

            border-bottom:
              1px solid
              #E5DED5;
          }

          .benefit:first-child {
            padding-left: 0;
          }

          .benefit:last-child {
            padding-right: 0;

            border-bottom: none;
          }

          .benefit-icon {
            width: 34px;
            height: 34px;
          }

          .benefit-title {
            font-size: 11px;
          }

          .benefit-text {
            font-size: 9.5px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 380px) {
          .contact-hero {
            height: 80vh;
          }

          .contact-hero-title {
            font-size: 39px;
          }

          .contact-hero-description {
            font-size: 12px;
          }

          .contact-section-title {
            font-size: 30px;
          }

          .contact-action {
            font-size: 8.5px;
          }

          .contact-form-card {
            padding:
              18px 14px;
          }

          .contact-form-title {
            font-size: 26px;
          }

          .store-title {
            font-size: 30px;
          }

          .store-map {
            height: 235px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .contact-hero-overlay,
          .contact-hero-copy,
          .contact-detail-card,
          .contact-action,
          .store-button,
          .contact-submit {
            transition: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className={
          "contact-hero" +
          (heroActive
            ? " hero-active"
            : "")
        }
        onClick={() => {
          if (
            typeof window !== "undefined" &&
            window.innerWidth <= 700
          ) {
            setHeroActive((prev) => !prev);
          }
        }}
      >
        {/* Desktop image */}

        <Image
          src={DESKTOP_HERO}
          alt="Bhavya Fabrics premium textile collection"
          fill
          priority
          sizes="100vw"
          className="
            contact-hero-image
            contact-hero-desktop-image
          "
        />

        {/* Mobile image */}

        <Image
          src={MOBILE_HERO}
          alt="Bhavya Fabrics premium textile collection"
          fill
          priority
          sizes="100vw"
          className="
            contact-hero-image
            contact-hero-mobile-image
          "
        />

        {/* Overlay */}

        <div className="contact-hero-overlay" />

        {/* Text */}

        <div className="contact-hero-content">
          <div className="contact-hero-inner">
            <div className="contact-hero-copy">

              <div className="contact-hero-eyebrow">
                <span className="contact-hero-line" />

                <span>
                  CONTACT US
                </span>

                <span className="contact-hero-line" />
              </div>

              <h1 className="contact-hero-title">
                Let&apos;s Create
                <br />
                Beautiful Spaces

                <span className="contact-hero-title-gold">
                  Together
                </span>
              </h1>

              <p className="contact-hero-description">
                Have a question about our
                fabrics, need help with an
                order, or looking to collaborate?
                Our team is here to help.
              </p>

              <div className="contact-hero-signature">
                Fabrics for
                <br />
                a Better Tomorrow
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          GET IN TOUCH
      ===================================================== */}

      <section
        className="contact-info-section"
      >
        <div className="contact-container">

          <div className="contact-info-grid">

            {/* LEFT */}

            <div className="contact-left">

              <div className="contact-section-eyebrow">
                <span className="contact-section-eyebrow-line" />
              </div>

              <h2 className="contact-section-title">
                Get in Touch
              </h2>

              <p className="contact-left-description">
                We&apos;d love to hear from you.
                Reach out to us through any of
                the following channels or fill
                out the form, and we&apos;ll get
                back to you as soon as possible.
              </p>

              <div className="contact-details">

                {CONTACT_DETAILS.map(
                  (item) => {
                    const Icon = item.icon;

                    const content = (
                      <>
                        <div className="contact-detail-icon">
                          <Icon
                            size={21}
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="contact-detail-copy">
                          <p className="contact-detail-label">
                            {item.label}
                          </p>

                          <p className="contact-detail-value">
                            {item.value}
                          </p>
                        </div>
                      </>
                    );

                    if (item.href) {
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          className="contact-detail-card"
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <div
                        key={item.label}
                        className="contact-detail-card"
                      >
                        {content}
                      </div>
                    );
                  }
                )}

              </div>

              <div className="contact-actions">

                <a
                  href="tel:+918302906190"
                  className="
                    contact-action
                    contact-call
                  "
                >
                  <Phone size={14} />

                  <span>
                    Call Now
                  </span>
                </a>

                <a
                  href="https://wa.me/918302906190"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    contact-action
                    contact-whatsapp
                  "
                >
                  <MessageCircle size={14} />

                  <span>
                    WhatsApp
                  </span>
                </a>

                <a
                  href="mailto:info@bhavyafabrics.com"
                  className="
                    contact-action
                    contact-email
                  "
                >
                  <Mail size={14} />

                  <span>
                    Email Us
                  </span>
                </a>

              </div>
            </div>

            {/* RIGHT FORM */}

            <div className="contact-form-card">

              <h2 className="contact-form-title">
                Send a Quote Request
              </h2>

              <div className="contact-form-line" />

              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >

                <div className="contact-form-grid">

                  {/* Full Name */}

                  <div className="contact-field">
                    <label
                      htmlFor="contact-name"
                      className="contact-label"
                    >
                      Full Name *
                    </label>

                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your Name"
                      value={form.name}
                      onChange={handleChange}
                      className="contact-input"
                    />
                  </div>

                  {/* Company */}

                  <div className="contact-field">
                    <label
                      htmlFor="contact-company"
                      className="contact-label"
                    >
                      Company
                    </label>

                    <input
                      id="contact-company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      placeholder="Company Name"
                      value={form.company}
                      onChange={handleChange}
                      className="contact-input"
                    />
                  </div>

                  {/* Phone */}

                  <div className="contact-field">
                    <label
                      htmlFor="contact-phone"
                      className="contact-label"
                    >
                      Phone
                    </label>

                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={form.phone}
                      onChange={handleChange}
                      className="contact-input"
                    />
                  </div>

                  {/* Email */}

                  <div className="contact-field">
                    <label
                      htmlFor="contact-email"
                      className="contact-label"
                    >
                      Email *
                    </label>

                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={handleChange}
                      className="contact-input"
                    />
                  </div>

                  {/* Fabric */}

                  <div
                    className="
                      contact-field
                      contact-field-full
                    "
                  >
                    <label
                      htmlFor="contact-fabric"
                      className="contact-label"
                    >
                      Fabric Requirement
                    </label>

                    <input
                      id="contact-fabric"
                      name="fabric"
                      type="text"
                      required
                      placeholder="e.g. Cotton Cambric, Ajrakh..."
                      value={form.fabric}
                      onChange={handleChange}
                      className="contact-input"
                    />
                  </div>

                  {/* Quantity */}

                  <div className="contact-field">
                    <label
                      htmlFor="contact-quantity"
                      className="contact-label"
                    >
                      Quantity / MOQ
                    </label>

                    <input
                      id="contact-quantity"
                      name="quantity"
                      type="text"
                      required
                      placeholder="e.g. 500 metres"
                      value={form.quantity}
                      onChange={handleChange}
                      className="contact-input"
                    />
                  </div>

                  {/* Country / City */}

                  <div className="contact-field">
                    <label
                      htmlFor="contact-city"
                      className="contact-label"
                    >
                      Country / City
                    </label>

                    <input
                      id="contact-city"
                      name="city"
                      type="text"
                      required
                      placeholder="Destination"
                      value={form.city}
                      onChange={handleChange}
                      className="contact-input"
                    />
                  </div>

                  {/* Message */}

                  <div
                    className="
                      contact-field
                      contact-field-full
                    "
                  >
                    <label
                      htmlFor="contact-message"
                      className="contact-label"
                    >
                      Message
                    </label>

                    <textarea
                      id="contact-message"
                      name="message"
                      placeholder="Tell us more about your requirements..."
                      value={form.message}
                      onChange={handleChange}
                      className="contact-textarea"
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  className="contact-submit"
                >
                  <span>
                    Submit Quote Request
                  </span>

                  <ArrowRight
                    size={17}
                    strokeWidth={2}
                  />
                </button>

                {submitted && (
                  <p
                    className="contact-success"
                    role="status"
                  >
                    Thank you. We&apos;ll get
                    back to you shortly.
                  </p>
                )}

              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STORE + LIVE MAP
      ===================================================== */}

      <section className="store-section">
        <div className="contact-container">

          <div className="store-grid">

            <div className="store-content">

              <div className="contact-section-eyebrow">
                <span className="contact-section-eyebrow-line" />

                <span
                  style={{
                    fontFamily:
                      "'Poppins', sans-serif",

                    fontSize: "10px",

                    letterSpacing: "3px",

                    color: COLORS.gold,

                    fontWeight: 600,

                    textTransform: "uppercase",
                  }}
                >
                  Our Location
                </span>
              </div>

              <h2 className="store-title">
                Visit Our Store
              </h2>

              <p className="store-description">
                Explore our exclusive collection
                of premium fabrics, home textiles
                and more at our Jaipur store.
                We&apos;d love to welcome you in
                person.
              </p>

              <a
                href={MAP_DIRECTION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="store-button"
              >
                <span>
                  Get Directions
                </span>

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                />
              </a>

            </div>

            {/* LIVE GOOGLE MAP */}

            <div
              className="store-map"
              aria-label="Bhavya Fabrics live location map"
            >
              <iframe
                src={MAP_EMBED_URL}
                title="Bhavya Fabrics Jaipur Location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          BENEFITS
      ===================================================== */}

      <section className="benefits-section">
        <div className="contact-container">

          <div className="benefits-grid">

            <div className="benefit">
              <Truck className="benefit-icon" />

              <div className="benefit-copy">
                <p className="benefit-title">
                  Worldwide Shipping
                </p>

                <p className="benefit-text">
                  Delivering happiness globally
                </p>
              </div>
            </div>

            <div className="benefit">
              <Headphones className="benefit-icon" />

              <div className="benefit-copy">
                <p className="benefit-title">
                  Dedicated Support
                </p>

                <p className="benefit-text">
                  We&apos;re here to help
                </p>
              </div>
            </div>

            <div className="benefit">
              <Heart className="benefit-icon" />

              <div className="benefit-copy">
                <p className="benefit-title">
                  Trusted by Thousands
                </p>

                <p className="benefit-text">
                  Loved by homes across India
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    width: "100%",

    background:
      COLORS.cream,

    boxSizing:
      "border-box",
  },
};
"use client";

import Image from "next/image";
import {
  ArrowRight,
  Gem,
  Users,
  Leaf,
  House,
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
   IMAGES
========================================================= */

const IMAGES = {
  desktopHero: "/images/contact/desktopHero.png",
  mobileHero: "/images/contact/mobileHero.png",

  story: "/images/about/1.png",
  commitment: "/images/about/2.png",
};

/* =========================================================
   TOP FEATURES
========================================================= */

const FEATURES = [
  {
    icon: Gem,
    title: "Premium Quality",
    desc: "Carefully sourced fabrics",
  },
  {
    icon: Users,
    title: "Skilled Artisans",
    desc: "Supporting local communities",
  },
  {
    icon: Leaf,
    title: "Sustainable Choices",
    desc: "Thoughtful for a better tomorrow",
  },
  {
    icon: House,
    title: "Beautiful Homes",
    desc: "Fabrics that feel like home",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <style>{`
        /* =====================================================
           BASE
        ===================================================== */

        .about-page {
          width: 100%;
          overflow-x: hidden;
          background: #FAF8F5;
          color: #1A1A1A;
        }

        /* =====================================================
           COMMON CONTAINER
        ===================================================== */

        .about-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          box-sizing: border-box;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .about-hero {
          position: relative;
          width: 100%;
          height: 480px;
          overflow: hidden;
          background: #E8E0D5;
        }

        .about-hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        /* Desktop hero visible by default */
        .about-hero-mobile-image {
          display: none !important;
        }

        /* =====================================================
           HERO OVERLAY
        ===================================================== */

        .about-hero-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(250,248,245,0.94) 0%,
              rgba(250,248,245,0.84) 30%,
              rgba(250,248,245,0.28) 62%,
              rgba(250,248,245,0.03) 100%
            );
        }

        /* =====================================================
           HERO CONTENT
        ===================================================== */

        .about-hero-content {
          position: relative;
          z-index: 2;

          width: 100%;
          height: 100%;

          display: flex;
          align-items: center;
        }

        .about-hero-inner {
          width: 100%;
          max-width: 1400px;

          margin: 0 auto;

          padding:
            42px 32px 0;

          box-sizing: border-box;
        }

        .about-hero-copy {
          width: 100%;
          max-width: 620px;
        }

        /* =====================================================
           EYEBROW
        ===================================================== */

        .about-eyebrow {
          display: flex;
          align-items: center;

          gap: 12px;

          margin-bottom: 18px;

          color: #24414A;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;

          font-weight: 500;

          letter-spacing: 4px;

          line-height: 1.2;

          text-transform: uppercase;
        }

        .about-eyebrow-line {
          width: 38px;
          height: 1px;

          background:
            #BE9D6B;

          flex-shrink: 0;
        }

        /* =====================================================
           HERO TITLE
        ===================================================== */

        .about-hero-title {
          margin: 0;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 60px;

          font-weight: 600;

          line-height: 0.98;

          color:
            #295C65;
        }

        .about-hero-title-gold {
          display: block;

          color:
            #BE9D6B;
        }

        .about-hero-description {
          width: 100%;
          max-width: 560px;

          margin:
            20px 0 0;

          color:
            #626262;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 14px;

          font-weight: 400;

          line-height: 1.7;
        }

        .about-hero-button {
          margin-top: 20px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 9px;

          padding:
            12px 20px;

          border:
            1px solid
            #BE9D6B;

          border-radius: 7px;

          background:
            transparent;

          color:
            #19333B;

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
            color 0.2s ease,
            transform 0.2s ease;
        }

        .about-hero-button:hover {
          background:
            #BE9D6B;

          color:
            #FFFFFF;

          transform:
            translateY(-2px);
        }

        /* =====================================================
           FEATURES
        ===================================================== */

        .about-features-section {
          width: 100%;

          background:
            #FFFFFF;

          padding:
            28px 0;
        }

        .about-features-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 0;
        }

        .about-feature {
          min-height: 110px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          padding:
            10px 24px;

          box-sizing: border-box;

          border-right:
            1px solid
            #E7E0D8;
        }

        .about-feature:last-child {
          border-right:
            none;
        }

        .about-feature-icon {
          width: 58px;
          height: 58px;

          margin-bottom: 10px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            #F1ECE5;

          color:
            #9A6D37;

          box-sizing: border-box;
        }

        .about-feature-title {
          margin:
            0 0 4px;

          color:
            #173843;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 19px;

          font-weight: 600;

          line-height: 1.2;
        }

        .about-feature-description {
          margin: 0;

          color:
            #737373;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;

          line-height: 1.5;
        }

        /* =====================================================
           STORY
        ===================================================== */

        .about-story-section {
          width: 100%;

          background:
            #FAF8F5;
        }

        .about-story-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1.05fr);

          align-items: stretch;

          min-height:
            440px;
        }

        .about-story-image {
          position: relative;

          width: 100%;

          min-height:
            440px;

          overflow: hidden;

          background:
            #E7E0D7;
        }

        .about-story-image img {
          width: 100%;
          height: 100%;

          object-fit: cover;

          display: block;
        }

        .about-story-image-overlay {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(20,35,39,0.36),
              rgba(20,35,39,0.04)
            );
        }

        .about-story-image-text {
          position: absolute;

          left: 54px;
          top: 54px;

          z-index: 2;

          max-width: 180px;

          color:
            #FFFFFF;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 10px;

          font-weight: 500;

          letter-spacing: 4px;

          line-height: 1.9;

          text-transform: uppercase;
        }

        .about-story-image-rule {
          width: 34px;
          height: 1px;

          margin-top: 18px;

          background:
            #BE9D6B;
        }

        .about-story-content {
          width: 100%;

          padding:
            58px 52px;

          box-sizing: border-box;

          display: flex;

          flex-direction: column;

          justify-content: center;
        }

        .about-small-eyebrow {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 12px;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 10px;

          font-weight: 500;

          letter-spacing: 3px;

          color:
            #28434C;

          text-transform: uppercase;
        }

        .about-small-eyebrow-line {
          width: 32px;
          height: 1px;

          background:
            #BE9D6B;
        }

        .about-story-title {
          margin: 0;

          color:
            #173C46;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 43px;

          font-weight: 600;

          line-height: 1.02;
        }

        .about-story-description {
          max-width: 540px;

          margin:
            18px 0 0;

          color:
            #646464;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 14px;

          line-height: 1.65;
        }

        /* =====================================================
           STORY STATS
        ===================================================== */

        .about-story-stats {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          margin-top:
            24px;
        }

        .about-story-stat {
          min-height:
            66px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          padding:
            0 14px;

          border-right:
            1px solid
            #D9D0C6;
        }

        .about-story-stat:first-child {
          padding-left: 0;
        }

        .about-story-stat:last-child {
          border-right:
            none;
        }

        .about-story-stat-value {
          color:
            #173C46;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 28px;

          font-weight: 600;

          line-height: 1;
        }

        .about-story-stat-label {
          margin-top:
            7px;

          color:
            #747474;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 9px;

          font-weight: 500;

          letter-spacing: 2px;

          text-transform: uppercase;
        }

        .about-story-button {
          align-self:
            flex-start;

          margin-top:
            22px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 8px;

          padding:
            11px 18px;

          border:
            1px solid
            #BE9D6B;

          border-radius:
            7px;

          background:
            transparent;

          color:
            #19333B;

          text-decoration:
            none;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            12px;

          font-weight:
            500;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .about-story-button:hover {
          background:
            #BE9D6B;

          color:
            #FFFFFF;

          transform:
            translateY(-2px);
        }

        /* =====================================================
           COMMITMENT
        ===================================================== */

        .about-commitment-section {
          width: 100%;

          background:
            #F2EEE9;

          padding:
            58px 0 62px;
        }

        .about-commitment-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            minmax(0,1fr)
            minmax(0,0.72fr);

          gap:
            50px;

          align-items:
            center;
        }

        .about-commitment-content {
          width: 100%;

          min-width: 0;
        }

        .about-commitment-title {
          margin:
            0;

          color:
            #173C46;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size:
            44px;

          font-weight:
            600;

          line-height:
            1.02;
        }

        .about-commitment-description {
          max-width:
            620px;

          margin:
            18px 0 0;

          color:
            #646464;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            14px;

          line-height:
            1.7;
        }

        .about-commitment-button {
          margin-top:
            22px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            8px;

          padding:
            11px 19px;

          border:
            1px solid
            #BE9D6B;

          border-radius:
            7px;

          background:
            transparent;

          color:
            #173C46;

          text-decoration:
            none;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            12px;

          font-weight:
            500;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .about-commitment-button:hover {
          background:
            #BE9D6B;

          color:
            #FFFFFF;
        }

        /* =====================================================
           COMMITMENT VISUAL
        ===================================================== */

        .about-commitment-visual {
          position:
            relative;

          width:
            100%;

          min-height:
            250px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          box-sizing:
            border-box;
        }

        .about-commitment-image {
          position:
            absolute;

          inset:
            0;

          width:
            100%;

          height:
            100%;

          object-fit:
            cover;

          border-radius:
            18px;

          opacity:
            0.72;
        }

        .about-commitment-image-overlay {
          position:
            absolute;

          inset:
            0;

          border-radius:
            18px;

          background:
            linear-gradient(
              90deg,
              rgba(242,238,233,0.92) 0%,
              rgba(242,238,233,0.72) 42%,
              rgba(242,238,233,0.36) 100%
            );
        }

        .about-quote {
          position:
            relative;

          z-index:
            2;

          width:
            100%;

          max-width:
            390px;

          padding:
            20px 20px 20px 26px;

          border-left:
            1px solid
            #BE9D6B;

          box-sizing:
            border-box;
        }

        .about-quote-mark {
          color:
            #BE9D6B;

          font-family:
            Georgia,
            serif;

          font-size:
            54px;

          line-height:
            0.6;

          margin-bottom:
            8px;
        }

        .about-quote-text {
          margin:
            0;

          color:
            #23424B;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size:
            29px;

          font-style:
            italic;

          font-weight:
            600;

          line-height:
            1.1;
        }

        .about-quote-line {
          width:
            34px;

          height:
            1px;

          margin:
            17px 0 12px;

          background:
            #BE9D6B;
        }

        .about-quote-author {
          margin:
            0;

          color:
            #727272;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            9px;

          letter-spacing:
            3px;

          text-transform:
            uppercase;
        }

        /* =====================================================
           BOTTOM LINE
        ===================================================== */

        .about-bottom-line {
          width:
            100%;

          padding-top:
            20px;

          color:
            #7C7C7C;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            9px;

          letter-spacing:
            4px;

          text-transform:
            uppercase;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1000px) {
          .about-hero {
            height:
              440px;
          }

          .about-hero-title {
            font-size:
              54px;
          }

          .about-story-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .about-story-content {
            padding:
              44px 36px;
          }

          .about-story-title {
            font-size:
              38px;
          }

          .about-commitment-grid {
            gap:
              32px;
          }

          .about-commitment-title {
            font-size:
              40px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {
          .about-container {
            width:
              100%;

            max-width:
              100%;

            margin:
              0;

            padding:
              0 16px;
          }

          /* =================================================
             MOBILE HERO IMAGE
          ================================================= */

          .about-hero {
            height:
              460px;
          }

          .about-hero-desktop-image {
            display:
              none !important;
          }

          .about-hero-mobile-image {
            display:
              block !important;
          }

          .about-hero-image {
            object-position:
              center;
          }

          .about-hero-overlay {
            background:
              linear-gradient(
                180deg,
                rgba(250,248,245,0.76) 0%,
                rgba(250,248,245,0.82) 42%,
                rgba(250,248,245,0.95) 100%
              );
          }

          .about-hero-content {
            align-items:
              flex-start;
          }

          .about-hero-inner {
            width:
              100%;

            max-width:
              100%;

            padding:
              42px 16px 0;
          }

          .about-hero-copy {
            max-width:
              100%;
          }

          .about-eyebrow {
            margin-bottom:
              15px;

            font-size:
              9px;

            letter-spacing:
              3px;
          }

          .about-eyebrow-line {
            width:
              26px;
          }

          .about-hero-title {
            font-size:
              43px;

            line-height:
              0.98;
          }

          .about-hero-description {
            max-width:
              350px;

            margin-top:
              18px;

            font-size:
              12.5px;

            line-height:
              1.6;
          }

          .about-hero-button {
            margin-top:
              17px;

            padding:
              10px 17px;

            font-size:
              11px;
          }

          /* =================================================
             FEATURES
          ================================================= */

          .about-features-section {
            padding:
              20px 0;
          }

          .about-features-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));

            row-gap:
              20px;
          }

          .about-feature {
            min-height:
              100px;

            padding:
              5px 12px;

            border-right:
              1px solid
              #E7E0D8;
          }

          .about-feature:nth-child(2) {
            border-right:
              none;
          }

          .about-feature-icon {
            width:
              48px;

            height:
              48px;

            margin-bottom:
              8px;
          }

          .about-feature-title {
            font-size:
              17px;
          }

          .about-feature-description {
            font-size:
              10.5px;
          }

          /* =================================================
             STORY
          ================================================= */

          .about-story-grid {
            display:
              flex;

            flex-direction:
              column;
          }

          .about-story-image {
            width:
              100%;

            min-height:
              320px;

            height:
              320px;
          }

          .about-story-image-text {
            left:
              24px;

            top:
              24px;

            font-size:
              8px;

            letter-spacing:
              3px;

            line-height:
              1.8;
          }

          .about-story-content {
            padding:
              36px 0 42px;
          }

          .about-story-title {
            font-size:
              34px;

            line-height:
              1.04;
          }

          .about-story-description {
            font-size:
              12px;

            line-height:
              1.6;

            margin-top:
              14px;
          }

          .about-story-stats {
            margin-top:
              21px;
          }

          .about-story-stat {
            min-height:
              58px;

            padding:
              0 8px;
          }

          .about-story-stat-value {
            font-size:
              24px;
          }

          .about-story-stat-label {
            font-size:
              8px;

            letter-spacing:
              1.5px;
          }

          .about-story-button {
            margin-top:
              19px;

            padding:
              10px 16px;

            font-size:
              11px;
          }

          /* =================================================
             COMMITMENT
          ================================================= */

          .about-commitment-section {
            padding:
              40px 0 44px;
          }

          .about-commitment-grid {
            grid-template-columns:
              1fr;

            gap:
              28px;
          }

          .about-commitment-title {
            font-size:
              35px;

            line-height:
              1.04;
          }

          .about-commitment-description {
            max-width:
              100%;

            font-size:
              12px;

            line-height:
              1.6;
          }

          .about-commitment-button {
            margin-top:
              18px;

            padding:
              10px 17px;

            font-size:
              11px;
          }

          .about-commitment-visual {
            min-height:
              235px;
          }

          .about-quote {
            max-width:
              310px;

            padding:
              16px 16px 16px 20px;
          }

          .about-quote-mark {
            font-size:
              42px;
          }

          .about-quote-text {
            font-size:
              25px;
          }

          .about-quote-line {
            margin:
              13px 0 10px;
          }

          .about-quote-author {
            font-size:
              8px;

            letter-spacing:
              2.5px;
          }

          .about-bottom-line {
            padding-top:
              14px;

            font-size:
              8px;

            letter-spacing:
              3px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 380px) {
          .about-hero {
            height:
              430px;
          }

          .about-hero-title {
            font-size:
              39px;
          }

          .about-hero-description {
            font-size:
              11.5px;
          }

          .about-feature-title {
            font-size:
              16px;
          }

          .about-story-image {
            height:
              290px;

            min-height:
              290px;
          }

          .about-story-title {
            font-size:
              31px;
          }

          .about-commitment-title {
            font-size:
              32px;
          }

          .about-quote-text {
            font-size:
              23px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .about-hero-button,
          .about-story-button,
          .about-commitment-button {
            transition:
              none;
          }
        }
      `}</style>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="about-hero">
        {/* DESKTOP HERO */}

        <Image
          src={IMAGES.desktopHero}
          alt="Bhavya Fabrics premium textile collection"
          fill
          priority
          sizes="100vw"
          className="
            about-hero-image
            about-hero-desktop-image
          "
        />

        {/* MOBILE HERO */}

        <Image
          src={IMAGES.mobileHero}
          alt="Bhavya Fabrics premium textile collection"
          fill
          priority
          sizes="100vw"
          className="
            about-hero-image
            about-hero-mobile-image
          "
        />

        <div className="about-hero-overlay" />

        <div className="about-hero-content">
          <div className="about-hero-inner">
            <div className="about-hero-copy">

              <div className="about-eyebrow">
                <span className="about-eyebrow-line" />

                <span>
                  About Us
                </span>

                <span className="about-eyebrow-line" />
              </div>

              <h1 className="about-hero-title">
                Rooted in
                <br />
                Tradition,

                <span className="about-hero-title-gold">
                  Designed for Today
                </span>
              </h1>

              <p className="about-hero-description">
                At Bhavya Fabrics, we bring the timeless
                beauty of Indian craftsmanship into
                modern living. Our fabrics and home
                textiles are made with care, culture and
                a deep love for tradition.
              </p>

              <a
                href="#story"
                className="about-hero-button"
              >
                Our Story

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                />
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section className="about-features-section">
        <div className="about-container">

          <div className="about-features-grid">

            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  className="about-feature"
                  key={feature.title}
                >
                  <div className="about-feature-icon">
                    <Icon
                      size={26}
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="about-feature-title">
                    {feature.title}
                  </h3>

                  <p className="about-feature-description">
                    {feature.desc}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* =====================================================
          OUR STORY
      ===================================================== */}

      <section
        id="story"
        className="about-story-section"
      >
        <div className="about-container">

          <div className="about-story-grid">

            {/* IMAGE */}

            <div className="about-story-image">

              <Image
                src={IMAGES.story}
                alt="Bhavya Fabrics Jaipur craftsmanship"
                fill
                sizes="
                  (max-width: 700px) 100vw,
                  50vw
                "
                style={{
                  objectFit: "cover",
                }}
              />

              <div className="about-story-image-overlay" />

              <div className="about-story-image-text">
                Crafted
                <br />
                in Jaipur
                <br />
                for homes
                <br />
                around
                <br />
                the world

                <div className="about-story-image-rule" />
              </div>

            </div>

            {/* CONTENT */}

            <div className="about-story-content">

              <div className="about-small-eyebrow">
                <span className="about-small-eyebrow-line" />

                <span>
                  Our Story
                </span>

                <span className="about-small-eyebrow-line" />
              </div>

              <h2 className="about-story-title">
                A Journey Rooted
                <br />
                in Jaipur
              </h2>

              <p className="about-story-description">
                Bhavya Fabrics was born from a passion for
                Indian textiles and a belief in the skill of
                our artisans. What started in Jaipur now
                brings beautifully crafted fabrics to homes
                across the world.
              </p>

              <div className="about-story-stats">

                <div className="about-story-stat">
                  <span className="about-story-stat-value">
                    2006
                  </span>

                  <span className="about-story-stat-label">
                    Established
                  </span>
                </div>

                <div className="about-story-stat">
                  <span className="about-story-stat-value">
                    30+
                  </span>

                  <span className="about-story-stat-label">
                    Countries
                  </span>
                </div>

                <div className="about-story-stat">
                  <span className="about-story-stat-value">
                    18+
                  </span>

                  <span className="about-story-stat-label">
                    Years of Trust
                  </span>
                </div>

              </div>

              <a
                href="#commitment"
                className="about-story-button"
              >
                Know Our Story

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                />
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COMMITMENT
      ===================================================== */}

      <section
        id="commitment"
        className="about-commitment-section"
      >
        <div className="about-container">

          <div className="about-commitment-grid">

            {/* LEFT */}

            <div className="about-commitment-content">

              <div className="about-small-eyebrow">
                <span className="about-small-eyebrow-line" />

                <span>
                  Our Commitment
                </span>

                <span className="about-small-eyebrow-line" />
              </div>

              <h2 className="about-commitment-title">
                Quality You Can Trust
              </h2>

              <p className="about-commitment-description">
                We work with the finest materials and
                traditional techniques to create fabrics
                that are made to last — for today,
                tomorrow and for generations.
              </p>

              <a
                href="#"
                className="about-commitment-button"
              >
                Our Promise

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                />
              </a>

            </div>

            {/* RIGHT */}

            <div className="about-commitment-visual">

              <Image
                src={IMAGES.commitment}
                alt="Bhavya Fabrics quality and craftsmanship"
                fill
                sizes="
                  (max-width: 700px) 100vw,
                  40vw
                "
                className="about-commitment-image"
              />

              <div className="about-commitment-image-overlay" />

              <div className="about-quote">

                <div className="about-quote-mark">
                  “
                </div>

                <p className="about-quote-text">
                  Better Fabrics.
                  <br />
                  A Kinder Tomorrow.
                </p>

                <div className="about-quote-line" />

                <p className="about-quote-author">
                  Bhavya Fabrics
                </p>

              </div>

            </div>
          </div>

          <div className="about-bottom-line">
            Tradition&nbsp;&nbsp;·&nbsp;&nbsp;
            Craftsmanship&nbsp;&nbsp;·&nbsp;&nbsp;
            A Brighter Tomorrow
          </div>

        </div>
      </section>
    </main>
  );
}
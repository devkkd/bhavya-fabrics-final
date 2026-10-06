"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faAward,
  faShieldHalved,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  darkCream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  ink: "#1A1A1A",
};

const FEATURES = [
  {
    icon: faGlobe,
    title: "20+ Countries",
    desc: "Active export destinations",
  },
  {
    icon: faAward,
    title: "ISO Certified",
    desc: "Quality management system",
  },
  {
    icon: faShieldHalved,
    title: "OEKO-TEX",
    desc: "Hazard-free fabric standards",
  },
  {
    icon: faCircleCheck,
    title: "GST Registered",
    desc: "Government-recognized exporter",
  },
];

const COUNTRIES = [
  "UAE",
  "UK",
  "USA",
  "Germany",
  "France",
  "Australia",
  "Canada",
  "Singapore",
  "Saudi Arabia",
  "Japan",
  "Malaysia",
  "South Africa",
];

/* =========================================================
   GIF
   Put your GIF inside:
   /public/images/home/export.gif
========================================================= */

const EXPORT_GIF = "/images/home/export.gif";

export default function WorldwideExport() {
  return (
    <section
      className="wex-section"
      style={styles.section}
    >
      <style>{`
        /* =====================================================
           ONE MAIN CONTAINER
           
           Desktop:
           max-width = 1400px
           side padding = 32px
           centered for equal left/right outer space
        ===================================================== */

        .wex-container {
          width: 100%;
          max-width: 1400px;

          margin: 0 auto;

          padding: 0 32px;

          box-sizing: border-box;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);

          gap: 64px;

          align-items: center;
        }

        /* =====================================================
           LEFT CONTENT
        ===================================================== */

        .wex-content {
          width: 100%;
          min-width: 0;
        }

        .wex-eyebrow {
          display: flex;
          align-items: center;

          gap: 12px;

          margin-bottom: 16px;

          color: ${COLORS.gold};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;
          font-weight: 500;

          letter-spacing: 3px;

          line-height: 1.2;

          text-transform: uppercase;
        }

        .wex-eyebrow-line {
          width: 28px;
          height: 1px;

          display: inline-block;

          flex-shrink: 0;

          background: ${COLORS.gold};
        }

        .wex-title {
          margin: 0 0 22px 0;

          color: ${COLORS.ink};

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 40px;

          font-weight: 600;

          line-height: 1.1;
        }

        .wex-desc {
          width: 100%;
          max-width: 560px;

          margin: 0 0 32px 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 14px;

          font-weight: 400;

          line-height: 1.7;
        }

        /* =====================================================
           FEATURE CARDS
        ===================================================== */

        .wex-features {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 14px;

          margin-bottom: 28px;
        }

        .wex-feature-card {
          width: 100%;
          min-width: 0;

          display: flex;
          align-items: flex-start;

          gap: 14px;

          padding: 18px 20px;

          background: ${COLORS.darkCream};

          border-radius: 14px;

          box-sizing: border-box;
        }

        .wex-feature-icon {
          width: 18px;
          height: 18px;

          flex-shrink: 0;

          margin-top: 3px;

          color: ${COLORS.teal};
        }

        .wex-feature-content {
          min-width: 0;
        }

        .wex-feature-title {
          margin: 0 0 3px 0;

          color: ${COLORS.ink};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 14px;

          font-weight: 500;

          line-height: 1.35;
        }

        .wex-feature-desc {
          margin: 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;

          font-weight: 400;

          line-height: 1.45;
        }

        /* =====================================================
           COUNTRIES
        ===================================================== */

        .wex-countries {
          display: flex;

          flex-wrap: wrap;

          gap: 10px;
        }

        .wex-country-pill {
          display: inline-flex;
          align-items: center;

          padding: 9px 18px;

          border-radius: 999px;

          background: ${COLORS.darkCream};

          color: ${COLORS.teal};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 13.5px;

          font-weight: 500;

          line-height: 1.2;

          white-space: nowrap;
        }

        /* =====================================================
           RIGHT GIF AREA
        ===================================================== */

        .wex-visual {
          width: 100%;

          display: flex;

          align-items: center;
          justify-content: center;

          min-width: 0;
        }

        .wex-gif-card {
          position: relative;

          width: 100%;

          max-width: 620px;

          aspect-ratio: 1 / 0.98;

          overflow: hidden;

          background: ${COLORS.darkCream};

          border-radius: 28px;

          box-sizing: border-box;
        }

        .wex-gif {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          object-position: center;
        }

        /* Optional subtle overlay so GIF blends
           with the website's visual language */
        .wex-gif-overlay {
          position: absolute;

          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              180deg,
              rgba(41, 92, 101, 0.02) 0%,
              rgba(41, 92, 101, 0.05) 100%
            );
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1024px) {
          .wex-container {
            grid-template-columns: 1fr;

            gap: 48px;
          }

          .wex-content {
            width: 100%;
          }

          .wex-visual {
            width: 100%;

            justify-content: flex-start;
          }

          .wex-gif-card {
            width: 100%;

            max-width: 620px;

            aspect-ratio: 1 / 0.8;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .wex-container {
            width: 100%;
            max-width: 100%;

            padding: 0 16px;

            grid-template-columns: 1fr;

            gap: 36px;
          }

          .wex-eyebrow {
            font-size: 11px;

            letter-spacing: 2px;

            margin-bottom: 14px;
          }

          .wex-eyebrow-line {
            width: 24px;
          }

          .wex-title {
            font-size: 38px;

            line-height: 1.08;

            margin-bottom: 18px;
          }

          .wex-desc {
            width: 100%;
            max-width: 100%;

            font-size: 14px;

            line-height: 1.6;

            margin-bottom: 28px;
          }

          .wex-features {
            grid-template-columns: 1fr;

            gap: 12px;

            margin-bottom: 24px;
          }

          .wex-feature-card {
            gap: 12px;

            padding: 16px;
          }

          .wex-feature-title {
            font-size: 14px;
          }

          .wex-feature-desc {
            font-size: 12.5px;
          }

          .wex-countries {
            gap: 8px;
          }

          .wex-country-pill {
            font-size: 12.5px;

            padding: 8px 14px;
          }

          .wex-visual {
            width: 100%;
          }

          .wex-gif-card {
            width: 100%;
            max-width: 100%;

            aspect-ratio: 1 / 0.95;

            border-radius: 20px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {
          .wex-container {
            gap: 30px;

            padding: 0 16px;
          }

          .wex-eyebrow {
            font-size: 10px;

            letter-spacing: 2px;
          }

          .wex-eyebrow-line {
            width: 24px;
          }

          .wex-title {
            font-size: 32px;

            line-height: 1.08;
          }

          .wex-desc {
            font-size: 13.5px;

            line-height: 1.6;
          }

          .wex-feature-card {
            padding: 15px;
          }

          .wex-feature-title {
            font-size: 13.5px;
          }

          .wex-feature-desc {
            font-size: 12px;
          }

          .wex-country-pill {
            font-size: 12px;

            padding: 7px 12px;
          }

          .wex-gif-card {
            aspect-ratio: 1 / 1;

            border-radius: 18px;
          }
        }

        /* =====================================================
           VERY SMALL MOBILE
        ===================================================== */

        @media (max-width: 360px) {
          .wex-title {
            font-size: 30px;
          }

          .wex-desc {
            font-size: 13px;
          }

          .wex-feature-card {
            gap: 10px;

            padding: 14px;
          }

          .wex-feature-title {
            font-size: 13px;
          }

          .wex-feature-desc {
            font-size: 11.5px;
          }
        }

        /* =====================================================
           ACCESSIBILITY
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .wex-gif {
            animation: none;
          }
        }
      `}</style>

      {/* =====================================================
          ONE MAIN CONTAINER
      ===================================================== */}

      <div className="wex-container">

        {/* ===================== LEFT ===================== */}

        <div className="wex-content">

          <div className="wex-eyebrow">
            <span className="wex-eyebrow-line" />

            <span>
              GLOBAL REACH
            </span>
          </div>

          <h2 className="wex-title">
            Worldwide Export
          </h2>

          <p className="wex-desc">
            Bhavya Fabrics exports premium textile
            yardage to over 20 countries across the
            Middle East, Europe, Southeast Asia, and
            North America. Partnered with DHL, FedEx,
            and India Post for reliable worldwide
            delivery.
          </p>

          <div className="wex-features">
            {FEATURES.map((feature) => (
              <div
                className="wex-feature-card"
                key={feature.title}
              >
                <FontAwesomeIcon
                  icon={feature.icon}
                  className="wex-feature-icon"
                />

                <div className="wex-feature-content">
                  <p className="wex-feature-title">
                    {feature.title}
                  </p>

                  <p className="wex-feature-desc">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="wex-countries">
            {COUNTRIES.map((country) => (
              <span
                className="wex-country-pill"
                key={country}
              >
                {country}
              </span>
            ))}
          </div>
        </div>

        {/* ===================== RIGHT GIF ===================== */}

        <div className="wex-visual">
          <div className="wex-gif-card">
            <img
              src="/images/Bhavya Fabrics world map.png"
              alt="Bhavya Fabrics worldwide export"
              className="wex-gif"
            />

            <div className="wex-gif-overlay" />
          </div>
        </div>

      </div>
    </section>
  );
}

const styles = {
  section: {
    width: "100%",

    background: COLORS.cream,

    /*
      Vertical spacing only.

      Horizontal spacing is handled
      by the single 1400px container.
    */
    padding: "64px 0",

    boxSizing: "border-box",
  },
};
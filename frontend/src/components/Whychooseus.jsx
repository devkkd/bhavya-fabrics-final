"use client";

import { TrendingUp, Award, Scissors, Truck } from "lucide-react";

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  iconBg: "#EAF0F1",
  bodyText: "#8A8783",
};

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Factory Direct Pricing",
    desc: "Direct pricing from our 50,000 sq.ft manufacturing unit in Jaipur.",
  },
  {
    icon: Award,
    title: "Export Quality Standards",
    desc: "ISO-certified quality checks and OEKO-TEX compliant processes.",
  },
  {
    icon: Scissors,
    title: "Custom Manufacturing",
    desc: "Custom prints, dyeing, private label finishing and bespoke fabrics.",
  },
  {
    icon: Truck,
    title: "Fast Bulk Delivery",
    desc: "Pan-India delivery in 7–10 days and international export support.",
  },
];

export default function WhyChooseUs() {
  return (
    <section style={styles.section}>
      <div
        className="wcu-section-padding"
        style={styles.container}
      >
        {/* Eyebrow */}
        <div style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>
            Why Choose Us
          </span>
        </div>

        {/* Heading */}
        <h2
          className="wcu-heading"
          style={styles.heading}
        >
          Built on Craft. Backed by Scale.
        </h2>

        {/* Cards */}
        <div className="wcu-grid">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="wcu-card"
                style={styles.card}
              >
                <div
                  className="wcu-icon-wrap"
                  style={styles.iconWrap}
                >
                  <Icon
                    size={22}
                    color={COLORS.teal}
                    strokeWidth={2}
                  />
                </div>

                <h3 style={styles.cardTitle}>
                  {feature.title}
                </h3>

                <p style={styles.cardDesc}>
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        /* =====================================================
           BASE GRID
        ===================================================== */

        .wcu-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
          width: 100%;
        }

        .wcu-card {
          width: 100%;
          min-width: 0;

          position: relative;

          border: 1px solid transparent;

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease,
            background 0.3s ease;
        }

        /* =====================================================
           DESKTOP HOVER
        ===================================================== */

        @media (hover: hover) and (pointer: fine) {
          .wcu-card:hover {
            transform: translateY(-8px);

            border-color: rgba(41, 92, 101, 0.12);

            box-shadow:
              0 16px 35px rgba(41, 92, 101, 0.12);
          }

          .wcu-card:hover .wcu-icon-wrap {
            transform: translateY(-2px);
            background: #dfeaec;
          }
        }

        .wcu-icon-wrap {
          transition:
            transform 0.3s ease,
            background 0.3s ease;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1024px) {
          .wcu-section-padding {
            padding: 80px 32px !important;
          }

          .wcu-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .wcu-heading {
            font-size: 36px !important;
            line-height: 1.2 !important;
          }

          .wcu-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .wcu-card {
            padding: 22px 16px !important;
            border-radius: 13px !important;
          }

          /* Disable desktop lift effect on touch devices */
          .wcu-card:active {
            transform: scale(0.99);
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 560px) {
          .wcu-section-padding {
            padding: 56px 16px !important;
          }

          .wcu-heading {
            font-size: 29px !important;
            line-height: 1.2 !important;
            margin-bottom: 32px !important;
          }

          .wcu-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;

            width: 100% !important;
            overflow: visible !important;
          }

          .wcu-card {
            width: 100% !important;
            min-width: 0 !important;

            padding: 20px 14px !important;

            border-radius: 12px !important;

            box-shadow:
              0 1px 4px rgba(0, 0, 0, 0.04) !important;
          }

          .wcu-icon-wrap {
            width: 44px !important;
            height: 44px !important;
            margin-bottom: 18px !important;
            border-radius: 10px !important;
          }

          .wcu-card h3 {
            font-size: 18px !important;
            line-height: 1.2 !important;
          }

          .wcu-card p {
            font-size: 13px !important;
            line-height: 1.55 !important;
          }
        }

        /* =====================================================
           VERY SMALL MOBILE
        ===================================================== */

        @media (max-width: 380px) {
          .wcu-section-padding {
            padding: 48px 14px !important;
          }

          .wcu-heading {
            font-size: 27px !important;
          }

          .wcu-grid {
            gap: 10px !important;
          }

          .wcu-card {
            padding: 17px 12px !important;
          }

          .wcu-icon-wrap {
            width: 40px !important;
            height: 40px !important;
            margin-bottom: 15px !important;
          }

          .wcu-card h3 {
            font-size: 17px !important;
          }

          .wcu-card p {
            font-size: 12px !important;
            line-height: 1.5 !important;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .wcu-card,
          .wcu-icon-wrap {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}

const styles = {
  section: {
    width: "100%",
    background: COLORS.cream,
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    padding: "96px 32px",
    boxSizing: "border-box",
  },

  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },

  eyebrowLine: {
    width: 36,
    height: 1,
    background: COLORS.gold,
    display: "inline-block",
  },

  eyebrowText: {
    fontFamily: "'Poppins', sans-serif",
    color: COLORS.gold,
    fontWeight: 400,
    letterSpacing: 2,
    fontSize: 13,
    textTransform: "uppercase",
  },

  heading: {
    width: "100%",
    maxWidth: 900,
    margin: "0 auto 56px auto",
    textAlign: "center",

    fontFamily: "'Cormorant Garamond', serif",
    color: "#1B1B1B",
    fontWeight: 400,

    fontSize: 40,
    lineHeight: 1.2,
  },

  card: {
    width: "100%",
    minWidth: 0,

    background: COLORS.white,

    borderRadius: 16,

    padding: "30px 26px",

    boxSizing: "border-box",

    boxShadow:
      "0 1px 3px rgba(0,0,0,0.04)",
  },

  iconWrap: {
    width: 48,
    height: 48,

    borderRadius: 11,

    background: COLORS.iconBg,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    marginBottom: 22,
  },

  cardTitle: {
    margin: "0 0 10px 0",

    fontFamily: "'Cormorant Garamond', serif",
    color: "#1B1B1B",

    fontWeight: 400,
    fontSize: 20,

    lineHeight: 1.2,
  },

  cardDesc: {
    margin: 0,

    fontFamily: "'Poppins', sans-serif",
    color: COLORS.bodyText,

    fontWeight: 400,
    fontSize: 14,

    lineHeight: 1.6,
  },
};
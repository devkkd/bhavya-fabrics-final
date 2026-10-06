"use client";

const FACILITY_ITEMS = [
  {
    area: "a",
    label: "Printing Unit",
    src: "/images/home/facility/1.png",
  },
  {
    area: "b",
    label: "Weaving Machines",
    src: "/images/home/facility/3.png",
  },
  {
    area: "c",
    label: "Fabric Warehouse",
    src: "/images/home/facility/4.png",
  },
  {
    area: "d",
    label: "Quality Lab",
    src: "/images/home/facility/2.png",
  },
  {
    area: "e",
    label: "Export Packaging",
    src: "/images/home/facility/5.png",
  },
];

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
};

export default function OurFacility() {
  return (
    <section
      className="facility-section"
      style={styles.section}
    >
      <style>{`
        /* =========================================
           DESKTOP BASE
        ========================================= */

        .facility-wrap {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .facility-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          grid-template-rows:
            240px 240px;

          grid-template-areas:
            "a b c"
            "d b e";

          gap: 16px;

          width: 100%;
        }

        .facility-item {
          grid-area: var(--area);

          position: relative;

          width: 100%;
          height: 100%;

          overflow: hidden;

          border-radius: 14px;

          background: #e6e1da;

          cursor: pointer;
        }

        .facility-image {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;
          object-position: center;

          transition: transform 0.5s ease;
        }

        .facility-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              180deg,
              rgba(41, 92, 101, 0.03) 0%,
              rgba(41, 92, 101, 0.10) 45%,
              rgba(41, 92, 101, 0.45) 100%
            );

          opacity: 1;

          pointer-events: none;
        }

        .facility-item:hover .facility-image {
          transform: scale(1.045);
        }

        .facility-badge {
          position: absolute;

          left: 12px;
          bottom: 12px;

          z-index: 2;

          display: inline-flex;
          align-items: center;

          max-width: calc(100% - 24px);

          padding: 7px 14px;

          border-radius: 999px;

          background: rgba(41, 92, 101, 0.92);

          color: #ffffff;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 13px;
          font-weight: 600;

          line-height: 1.2;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          box-sizing: border-box;

          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 1024px) {
          .facility-section {
            padding-left: 32px !important;
            padding-right: 32px !important;
          }

          .facility-grid {
            grid-template-rows:
              210px 210px;
          }

          .facility-badge {
            font-size: 12px;
            padding: 7px 12px;
          }
        }

        /* =========================================
           SMALL TABLET
        ========================================= */

        @media (max-width: 820px) {
          .facility-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            grid-template-rows:
              190px
              190px
              190px;

            grid-template-areas:
              "a c"
              "b b"
              "d e";

            gap: 12px;
          }
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 560px) {
          .facility-section {
            padding: 42px 16px 44px 16px !important;
          }

          .facility-grid {
            display: flex;
            flex-direction: column;

            width: 100%;

            gap: 12px;
          }

          .facility-item {
            width: 100%;
            height: 180px;

            flex: none;

            border-radius: 13px;
          }

          .facility-image {
            width: 100%;
            height: 100%;

            object-fit: cover;
            object-position: center;
          }

          .facility-badge {
            left: 10px;
            bottom: 10px;

            max-width: calc(100% - 20px);

            padding: 7px 12px;

            font-size: 11.5px;
          }
        }

        /* =========================================
           SMALL MOBILE
        ========================================= */

        @media (max-width: 400px) {
          .facility-section {
            padding: 38px 14px 40px 14px !important;
          }

          .facility-grid {
            gap: 10px;
          }

          .facility-item {
            height: 165px;
            border-radius: 12px;
          }

          .facility-badge {
            left: 9px;
            bottom: 9px;

            padding: 6px 11px;

            font-size: 10.5px;
          }
        }

        /* =========================================
           TOUCH DEVICES
        ========================================= */

        @media (hover: none) {
          .facility-item:hover .facility-image {
            transform: none;
          }
        }

        /* =========================================
           REDUCED MOTION
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          .facility-image {
            transition: none;
          }
        }
      `}</style>

      <div className="facility-wrap">
        {/* Eyebrow */}
        <div
          className="facility-eyebrow"
          style={styles.eyebrow}
        >
          <span style={styles.rule} />

          <span style={styles.eyebrowText}>
            OUR FACILITY
          </span>
        </div>

        {/* Heading */}
        <h2
          className="facility-title"
          style={styles.title}
        >
          World-Class Infrastructure
        </h2>

        {/* Facility Collage */}
        <div className="facility-grid">
          {FACILITY_ITEMS.map((item) => (
            <div
              key={item.area}
              className="facility-item"
              style={{
                "--area": item.area,
              }}
              tabIndex={0}
            >
              <img
                src={item.src}
                alt={item.label}
                className="facility-image"
                loading="lazy"
              />

              <div className="facility-overlay" />

              <span className="facility-badge">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    width: "100%",

    background: COLORS.cream,

    padding: "76px 64px",

    boxSizing: "border-box",
  },

  eyebrow: {
    display: "flex",
    alignItems: "center",

    gap: 12,

    marginBottom: 22,
  },

  rule: {
    width: 28,
    height: 1,

    flexShrink: 0,

    display: "inline-block",

    background: COLORS.gold,
  },

  eyebrowText: {
    fontFamily:
      "'Poppins', Arial, Helvetica, sans-serif",

    color: COLORS.gold,

    fontWeight: 500,

    letterSpacing: 3,

    fontSize: 12,

    lineHeight: 1.2,

    textTransform: "uppercase",
  },

  title: {
    margin: "0 0 58px 0",

    fontFamily:
      "'Cormorant Garamond', Georgia, serif",

    color: "#1A1A1A",

    fontWeight: 600,

    fontSize: 40,

    lineHeight: 1.1,
  },
};
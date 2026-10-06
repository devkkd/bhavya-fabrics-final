"use client";

import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShirt,
  faChartLine,
  faGlobe,
  faBagShopping,
  faUserGroup,
  faScissors,
  faBuilding,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const INDUSTRIES = [
  {
    icon: faShirt,
    title: "Fashion Brands",
    desc: "Premium ready-to-wear collections",
  },
  {
    icon: faChartLine,
    title: "Garment Manufacturers",
    desc: "Large-scale production units",
  },
  {
    icon: faGlobe,
    title: "Export Houses",
    desc: "International sourcing partners",
  },
  {
    icon: faBagShopping,
    title: "Boutiques",
    desc: "Curated independent labels",
  },
  {
    icon: faUserGroup,
    title: "Uniform Manufacturers",
    desc: "Corporate and institutional wear",
  },
  {
    icon: faScissors,
    title: "Designers",
    desc: "Couture and concept-driven fashion",
  },
  {
    icon: faBuilding,
    title: "Retailers",
    desc: "Multi-brand fabric retail chains",
  },
];

const COLORS = {
  teal: "#295C65",
  cream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
};

export default function IndustriesWeServe() {
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  /* =========================================================
     STOP AUTO SLIDE
  ========================================================= */

  const stopAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  /* =========================================================
     START AUTO SLIDE
  ========================================================= */

  const startAutoSlide = () => {
    stopAutoSlide();

    intervalRef.current = setInterval(() => {
      const slider = sliderRef.current;

      if (!slider) return;

      if (window.innerWidth > 700) {
        return;
      }

      const card =
        slider.querySelector(".industry-card");

      if (!card) return;

      const cardWidth =
        card.getBoundingClientRect().width;

      const computed =
        window.getComputedStyle(slider);

      const gap =
        parseFloat(computed.gap) || 0;

      const step =
        cardWidth + gap;

      const maxScroll =
        slider.scrollWidth -
        slider.clientWidth;

      let nextScroll =
        slider.scrollLeft + step;

      if (nextScroll >= maxScroll - 5) {
        nextScroll = 0;
      }

      slider.scrollTo({
        left: nextScroll,
        behavior: "smooth",
      });
    }, 3000);
  };

  /* =========================================================
     PAUSE AUTO SLIDE
  ========================================================= */

  const pauseAutoSlide = () => {
    stopAutoSlide();

    if (resumeTimeoutRef.current) {
      clearTimeout(
        resumeTimeoutRef.current
      );

      resumeTimeoutRef.current = null;
    }
  };

  /* =========================================================
     RESUME AUTO SLIDE
  ========================================================= */

  const resumeAutoSlide = () => {
    pauseAutoSlide();

    if (window.innerWidth <= 700) {
      resumeTimeoutRef.current =
        setTimeout(() => {
          startAutoSlide();
        }, 2200);
    }
  };

  /* =========================================================
     POINTER DOWN
  ========================================================= */

  const handlePointerDown = () => {
    if (window.innerWidth <= 700) {
      pauseAutoSlide();
    }
  };

  /* =========================================================
     POINTER UP
  ========================================================= */

  const handlePointerUp = () => {
    if (window.innerWidth <= 700) {
      resumeAutoSlide();
    }
  };

  /* =========================================================
     EFFECT
  ========================================================= */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 700) {
        startAutoSlide();
      } else {
        stopAutoSlide();

        if (resumeTimeoutRef.current) {
          clearTimeout(
            resumeTimeoutRef.current
          );

          resumeTimeoutRef.current = null;
        }
      }
    };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      stopAutoSlide();

      if (resumeTimeoutRef.current) {
        clearTimeout(
          resumeTimeoutRef.current
        );
      }

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  return (
    <section
      className="industries-section"
      style={styles.section}
    >
      <style>{`
        /* =====================================================
           MAIN CONTAINER
           
           Desktop:
           max-width = 1400px
           left/right padding = 32px
           equal outer spacing
        ===================================================== */

        .industries-container {
          width: 100%;
          max-width: 1400px;

          margin: 0 auto;

          padding: 0 32px;

          box-sizing: border-box;
        }

        /* =====================================================
           EYEBROW
        ===================================================== */

        .industries-eyebrow {
          display: flex;
          align-items: center;

          gap: 12px;

          box-sizing: border-box;
        }

        /* =====================================================
           DESKTOP GRID
        ===================================================== */

        .industries-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(7, minmax(0, 1fr));

          gap: 16px;

          box-sizing: border-box;
        }

        /* =====================================================
           DESKTOP CARD
        ===================================================== */

        .industry-card {
          width: 100%;
          min-width: 0;

          height: 236px;

          padding: 24px 12px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: flex-start;

          background: #ffffff;

          border:
            1px solid
            rgba(41, 92, 101, 0.06);

          border-radius: 20px;

          box-sizing: border-box;

          box-shadow:
            0 2px 8px
            rgba(0, 0, 0, 0.05);

          cursor: pointer;

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        /* =====================================================
           DESKTOP HOVER
        ===================================================== */

        @media (hover: hover) and (pointer: fine) {
          .industry-card:hover {
            transform: translateY(-7px);

            border-color:
              rgba(41, 92, 101, 0.15);

            box-shadow:
              0 16px 30px
              rgba(41, 92, 101, 0.14);
          }

          .industry-card:hover
            .industry-icon-box {
            transform: translateY(-2px);

            background: #e3ebe9;
          }
        }

        /* =====================================================
           ICON
        ===================================================== */

        .industry-icon-box {
          width: 56px;
          height: 56px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 17px;

          border-radius: 14px;

          background: #edf2f1;

          transition:
            transform 0.3s ease,
            background 0.3s ease;
        }

        .industry-icon {
          width: 22px;
          height: 22px;

          color: #295c65;
        }

        /* =====================================================
           TITLE
        ===================================================== */

        .industry-title {
          width: 100%;

          margin: 0 0 8px 0;

          color: #1a1a1a;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 14px;

          font-weight: 500;

          line-height: 1.3;

          text-align: center;
        }

        /* =====================================================
           DESCRIPTION
        ===================================================== */

        .industry-desc {
          width: 100%;

          margin: 0;

          color: #696968;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;

          font-weight: 400;

          line-height: 1.45;

          text-align: center;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1100px) {
          .industries-container {
            max-width: 100%;

            padding: 0 32px;
          }

          .industries-grid {
            grid-template-columns:
              repeat(4, minmax(0, 1fr));

            gap: 16px;
          }

          .industry-card {
            height: 226px;

            padding: 22px 14px;
          }

          .industry-title {
            font-size: 15px;
          }

          .industry-desc {
            font-size: 12.5px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {
          .industries-container {
            width: 100%;

            max-width: 100%;

            margin: 0;

            padding: 0 16px;

            box-sizing: border-box;
          }

          .industries-grid {
            display: flex;

            width: calc(100% + 32px);

            margin-left: -16px;

            padding:
              0 16px 10px 16px;

            gap: 12px;

            overflow-x: auto;
            overflow-y: hidden;

            scroll-snap-type: x mandatory;

            -webkit-overflow-scrolling: touch;

            scrollbar-width: none;
            -ms-overflow-style: none;

            touch-action: pan-x;

            box-sizing: border-box;
          }

          .industries-grid::-webkit-scrollbar {
            display: none;
          }

          .industry-card {
            flex:
              0 0 168px;

            width: 168px;

            min-width: 168px;
            max-width: 168px;

            height: 208px;

            padding: 18px 12px;

            border-radius: 16px;

            scroll-snap-align: start;

            box-shadow:
              0 2px 8px
              rgba(0, 0, 0, 0.05);
          }

          .industry-card:hover {
            transform: none;

            box-shadow:
              0 2px 8px
              rgba(0, 0, 0, 0.05);
          }

          .industry-card:active {
            transform: scale(0.985);
          }

          .industry-icon-box {
            width: 48px;
            height: 48px;

            margin-bottom: 14px;

            border-radius: 12px;
          }

          .industry-icon {
            width: 18px;
            height: 18px;
          }

          .industry-title {
            font-size: 14px;

            line-height: 1.3;

            margin-bottom: 7px;
          }

          .industry-desc {
            font-size: 12px;

            line-height: 1.45;
          }
        }

        /* =====================================================
           SWIPE INDICATOR
        ===================================================== */

        .industry-swipe-indicator {
          display: none;
        }

        @media (max-width: 700px) {
          .industry-swipe-indicator {
            display: flex;

            align-items: center;
            justify-content: center;

            gap: 8px;

            margin-top: 12px;

            color: #696968;

            font-family:
              "Poppins",
              Arial,
              Helvetica,
              sans-serif;

            font-size: 11px;

            font-weight: 500;

            letter-spacing: 0.8px;

            text-transform: uppercase;

            opacity: 0.8;
          }

          .industry-swipe-arrow {
            color: #295c65;

            animation:
              industry-swipe-move
              1.4s
              ease-in-out
              infinite;
          }

          @keyframes industry-swipe-move {
            0%,
            100% {
              transform: translateX(0);
            }

            50% {
              transform: translateX(5px);
            }
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 380px) {
          .industry-card {
            flex:
              0 0 158px;

            width: 158px;

            min-width: 158px;
            max-width: 158px;

            height: 202px;

            padding: 17px 10px;
          }

          .industry-icon-box {
            width: 45px;
            height: 45px;

            margin-bottom: 13px;
          }

          .industry-title {
            font-size: 13px;
          }

          .industry-desc {
            font-size: 11.5px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .industry-card,
          .industry-icon-box,
          .industry-swipe-arrow {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          ONE MAIN CONTAINER
      ===================================================== */}

      <div className="industries-container">

        {/* =====================================================
            EYEBROW
        ===================================================== */}

        <div
          className="industries-eyebrow"
          style={{
            color: COLORS.gold,

            fontFamily:
              "'Poppins', sans-serif",

            fontWeight: 500,

            letterSpacing: 3,

            fontSize: 12,

            marginBottom: 14,

            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 28,
              height: 1,

              display: "inline-block",

              background:
                COLORS.gold,

              flexShrink: 0,
            }}
          />

          <span>
            WHO WE SERVE
          </span>
        </div>

        {/* =====================================================
            HEADING
        ===================================================== */}

        <h2
          className="industries-title"
          style={{
            textAlign: "center",

            fontFamily:
              "'Cormorant Garamond', serif",

            fontWeight: 600,

            color: "#1A1A1A",

            fontSize: 40,

            lineHeight: 1.15,

            margin: "0 0 44px 0",
          }}
        >
          Industries We Serve
        </h2>

        {/* =====================================================
            CARDS
        ===================================================== */}

        <div
          ref={sliderRef}
          className="industries-grid"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {INDUSTRIES.map((item) => (
            <div
              key={item.title}
              className="industry-card"
            >
              <div className="industry-icon-box">
                <FontAwesomeIcon
                  icon={item.icon}
                  className="industry-icon"
                />
              </div>

              <div className="industry-title">
                {item.title}
              </div>

              <div className="industry-desc">
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* =====================================================
            MOBILE SWIPE INDICATOR
        ===================================================== */}

        <div className="industry-swipe-indicator">
          <span>
            Swipe to explore
          </span>

          <FontAwesomeIcon
            icon={faArrowRight}
            className="industry-swipe-arrow"
          />
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
      Desktop:
      vertical spacing only.
      Horizontal spacing is controlled
      by the single 1400px container.
    */
    padding: "64px 0",

    boxSizing: "border-box",
  },
};
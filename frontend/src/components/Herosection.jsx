"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Poppins, Cormorant_Garamond } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
};

// 🔧 apni images yahan lagao — desktop aur mobile ke liye alag alag
const IMAGES = {
  desktop:
    "/images/hero.png",
  mobile:
    "/images/hero-mobile.png",
};

const STATS = [
  { value: 25, suffix: "+", label: "Years Experience" },
  { value: 500, suffix: "+", label: "Designs" },
  { value: 50, suffix: "+", label: "Cities Served" },
  { value: 20, suffix: "+", label: "Countries Exported" },
];

function useLoopingCounter(targets, intervalMs = 10000, durationMs = 1800) {
  const [counts, setCounts] = useState(targets.map(() => 0));

  useEffect(() => {
    let rafId;
    let intervalId;
    let cancelled = false;

    const runAnimation = () => {
      const start = performance.now();

      const step = (now) => {
        if (cancelled) return;
        const elapsed = now - start;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        setCounts(targets.map((t) => Math.floor(t * eased)));

        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          setCounts(targets.map((t) => t));
        }
      };

      rafId = requestAnimationFrame(step);
    };

    runAnimation();
    intervalId = setInterval(runAnimation, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return counts;
}

export default function HeroSection() {
  const counts = useLoopingCounter(STATS.map((s) => s.value));

  return (
   <section
  className={`${poppins.variable} ${cormorant.variable} hero-mobile-height`}
  style={styles.hero}
>
      {/* Background images — desktop/mobile alag alag, CSS media query se toggle */}
      <div
        className="hero-bg hero-bg-desktop"
        style={{ ...styles.bgLayer, backgroundImage: `url(${IMAGES.desktop})` }}
      />
      <div
        className="hero-bg hero-bg-mobile"
        style={{ ...styles.bgLayer, backgroundImage: `url(${IMAGES.mobile})` }}
      />

      {/* Overlay — screenshot jaisa hi: left dark, right natural image */}
      <div style={styles.overlay} />

      <div className="hero-content-padding" style={styles.content}>
        <div style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>
            Jaipur, Rajasthan — Est. Since Years
          </span>
        </div>

        <h1 className="hero-heading" style={styles.heading}>
          Premium Wholesale Fabrics for Global Fashion Brands
        </h1>

        <p className="hero-subtext" style={styles.subtext}>
          Manufacturer of Premium Cotton, Linen, Rayon, Mulmul, Ajrakh, Block
          Print and Designer Fabrics for Bulk Orders Worldwide.
        </p>

        <div className="hero-buttons" style={styles.buttonRow}>
          <button style={styles.primaryBtn} type="button">
            Explore Collections
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
          <button style={styles.secondaryBtn} type="button">
            Request Catalogue
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Stats bar — same width as left content (heading/subtext), full width nahi */}
        <div className="hero-stats" style={styles.statsBar}>
          {STATS.map((s, i) => (
            <div key={s.label} className="hero-stat-item" style={styles.statItem}>
              <div style={styles.statValue}>
                {counts[i]}
                {s.suffix}
              </div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sirf media queries + background-image toggle — plain static CSS, koi styled-jsx nahi (isliye refresh pe koi flicker nahi) */}
      <style>{`
        .hero-bg-mobile { display: none; }

        @media (max-width: 768px) {
          .hero-bg-desktop { display: none; }
          .hero-bg-mobile { display: block; }
        }

        @media (max-width: 1024px) {
          .hero-content-padding {
            padding: 70px 40px 32px 40px !important;
          }
          .hero-stats {
            max-width: 100% !important;
          }
        }

       @media (max-width: 768px) {
  .hero-mobile-height {
    min-height: 90vh !important;
    height: 90vh !important;
  }

  .hero-heading {
    font-size: 38px !important;
    line-height: 1.15 !important;
    margin-bottom: 18px !important;
  }

  .hero-subtext {
    font-size: 14px !important;
    line-height: 1.5 !important;
    margin-bottom: 24px !important;
  }

  .hero-content-padding {
    padding: 32px 20px 20px 20px !important;
  }

  .hero-buttons {
    flex-direction: column !important;
    align-items: stretch !important;
    width: 100% !important;
    gap: 10px !important;
    margin-bottom: 28px !important;
  }

  .hero-buttons button {
    width: 100% !important;
    justify-content: center !important;
    padding: 13px 18px !important;
    font-size: 14px !important;
    min-height: 46px !important;
  }

  .hero-stats {
    grid-template-columns: repeat(2, 1fr) !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  .hero-stat-item {
    padding: 16px 8px !important;
    border-bottom: 1px solid rgba(255,255,255,0.18) !important;
  }

  .hero-bg {
    height: 100% !important;
  }
}

      @media (max-width: 400px) {
  .hero-mobile-height {
    min-height: 90vh !important;
    height: 90vh !important;
  }

  .hero-content-padding {
    padding: 26px 18px 18px 18px !important;
  }

  .hero-heading {
    font-size: 30px !important;
    line-height: 1.12 !important;
  }

  .hero-subtext {
    font-size: 13px !important;
    line-height: 1.45 !important;
    margin-bottom: 20px !important;
  }

  .hero-buttons {
    margin-bottom: 22px !important;
  }

  .hero-buttons button {
    min-height: 44px !important;
    font-size: 13px !important;
    padding: 11px 16px !important;
  }

  .hero-stat-item {
    padding: 13px 6px !important;
  }
}
      `}</style>
    </section>
  );
}

const styles = {
 hero: {
  position: "relative",
  width: "100%",
  minHeight: "780px",
  overflow: "hidden",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "flex-start",
  backgroundColor: COLORS.teal,
},
  bgLayer: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: 0,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(100deg, rgba(20,40,44,0.90) 0%, rgba(41,92,101,0.75) 32%, rgba(41,92,101,0.38) 60%, rgba(20,40,44,0.15) 100%)",
    zIndex: 1,
  },
  content: {
    position: "relative",
    zIndex: 2,
    maxWidth: 1400,
    width: "100%",
    margin: "0 auto",
    padding: "70px 32px 40px 32px",
    boxSizing: "border-box",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  eyebrowLine: {
    width: 36,
    height: 1,
    background: COLORS.gold,
    display: "inline-block",
  },
  eyebrowText: {
    fontFamily: "var(--font-poppins), sans-serif",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 500,
    letterSpacing: 2,
    fontSize: 12,
    textTransform: "uppercase",
  },
  heading: {
    fontFamily: "var(--font-cormorant), serif",
    color: COLORS.white,
    fontWeight: 600,
    fontSize: 60,
    lineHeight: 1.12,
    margin: "0 0 28px 0",
    maxWidth: 600,
  },
  subtext: {
    fontFamily: "var(--font-poppins), sans-serif",
    color: "rgba(255,255,255,0.82)",
    fontWeight: 400,
    fontSize: 15,
    lineHeight: 1.7,
    margin: "0 0 40px 0",
    maxWidth: 580,
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 56,
    flexWrap: "wrap",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontFamily: "var(--font-poppins), sans-serif",
    fontWeight: 600,
    fontSize: 15,
    color: "#1B1B1B",
    background: COLORS.gold,
    border: "none",
    borderRadius: 999,
    padding: "16px 28px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "var(--font-poppins), sans-serif",
    fontWeight: 600,
    fontSize: 15,
    color: COLORS.white,
    background: "transparent",
    border: "1.5px solid rgba(255,255,255,0.55)",
    borderRadius: 999,
    padding: "16px 28px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    background: "rgba(41,92,101,0.55)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    borderRadius: 14,
    overflow: "hidden",
    boxSizing: "border-box",
    maxWidth: 700,
    width: "100%",
  },
  statItem: {
    padding: "26px 16px",
    textAlign: "center",
    borderRight: "1px solid rgba(255,255,255,0.18)",
    boxSizing: "border-box",
  },
  statValue: {
    fontFamily: "var(--font-cormorant), serif",
    color: COLORS.white,
    fontWeight: 700,
    fontSize: 34,
    lineHeight: 1.1,
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: "var(--font-poppins), sans-serif",
    color: "rgba(255,255,255,0.75)",
    fontWeight: 500,
    letterSpacing: 1,
    fontSize: 11,
    textTransform: "uppercase",
  },
};
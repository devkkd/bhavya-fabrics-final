"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const FALLBACK_HERO = {
  desktopImage: "/images/hero.png",
  mobileImage: "/images/hero-mobile.png",

  eyebrowText: "Jaipur, Rajasthan — Est. Since Years",

  heading: "Premium Wholesale Fabrics for Global Fashion Brands",

  subtext:
    "Manufacturer of Premium Cotton, Linen, Rayon, Mulmul, Ajrakh, Block Print and Designer Fabrics for Bulk Orders Worldwide.",

  primaryButtonText: "Explore Collections",
  secondaryButtonText: "Request Catalogue",
};

const STATS = [
  { value: 25, suffix: "+", label: "Years Experience" },
  { value: 500, suffix: "+", label: "Designs" },
  { value: 50, suffix: "+", label: "Cities Served" },
  { value: 20, suffix: "+", label: "Countries Exported" },
];

function useLoopingCounter(
  targets,
  intervalMs = 10000,
  durationMs = 1800
) {
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
        const eased = 1 - Math.pow(1 - progress, 3);

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
  const router = useRouter();

  const counts = useLoopingCounter(STATS.map((s) => s.value));

  const [heroSettings, setHeroSettings] = useState(FALLBACK_HERO);

  useEffect(() => {
    let cancelled = false;

    const loadHeroSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/hero-settings`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();
        const settings = data?.settings;

        if (!settings || cancelled) return;

        setHeroSettings({
          desktopImage:
            settings.desktopHeroImage ||
            FALLBACK_HERO.desktopImage,

          mobileImage:
            settings.mobileHeroImage ||
            FALLBACK_HERO.mobileImage,

          eyebrowText:
            settings.eyebrowText ||
            FALLBACK_HERO.eyebrowText,

          heading:
            settings.heading ||
            FALLBACK_HERO.heading,

          subtext:
            settings.subtext ||
            FALLBACK_HERO.subtext,

          primaryButtonText:
            settings.primaryButtonText ||
            FALLBACK_HERO.primaryButtonText,

          secondaryButtonText:
            settings.secondaryButtonText ||
            FALLBACK_HERO.secondaryButtonText,
        });
      } catch (error) {
        console.error(
          "Hero settings load failed:",
          error
        );
      }
    };

    loadHeroSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className={`${poppins.variable} ${cormorant.variable} hero-mobile-height`}
      style={styles.hero}
    >
      {/* Desktop background */}
      <div
        className="hero-bg hero-bg-desktop"
        style={{
          ...styles.bgLayer,
          backgroundImage: `url(${heroSettings.desktopImage})`,
        }}
      />

      {/* Mobile background */}
      <div
        className="hero-bg hero-bg-mobile"
        style={{
          ...styles.bgLayer,
          backgroundImage: `url(${heroSettings.mobileImage})`,
        }}
      />

      {/* Overlay */}
      <div style={styles.overlay} />

      <div
        className="hero-content-padding"
        style={styles.content}
      >
        <div style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />

          <span style={styles.eyebrowText}>
            {heroSettings.eyebrowText}
          </span>
        </div>

        <h1
          className="hero-heading"
          style={styles.heading}
        >
          {heroSettings.heading}
        </h1>

        <p
          className="hero-subtext"
          style={styles.subtext}
        >
          {heroSettings.subtext}
        </p>

        <div
          className="hero-buttons"
          style={styles.buttonRow}
        >
          <button
            style={styles.primaryBtn}
            type="button"
            onClick={() => router.push("/collection")}
            aria-label="Explore Collections"
          >
            {heroSettings.primaryButtonText}

            <ArrowRight
              size={18}
              strokeWidth={2.5}
            />
          </button>

          <button
            style={styles.secondaryBtn}
            type="button"
            onClick={() => router.push("/contact")}
            aria-label="Request Catalogue"
          >
            {heroSettings.secondaryButtonText}

            <ChevronRight
              size={18}
              strokeWidth={2.5}
            />
          </button>
        </div>

        <div
          className="hero-stats"
          style={styles.statsBar}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="hero-stat-item"
              style={styles.statItem}
            >
              <div style={styles.statValue}>
                {counts[i]}
                {s.suffix}
              </div>

              <div style={styles.statLabel}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hero-buttons button {
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease,
            color 0.25s ease,
            border-color 0.25s ease;
          will-change: transform;
        }

        .hero-buttons button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.16);
        }

        .hero-buttons button:active {
          transform: translateY(0) scale(0.98);
        }

        .hero-bg-mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .hero-bg-desktop {
            display: none;
          }

          .hero-bg-mobile {
            display: block;
          }
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
            border-bottom:
              1px solid rgba(255,255,255,0.18) !important;
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
    fontFamily:
      "var(--font-poppins), sans-serif",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 500,
    letterSpacing: 2,
    fontSize: 12,
    textTransform: "uppercase",
  },

  heading: {
    fontFamily:
      "var(--font-cormorant), serif",
    color: COLORS.white,
    fontWeight: 600,
    fontSize: 60,
    lineHeight: 1.12,
    margin: "0 0 28px 0",
    maxWidth: 600,
  },

  subtext: {
    fontFamily:
      "var(--font-poppins), sans-serif",
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
    fontFamily:
      "var(--font-poppins), sans-serif",
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
    fontFamily:
      "var(--font-poppins), sans-serif",
    fontWeight: 600,
    fontSize: 15,
    color: COLORS.white,
    background: "transparent",
    border:
      "1.5px solid rgba(255,255,255,0.55)",
    borderRadius: 999,
    padding: "16px 28px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  statsBar: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    background:
      "rgba(41,92,101,0.55)",
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
    borderRight:
      "1px solid rgba(255,255,255,0.18)",
    boxSizing: "border-box",
  },

  statValue: {
    fontFamily:
      "var(--font-cormorant), serif",
    color: COLORS.white,
    fontWeight: 700,
    fontSize: 34,
    lineHeight: 1.1,
    marginBottom: 8,
  },

  statLabel: {
    fontFamily:
      "var(--font-poppins), sans-serif",
    color: "rgba(255,255,255,0.75)",
    fontWeight: 500,
    letterSpacing: 1,
    fontSize: 11,
    textTransform: "uppercase",
  },
};
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Poppins, Cormorant_Garamond } from "next/font/google";

import { categories as fallbackCategories } from "@/app/data/product";

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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

const COLORS = {
  teal: "#295C65",
  cream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
};

const FALLBACK_IMAGES = {
  cotton: "/images/home/1.png",
  silk: "/images/home/2.png",
  printed: "/images/home/3.png",
  embroidered: "/images/home/4.png",
  linen: "/images/home/5.png",
  rayon: "/images/home/6.png",
  mulmul: "/images/home/7.png",
  cambric: "/images/home/8.png",
  voile: "/images/home/9.png",
  muslin: "/images/home/10.png",
};

function normalizeCategory(item) {
  const name =
    item?.name ||
    item?.label ||
    item?.title ||
    "Untitled Collection";

  const slug =
    item?.slug ||
    item?.id ||
    String(name).trim().toLowerCase().replace(/\s+/g, "-");

  const imageUrl =
    item?.homeImage?.url ||
    item?.homeImage ||
    item?.image?.url ||
    item?.image ||
    item?.imageUrl ||
    item?.heroImage?.url ||
    item?.heroImage ||
    FALLBACK_IMAGES[String(slug).toLowerCase()] ||
    "/images/home/1.png";

  return {
    id: String(slug),
    slug: String(slug),
    name: String(name),
    image: imageUrl,
    description: item?.description || "",
  };
}

export default function FabricCollections() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const response = await fetch(
          `${API_URL}/categories?all=true&home=true`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const payload = await response.json();
        const list = Array.isArray(payload?.categories)
          ? payload.categories
          : Array.isArray(payload?.data?.categories)
          ? payload.data.categories
          : [];

        const normalized =
          list.length > 0
            ? list.map(normalizeCategory)
            : fallbackCategories.map(normalizeCategory);

        if (isMounted) {
          setItems(normalized);
        }
      } catch (error) {
        if (isMounted) {
          setItems(
            fallbackCategories.map(normalizeCategory)
          );
        }
      }
    }

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const cards = useMemo(() => {
    if (items.length > 0) return items;
    return fallbackCategories.map(normalizeCategory);
  }, [items]);

  return (
    <section
      className={`${poppins.variable} ${cormorant.variable}`}
      style={styles.section}
    >
      <div className="fc-container" style={styles.container}>
        <div className="fc-header-row" style={styles.headerRow}>
          <div>
            <div style={styles.eyebrow}>
              <span style={styles.eyebrowLine} />
              <span style={styles.eyebrowText}>Our Range</span>
            </div>
            <h2 className="fc-heading" style={styles.heading}>
              Fabric Collections
            </h2>
          </div>

          <Link
            href="/collection"
            className="fc-view-all"
            style={styles.viewAllLink}
          >
            View All Collections
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="fc-grid" style={styles.grid}>
          {cards.map((item) => (
            <Link
              key={item.slug}
              href={`/collection/${item.slug}`}
              className="fc-card"
              style={styles.card}
            >
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                style={styles.cardImg}
              />
              <div className="fc-overlay" style={styles.overlay} />
              <div className="fc-info" style={styles.info}>
                <span style={styles.tag}>
                  {item.name}
                </span>
                <h3 style={styles.cardTitle}>{item.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .fc-card {
          cursor: pointer;
          text-decoration: none;
        }
        .fc-card .fc-overlay {
          opacity: 1;
          transition: none;
        }

        .fc-card .fc-info {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.35s ease, transform 0.35s ease;
        }

        .fc-card img {
          transition: transform 0.5s ease;
        }

        @media (hover: hover) {
          .fc-card:hover .fc-overlay {
            opacity: 1;
          }
          .fc-card:hover .fc-info {
            opacity: 1;
            transform: translateY(0);
          }
          .fc-card:hover img {
            transform: scale(1.06);
          }
        }

        @media (hover: none) {
          .fc-card .fc-overlay {
            opacity: 0.85;
          }
          .fc-card .fc-info {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          .fc-container {
            padding: 72px 32px !important;
          }
          .fc-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .fc-heading {
            font-size: 38px !important;
          }
          .fc-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
        }

        @media (max-width: 560px) {
          .fc-container {
            padding: 48px 20px !important;
          }
          .fc-heading {
            font-size: 30px !important;
          }
          .fc-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}

const styles = {
  section: {
    background: COLORS.cream,
    width: "100%",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: 1400,
    width: "100%",
    margin: "0 auto",
    padding: "96px 32px",
    boxSizing: "border-box",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 48,
    gap: 24,
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  eyebrowLine: {
    width: 36,
    height: 1,
    background: COLORS.gold,
    display: "inline-block",
  },
  eyebrowText: {
    fontFamily: "var(--font-poppins), sans-serif",
    color: COLORS.gold,
    fontWeight: 500,
    letterSpacing: 2,
    fontSize: 12,
    textTransform: "uppercase",
  },
  heading: {
    fontFamily: "var(--font-cormorant), serif",
    color: "#1B1B1B",
    fontWeight: 600,
    fontSize: 40,
    lineHeight: 1.1,
    margin: 0,
  },
  viewAllLink: {
    fontFamily: "var(--font-poppins), sans-serif",
    color: COLORS.teal,
    fontWeight: 500,
    fontSize: 14,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 20,
    width: "100%",
  },
  card: {
    position: "relative",
    width: "100%",
    aspectRatio: "3 / 4",
    borderRadius: 16,
    overflow: "hidden",
    boxSizing: "border-box",
    background: COLORS.navGray,
  },
  cardImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
 overlay: {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(41,92,101,0.05) 0%, rgba(41,92,101,0.20) 45%, rgba(41,92,101,0.92) 100%)",
},
  info: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "18px 16px",
    boxSizing: "border-box",
  },
  tag: {
    display: "block",
    fontFamily: "var(--font-poppins), sans-serif",
    color: COLORS.gold,
    fontWeight: 600,
    letterSpacing: 1,
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: "var(--font-cormorant), serif",
    color: COLORS.white,
    fontWeight: 700,
    fontSize: 22,
    margin: 0,
  },
  desc: {
    fontFamily: "var(--font-poppins), sans-serif",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 400,
    fontSize: 12.5,
    lineHeight: 1.6,
    margin: 0,
  },
};
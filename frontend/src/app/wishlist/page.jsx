"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Zap,
} from "lucide-react";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const PAGE_SIZE = 8;

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  darkCream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  ink: "#1A1A1A",
};

export default function WishlistPage() {
  const {
    items: wishlistItems,
    itemCount,
    loading: wishlistLoading,
    toggleSave,
  } = useWishlist();

  const { addToCart } = useCart();

  const [cartStates, setCartStates] = useState({});
  const [buyingId, setBuyingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(itemCount / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleProducts = wishlistItems.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = async (productId) => {
    if (
      cartStates[productId] === "loading" ||
      cartStates[productId] === "added"
    ) {
      return;
    }

    setCartStates((c) => ({
      ...c,
      [productId]: "loading",
    }));

    const result = await addToCart(String(productId), 1);

    if (result?.loginRequired) {
      setCartStates((c) => ({
        ...c,
        [productId]: "idle",
      }));
      return;
    }

    if (result?.success) {
      setCartStates((c) => ({
        ...c,
        [productId]: "added",
      }));
      window.setTimeout(() => {
        setCartStates((c) => ({
          ...c,
          [productId]: "idle",
        }));
      }, 1800);
    } else {
      setCartStates((c) => ({
        ...c,
        [productId]: "idle",
      }));
    }
  };

  /* =====================================================
     BUY NOW
  ===================================================== */

  const handleBuyNow = (slug) => {
    if (buyingId) return;
    setBuyingId(slug);
    window.setTimeout(() => {
      if (slug) {
        window.location.href = `/products/${slug}`;
      }
    }, 450);
  };

  /* =====================================================
     PAGE CHANGE
  ===================================================== */

  const changePage = (page) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="wishlist-page">
      <style>{`
        /* =================================================
           PAGE
        ================================================= */

        .wishlist-page {
          width: 100%;
          min-height: 100vh;
          background: ${COLORS.cream};
          color: ${COLORS.ink};
          padding: 42px 0 64px;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        /* =================================================
           CONTAINER
        ================================================= */

        .wishlist-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          box-sizing: border-box;
        }

        /* =================================================
           HEADER
        ================================================= */

        .wishlist-header {
          width: 100%;
          text-align: center;
          margin-bottom: 34px;
        }

        .wishlist-eyebrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: ${COLORS.gold};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .wishlist-title {
          margin: 0;
          color: ${COLORS.teal};
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 40px;
          font-weight: 500;
          line-height: 1;
        }

        .wishlist-line {
          width: 80px;
          height: 1px;
          background: ${COLORS.gold};
          margin: 14px auto 13px;
          position: relative;
        }

        .wishlist-line::before {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${COLORS.gold};
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .wishlist-subtitle {
          margin: 0 auto;
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 13px;
          line-height: 1.55;
        }

        /* =================================================
           COUNT
        ================================================= */

        .wishlist-top-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 20px;
        }

        .wishlist-count {
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 11px;
        }

        /* =================================================
           GRID
        ================================================= */

        .wishlist-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        /* =================================================
           CARD
        ================================================= */

        .wishlist-card {
          position: relative;
          width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: ${COLORS.white};
          border: 1px solid #E8E0D7;
          border-radius: 11px;
          overflow: hidden;
          box-sizing: border-box;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .wishlist-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(41, 92, 101, 0.09);
        }

        /* =================================================
           IMAGE
        ================================================= */

        .wishlist-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: ${COLORS.darkCream};
        }

        .wishlist-image-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .wishlist-image-link img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          transition: transform 0.45s ease;
        }

        .wishlist-card:hover .wishlist-image-link img {
          transform: scale(1.035);
        }

        /* =================================================
           SAVE BUTTON
        ================================================= */

        .wishlist-heart {
          position: absolute;
          top: 9px;
          left: 9px;
          z-index: 6;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.96);
          color: ${COLORS.teal};
          cursor: pointer;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .wishlist-heart:hover {
          transform: scale(1.07);
          background: ${COLORS.teal};
          color: ${COLORS.white};
          border-color: ${COLORS.teal};
        }

        /* =================================================
           PRICE
        ================================================= */

        .wishlist-price {
          position: absolute;
          top: 9px;
          right: 9px;
          z-index: 5;
          min-height: 31px;
          padding: 0 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: ${COLORS.teal};
          color: #FFFFFF;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        /* =================================================
           CARD BODY
        ================================================= */

        .wishlist-card-body {
          width: 100%;
          height: 235px;
          min-height: 235px;
          display: flex;
          flex-direction: column;
          padding: 13px 13px 14px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .wishlist-name {
          width: 100%;
          margin: 0 0 11px;
          color: ${COLORS.ink};
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 19px;
          font-weight: 600;
          line-height: 1.08;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wishlist-name:hover {
          color: ${COLORS.teal};
        }

        /* =================================================
           SPECS
        ================================================= */

        .wishlist-specs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 15px;
          padding-bottom: 11px;
          border-bottom: 1px solid #EEE8E1;
        }

        .wishlist-spec {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .wishlist-spec-label {
          color: ${COLORS.gold};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .wishlist-spec-value {
          color: #283438;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10.5px;
          font-weight: 500;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =================================================
           COLORS
        ================================================= */

        .wishlist-colors {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 11px 0 12px;
        }

        .wishlist-colors-label {
          color: ${COLORS.gold};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 1px;
          flex-shrink: 0;
        }

        .wishlist-swatches {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
          min-width: 0;
        }

        .wishlist-swatch {
          width: 15px;
          height: 15px;
          border: 1px solid rgba(0, 0, 0, 0.13);
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* =================================================
           BUTTONS
        ================================================= */

        .wishlist-actions {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          margin-top: auto;
        }

        .wishlist-action {
          width: 100%;
          height: 39px;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0 7px;
          border-radius: 999px;
          box-sizing: border-box;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 9px;
          font-weight: 600;
          line-height: 1;
          white-space: nowrap;
          cursor: pointer;
        }

        .wishlist-buy {
          border: 1px solid ${COLORS.teal};
          background: ${COLORS.teal};
          color: #FFFFFF;
          transition: background 0.2s ease;
        }

        .wishlist-buy:hover {
          background: #214D55;
        }

        .wishlist-cart {
          border: 1px solid ${COLORS.teal};
          background: #FFFFFF;
          color: ${COLORS.teal};
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .wishlist-cart:hover {
          background: ${COLORS.teal};
          color: #FFFFFF;
        }

        .wishlist-cart.is-added {
          background: ${COLORS.gold};
          color: #FFFFFF;
          border-color: ${COLORS.gold};
        }

        /* =================================================
           BUTTON ANIMATION
        ================================================= */

        .wishlist-button-stage {
          position: relative;
          width: 100%;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .wishlist-button-state {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          animation: wishlistButtonEnter 0.42s cubic-bezier(0.2, 0.8, 0.25, 1) both;
        }

        @keyframes wishlistButtonEnter {
          0% {
            opacity: 0;
            transform: translateY(-120%);
          }
          55% {
            opacity: 1;
            transform: translateY(7%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =================================================
           EMPTY STATE
        ================================================= */

        .wishlist-empty {
          width: 100%;
          min-height: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: ${COLORS.darkCream};
          border: 1px solid #E4DCD4;
          border-radius: 14px;
          box-sizing: border-box;
          padding: 40px;
        }

        .wishlist-empty-icon {
          width: 66px;
          height: 66px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          border-radius: 50%;
          background: #EDE7DF;
          color: ${COLORS.teal};
        }

        .wishlist-empty-title {
          margin: 0 0 8px;
          color: ${COLORS.teal};
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 30px;
          font-weight: 600;
        }

        .wishlist-empty-text {
          max-width: 420px;
          margin: 0 0 20px;
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 12px;
          line-height: 1.6;
        }

        .wishlist-empty-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 40px;
          padding: 0 18px;
          border-radius: 999px;
          background: ${COLORS.teal};
          color: #FFFFFF;
          text-decoration: none;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10px;
          font-weight: 600;
        }

        /* =================================================
           PAGINATION
        ================================================= */

        .wishlist-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
        }

        .wishlist-page-button {
          width: 37px;
          height: 37px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid #E4DDD5;
          border-radius: 50%;
          background: #FFFFFF;
          color: ${COLORS.teal};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10px;
          cursor: pointer;
        }

        .wishlist-page-button.active {
          background: ${COLORS.teal};
          color: #FFFFFF;
          border-color: ${COLORS.teal};
        }

        .wishlist-page-button:hover {
          border-color: ${COLORS.teal};
        }

        .wishlist-page-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1100px) {
          .wishlist-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .wishlist-title {
            font-size: 50px;
          }
        }

        @media (max-width: 800px) {
          .wishlist-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .wishlist-card-body {
            height: 225px;
            min-height: 225px;
          }
        }

        @media (max-width: 600px) {
          .wishlist-page {
            padding: 30px 0 42px;
          }
          .wishlist-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0 16px;
          }
          .wishlist-header {
            margin-bottom: 25px;
          }
          .wishlist-eyebrow {
            font-size: 8px;
            letter-spacing: 2.5px;
            margin-bottom: 6px;
          }
          .wishlist-title {
            font-size: 34px;
          }
          .wishlist-line {
            width: 58px;
            margin: 10px auto 10px;
          }
          .wishlist-subtitle {
            font-size: 9px;
            line-height: 1.5;
          }
          .wishlist-count {
            font-size: 8px;
          }
          .wishlist-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }
          .wishlist-card {
            border-radius: 9px;
          }
          .wishlist-image-wrap {
            aspect-ratio: 3 / 4;
          }
          .wishlist-heart {
            top: 7px;
            left: 7px;
            width: 27px;
            height: 27px;
          }
          .wishlist-price {
            top: 7px;
            right: 7px;
            min-height: 26px;
            padding: 0 8px;
            font-size: 8px;
          }
          .wishlist-card-body {
            height: 200px;
            min-height: 200px;
            padding: 8px;
          }
          .wishlist-name {
            margin: 0 0 7px;
            font-size: 14px;
          }
          .wishlist-specs {
            column-gap: 7px;
            row-gap: 6px;
            padding-bottom: 7px;
          }
          .wishlist-spec-label {
            font-size: 6px;
          }
          .wishlist-spec-value {
            font-size: 7.5px;
          }
          .wishlist-colors {
            gap: 4px;
            margin: 7px 0 8px;
          }
          .wishlist-swatch {
            width: 10px;
            height: 10px;
          }
          .wishlist-actions {
            gap: 5px;
          }
          .wishlist-action {
            height: 31px;
            font-size: 7px;
          }
          .wishlist-button-stage {
            height: 15px;
          }
          .wishlist-pagination {
            margin-top: 23px;
            gap: 6px;
          }
          .wishlist-page-button {
            width: 30px;
            height: 30px;
            font-size: 8px;
          }
        }

        @media (max-width: 380px) {
          .wishlist-page {
            padding: 26px 0 38px;
          }
          .wishlist-title {
            font-size: 31px;
          }
          .wishlist-grid {
            gap: 8px;
          }
          .wishlist-card-body {
            height: 190px;
            min-height: 190px;
          }
        }
      `}</style>

      <div className="wishlist-container">
        {/* HEADER */}
        <header className="wishlist-header">
          <div className="wishlist-eyebrow">
            <span>SAVED PRODUCTS</span>
          </div>
          <h1 className="wishlist-title">My Wishlist</h1>
          <div className="wishlist-line" />
          <p className="wishlist-subtitle">
            Your favorite fabrics in one place. Organize and shop your saved items.
          </p>
        </header>

        {/* COUNT */}
        <div className="wishlist-top-row">
          {wishlistLoading ? (
            <div className="wishlist-count">Loading...</div>
          ) : (
            <div className="wishlist-count">
              {itemCount} {itemCount === 1 ? "Product" : "Products"}
            </div>
          )}
        </div>

        {/* LOADING */}
        {wishlistLoading ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-title">Loading...</div>
          </div>
        ) : itemCount === 0 ? (
          /* EMPTY STATE */
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <Heart size={32} />
            </div>
            <h2 className="wishlist-empty-title">No Saved Items</h2>
            <p className="wishlist-empty-text">
              Your wishlist is empty. Browse our collection and save your favorite fabrics to get started.
            </p>
            <Link href="/newArrivals" className="wishlist-empty-button">
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* PRODUCTS */
          <>
            <div className="wishlist-grid">
              {visibleProducts.map((item) => {
                const cartState = cartStates[item.productId] || "idle";

                return (
                  <article key={item._id} className="wishlist-card">
                    {/* IMAGE */}
                    <div className="wishlist-image-wrap">
                      <Link
                        href={`/products/${item.slug}`}
                        className="wishlist-image-link"
                      >
                        <img
                          src={item.imageUrl || "/images/home/products/1.png"}
                          alt={item.title}
                          loading="lazy"
                          draggable="false"
                        />
                      </Link>

                      {/* SAVE BUTTON */}
                      <button
                        type="button"
                        className="wishlist-heart"
                        onClick={() => toggleSave(item.productId)}
                        aria-label={`Remove ${item.title} from wishlist`}
                      >
                        <Heart size={15} strokeWidth={2} fill="currentColor" />
                      </button>

                      {/* PRICE */}
                      <span className="wishlist-price">
                        ₹{Number(item.regularPrice || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* BODY */}
                    <div className="wishlist-card-body">
                      {/* NAME */}
                      <Link
                        href={`/products/${item.slug}`}
                        className="wishlist-name"
                      >
                        {item.title}
                      </Link>

                      {/* SPECS */}
                      <div className="wishlist-specs">
                        <div className="wishlist-spec">
                          <span className="wishlist-spec-label">GSM</span>
                          <span className="wishlist-spec-value">—</span>
                        </div>
                        <div className="wishlist-spec">
                          <span className="wishlist-spec-label">WIDTH</span>
                          <span className="wishlist-spec-value">—</span>
                        </div>
                        <div className="wishlist-spec">
                          <span className="wishlist-spec-label">MATERIAL</span>
                          <span className="wishlist-spec-value">—</span>
                        </div>
                        <div className="wishlist-spec">
                          <span className="wishlist-spec-label">MOQ</span>
                          <span className="wishlist-spec-value">—</span>
                        </div>
                      </div>

                      {/* COLORS */}
                      <div className="wishlist-colors">
                        <span className="wishlist-colors-label">COLORS</span>
                        <div className="wishlist-swatches">
                          {[
                            "#ffffff",
                            "#e0e0e0",
                            "#d4a574",
                            "#8b7355",
                          ].map((color, idx) => (
                            <span
                              key={idx}
                              className="wishlist-swatch"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="wishlist-actions">
                        <button
                          type="button"
                          className={`wishlist-action wishlist-cart ${
                            cartState === "added" ? "is-added" : ""
                          }`}
                          onClick={() => handleAddToCart(item.productId)}
                          disabled={cartState === "loading"}
                        >
                          <span className="wishlist-button-stage">
                            {cartState === "added" ? (
                              <span
                                key="added"
                                className="wishlist-button-state"
                              >
                                <Check size={12} strokeWidth={2.8} />
                                <span>Added</span>
                              </span>
                            ) : cartState === "loading" ? (
                              <span
                                key="loading"
                                className="wishlist-button-state"
                              >
                                <ShoppingCart size={12} strokeWidth={2} />
                              </span>
                            ) : (
                              <span key="idle" className="wishlist-button-state">
                                <ShoppingCart size={12} strokeWidth={2} />
                                <span>Add to Cart</span>
                              </span>
                            )}
                          </span>
                        </button>

                        <Link
                          href={`/products/${item.slug}`}
                          className="wishlist-action wishlist-buy"
                        >
                          <Zap size={12} />
                          <span>Request Quote</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="wishlist-pagination">
                <button
                  type="button"
                  className="wishlist-page-button"
                  disabled={safePage === 1}
                  onClick={() => changePage(safePage - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      className={`wishlist-page-button ${
                        page === safePage ? "active" : ""
                      }`}
                      onClick={() => changePage(page)}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="wishlist-page-button"
                  disabled={safePage === totalPages}
                  onClick={() => changePage(safePage + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  darkCream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  ink: "#1A1A1A",
};

export default function CartPage() {
  const {
    items,
    itemCount,
    loading,
    isLoggedIn,
    updateQuantity: ctxUpdateQty,
    removeItem: ctxRemove,
  } = useCart();

  const [buyNowLoading, setBuyNowLoading] =
    useState(false);

  /* ── resolved cart from server items ── */

  const resolvedCart = useMemo(() => {
    return items.map((item) => {
      const snapshot = item?.snapshot || {};

      /*
       * Variant-specific images are stored inside
       * snapshot.images by the cart API.
       *
       * Keep backward compatibility with older
       * cart items that only have imageUrl/images.
       */

      const snapshotImages = Array.isArray(
        snapshot?.images
      )
        ? snapshot.images
            .map((image) =>
              typeof image === "string"
                ? image
                : image?.url
            )
            .filter(Boolean)
        : [];

      const itemImages = Array.isArray(
        item?.images
      )
        ? item.images
            .map((image) =>
              typeof image === "string"
                ? image
                : image?.url
            )
            .filter(Boolean)
        : [];

      const images =
        snapshotImages.length > 0
          ? snapshotImages
          : itemImages.length > 0
          ? itemImages
          : item?.imageUrl
          ? [item.imageUrl]
          : ["/images/home/products/1.png"];

      /*
       * For a variant product, use the variant
       * price saved in the snapshot.
       */

      const variantRegularPrice = Number(
        snapshot?.variantRegularPrice
      );

      const variantSalePrice = Number(
        snapshot?.variantSalePrice
      );

      const regularPrice =
        Number.isFinite(
          variantRegularPrice
        ) &&
        variantRegularPrice > 0
          ? variantRegularPrice
          : Number(
              item?.regularPrice ||
                snapshot?.regularPrice ||
                0
            );

      const salePrice =
        Number.isFinite(
          variantSalePrice
        ) &&
        variantSalePrice > 0
          ? variantSalePrice
          : Number(
              item?.salePrice ??
                snapshot?.salePrice
            );

      const hasSale =
        Number.isFinite(salePrice) &&
        salePrice > 0 &&
        regularPrice > 0 &&
        salePrice < regularPrice;

      /*
       * Cart route stores selectedColor /
       * selectedSize as nested objects.
       *
       * These helpers also support older string values.
       */

      const selectedColor =
        item?.selectedColor ||
        snapshot?.selectedColor ||
        null;

      const selectedSize =
        item?.selectedSize ||
        snapshot?.selectedSize ||
        null;

      const colorName =
        typeof selectedColor === "string"
          ? selectedColor
          : selectedColor?.name ||
            selectedColor?.value ||
            "";

      const colorHex =
        typeof selectedColor === "object"
          ? selectedColor?.hex || ""
          : "";

      const sizeName =
        typeof selectedSize === "string"
          ? selectedSize
          : selectedSize?.name ||
            selectedSize?.value ||
            "";

      const sku =
        item?.sku ||
        snapshot?.sku ||
        "";

      return {
        _id: item?._id,

        productId: item?.productId,

        variantId:
          item?.variantId || null,

        sku,

        name:
          item?.title ||
          snapshot?.title ||
          "Product",

        slug:
          item?.slug ||
          snapshot?.slug ||
          "",

        images,

        price:
          hasSale
            ? salePrice
            : regularPrice,

        regularPrice,

        salePrice:
          hasSale
            ? salePrice
            : null,

        variantRegularPrice:
          Number.isFinite(
            variantRegularPrice
          )
            ? variantRegularPrice
            : null,

        variantSalePrice:
          Number.isFinite(
            variantSalePrice
          )
            ? variantSalePrice
            : null,

        selectedColor,

        selectedSize,

        colorName,

        colorHex,

        sizeName,

        cartQuantity:
          Number(
            item?.quantity || 1
          ),
      };
    });
  }, [items]);

  const totalItems = itemCount;

  const subtotal = useMemo(() => {
    return resolvedCart.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.cartQuantity,
      0
    );
  }, [resolvedCart]);

  const shipping = 0;

  const total =
    subtotal + shipping;

  /* ── quantity update ── */

  const updateQuantity = (
    itemId,
    change
  ) => {
    const item =
      resolvedCart.find(
        (i) =>
          i._id?.toString() ===
          itemId?.toString()
      );

    if (!item) return;

    const newQty = Math.max(
      1,
      item.cartQuantity +
        change
    );

    ctxUpdateQty(
      itemId,
      newQty
    );
  };

  const removeItem = (
    itemId
  ) => {
    ctxRemove(itemId);
  };

  const handleBuyNow = () => {
    if (
      buyNowLoading ||
      resolvedCart.length === 0
    ) {
      return;
    }

    setBuyNowLoading(true);

    if (
      typeof window !==
      "undefined"
    ) {
      window.location.href =
        "/checkout";
    }
  };

  return (
    <main className="cart-page">
      <style>{`

        /* =================================================
           PAGE
        ================================================= */

        .cart-page {
          width: 100%;
          min-height: 100vh;
          background: ${COLORS.cream};
          color: ${COLORS.ink};
          padding: 42px 0 70px;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        /* =================================================
           MAIN CONTAINER
        ================================================= */

        .cart-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          box-sizing: border-box;
        }

        /* =================================================
           PAGE HEADER
        ================================================= */

        .cart-header {
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
        }

        .cart-heading-wrap {
          min-width: 0;
        }

        .cart-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 10px;
          color: ${COLORS.gold};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .cart-eyebrow-line {
          width: 28px;
          height: 1px;
          background: ${COLORS.gold};
          display: inline-block;
        }

        .cart-title {
          margin: 0;
          color: ${COLORS.teal};
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 40px;
          font-weight: 500;
          line-height: .95;
        }

        .cart-count {
          flex-shrink: 0;
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 13px;
        }

        /* =================================================
           CONTENT LAYOUT
        ================================================= */

        .cart-layout {
          width: 100%;
          display: grid;
          grid-template-columns:
            minmax(0, 2fr)
            minmax(350px, .9fr);
          gap: 26px;
          align-items: start;
        }

        /* =================================================
           CART ITEMS BOX
        ================================================= */

        .cart-items-box {
          width: 100%;
          background: ${COLORS.white};
          border: 1px solid #E7E0D8;
          border-radius: 13px;
          padding: 20px 30px;
          box-sizing: border-box;
        }

        .cart-item {
          width: 100%;
          display: grid;
          grid-template-columns:
            180px
            minmax(0,1fr)
            150px
            30px;
          align-items: center;
          gap: 28px;
          padding: 18px 0;
        }

        .cart-item + .cart-item {
          border-top: 1px solid #ECE6DF;
        }

        /* =================================================
           ITEM IMAGE
        ================================================= */

        .cart-item-image {
          width: 180px;
          height: 165px;
          overflow: hidden;
          border-radius: 9px;
          background: ${COLORS.darkCream};
        }

        .cart-item-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        /* =================================================
           ITEM INFO
        ================================================= */

        .cart-item-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 7px;
        }

        .cart-item-name {
          margin: 0;
          color: #173C46;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 20px;
          font-weight: 500;
          line-height: 1.05;
        }

        .cart-item-meta {
          color: #696968;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 13px;
          line-height: 1.5;
        }

        /* =================================================
           VARIANT DETAILS
        ================================================= */

        .cart-item-variant-details {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
          margin-top: 3px;
          color: #696968;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 11px;
          line-height: 1.4;
        }

        .cart-item-variant-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-height: 24px;
          padding: 3px 8px;
          border: 1px solid #E7E0D8;
          border-radius: 999px;
          background: #FAF8F5;
          color: #4F4F4E;
          white-space: nowrap;
        }

        .cart-item-color-dot {
          width: 12px;
          height: 12px;
          flex: 0 0 12px;
          border: 1px solid rgba(0, 0, 0, .12);
          border-radius: 50%;
        }

        .cart-item-sku {
          color: #8A857E;
          font-size: 10px;
        }

        .cart-item-variant-image-note {
          color: #8A857E;
          font-size: 10px;
        }

        .cart-item-price {
          margin-top: 6px;
          color: #16343D;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 18px;
          font-weight: 600;
        }

        /* =================================================
           QUANTITY
        ================================================= */

        .cart-quantity {
          width: 150px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #DED7CF;
          border-radius: 999px;
          background: #FFFFFF;
          box-sizing: border-box;
          overflow: hidden;
        }

        .cart-quantity button {
          width: 48px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #295C65;
          cursor: pointer;
        }

        .cart-quantity button:hover {
          background: #F5EFE8;
        }

        .cart-quantity-value {
          min-width: 35px;
          text-align: center;
          color: #1E3137;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 14px;
          font-weight: 500;
        }

        /* =================================================
           REMOVE
        ================================================= */

        .cart-remove {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: none;
          background: transparent;
          color: #696968;
          cursor: pointer;
          border-radius: 50%;
        }

        .cart-remove:hover {
          background: #F2EEE9;
          color: #295C65;
        }

        /* =================================================
           SUMMARY
        ================================================= */

        .cart-summary {
          position: sticky;
          top: 24px;
          width: 100%;
          background: ${COLORS.white};
          border: 1px solid #E7E0D8;
          border-radius: 13px;
          padding: 34px;
          box-sizing: border-box;
        }

        .cart-summary-title {
          margin: 0 0 26px;
          color: #173C46;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 30px;
          font-weight: 600;
          line-height: 1;
        }

        .cart-summary-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          color: #696968;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 20px;
        }

        .cart-summary-row strong {
          color: #263A40;
          font-weight: 500;
        }

        .cart-summary-line {
          width: 100%;
          height: 1px;
          background: #E9E1D8;
          margin: 6px 0 24px;
        }

        .cart-total-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 30px;
        }

        .cart-total-label {
          color: #173C46;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 22px;
          font-weight: 600;
        }

        .cart-total {
          color: #173C46;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 22px;
          font-weight: 600;
        }

        /* =================================================
           SUMMARY BUTTON
        ================================================= */

        .cart-summary-button {
          position: relative;
          width: 100%;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid ${COLORS.teal};
          border-radius: 999px;
          background: ${COLORS.teal};
          color: #FFFFFF;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          overflow: hidden;
          box-sizing: border-box;
        }

        .cart-summary-button:hover {
          background: #214D55;
        }

        .cart-summary-button:disabled {
          opacity: .7;
          cursor: not-allowed;
        }

        .cart-button-stage {
          position: relative;
          width: 100%;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .cart-button-state {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          animation:
            cartButtonEnter
            .42s
            cubic-bezier(.2,.8,.25,1)
            both;
        }

        @keyframes cartButtonEnter {
          0% {
            opacity: 0;
            transform: translateY(-120%);
          }

          55% {
            opacity: 1;
            transform: translateY(8%);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =================================================
           EMPTY
        ================================================= */

        .cart-empty {
          min-height: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: ${COLORS.white};
          border: 1px solid #E7E0D8;
          border-radius: 13px;
          padding: 40px;
          box-sizing: border-box;
        }

        .cart-empty-icon {
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: ${COLORS.darkCream};
          color: ${COLORS.teal};
          margin-bottom: 18px;
        }

        .cart-empty h2 {
          margin: 0 0 9px;
          color: ${COLORS.teal};
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 34px;
          font-weight: 600;
        }

        .cart-empty p {
          max-width: 430px;
          margin: 0 0 23px;
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 12px;
          line-height: 1.6;
        }

        .cart-empty-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 42px;
          padding: 0 20px;
          border-radius: 999px;
          background: ${COLORS.teal};
          color: #FFFFFF;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1050px) {
          .cart-layout {
            grid-template-columns:
              minmax(0,1.7fr)
              minmax(300px,.9fr);
            gap: 18px;
          }

          .cart-items-box {
            padding: 15px 20px;
          }

          .cart-item {
            grid-template-columns:
              135px
              minmax(0,1fr)
              125px
              28px;
            gap: 18px;
          }

          .cart-item-image {
            width: 135px;
            height: 130px;
          }

          .cart-item-name {
            font-size: 21px;
          }

          .cart-quantity {
            width: 125px;
          }
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 800px) {
          .cart-page {
            padding: 30px 0 45px;
          }

          .cart-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0 16px;
            box-sizing: border-box;
          }

          .cart-header {
            align-items: flex-start;
            margin-bottom: 22px;
            gap: 12px;
          }

          .cart-eyebrow {
            font-size: 9px;
            letter-spacing: 2.5px;
            gap: 8px;
            margin-bottom: 7px;
          }

          .cart-eyebrow-line {
            width: 24px;
          }

          .cart-title {
            font-size: 38px;
            line-height: 1;
          }

          .cart-count {
            font-size: 10px;
            padding-top: 7px;
          }

          .cart-layout {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
          }

          .cart-items-box {
            width: 100%;
            padding: 8px 12px;
            border-radius: 11px;
          }

          .cart-item {
            position: relative;
            width: 100%;
            display: grid;
            grid-template-columns:
              88px
              minmax(0,1fr);
            grid-template-areas:
              "image info"
              "image price"
              "image qty";
            align-items: start;
            column-gap: 12px;
            row-gap: 6px;
            padding: 14px 0;
          }

          .cart-item-image {
            grid-area: image;
            width: 88px;
            height: 108px;
            border-radius: 8px;
            overflow: hidden;
          }

          .cart-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .cart-item-info {
            grid-area: info;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding-right: 28px;
          }

          .cart-item-name {
            width: 100%;
            margin: 0;
            font-size: 17px;
            line-height: 1.05;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .cart-item-meta {
            font-size: 9px;
            line-height: 1.35;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .cart-item-variant-details {
            gap: 5px;
            margin-top: 2px;
            font-size: 8px;
            line-height: 1.25;
          }

          .cart-item-variant-chip {
            min-height: 21px;
            padding: 2px 6px;
            gap: 4px;
          }

          .cart-item-color-dot {
            width: 10px;
            height: 10px;
            flex-basis: 10px;
          }

          .cart-item-sku {
            font-size: 8px;
          }

          .cart-item-price {
            grid-area: price;
            margin: 0;
            font-size: 15px;
            line-height: 1.2;
          }

          .cart-quantity {
            grid-area: qty;
            width: 104px;
            height: 33px;
            margin-top: 1px;
            border-radius: 999px;
          }

          .cart-quantity button {
            width: 31px;
            height: 100%;
          }

          .cart-quantity-value {
            min-width: 28px;
            font-size: 10px;
          }

          .cart-remove {
            position: absolute;
            top: 13px;
            right: 0;
            width: 27px;
            height: 27px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cart-remove svg {
            width: 15px;
            height: 15px;
          }

          .cart-summary {
            position: static;
            width: 100%;
            padding: 20px;
            border-radius: 11px;
          }

          .cart-summary-title {
            font-size: 28px;
            line-height: 1;
            margin-bottom: 20px;
          }

          .cart-summary-row {
            font-size: 10px;
            line-height: 1.4;
            margin-bottom: 13px;
          }

          .cart-summary-row strong {
            font-size: 11px;
          }

          .cart-summary-line {
            margin: 3px 0 18px;
          }

          .cart-total-row {
            margin-bottom: 20px;
          }

          .cart-total-label {
            font-size: 21px;
          }

          .cart-total {
            font-size: 20px;
          }

          .cart-summary-button {
            height: 47px;
            padding: 0 15px;
            font-size: 11px;
            border-radius: 999px;
          }

          .cart-button-stage {
            height: 17px;
          }

          .cart-button-state {
            gap: 6px;
            font-size: 11px;
          }

          .cart-button-state svg {
            width: 14px;
            height: 14px;
          }

          .cart-empty {
            min-height: 340px;
            padding: 28px 18px;
            border-radius: 11px;
          }

          .cart-empty-icon {
            width: 66px;
            height: 66px;
            margin-bottom: 15px;
          }

          .cart-empty-icon svg {
            width: 27px;
            height: 27px;
          }

          .cart-empty h2 {
            font-size: 27px;
            line-height: 1;
          }

          .cart-empty p {
            max-width: 320px;
            font-size: 10px;
            line-height: 1.55;
          }

          .cart-empty-link {
            height: 40px;
            padding: 0 18px;
            font-size: 10px;
          }
        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 380px) {
          .cart-page {
            padding: 26px 0 40px;
          }

          .cart-container {
            padding: 0 16px;
          }

          .cart-eyebrow {
            font-size: 8px;
            letter-spacing: 2.2px;
          }

          .cart-eyebrow-line {
            width: 22px;
          }

          .cart-title {
            font-size: 34px;
          }

          .cart-count {
            font-size: 9px;
            padding-top: 6px;
          }

          .cart-items-box {
            padding: 7px 10px;
          }

          .cart-item {
            grid-template-columns:
              80px
              minmax(0,1fr);
            column-gap: 10px;
            row-gap: 5px;
            padding: 13px 0;
          }

          .cart-item-image {
            width: 80px;
            height: 100px;
          }

          .cart-item-info {
            padding-right: 25px;
          }

          .cart-item-name {
            font-size: 16px;
          }

          .cart-item-meta {
            font-size: 8px;
            line-height: 1.3;
          }

          .cart-item-variant-details {
            gap: 4px;
            font-size: 7px;
          }

          .cart-item-variant-chip {
            min-height: 19px;
            padding: 2px 5px;
          }

          .cart-item-color-dot {
            width: 9px;
            height: 9px;
            flex-basis: 9px;
          }

          .cart-item-sku {
            font-size: 7px;
          }

          .cart-item-price {
            font-size: 14px;
          }

          .cart-quantity {
            width: 96px;
            height: 31px;
          }

          .cart-quantity button {
            width: 29px;
          }

          .cart-quantity-value {
            min-width: 26px;
            font-size: 9px;
          }

          .cart-remove {
            top: 12px;
            width: 25px;
            height: 25px;
          }

          .cart-remove svg {
            width: 14px;
            height: 14px;
          }

          .cart-summary {
            padding: 18px;
          }

          .cart-summary-title {
            font-size: 26px;
            margin-bottom: 18px;
          }

          .cart-summary-row {
            font-size: 9px;
            margin-bottom: 12px;
          }

          .cart-summary-row strong {
            font-size: 10px;
          }

          .cart-summary-line {
            margin: 2px 0 17px;
          }

          .cart-total-row {
            margin-bottom: 18px;
          }

          .cart-total-label {
            font-size: 20px;
          }

          .cart-total {
            font-size: 19px;
          }

          .cart-summary-button {
            height: 45px;
            font-size: 10px;
          }

          .cart-button-state {
            font-size: 10px;
          }

          .cart-button-state svg {
            width: 13px;
            height: 13px;
          }

          .cart-empty {
            min-height: 320px;
            padding: 24px 16px;
          }

          .cart-empty-icon {
            width: 60px;
            height: 60px;
          }

          .cart-empty h2 {
            font-size: 25px;
          }

          .cart-empty p {
            font-size: 9px;
            line-height: 1.5;
          }

          .cart-empty-link {
            height: 38px;
            padding: 0 16px;
            font-size: 9px;
          }
        }

        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {
          .cart-button-state,
          .cart-page *,
          .cart-page *::before,
          .cart-page *::after {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .001ms !important;
          }
        }

      `}</style>

      <div className="cart-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="cart-header">

          <div className="cart-heading-wrap">

            <div className="cart-eyebrow">
              <span className="cart-eyebrow-line" />
              SHOPPING CART
            </div>

            <h1 className="cart-title">
              Your Cart
            </h1>

          </div>

          <span className="cart-count">
            {totalItems}{" "}
            {totalItems === 1
              ? "Item"
              : "Items"}
          </span>

        </header>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {(
          loading ||
          resolvedCart.length === 0
        ) ? (

          <section className="cart-empty">

            <div className="cart-empty-icon">
              <ShoppingCart
                size={30}
                strokeWidth={1.7}
              />
            </div>

            {loading ? (
              <>
                <h2>
                  Loading Cart…
                </h2>

                <p>
                  Fetching your cart items.
                </p>
              </>
            ) : !isLoggedIn ? (
              <>
                <h2>
                  Please Login
                </h2>

                <p>
                  Login to your account
                  to view your cart and
                  saved items.
                </p>

                <Link
                  href="/account"
                  className="cart-empty-link"
                >
                  Login / Register
                  <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <>
                <h2>
                  Your Cart is Empty
                </h2>

                <p>
                  Explore our premium
                  fabric collections and
                  add the styles you love
                  to your cart.
                </p>

                <Link
                  href="/collection/cotton"
                  className="cart-empty-link"
                >
                  Explore Collections
                  <ArrowRight size={14} />
                </Link>
              </>
            )}

          </section>

        ) : (

          <div className="cart-layout">

            {/* =================================================
                LEFT — ITEMS
            ================================================= */}

            <section className="cart-items-box">

              {resolvedCart.map(
                (item) => (

                  <article
                    className="cart-item"
                    key={
                      item._id ||
                      `${item.productId}-${item.variantId || ""}-${item.colorName || ""}-${item.sizeName || ""}`
                    }
                  >

                    {/* IMAGE */}

                    <Link
                      href={`/products/${item.slug}`}
                      className="cart-item-image"
                    >
                      <img
                        src={
                          item.images?.[0] ||
                          "/images/home/products/1.png"
                        }
                        alt={item.name}
                      />
                    </Link>

                    {/* INFO */}

                    <div className="cart-item-info">

                      <Link
                        href={`/products/${item.slug}`}
                        className="cart-item-name"
                      >
                        {item.name}
                      </Link>

                      <span className="cart-item-meta">

                        {item.regularPrice !== item.price && (
                          <span
                            style={{
                              textDecoration:
                                "line-through",
                              color:
                                "#aaa",
                              marginRight:
                                6,
                            }}
                          >
                            ₹{item.regularPrice}
                          </span>
                        )}

                        per meter

                      </span>

                      {/* VARIANT DETAILS */}

                      {(
                        item.colorName ||
                        item.sizeName ||
                        item.sku
                      ) && (

                        <div className="cart-item-variant-details">

                          {item.colorName && (
                            <span className="cart-item-variant-chip">

                              {item.colorHex && (
                                <span
                                  className="cart-item-color-dot"
                                  style={{
                                    backgroundColor:
                                      item.colorHex,
                                  }}
                                />
                              )}

                              <span>
                                Color:{" "}
                                {item.colorName}
                              </span>

                            </span>
                          )}

                          {item.sizeName && (
                            <span className="cart-item-variant-chip">
                              Size:{" "}
                              {item.sizeName}
                            </span>
                          )}

                          {item.sku && (
                            <span className="cart-item-sku">
                              SKU:{" "}
                              {item.sku}
                            </span>
                          )}

                        </div>

                      )}

                      <span className="cart-item-price">
                        ₹{item.price}
                      </span>

                    </div>

                    {/* QUANTITY */}

                    <div className="cart-quantity">

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item._id,
                            -1
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="cart-quantity-value">
                        {item.cartQuantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item._id,
                            1
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>

                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() =>
                        removeItem(
                          item._id
                        )
                      }
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2
                        size={18}
                        strokeWidth={1.8}
                      />
                    </button>

                  </article>

                )
              )}

            </section>

            {/* =================================================
                RIGHT — SUMMARY
            ================================================= */}

            <aside className="cart-summary">

              <h2 className="cart-summary-title">
                Order Summary
              </h2>

              <div className="cart-summary-row">

                <span>
                  Subtotal ({totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"})
                </span>

                <strong>
                  ₹{subtotal}
                </strong>

              </div>

              <div className="cart-summary-row">

                <span>
                  Shipping
                </span>

                <strong>
                  ₹{shipping}
                </strong>

              </div>

              <div className="cart-summary-line" />

              <div className="cart-total-row">

                <span className="cart-total-label">
                  Total
                </span>

                <span className="cart-total">
                  ₹{total}
                </span>

              </div>

              {/* BUY NOW */}

              <button
                type="button"
                className="cart-summary-button"
                onClick={handleBuyNow}
                disabled={
                  buyNowLoading
                }
              >

                <span className="cart-button-stage">

                  {buyNowLoading ? (

                    <span
                      className="cart-button-state"
                      key="loading"
                    >

                      <ShoppingCart
                        size={16}
                      />

                      <span>
                        Processing...
                      </span>

                    </span>

                  ) : (

                    <span
                      className="cart-button-state"
                      key="buy"
                    >

                      <ArrowRight
                        size={16}
                        strokeWidth={2}
                      />

                      <span>
                        Buy Now
                      </span>

                    </span>

                  )}

                </span>

              </button>

              {/* CONTINUE SHOPPING */}

              <button
                type="button"
                style={{
                  width: "100%",
                  height: "52px",
                  marginTop: "13px",
                  borderRadius: "999px",
                  border:
                    "1px solid #295C65",
                  background:
                    "#FFFFFF",
                  color:
                    "#295C65",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontFamily:
                    "'Poppins', Arial, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  overflow: "hidden",
                }}
                onClick={() => {
                  if (
                    typeof window !==
                    "undefined"
                  ) {
                    window.location.href =
                      "/collection/cotton";
                  }
                }}
              >

                <span className="cart-button-stage">

                  <span
                    className="cart-button-state"
                    key="continue-shopping"
                  >

                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                    />

                    <span>
                      Continue Shopping
                    </span>

                  </span>

                </span>

              </button>

            </aside>

          </div>

        )}

      </div>
    </main>
  );
}
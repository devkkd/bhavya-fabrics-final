"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Heart,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
  ZoomIn,
} from "lucide-react";
import { products as fallbackProducts } from "../../data/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import CartStatusButton from "@/components/CartStatusButton";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const PLACEHOLDER_IMAGE = "/images/home/products/1.png";

const TABS = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "care", label: "Care Instructions" },
  { id: "shipping", label: "Shipping & Returns" },
];

const PD_STYLES = `
.pd-page,
.pd-page *,
.pd-page *::before,
.pd-page *::after {
  box-sizing: border-box;
}

.pd-page {
  width: 100%;
  min-height: 100vh;
  background: #FAF8F5;
  color: #1A1A1A;
  font-family: "Poppins", Arial, Helvetica, sans-serif;
  padding: 24px 0 70px;
  overflow-x: hidden;
}

.pd-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
}

.pd-page :focus-visible {
  outline: 2px solid #295C65;
  outline-offset: 2px;
}

.pd-state {
  min-height: 100vh;
  width: 100%;
  background: #FAF8F5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
  box-sizing: border-box;
}

.pd-state-box {
  width: 100%;
  max-width: 500px;
}

.pd-state-box h1 {
  margin: 0 0 10px;
  color: #295C65;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 44px;
  font-weight: 600;
  line-height: 1.1;
}

.pd-state-box p {
  margin: 0 0 24px;
  color: #696968;
  font-family: "Poppins", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

.pd-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: #295C65;
  color: #FFFFFF;
  border-radius: 999px;
  font-family: "Poppins", Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.pd-breadcrumb {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 20px;
  color: #696968;
  font-size: 12px;
}

.pd-breadcrumb a {
  color: #696968;
  text-decoration: none;
}

.pd-breadcrumb a:hover {
  color: #295C65;
}

.pd-breadcrumb-current {
  color: #295C65;
  font-weight: 500;
}

.pd-top {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 42px;
  align-items: start;
  margin-bottom: 52px;
}

.pd-gallery {
  width: 100%;
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
}

.pd-thumbs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pd-thumb {
  width: 78px;
  height: 96px;
  padding: 0;
  border: 1px solid #E4DCD4;
  border-radius: 9px;
  overflow: hidden;
  background: #F2EEE9;
  cursor: pointer;
  transition: border-color .2s ease, transform .2s ease;
}

.pd-thumb:hover {
  transform: translateY(-1px);
}

.pd-thumb.is-active {
  border: 2px solid #BE9D6B;
}

.pd-thumb img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.pd-main-image {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  max-height: 620px;
  overflow: hidden;
  border-radius: 12px;
  background: #F2EEE9;
}

.pd-main-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform .35s ease;
}

.pd-main-image:hover img {
  transform: scale(1.015);
}

.pd-zoom {
  position: absolute;
  right: 14px;
  bottom: 14px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(255,255,255,.95);
  color: #295C65;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,.10);
}

.pd-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0;
}

.pd-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  background: #F1E9DD;
  color: #A17645;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .8px;
  text-transform: uppercase;
}

.pd-title {
  margin: 0;
  color: #295C65;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 40px;
  font-weight: 500;
  line-height: 1;
  max-width: 700px;
  overflow-wrap: anywhere;
}

.pd-price-row {
  width: 100%;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}

.pd-price {
  color: #1A1A1A;
  font-size: 25px;
  font-weight: 700;
  line-height: 1;
}

.pd-price-unit {
  color: #696968;
  font-size: 12px;
}

.pd-sku {
  margin-left: auto;
  color: #696968;
  font-size: 11px;
  white-space: nowrap;
}

.pd-description {
  margin: 0;
  max-width: 660px;
  color: #696968;
  font-size: 14px;
  line-height: 1.7;
}

.pd-specs {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid #E9E0D7;
  border-bottom: 1px solid #E9E0D7;
}

.pd-spec {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px 10px 0;
  min-width: 0;
}

.pd-spec:nth-child(odd) {
  border-right: 1px solid #E9E0D7;
}

.pd-spec:nth-child(n + 3) {
  border-top: 1px solid #E9E0D7;
}

.pd-spec-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #F3EEE7;
  color: #A77A43;
}

.pd-spec-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pd-spec-label {
  color: #B08B5A;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.2px;
}

.pd-spec-value {
  color: #213A42;
  font-size: 13px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.pd-colors {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pd-colors-title {
  color: #B08B5A;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
}

.pd-swatch-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.pd-swatch {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 1px #DDD4C9;
  transition: transform .2s ease, box-shadow .2s ease;
}

.pd-swatch:hover {
  transform: scale(1.06);
}

.pd-swatch.is-active {
  box-shadow: 0 0 0 2px #295C65;
}

.pd-quantity-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pd-quantity-label {
  color: #213A42;
  font-size: 12px;
  font-weight: 500;
}

.pd-quantity-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.pd-quantity-control {
  height: 45px;
  display: inline-flex;
  align-items: center;
  border: 1px solid #DCD4CB;
  border-radius: 8px;
  background: #FFFFFF;
  overflow: hidden;
}

.pd-quantity-control button {
  width: 42px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #295C65;
  cursor: pointer;
}

.pd-quantity-control button:hover {
  background: #F4EFE8;
}

.pd-quantity-control button:disabled {
  color: #B9B3AC;
  cursor: not-allowed;
  background: transparent;
}

.pd-quantity-number {
  min-width: 75px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #E6DED5;
  border-right: 1px solid #E6DED5;
  color: #1A1A1A;
  font-size: 14px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.pd-min-order {
  color: #696968;
  font-size: 11px;
}

.pd-cart-icon-button {
  position: relative;
  width: 53px;
  height: 53px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #BE9D6B;
  border-radius: 50%;
  background: #FFFFFF;
  color: #295C65;
  cursor: pointer;
  overflow: hidden;
  transition: transform .2s ease, background .2s ease, color .2s ease;
}

.pd-cart-icon-button:hover {
  transform: translateY(-1px);
  background: #F8F2EA;
}

.pd-cart-icon-button.is-added {
  background: #295C65;
  border-color: #295C65;
  color: #FFFFFF;
}

.pd-cart-icon-wrap {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pd-cart-icon-wrap.cart-enter {
  animation: pdCartIconIn .42s cubic-bezier(.2,.8,.25,1) both;
}

.pd-cart-icon-wrap.check-enter {
  animation: pdCheckIn .42s cubic-bezier(.2,.8,.25,1) both;
}

@keyframes pdCartIconIn {
  0% { transform: translateY(-120%); opacity: 0; }
  55% { transform: translateY(8%); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes pdCheckIn {
  0% { transform: translateY(-120%); opacity: 0; }
  55% { transform: translateY(8%); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}

.pd-main-actions {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pd-main-button {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  padding: 0 20px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.pd-buy-now {
  border: 1px solid #295C65;
  background: #295C65;
  color: #FFFFFF;
}

.pd-buy-now:hover {
  background: #214D55;
}

.pd-request-quote {
  border: 1px solid #295C65;
  background: #FFFFFF;
  color: #295C65;
}

.pd-request-quote:hover {
  background: #F7F1E9;
}

.pd-trust-row {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid #E9E0D7;
  padding-top: 14px;
  gap: 12px;
}

.pd-trust-item {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: #696968;
  font-size: 10px;
  line-height: 1.3;
}

.pd-trust-item + .pd-trust-item {
  border-left: 1px solid #E9E0D7;
  padding-left: 14px;
}

.pd-trust-item svg {
  color: #295C65;
  flex-shrink: 0;
}

.pd-tabs {
  width: 100%;
  margin-bottom: 48px;
}

.pd-tabs-nav {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 38px;
  overflow-x: auto;
  border-top: 1px solid #E9E0D7;
  border-bottom: 1px solid #E9E0D7;
  scrollbar-width: none;
}

.pd-tabs-nav::-webkit-scrollbar {
  display: none;
}

.pd-tab {
  position: relative;
  flex: 0 0 auto;
  padding: 15px 0;
  border: none;
  background: none;
  color: #696968;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.pd-tab::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: #295C65;
  transform: scaleX(0);
  transition: transform .2s ease;
}

.pd-tab.is-active {
  color: #295C65;
}

.pd-tab.is-active::after {
  transform: scaleX(1);
}

.pd-tab-content {
  width: 100%;
  max-width: 900px;
  min-height: 150px;
  padding-top: 24px;
  color: #696968;
  font-size: 13px;
  line-height: 1.8;
}

.pd-tab-content h2 {
  margin: 0 0 10px;
  color: #173C46;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 28px;
  font-weight: 600;
}

.pd-tab-content p {
  margin: 0;
}

.pd-spec-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 30px;
}

.pd-spec-list li {
  padding: 10px 0;
  border-bottom: 1px solid #EEE7DF;
}

.pd-spec-list strong {
  color: #295C65;
}

.pd-feature-band {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #F2EEE9;
  border-radius: 14px;
  margin-bottom: 52px;
  overflow: hidden;
}

.pd-feature {
  min-height: 138px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 18px;
}

.pd-feature + .pd-feature {
  border-left: 1px solid #DED5CB;
}

.pd-feature-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 9px;
  border-radius: 50%;
  background: #EEE7DE;
  color: #9E7542;
}

.pd-feature-title {
  color: #203D45;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.1;
}

.pd-feature-text {
  max-width: 150px;
  margin-top: 4px;
  color: #696968;
  font-size: 10px;
  line-height: 1.4;
}

.pd-related {
  width: 100%;
}

.pd-related-heading {
  position: relative;
  margin: 0 0 28px;
  display: flex;
  justify-content: center;
  color: #295C65;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 38px;
  font-weight: 600;
  line-height: 1;
}

.pd-related-heading::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  width: 60px;
  height: 1px;
  background: #BE9D6B;
}

.pd-related-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.pd-related-card {
  position: relative;
  width: 100%;
  min-width: 0;
  background: #FFFFFF;
  border: 1px solid #E7DED4;
  border-radius: 11px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform .25s ease, box-shadow .25s ease;
}

.pd-related-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(41,92,101,.09);
}

.pd-related-image {
  width: 100%;
  aspect-ratio: 3 / 4;
  display: block;
  overflow: hidden;
  background: #F2EEE9;
  position: relative;
}

.pd-related-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform .4s ease;
}

.pd-related-card:hover .pd-related-image img {
  transform: scale(1.035);
}

.pd-related-save {
  position: absolute;
  top: 9px;
  right: 9px;
  z-index: 5;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,.85);
  border-radius: 50%;
  background: rgba(255,255,255,.95);
  color: #295C65;
  cursor: pointer;
  transition: transform .2s ease, background .2s ease;
}

.pd-related-save:hover {
  transform: scale(1.06);
  background: #F7F0E8;
}

.pd-related-save.is-saved {
  background: #295C65;
  color: #FFFFFF;
  border-color: #295C65;
}

.pd-related-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 5;
  display: inline-block;
  padding: 7px 16px;
  background: linear-gradient(
    135deg,
    rgba(190,157,107,.95) 0%,
    rgba(166,133,86,.95) 100%
  );
  color: #FFFFFF;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  box-shadow:
    0 8px 24px rgba(0,0,0,.28),
    inset 0 1px 0 rgba(255,255,255,.25),
    0 0 20px rgba(190,157,107,.3);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255,255,255,.25);
  text-shadow: 0 1px 3px rgba(0,0,0,.15);
}

.pd-related-body {
  position: relative;
  min-height: 106px;
  padding: 12px 58px 13px 12px;
  display: block;
  text-decoration: none;
}

.pd-related-name {
  display: block;
  color: #173C46;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.08;
  overflow-wrap: anywhere;
}

.pd-related-meta {
  display: block;
  margin-top: 6px;
  color: #696968;
  font-size: 10px;
}

.pd-related-colors {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 7px;
}

.pd-related-color {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 50%;
}

.pd-related-price {
  display: block;
  margin-top: 5px;
  color: #295C65;
  font-size: 14px;
  font-weight: 700;
}

.pd-related-cart {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 8;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #295C65;
  border-radius: 50%;
  background: #295C65;
  color: #FFFFFF;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 11px rgba(41,92,101,.17);
  transition: background .2s ease, transform .2s ease;
}

.pd-related-cart:hover {
  transform: translateY(-1px);
  background: #214D55;
}

.pd-related-cart.is-added {
  background: #BE9D6B;
  border-color: #BE9D6B;
}

.pd-related-cart-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pd-related-cart-icon.cart-in {
  animation: relatedCartIn .42s cubic-bezier(.2,.8,.25,1) both;
}

.pd-related-cart-icon.check-in {
  animation: relatedCheckIn .42s cubic-bezier(.2,.8,.25,1) both;
}

@keyframes relatedCartIn {
  0% { transform: translateY(-120%); opacity: 0; }
  55% { transform: translateY(8%); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes relatedCheckIn {
  0% { transform: translateY(-120%); opacity: 0; }
  55% { transform: translateY(8%); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}

.pd-skeleton {
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    #EFEAE3 25%,
    #F6F2EC 37%,
    #EFEAE3 63%
  );
  background-size: 400% 100%;
  animation: pdShimmer 1.4s ease infinite;
}

.pd-skeleton-line {
  height: 14px;
  margin-bottom: 12px;
}

.pd-skeleton-title {
  height: 40px;
  width: 70%;
  margin-bottom: 18px;
}

.pd-skeleton-block {
  height: 72px;
  margin-bottom: 16px;
}

@keyframes pdShimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

@media (max-width: 1050px) {
  .pd-top {
    gap: 28px;
  }

  .pd-title {
    font-size: 42px;
  }

  .pd-gallery {
    grid-template-columns: 66px minmax(0, 1fr);
  }

  .pd-thumb {
    width: 66px;
    height: 84px;
  }

  .pd-related-grid {
    gap: 12px;
  }
}

@media (max-width: 900px) {
  .pd-top {
    grid-template-columns: 1fr;
    gap: 34px;
  }

  .pd-gallery,
  .pd-info {
    max-width: 720px;
    margin: 0 auto;
  }

  .pd-feature-band {
    grid-template-columns: repeat(2, 1fr);
  }

  .pd-feature:nth-child(3) {
    border-left: none;
  }

  .pd-feature:nth-child(n + 3) {
    border-top: 1px solid #DED5CB;
  }

  .pd-related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .pd-page {
    padding: 16px 0 45px;
  }

  .pd-container {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0 16px;
  }

  .pd-breadcrumb {
    margin-bottom: 14px;
    font-size: 10px;
  }

  .pd-top {
    gap: 28px;
    margin-bottom: 34px;
  }

  .pd-gallery {
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
    gap: 9px;
    max-width: none;
  }

  .pd-thumbs {
    flex-direction: row;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 2px;
  }

  .pd-thumbs::-webkit-scrollbar {
    display: none;
  }

  .pd-thumb {
    width: 58px;
    height: 70px;
    flex: 0 0 58px;
    border-radius: 7px;
  }

  .pd-main-image {
    width: 100%;
    aspect-ratio: 4 / 5;
    max-height: none;
    border-radius: 10px;
  }

  .pd-zoom {
    width: 34px;
    height: 34px;
    right: 10px;
    bottom: 10px;
  }

  .pd-info {
    width: 100%;
    max-width: none;
    gap: 13px;
  }

  .pd-badge {
    padding: 4px 10px;
    font-size: 8px;
  }

  .pd-title {
    font-size: 34px;
    line-height: 1;
  }

  .pd-price {
    font-size: 25px;
  }

  .pd-price-unit {
    font-size: 10px;
  }

  .pd-sku {
    width: 100%;
    margin-left: 0;
    font-size: 9px;
  }

  .pd-description {
    font-size: 12px;
    line-height: 1.65;
  }

  .pd-spec {
    min-height: 65px;
    gap: 8px;
    padding: 8px 7px 8px 0;
  }

  .pd-spec-icon {
    width: 31px;
    height: 31px;
  }

  .pd-spec-label {
    font-size: 8px;
  }

  .pd-spec-value {
    font-size: 10px;
  }

  .pd-colors-title {
    font-size: 8px;
  }

  .pd-swatch {
    width: 27px;
    height: 27px;
  }

  .pd-quantity-label {
    font-size: 11px;
  }

  .pd-quantity-row {
    gap: 9px;
  }

  .pd-quantity-control {
    height: 40px;
  }

  .pd-quantity-control button {
    width: 35px;
  }

  .pd-quantity-number {
    min-width: 62px;
    font-size: 12px;
  }

  .pd-cart-icon-button {
    width: 45px;
    height: 45px;
  }

  .pd-min-order {
    width: 100%;
    font-size: 9px;
    margin-top: 1px;
  }

  .pd-main-actions {
    grid-template-columns: 1fr;
    gap: 9px;
  }

  .pd-main-button {
    min-height: 44px;
    font-size: 11px;
  }

  .pd-trust-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
    padding-top: 11px;
  }

  .pd-trust-item {
    gap: 4px;
    font-size: 8px;
  }

  .pd-trust-item + .pd-trust-item {
    padding-left: 6px;
  }

  .pd-tabs {
    margin-bottom: 34px;
  }

  .pd-tabs-nav {
    gap: 24px;
  }

  .pd-tab {
    padding: 12px 0;
    font-size: 12px;
  }

  .pd-tab-content {
    min-height: 130px;
    padding-top: 18px;
    font-size: 11px;
    line-height: 1.7;
  }

  .pd-tab-content h2 {
    font-size: 23px;
  }

  .pd-spec-list {
    grid-template-columns: 1fr;
  }

  .pd-feature-band {
    grid-template-columns: 1fr 1fr;
    border-radius: 11px;
    margin-bottom: 40px;
  }

  .pd-feature {
    min-height: 120px;
    padding: 13px 9px;
  }

  .pd-feature-icon {
    width: 44px;
    height: 44px;
  }

  .pd-feature-title {
    font-size: 16px;
  }

  .pd-feature-text {
    max-width: 125px;
    font-size: 9px;
  }

  .pd-related-heading {
    font-size: 30px;
    margin-bottom: 24px;
  }

  .pd-related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .pd-related-card {
    border-radius: 9px;
  }

  .pd-related-save {
    width: 29px;
    height: 29px;
    top: 6px;
    right: 6px;
  }

  .pd-related-badge {
    top: 6px;
    left: 6px;
    padding: 5px 10px;
    font-size: 8px;
    border-radius: 4px;
    font-weight: 800;
  }

  .pd-related-body {
    min-height: 96px;
    padding: 9px 48px 9px 9px;
  }

  .pd-related-name {
    font-size: 14px;
  }

  .pd-related-meta {
    font-size: 8px;
  }

  .pd-related-price {
    font-size: 12px;
  }

  .pd-related-cart {
    width: 34px;
    height: 34px;
    right: 7px;
    bottom: 7px;
  }

  .pd-related-color {
    width: 10px;
    height: 10px;
  }

  .pd-state-box h1 {
    font-size: 32px;
  }
}

@media (max-width: 380px) {
  .pd-container {
    padding: 0 16px;
  }

  .pd-title {
    font-size: 31px;
  }

  .pd-main-image {
    aspect-ratio: 1 / 1.18;
  }

  .pd-feature {
    min-height: 112px;
  }

  .pd-feature-title {
    font-size: 15px;
  }

  .pd-related-grid {
    gap: 8px;
  }

  .pd-related-name {
    font-size: 13px;
  }

  .pd-related-cart {
    width: 32px;
    height: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pd-cart-icon-wrap,
  .pd-related-cart-icon,
  .pd-main-image img,
  .pd-related-card,
  .pd-related-image img,
  .pd-thumb,
  .pd-swatch,
  .pd-related-save,
  .pd-related-cart,
  .pd-skeleton {
    animation: none !important;
    transition: none !important;
  }
}

.pd-cart-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pd-cart-status-control {
  display: flex;
  align-items: center;
  height: 44px;
  background: #F5F3F0;
  border: 1px solid #E4DCD4;
  border-radius: 8px;
  padding: 0 4px;
  gap: 4px;
}

.pd-cart-qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: #295C65;
  cursor: pointer;
  border-radius: 5px;
  transition: background .2s ease;
  font-weight: 600;
}

.pd-cart-qty-btn:hover:not(:disabled) {
  background: #EDE8E1;
}

.pd-cart-qty-btn:disabled {
  color: #D4CCBF;
  cursor: not-allowed;
}

.pd-cart-qty-display {
  display: inline-block;
  min-width: 24px;
  text-align: center;
  font-weight: 700;
  color: #295C65;
}

.pd-cart-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  height: 44px;
  background: #E8DCCF;
  border: 1px solid #D4CCBF;
  border-radius: 8px;
  color: #8B6F54;
  font-family: "Poppins", Arial, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
}

.pd-cart-remove-btn:hover {
  background: #D4CCBF;
  color: #5D4A38;
}

@media (max-width: 640px) {
  .pd-cart-status {
    gap: 6px;
  }

  .pd-cart-status-control {
    height: 38px;
    padding: 0 2px;
    gap: 2px;
  }

  .pd-cart-qty-btn {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }

  .pd-cart-remove-btn {
    height: 38px;
    padding: 0 10px;
    font-size: 11px;
  }
}

.pd-related-cart-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255,255,255,.95);
  border: 1px solid #E4DCD4;
  border-radius: 6px;
  padding: 3px;
  backdrop-filter: blur(4px);
}

.pd-related-qty-decrease,
.pd-related-qty-increase {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #295C65;
  cursor: pointer;
  border-radius: 3px;
  transition: background .2s ease;
}

.pd-related-qty-decrease:hover:not(:disabled),
.pd-related-qty-increase:hover:not(:disabled) {
  background: #F5F3F0;
}

.pd-related-qty-decrease:disabled,
.pd-related-qty-increase:disabled {
  color: #D4CCBF;
  cursor: not-allowed;
}

.pd-related-qty-display {
  display: inline-block;
  min-width: 18px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #295C65;
}
`;

function ProductStyles() {
  return (
    <style
      id="pd-styles"
      precedence="high"
      dangerouslySetInnerHTML={{ __html: PD_STYLES }}
    />
  );
}

function getOptionName(value = "") {
  if (value && typeof value === "object") {
    return String(
      value?.name ||
        value?.label ||
        value?.value ||
        value?.hex ||
        ""
    ).trim();
  }

  return String(value || "").trim();
}

function getOptionValue(value = "") {
  if (value && typeof value === "object") {
    return String(
      value?.value ||
        value?.name ||
        value?.label ||
        value?.hex ||
        ""
    ).trim();
  }

  return String(value || "").trim();
}

function getOptionHex(value = "") {
  if (value && typeof value === "object") {
    return String(
      value?.hex ||
        value?.value ||
        ""
    ).trim();
  }

  return String(value || "").trim();
}

function optionMatches(a, b) {
  const left = [
    getOptionName(a),
    getOptionValue(a),
    getOptionHex(a),
  ]
    .map((x) => x.toLowerCase())
    .filter(Boolean);

  const right = [
    getOptionName(b),
    getOptionValue(b),
    getOptionHex(b),
  ]
    .map((x) => x.toLowerCase())
    .filter(Boolean);

  return left.some((value) =>
    right.includes(value)
  );
}

function normalizeBackendProduct(item) {
  if (!item) return null;

  const regularPrice =
    Number(
      item?.pricing?.regularPrice ??
        item?.price ??
        0
    ) || 0;

  const images = [
    item?.mainImage?.url,
    item?.image?.url,
    item?.imageUrl,
    ...(Array.isArray(item?.gallery)
      ? item.gallery.map(
          (x) => x?.url || x
        )
      : []),
    ...(Array.isArray(item?.images)
      ? item.images.map(
          (x) => x?.url || x
        )
      : []),
  ].filter(Boolean);

  const uniqueImages =
    Array.from(new Set(images));

  const rawVariants = Array.isArray(
    item?.variants
  )
    ? item.variants
    : [];

  const rawColors =
    Array.isArray(
      item?.options?.colors
    ) &&
    item.options.colors.length > 0
      ? item.options.colors
      : rawVariants
          .map(
            (variant) =>
              variant?.color
          )
          .filter(Boolean);

  const colorOptions =
    Array.from(
      new Map(
        rawColors.map(
          (color, index) => {
            const name =
              getOptionName(
                color
              ) ||
              `Color ${index + 1}`;

            const value =
              getOptionValue(
                color
              ) || name;

            const hex =
              getOptionHex(
                color
              ) || "#D9D1C7";

            return [
              `${name.toLowerCase()}|${value.toLowerCase()}|${hex.toLowerCase()}`,
              {
                index,
                name,
                value,
                hex,
              },
            ];
          }
        )
      ).values()
    );

  const colors = colorOptions
    .map((color) => color.hex)
    .filter(Boolean);

  const variants = rawVariants
    .map((variant) => ({
      id:
        variant?._id ||
        variant?.id ||
        "",

      color:
        variant?.color ||
        "",

      colorName:
        getOptionName(
          variant?.color
        ),

      colorValue:
        getOptionValue(
          variant?.color
        ),

      colorHex:
        getOptionHex(
          variant?.color
        ),

      size:
        variant?.size ||
        "",

      sizeName:
        getOptionName(
          variant?.size
        ),

      sizeValue:
        getOptionValue(
          variant?.size
        ),

      regularPrice:
        Number(
          variant?.regularPrice ??
            0
        ) || 0,

      salePrice:
        Number(
          variant?.salePrice ??
            0
        ) || 0,

      sku:
        variant?.sku ||
        "",

      stock:
        Number(
          variant?.stock ??
            0
        ) || 0,

      active:
        variant?.active !== false,

      images:
        Array.isArray(
          variant?.images
        )
          ? variant.images
              .map(
                (image) =>
                  image?.url ||
                  image
              )
              .filter(Boolean)
          : [],
    }))
    .filter(
      (variant) =>
        variant.active
    );

  const rawSizes = [
    ...(Array.isArray(
      item?.options?.sizes
    )
      ? item.options.sizes
      : []),

    ...variants
      .map(
        (variant) =>
          variant?.size
      )
      .filter(Boolean),
  ];

  const sizeOptions =
    Array.from(
      new Map(
        rawSizes.map(
          (size, index) => {
            const name =
              getOptionName(
                size
              ) ||
              `Size ${index + 1}`;

            const value =
              getOptionValue(
                size
              ) || name;

            return [
              value.toLowerCase(),
              {
                index,
                name,
                value,
              },
            ];
          }
        )
      ).values()
    );

  const moq =
    Number(
      item?.moq ||
        item?.minimumOrderQuantity ||
        item?.inventory
          ?.maxQuantityPerOrder ||
        1
    ) || 1;

  return {
    id:
      item?._id ||
      item?.slug ||
      item?.title,

    slug:
      item?.slug ||
      String(
        item?.title || ""
      )
        .trim()
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        ),

    name:
      item?.title ||
      item?.name ||
      "Untitled Product",

    sku:
      item?.sku ||
      "—",

    category:
      item?.category?.slug ||
      item?.category ||
      "",

    categoryLabel:
      item?.category?.name ||
      item?.categoryName ||
      "",

    subcategory:
      item?.subCategory?.slug ||
      item?.subcategory ||
      "",

    type:
      item?.details?.pattern ||
      item?.pattern ||
      item?.type ||
      "plain",

    price:
      regularPrice,

    priceUnit:
      item?.priceUnit ||
      "Per Meter",

    badge:
      Boolean(
        item?.showOnSale
      ) &&
      Number(
        item?.pricing?.salePrice ??
          item?.salePrice ??
          0
      ) > 0 &&
      Number(
        item?.pricing?.regularPrice ??
          item?.regularPrice ??
          item?.price ??
          0
      ) >
        Number(
          item?.pricing?.salePrice ??
            item?.salePrice ??
            0
        )
        ? "Sale"
        : item?.showInNewArrivals
        ? "New Arrival"
        : item?.featured
        ? "Featured"
        : "",

    gsm:
      item?.details?.gsm ||
      item?.gsm ||
      "—",

    width:
      item?.details?.width ||
      item?.width ||
      "—",

    composition:
      item?.details?.material ||
      item?.details?.fabric ||
      item?.composition ||
      "—",

    moq,

    colors:
      colors.length > 0
        ? colors
        : [
            "#F1EDE4",
            "#295C65",
            "#BE9D6B",
          ],

    colorOptions,

    sizeOptions,

    variants,

    variantsEnabled:
      Boolean(
        item?.variantsEnabled ||
          variants.length > 0
      ),

    images:
      uniqueImages.length > 0
        ? uniqueImages
        : [PLACEHOLDER_IMAGE],

    description:
      item?.shortDescription ||
      item?.description ||
      "",

    longDescription:
      item?.description ||
      item?.shortDescription ||
      "",

    care:
      item?.details
        ?.careInstructions ||
      item?.care ||
      "",

    shipping:
      item?.shipping ||
      "Ships within 3-5 business days.",
  };
}

function handleImageError(event) {
  if (
    event.currentTarget.src.endsWith(
      PLACEHOLDER_IMAGE
    )
  ) {
    return;
  }

  event.currentTarget.src =
    PLACEHOLDER_IMAGE;
}

export default function ProductDetailPage() {
  const params = useParams();

  const {
    addToCart,
    isInCart,
  } = useCart();

  const {
    toggleSave,
    isSaved,
  } = useWishlist();

  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
      ? params.slug[0]
      : "";

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [activeImage, setActiveImage] =
    useState(0);

  const [activeColor, setActiveColor] =
    useState(0);

  const [selectedSize, setSelectedSize] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("description");

  const [quantity, setQuantity] =
    useState(1);

  const [cartAdded, setCartAdded] =
    useState(false);

  const [cartMsg, setCartMsg] =
    useState("");

  const [
    relatedCartAdded,
    setRelatedCartAdded,
  ] = useState({});

  const [loginPrompt, setLoginPrompt] =
    useState(false);

  const [
    relatedProducts,
    setRelatedProducts,
  ] = useState([]);

  const [loadingRelated, setLoadingRelated] =
    useState(false);

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const controller =
      new AbortController();

    async function loadProduct() {
      setLoading(true);

      const fallback =
        (fallbackProducts || []).find(
          (item) =>
            item.slug === slug
        ) || null;

      try {
        const response =
          await fetch(
            `${API_URL}/products/${slug}`,
            {
              cache: "no-store",
              signal:
                controller.signal,
            }
          );

        if (!response.ok) {
          throw new Error(
            "Request failed"
          );
        }

        const payload =
          await response.json();

        const nextProduct =
          normalizeBackendProduct(
            payload?.product
          );

        if (isMounted) {
          setProduct(
            nextProduct ||
              fallback
          );
        }
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        if (isMounted) {
          setProduct(fallback);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [slug]);
  // ---------- RESET ON PRODUCT CHANGE ----------

  useEffect(() => {
    setQuantity(product?.moq || 1);
    setActiveImage(0);
    setActiveColor(0);
    setSelectedSize("");
    setActiveTab("description");
    setCartAdded(false);
    setCartMsg("");
  }, [product]);

  // ---------- CART TIMER CLEANUP ----------

  useEffect(() => {
    if (!cartAdded) return;

    const timer = window.setTimeout(() => {
      setCartAdded(false);
      setCartMsg("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [cartAdded]);

  // ---------- RELATED PRODUCTS ----------

  useEffect(() => {
    if (!product) {
      setRelatedProducts([]);
      return;
    }

    setLoadingRelated(true);

    (async () => {
      try {
        let url = `${API_URL}/products?exclude=${product.id}&limit=4`;

        if (
          product.showOnSale ||
          product.badge === "Sale"
        ) {
          url += "&showOnSale=true";
        } else if (product.category) {
          url += `&category=${encodeURIComponent(
            product.category
          )}`;
        }

        const response = await fetch(url, {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();

          const relatedArray =
            Array.isArray(data?.products)
              ? data.products
              : Array.isArray(data?.data)
              ? data.data
              : [];

          const normalized = relatedArray
            .slice(0, 4)
            .map((item) =>
              normalizeBackendProduct(item)
            )
            .filter(Boolean);

          setRelatedProducts(normalized);
        } else {
          const fallback =
            (fallbackProducts || [])
              .filter(
                (item) =>
                  item.slug !== product.slug &&
                  (
                    product.category
                      ? item.category ===
                        product.category
                      : true
                  )
              )
              .slice(0, 4);

          setRelatedProducts(fallback);
        }
      } catch (error) {
        console.error(
          "Failed to load related products:",
          error
        );

        const fallback =
          (fallbackProducts || [])
            .filter(
              (item) =>
                item.slug !== product.slug &&
                (
                  product.category
                    ? item.category ===
                      product.category
                    : true
                )
            )
            .slice(0, 4);

        setRelatedProducts(fallback);
      } finally {
        setLoadingRelated(false);
      }
    })();
  }, [product]);

  // ---------- COLOUR OPTIONS ----------

  const colorOptions = useMemo(() => {
    if (!product) return [];

    if (
      Array.isArray(product.colorOptions) &&
      product.colorOptions.length
    ) {
      return product.colorOptions;
    }

    return (
      product.colors || []
    ).map((color, index) => ({
      index,
      name: `Color ${index + 1}`,
      value: color,
      hex: color,
    }));
  }, [product]);

  // ---------- SELECTED COLOUR ----------

  const selectedColor = useMemo(() => {
    if (!colorOptions.length) {
      return "";
    }

    return (
      colorOptions[
        Math.min(
          activeColor,
          colorOptions.length - 1
        )
      ] || ""
    );
  }, [colorOptions, activeColor]);

  // ---------- AVAILABLE SIZES ----------

  const availableSizes = useMemo(() => {
    if (!product) return [];

    const configuredSizes =
      Array.isArray(product.sizeOptions)
        ? product.sizeOptions
        : [];

    const variants =
      Array.isArray(product.variants)
        ? product.variants
        : [];

    /*
     * When variants are enabled and a colour is
     * selected, only show sizes available for
     * that colour.
     */
    if (
      product.variantsEnabled &&
      variants.length > 0
    ) {
      const filtered = variants
        .filter((variant) => {
          if (!variant?.active) {
            return false;
          }

          if (!selectedColor) {
            return true;
          }

          return optionMatches(
            variant.color ||
              {
                name:
                  variant.colorName,
                value:
                  variant.colorValue,
                hex:
                  variant.colorHex,
              },
            selectedColor
          );
        })
        .map(
          (variant) =>
            variant.size ||
            {
              name:
                variant.sizeName,
              value:
                variant.sizeValue,
            }
        )
        .filter(Boolean);

      const unique = Array.from(
        new Map(
          filtered.map((size) => {
            const name =
              getOptionName(size);

            return [
              name.toLowerCase(),
              {
                name,
                value:
                  getOptionValue(size) ||
                  name,
              },
            ];
          })
        ).values()
      );

      /*
       * Important:
       * If strict colour filtering produces
       * nothing, keep configured sizes visible.
       */
      if (unique.length > 0) {
        return unique;
      }

      if (configuredSizes.length > 0) {
        return configuredSizes;
      }

      return [];
    }

    return configuredSizes;
  }, [
    product,
    selectedColor,
  ]);

  // ---------- SELECTED VARIANT ----------

  const selectedVariant = useMemo(() => {
    if (!product) return null;

    const variants =
      Array.isArray(product.variants)
        ? product.variants
        : [];

    if (
      !product.variantsEnabled ||
      variants.length === 0
    ) {
      return null;
    }

    /*
     * A variant is only considered selected
     * after all required options have been chosen.
     */
    const requiresColor =
      colorOptions.length > 0;

    const requiresSize =
      availableSizes.length > 0;

    if (
      requiresColor &&
      !selectedColor
    ) {
      return null;
    }

    if (
      requiresSize &&
      !selectedSize
    ) {
      return null;
    }

    return (
      variants.find((variant) => {
        if (!variant?.active) {
          return false;
        }

        const colorMatches =
          selectedColor
            ? optionMatches(
                variant.color ||
                  {
                    name:
                      variant.colorName,
                    value:
                      variant.colorValue,
                    hex:
                      variant.colorHex,
                  },
                selectedColor
              )
            : true;

        const sizeMatches =
          selectedSize
            ? optionMatches(
                variant.size ||
                  {
                    name:
                      variant.sizeName,
                    value:
                      variant.sizeValue,
                  },
                selectedSize
              )
            : true;

        return (
          colorMatches &&
          sizeMatches
        );
      }) || null
    );
  }, [
    product,
    colorOptions,
    availableSizes,
    selectedColor,
    selectedSize,
  ]);

  // ---------- PRICE ----------

  const displayPrice = useMemo(() => {
    if (
      selectedVariant
    ) {
      const sale =
        Number(
          selectedVariant.salePrice
        ) || 0;

      const regular =
        Number(
          selectedVariant.regularPrice
        ) || 0;

      if (
        sale > 0 &&
        regular > sale
      ) {
        return sale;
      }

      return regular;
    }

    return (
      Number(product?.price) || 0
    );
  }, [
    product,
    selectedVariant,
  ]);

  const regularDisplayPrice =
    useMemo(() => {
      if (
        selectedVariant &&
        Number(
          selectedVariant.regularPrice
        ) > 0
      ) {
        return Number(
          selectedVariant.regularPrice
        );
      }

      return (
        Number(product?.price) || 0
      );
    }, [
      product,
      selectedVariant,
    ]);

  const hasSalePrice =
    regularDisplayPrice >
      displayPrice &&
    displayPrice > 0;

  // ---------- ACTIVE IMAGE LIST ----------

  const activeImages = useMemo(() => {
    if (
      selectedVariant &&
      Array.isArray(
        selectedVariant.images
      ) &&
      selectedVariant.images.length
    ) {
      return selectedVariant.images;
    }

    return product?.images?.length
      ? product.images
      : [PLACEHOLDER_IMAGE];
  }, [
    product,
    selectedVariant,
  ]);

  // Keep active image valid when variant changes
  useEffect(() => {
    if (
      activeImage >= activeImages.length
    ) {
      setActiveImage(0);
    }
  }, [
    activeImage,
    activeImages.length,
  ]);

  // ---------- STOCK ----------

  const availableStock = useMemo(() => {
    if (selectedVariant) {
      return Math.max(
        0,
        Number(
          selectedVariant.stock || 0
        )
      );
    }

    return null;
  }, [selectedVariant]);

  const isOutOfStock =
    selectedVariant
      ? availableStock <= 0
      : false;

  // ---------- WISHLIST ----------

  const saved = product
    ? isSaved(product.id)
    : false;

  const handleWishlist = useCallback(
    async () => {
      if (!product?.id) return;

      try {
        await toggleSave(product.id);
      } catch (error) {
        console.error(
          "Wishlist error:",
          error
        );
      }
    },
    [
      product,
      toggleSave,
    ]
  );

  // ---------- COLOUR CHANGE ----------

  const handleColorChange = useCallback(
    (index) => {
      setActiveColor(index);
      setSelectedSize("");
      setActiveImage(0);
      setCartAdded(false);
      setCartMsg("");
    },
    []
  );

  // ---------- SIZE CHANGE ----------

  const handleSizeChange = useCallback(
    (size) => {
      setSelectedSize(
        getOptionName(size)
      );
      setCartAdded(false);
      setCartMsg("");
    },
    []
  );

  // ---------- QUANTITY ----------

  const decreaseQuantity =
    useCallback(() => {
      setQuantity((current) =>
        Math.max(
          product?.moq || 1,
          current - 1
        )
      );
    }, [product]);

  const increaseQuantity =
    useCallback(() => {
      setQuantity((current) => {
        const next =
          current + 1;

        if (
          selectedVariant &&
          availableStock !== null
        ) {
          return Math.min(
            next,
            availableStock
          );
        }

        return Math.min(
          next,
          100
        );
      });
    }, [
      selectedVariant,
      availableStock,
    ]);

  // ---------- ADD TO CART ----------

  const handleAddToCart =
    useCallback(
      async () => {
        if (!product?.id) {
          return {
            success: false,
            message:
              "Product not found",
          };
        }

        /*
         * Variant validation
         */
        if (
          product.variantsEnabled
        ) {
          const requiresColor =
            colorOptions.length > 0;

          const requiresSize =
            availableSizes.length > 0;

          if (
            requiresColor &&
            !selectedColor
          ) {
            setCartMsg(
              "Please select a color."
            );

            return {
              success: false,
              message:
                "Please select a color",
            };
          }

          if (
            requiresSize &&
            !selectedSize
          ) {
            setCartMsg(
              "Please select a size."
            );

            return {
              success: false,
              message:
                "Please select a size",
            };
          }

          if (
            selectedVariant &&
            Number(
              selectedVariant.stock || 0
            ) <= 0
          ) {
            setCartMsg(
              "This variant is out of stock."
            );

            return {
              success: false,
              message:
                "Selected variant is out of stock",
            };
          }

          if (
            !selectedVariant &&
            (
              requiresColor ||
              requiresSize
            )
          ) {
            setCartMsg(
              "This color and size combination is unavailable."
            );

            return {
              success: false,
              message:
                "Selected variant is unavailable",
            };
          }

          if (
            selectedVariant &&
            quantity >
              Number(
                selectedVariant.stock || 0
              )
          ) {
            setCartMsg(
              `Only ${selectedVariant.stock} units are available.`
            );

            return {
              success: false,
              message:
                "Insufficient stock",
            };
          }
        }

        setCartMsg("");

        const result =
          await addToCart(
            String(product.id),
            Number(quantity) || 1,
            {
              selectedColor:
                selectedColor || "",

              selectedSize:
                selectedSize || "",

              variantId:
                selectedVariant?.id ||
                "",
            }
          );

        if (
          result?.loginRequired
        ) {
          setLoginPrompt(true);
          setCartAdded(false);

          return result;
        }

        if (
          result?.success
        ) {
          setCartAdded(true);
          setCartMsg(
            result?.message ||
              "Added to cart"
          );
        } else {
          setCartAdded(false);
          setCartMsg(
            result?.message ||
              "Unable to add this item."
          );
        }

        return result;
      },
      [
        product,
        addToCart,
        quantity,
        selectedColor,
        selectedSize,
        selectedVariant,
        colorOptions,
        availableSizes,
      ]
    );

  // ---------- BUY NOW ----------

  const handleBuyNow =
    useCallback(async () => {
      const result =
        await handleAddToCart();

      if (
        result?.success
      ) {
        window.location.href =
          "/cart";
      }
    }, [
      handleAddToCart,
    ]);

  // ---------- IMAGE NAVIGATION ----------

  const goToPreviousImage =
    useCallback(() => {
      setActiveImage((current) => {
        const total =
          activeImages.length;

        if (total <= 1) {
          return 0;
        }

        return (
          (current - 1 + total) %
          total
        );
      });
    }, [
      activeImages.length,
    ]);

  const goToNextImage =
    useCallback(() => {
      setActiveImage((current) => {
        const total =
          activeImages.length;

        if (total <= 1) {
          return 0;
        }

        return (
          (current + 1) %
          total
        );
      });
    }, [
      activeImages.length,
    ]);

  // ---------- LOADING ----------

  if (loading) {
    return (
      <>
        <ProductStyles />

        <main className="pd-state">
          <div className="pd-state-box">
            <div
              className="pd-skeleton"
              style={{
                width: "190px",
                height: "245px",
                margin:
                  "0 auto 25px",
              }}
            />

            <div
              className="pd-skeleton pd-skeleton-title"
              style={{
                margin:
                  "0 auto 18px",
              }}
            />

            <div
              className="pd-skeleton pd-skeleton-line"
              style={{
                width: "55%",
                margin:
                  "0 auto 10px",
              }}
            />

            <div
              className="pd-skeleton pd-skeleton-block"
              style={{
                width: "80%",
                margin:
                  "0 auto",
              }}
            />
          </div>
        </main>
      </>
    );
  }

  // ---------- NOT FOUND ----------

  if (!product) {
    return (
      <>
        <ProductStyles />

        <main className="pd-state">
          <div className="pd-state-box">
            <h1>
              Product Not Found
            </h1>

            <p>
              The product you are
              looking for could not
              be found.
            </p>

            <Link
              href="/products"
              className="pd-back-btn"
            >
              <ArrowLeft
                size={15}
              />
              Back to Products
            </Link>
          </div>
        </main>
      </>
    );
  }
    // ---------- DERIVED DISPLAY VALUES ----------

  const imageList =
    activeImages.length > 0
      ? activeImages
      : [PLACEHOLDER_IMAGE];

  const currentImage =
    imageList[
      Math.min(
        activeImage,
        imageList.length - 1
      )
    ] || PLACEHOLDER_IMAGE;

  const selectedPrice = displayPrice;

  const selectedSku =
    selectedVariant?.sku ||
    product.sku ||
    "—";

  const minQty =
    Math.max(
      1,
      Number(product.moq || 1)
    );

  const changeQty = (delta) => {
    setQuantity((current) => {
      const next = current + delta;

      if (next < minQty) {
        return minQty;
      }

      if (
        selectedVariant &&
        Number.isFinite(availableStock) &&
        availableStock > 0
      ) {
        return Math.min(
          next,
          availableStock
        );
      }

      return Math.min(
        next,
        100
      );
    });
  };

  // ---------- RELATED PRODUCT ACTIONS ----------

  const handleRelatedSave = async (
    item
  ) => {
    try {
      await toggleSave(
        String(item._id || item.id)
      );
    } catch (error) {
      console.error(
        "Related wishlist error:",
        error
      );
    }
  };

  const handleRelatedCart = async (
    item
  ) => {
    const id =
      item?._id || item?.id;

    if (!id) return;

    try {
      const result =
        await addToCart(
          String(id),
          1,
          {
            selectedColor: "",
            selectedSize: "",
            variantId: "",
          }
        );

      if (
        result?.loginRequired
      ) {
        setLoginPrompt(true);
        return;
      }

      if (result?.success) {
        setRelatedCartAdded(
          (current) => ({
            ...current,
            [id]: true,
          })
        );

        window.setTimeout(() => {
          setRelatedCartAdded(
            (current) => {
              const next = {
                ...current,
              };

              delete next[id];

              return next;
            }
          );
        }, 2200);
      } else {
        console.error(
          "Related cart error:",
          result?.message
        );
      }
    } catch (error) {
      console.error(
        "Related add to cart error:",
        error
      );
    }
  };

  // ---------- CART ITEM CHECK ----------

  const productIsInCart =
    isInCart(
      String(product.id)
    );

  // ---------- FINAL RENDER ----------

  return (
    <main className="pd-page">
      <ProductStyles />

      <div className="pd-container">

        {/* BREADCRUMB */}

        <nav
          className="pd-breadcrumb"
          aria-label="Breadcrumb"
        >
          <Link href="/">
            Home
          </Link>

          <span aria-hidden="true">
            ›
          </span>

          <Link
            href={
              product.category
                ? `/collection/${product.category}`
                : "/products"
            }
          >
            Collections
          </Link>

          <span aria-hidden="true">
            ›
          </span>

          {product.categoryLabel && (
            <>
              <Link
                href={`/collection/${product.category}`}
              >
                {product.categoryLabel}
              </Link>

              <span aria-hidden="true">
                ›
              </span>
            </>
          )}

          <span className="pd-breadcrumb-current">
            {product.name}
          </span>
        </nav>

        {/* PRODUCT TOP */}

        <section className="pd-top">

          {/* GALLERY */}

          <div className="pd-gallery">

            <div className="pd-thumbs">
              {imageList.map(
                (image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`pd-thumb ${
                      index === activeImage
                        ? "is-active"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveImage(index)
                    }
                    aria-label={`View image ${
                      index + 1
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${
                        index + 1
                      }`}
                      loading={
                        index === 0
                          ? "eager"
                          : "lazy"
                      }
                      onError={
                        handleImageError
                      }
                    />
                  </button>
                )
              )}
            </div>

            <div className="pd-main-image">

              <img
                src={currentImage}
                alt={product.name}
                onError={
                  handleImageError
                }
              />

              {imageList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={
                      goToPreviousImage
                    }
                    aria-label="Previous image"
                    style={{
                      position:
                        "absolute",
                      left: 12,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      width: 38,
                      height: 38,
                      border: "none",
                      borderRadius:
                        "50%",
                      background:
                        "rgba(255,255,255,.94)",
                      color:
                        "#295C65",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      cursor:
                        "pointer",
                      zIndex: 3,
                    }}
                  >
                    <ArrowLeft
                      size={17}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      goToNextImage
                    }
                    aria-label="Next image"
                    style={{
                      position:
                        "absolute",
                      right: 12,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      width: 38,
                      height: 38,
                      border: "none",
                      borderRadius:
                        "50%",
                      background:
                        "rgba(255,255,255,.94)",
                      color:
                        "#295C65",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      cursor:
                        "pointer",
                      zIndex: 3,
                    }}
                  >
                    <ArrowRight
                      size={17}
                    />
                  </button>
                </>
              )}

              <button
                type="button"
                className="pd-zoom"
                aria-label="View full image"
                onClick={() => {
                  const image =
                    currentImage;

                  if (
                    image &&
                    typeof window !==
                      "undefined"
                  ) {
                    window.open(
                      image,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }
                }}
              >
                <ZoomIn size={17} />
              </button>
            </div>

          </div>

          {/* PRODUCT INFO */}

          <div className="pd-info">

            {product.badge && (
              <span className="pd-badge">
                {product.badge}
              </span>
            )}

            <h1 className="pd-title">
              {product.name}
            </h1>

            <div className="pd-price-row">

              <span className="pd-price">
                ₹{selectedPrice}
              </span>

              {hasSalePrice && (
                <span
                  style={{
                    color:
                      "#9A938B",
                    fontSize: 13,
                    textDecoration:
                      "line-through",
                  }}
                >
                  ₹
                  {
                    regularDisplayPrice
                  }
                </span>
              )}

              <span className="pd-price-unit">
                ({product.priceUnit})
              </span>

              <span className="pd-sku">
                SKU: {selectedSku}
              </span>

            </div>

            {product.description && (
              <p className="pd-description">
                {product.description}
              </p>
            )}

            {/* PRODUCT SPECS */}

            <div className="pd-specs">

              <div className="pd-spec">
                <div className="pd-spec-icon">
                  <Leaf
                    size={18}
                    strokeWidth={1.7}
                  />
                </div>

                <div className="pd-spec-copy">
                  <span className="pd-spec-label">
                    GSM
                  </span>

                  <span className="pd-spec-value">
                    {product.gsm}
                  </span>
                </div>
              </div>

              <div className="pd-spec">
                <div className="pd-spec-icon">
                  <ArrowRight
                    size={18}
                    strokeWidth={1.7}
                  />
                </div>

                <div className="pd-spec-copy">
                  <span className="pd-spec-label">
                    WIDTH
                  </span>

                  <span className="pd-spec-value">
                    {product.width}
                  </span>
                </div>
              </div>

              <div className="pd-spec">
                <div className="pd-spec-icon">
                  <Leaf
                    size={18}
                    strokeWidth={1.7}
                  />
                </div>

                <div className="pd-spec-copy">
                  <span className="pd-spec-label">
                    COMPOSITION
                  </span>

                  <span className="pd-spec-value">
                    {product.composition}
                  </span>
                </div>
              </div>

              <div className="pd-spec">
                <div className="pd-spec-icon">
                  <ShoppingCart
                    size={18}
                    strokeWidth={1.7}
                  />
                </div>

                <div className="pd-spec-copy">
                  <span className="pd-spec-label">
                    MOQ
                  </span>

                  <span className="pd-spec-value">
                    {product.moq} Metres
                  </span>
                </div>
              </div>

            </div>

            {/* COLOR */}

            {colorOptions.length > 0 && (
              <div className="pd-colors">

                <span className="pd-colors-title">
                  {selectedColor
                    ? `COLOR — ${
                        getOptionName(
                          selectedColor
                        )
                      }`
                    : "COLOR"}
                </span>

                <div className="pd-swatch-row">

                  {colorOptions.map(
                    (color, index) => (
                      <button
                        key={`${product.id}-color-${index}`}
                        type="button"
                        className={`pd-swatch ${
                          activeColor ===
                          index
                            ? "is-active"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            color.hex ||
                            color.value ||
                            "#D9D1C7",
                        }}
                        onClick={() =>
                          handleColorChange(
                            index
                          )
                        }
                        aria-label={`Select color ${
                          color.name
                        }`}
                        aria-pressed={
                          activeColor ===
                          index
                        }
                        title={
                          color.name
                        }
                      />
                    )
                  )}

                </div>
              </div>
            )}

            {/* SIZE */}

            {availableSizes.length > 0 && (
              <div className="pd-colors">

                <span className="pd-colors-title">
                  {selectedSize
                    ? `SIZE — ${selectedSize}`
                    : "SIZE"}
                </span>

                <div
                  className="pd-swatch-row"
                  style={{
                    gap: 8,
                  }}
                >
                  {availableSizes.map(
                    (size, index) => {
                      const sizeValue =
                        getOptionValue(
                          size
                        ) ||
                        getOptionName(
                          size
                        );

                      const active =
                        String(
                          selectedSize
                        ).toLowerCase() ===
                        String(
                          sizeValue
                        ).toLowerCase();

                      const matchingVariant =
                        product.variants?.find(
                          (variant) => {
                            const colorMatch =
                              selectedColor
                                ? optionMatches(
                                    variant?.color ||
                                      {
                                        name:
                                          variant?.colorName,
                                        value:
                                          variant?.colorValue,
                                        hex:
                                          variant?.colorHex,
                                      },
                                    selectedColor
                                  )
                                : true;

                            const sizeMatch =
                              optionMatches(
                                variant?.size ||
                                  {
                                    name:
                                      variant?.sizeName,
                                    value:
                                      variant?.sizeValue,
                                  },
                                size
                              );

                            return (
                              colorMatch &&
                              sizeMatch &&
                              variant?.active
                            );
                          }
                        );

                      const sizeOutOfStock =
                        Boolean(
                          matchingVariant &&
                          Number(
                            matchingVariant.stock ||
                              0
                          ) <= 0
                        );

                      return (
                        <button
                          key={`${product.id}-size-${index}`}
                          type="button"
                          onClick={() =>
                            !sizeOutOfStock &&
                            handleSizeChange(
                              size
                            )
                          }
                          disabled={
                            sizeOutOfStock
                          }
                          aria-pressed={
                            active
                          }
                          style={{
                            minWidth: 48,
                            minHeight: 34,
                            padding:
                              "6px 12px",
                            border:
                              active
                                ? "2px solid #295C65"
                                : "1px solid #DCD4CB",
                            borderRadius: 7,
                            background:
                              active
                                ? "#295C65"
                                : sizeOutOfStock
                                ? "#F3F0EC"
                                : "#FFFFFF",
                            color:
                              active
                                ? "#FFFFFF"
                                : sizeOutOfStock
                                ? "#B5ADA4"
                                : "#295C65",
                            cursor:
                              sizeOutOfStock
                                ? "not-allowed"
                                : "pointer",
                            fontFamily:
                              "inherit",
                            fontSize: 11,
                            fontWeight: 600,
                            opacity:
                              sizeOutOfStock
                                ? 0.6
                                : 1,
                          }}
                        >
                          {getOptionName(
                            size
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

              </div>
            )}

            {/* SELECTED VARIANT */}

            {selectedVariant && (
              <div
                style={{
                  color: "#696968",
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                SKU: {selectedSku}

                {" • "}

                {selectedVariant.stock >
                0
                  ? `${selectedVariant.stock} available`
                  : "Out of stock"}
              </div>
            )}

            {/* QUANTITY */}

            <div className="pd-quantity-section">

              <span className="pd-quantity-label">
                Quantity (Metres)
              </span>

              <div className="pd-quantity-row">

                <div className="pd-quantity-control">

                  <button
                    type="button"
                    onClick={() =>
                      changeQty(-1)
                    }
                    disabled={
                      quantity <= minQty
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>

                  <span className="pd-quantity-number">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      changeQty(1)
                    }
                    disabled={
                      Boolean(
                        selectedVariant &&
                        availableStock !==
                          null &&
                        quantity >=
                          availableStock
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>

                </div>

                <CartStatusButton
                  productId={product.id}
                  quantity={quantity}
                  selectedColor={
                    selectedColor
                  }
                  selectedSize={
                    selectedSize
                  }
                  variantId={
                    selectedVariant?.id ||
                    ""
                  }
                  onAdd={
                    handleAddToCart
                  }
                  showLabel={
                    true
                  }
                />

                <span className="pd-min-order">
                  Minimum order:{" "}
                  {product.moq} Metres
                </span>

              </div>

              {cartMsg && (
                <div
                  style={{
                    color:
                      cartMsg
                        .toLowerCase()
                        .includes(
                          "added"
                        )
                        ? "#1A7A45"
                        : "#9C4B37",
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1.4,
                  }}
                >
                  {cartMsg}
                </div>
              )}

              {loginPrompt && (
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: 8,
                    color:
                      "#9C4B37",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  Please login to add
                  items to cart.
                </div>
              )}

            </div>

            {/* MAIN ACTIONS */}

            <div className="pd-main-actions">

              <button
                type="button"
                className="pd-main-button pd-buy-now"
                onClick={
                  handleBuyNow
                }
                disabled={
                  isOutOfStock
                }
              >
                <ArrowRight
                  size={17}
                  strokeWidth={2.2}
                />
                {isOutOfStock
                  ? "Out of Stock"
                  : "Buy Now"}
              </button>

              <Link
                href="#quote"
                className="pd-main-button pd-request-quote"
              >
                <FileText
                  size={17}
                  strokeWidth={2}
                />
                Request Quote
              </Link>

            </div>

            {/* TRUST */}

            <div className="pd-trust-row">

              <div className="pd-trust-item">
                <ShieldCheck
                  size={17}
                />
                <span>
                  Secure Payments
                </span>
              </div>

              <div className="pd-trust-item">
                <Truck size={17} />
                <span>
                  Worldwide Shipping
                </span>
              </div>

              <div className="pd-trust-item">
                <FileText
                  size={17}
                />
                <span>
                  Bulk Enquiries
                </span>
              </div>

            </div>

          </div>
        </section>

        {/* TABS */}

        <section className="pd-tabs">

          <div
            className="pd-tabs-nav"
            role="tablist"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={
                  activeTab ===
                  tab.id
                }
                className={`pd-tab ${
                  activeTab ===
                  tab.id
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    tab.id
                  )
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pd-tab-content">

            {activeTab ===
              "description" && (
              <>
                <h2>
                  Product Description
                </h2>

                <p>
                  {product.longDescription ||
                    product.description ||
                    "Description coming soon."}
                </p>
              </>
            )}

            {activeTab ===
              "specifications" && (
              <ul className="pd-spec-list">

                <li>
                  <strong>
                    GSM:
                  </strong>{" "}
                  {product.gsm}
                </li>

                <li>
                  <strong>
                    Width:
                  </strong>{" "}
                  {product.width}
                </li>

                <li>
                  <strong>
                    Composition:
                  </strong>{" "}
                  {product.composition}
                </li>

                <li>
                  <strong>
                    MOQ:
                  </strong>{" "}
                  {product.moq} Metres
                </li>

                <li>
                  <strong>
                    SKU:
                  </strong>{" "}
                  {selectedSku}
                </li>

                <li>
                  <strong>
                    Price:
                  </strong>{" "}
                  ₹{selectedPrice}{" "}
                  ({product.priceUnit})
                </li>

              </ul>
            )}

            {activeTab ===
              "care" && (
              <p>
                {product.care ||
                  "Please follow the recommended fabric care instructions."}
              </p>
            )}

            {activeTab ===
              "shipping" && (
              <p>
                {product.shipping ||
                  "Worldwide shipping is available. Bulk orders may require additional lead time."}
              </p>
            )}

          </div>

        </section>

        {/* FEATURE BAND */}

        <section className="pd-feature-band">

          <div className="pd-feature">
            <div className="pd-feature-icon">
              <Leaf
                size={25}
                strokeWidth={1.5}
              />
            </div>

            <strong className="pd-feature-title">
              Breathable
            </strong>

            <span className="pd-feature-text">
              Keeps you comfortable
              all day
            </span>
          </div>

          <div className="pd-feature">
            <div className="pd-feature-icon">
              <ShieldCheck
                size={25}
                strokeWidth={1.5}
              />
            </div>

            <strong className="pd-feature-title">
              Premium Quality
            </strong>

            <span className="pd-feature-text">
              Finest fabric
              selection
            </span>
          </div>

          <div className="pd-feature">
            <div className="pd-feature-icon">
              <ArrowRight
                size={25}
                strokeWidth={1.5}
              />
            </div>

            <strong className="pd-feature-title">
              Versatile Use
            </strong>

            <span className="pd-feature-text">
              Ideal for multiple
              apparel
            </span>
          </div>

          <div className="pd-feature">
            <div className="pd-feature-icon">
              <Leaf
                size={25}
                strokeWidth={1.5}
              />
            </div>

            <strong className="pd-feature-title">
              Eco Friendly
            </strong>

            <span className="pd-feature-text">
              A sustainable choice
            </span>
          </div>

        </section>

        {/* RELATED PRODUCTS */}

        {relatedProducts.length >
          0 && (
          <section className="pd-related">

            <h2 className="pd-related-heading">
              You May Also Like
            </h2>

            <div className="pd-related-grid">

              {relatedProducts.map(
                (item) => {
                  const itemId =
                    String(
                      item._id ||
                        item.id
                    );

                  const added =
                    Boolean(
                      relatedCartAdded[
                        itemId
                      ]
                    );

                  const itemSaved =
                    isSaved(
                      itemId
                    );

                  return (
                    <article
                      key={itemId}
                      className="pd-related-card"
                    >

                      <Link
                        href={`/products/${item.slug}`}
                        className="pd-related-image"
                        aria-label={`View ${item.name}`}
                      >
                        <img
                          src={
                            item.images?.[
                              0
                            ] ||
                            PLACEHOLDER_IMAGE
                          }
                          alt={
                            item.name
                          }
                          loading="lazy"
                          onError={
                            handleImageError
                          }
                        />
                      </Link>

                      <button
                        type="button"
                        className={`pd-related-save ${
                          itemSaved
                            ? "is-saved"
                            : ""
                        }`}
                        onClick={() =>
                          handleRelatedSave(
                            item
                          )
                        }
                        aria-label={
                          itemSaved
                            ? "Remove from wishlist"
                            : "Save product"
                        }
                        aria-pressed={
                          itemSaved
                        }
                      >
                        <Heart
                          size={16}
                          strokeWidth={1.9}
                          fill={
                            itemSaved
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                      {item.badge && (
                        <span className="pd-related-badge">
                          {item.badge}
                        </span>
                      )}

                      <Link
                        href={`/products/${item.slug}`}
                        className="pd-related-body"
                      >
                        <span className="pd-related-name">
                          {item.name}
                        </span>

                        <span className="pd-related-meta">
                          {item.gsm}
                          {" | "}
                          {item.width}
                        </span>

                        {item.colors?.length >
                          0 && (
                          <span className="pd-related-colors">
                            {item.colors
                              .slice(
                                0,
                                5
                              )
                              .map(
                                (
                                  color,
                                  index
                                ) => (
                                  <span
                                    key={`${itemId}-${index}`}
                                    className="pd-related-color"
                                    style={{
                                      backgroundColor:
                                        color,
                                    }}
                                  />
                                )
                              )}
                          </span>
                        )}

                        <span className="pd-related-price">
                          ₹{item.price}
                        </span>
                      </Link>

                      <div
                        style={{
                          position:
                            "absolute",
                          right: 10,
                          bottom: 10,
                          zIndex: 8,
                        }}
                      >
                        {added ? (
                          <button
                            type="button"
                            className="pd-related-cart is-added"
                            aria-label="Added to cart"
                          >
                            <span className="pd-related-cart-icon check-in">
                              <Check
                                size={17}
                                strokeWidth={
                                  2.5
                                }
                              />
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="pd-related-cart"
                            onClick={() =>
                              handleRelatedCart(
                                item
                              )
                            }
                            aria-label="Add to cart"
                          >
                            <span className="pd-related-cart-icon cart-in">
                              <ShoppingCart
                                size={
                                  17
                                }
                                strokeWidth={
                                  2
                                }
                              />
                            </span>
                          </button>
                        )}
                      </div>

                    </article>
                  );
                }
              )}

            </div>

          </section>
        )}

      </div>
    </main>
  );
}
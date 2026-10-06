"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  FileText,
  Mail,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  darkCream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  ink: "#1A1A1A",
};

const LAST_UPDATED = "12 September 2026";

export default function TermsOfUsePage() {
  return (
    <main className="terms-page">
      <style>{`

        /* =================================================
           PAGE
        ================================================= */

        .terms-page {
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

        .terms-container {
          width: 100%;
          max-width: 1400px;

          margin: 0 auto;

          padding: 0 32px;

          box-sizing: border-box;
        }


        /* =================================================
           BREADCRUMB
        ================================================= */

        .terms-breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;

          margin-bottom: 22px;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;
        }


        .terms-breadcrumb a {
          color: ${COLORS.navGray};

          text-decoration: none;
        }


        .terms-breadcrumb a:hover {
          color: ${COLORS.teal};
        }


        .terms-breadcrumb-current {
          color: ${COLORS.teal};

          font-weight: 500;
        }


        /* =================================================
           HEADER
        ================================================= */

        .terms-header {
          width: 100%;

          padding: 34px 38px;

          background: ${COLORS.darkCream};

          border: 1px solid #E7DFD6;

          border-radius: 14px;

          box-sizing: border-box;

          margin-bottom: 25px;
        }


        .terms-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-bottom: 10px;

          color: ${COLORS.gold};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10px;

          font-weight: 600;

          letter-spacing: 3px;

          text-transform: uppercase;
        }


        .terms-eyebrow-line {
          width: 30px;
          height: 1px;

          display: inline-block;

          background: ${COLORS.gold};
        }


        .terms-title {
          margin: 0 0 9px;

          color: ${COLORS.teal};

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 54px;

          font-weight: 600;

          line-height: .98;
        }


        .terms-intro {
          width: 100%;
          max-width: 800px;

          margin: 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 13px;

          line-height: 1.65;
        }


        .terms-updated {
          margin: 14px 0 0;

          color: #817A72;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10px;
        }


        /* =================================================
           LAYOUT
        ================================================= */

        .terms-layout {
          width: 100%;

          display: grid;

          grid-template-columns:
            230px
            minmax(
              0,
              1fr
            );

          gap: 28px;

          align-items: start;
        }


        /* =================================================
           SIDEBAR
        ================================================= */

        .terms-sidebar {
          position: sticky;

          top: 24px;

          width: 100%;

          background: ${COLORS.white};

          border: 1px solid #E7E0D8;

          border-radius: 12px;

          padding: 14px;

          box-sizing: border-box;
        }


        .terms-sidebar-title {
          margin: 0 0 11px;

          padding: 2px 8px;

          color: #20363C;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;

          font-weight: 600;

          letter-spacing: 1px;

          text-transform: uppercase;
        }


        .terms-sidebar-nav {
          display: flex;

          flex-direction: column;

          gap: 2px;
        }


        .terms-sidebar-link {
          width: 100%;

          min-height: 37px;

          display: flex;

          align-items: center;

          gap: 8px;

          padding: 0 9px;

          border-radius: 7px;

          color: ${COLORS.navGray};

          text-decoration: none;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10px;

          box-sizing: border-box;

          transition:
            background .2s ease,
            color .2s ease;
        }


        .terms-sidebar-link:hover,
        .terms-sidebar-link.active {
          background: #EAF0EE;

          color: ${COLORS.teal};
        }


        .terms-sidebar-link svg {
          flex-shrink: 0;

          width: 14px;
          height: 14px;
        }


        /* =================================================
           CONTENT
        ================================================= */

        .terms-content {
          width: 100%;
          min-width: 0;

          background: ${COLORS.white};

          border: 1px solid #E7E0D8;

          border-radius: 12px;

          padding: 35px 40px;

          box-sizing: border-box;
        }


        /* =================================================
           SECTION
        ================================================= */

        .terms-section {
          width: 100%;

          scroll-margin-top: 25px;
        }


        .terms-section + .terms-section {
          margin-top: 36px;

          padding-top: 34px;

          border-top: 1px solid #ECE5DE;
        }


        .terms-section h2 {
          margin: 0 0 12px;

          color: ${COLORS.teal};

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 28px;

          font-weight: 600;

          line-height: 1.05;
        }


        .terms-section h3 {
          margin: 20px 0 8px;

          color: #20383F;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 14px;

          font-weight: 600;
        }


        .terms-section p {
          margin: 0 0 12px;

          color: #646462;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 12.5px;

          line-height: 1.75;
        }


        .terms-section ul,
        .terms-section ol {
          margin:
            8px 0 13px;

          padding-left:
            20px;

          color: #646462;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 12.5px;

          line-height: 1.75;
        }


        .terms-section li {
          margin-bottom: 5px;
        }


        .terms-section strong {
          color: #354C52;

          font-weight: 600;
        }


        /* =================================================
           INFO BOX
        ================================================= */

        .terms-info-box {
          width: 100%;

          margin: 16px 0;

          padding: 16px 18px;

          background: #F5F1EB;

          border-left:
            3px solid
            ${COLORS.gold};

          border-radius: 7px;

          box-sizing: border-box;
        }


        .terms-info-box p {
          margin: 0;

          font-size: 11.5px;

          line-height: 1.65;
        }


        /* =================================================
           HIGHLIGHT GRID
        ================================================= */

        .terms-highlight-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            1fr
            1fr;

          gap: 10px;

          margin: 15px 0;
        }


        .terms-highlight-card {
          min-width: 0;

          padding: 14px;

          background: #FCFAF8;

          border:
            1px solid
            #E9E2DA;

          border-radius: 8px;

          box-sizing: border-box;
        }


        .terms-highlight-title {
          margin: 0 0 5px;

          color: ${COLORS.teal};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;

          font-weight: 600;
        }


        .terms-highlight-text {
          margin: 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10.5px;

          line-height: 1.55;
        }


        /* =================================================
           CONTACT
        ================================================= */

        .terms-contact-box {
          width: 100%;

          display: flex;

          align-items: flex-start;

          gap: 12px;

          margin-top: 16px;

          padding: 17px;

          background: #FCFAF8;

          border:
            1px solid
            #E7E0D8;

          border-radius: 8px;

          box-sizing: border-box;
        }


        .terms-contact-icon {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #EAF0EE;

          color: ${COLORS.teal};
        }


        .terms-contact-content {
          min-width: 0;
        }


        .terms-contact-title {
          margin: 0 0 3px;

          color: #20383F;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;

          font-weight: 600;
        }


        .terms-contact-text {
          margin: 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10.5px;

          line-height: 1.55;
        }


        .terms-contact-text a {
          color:
            ${COLORS.teal};

          text-decoration: none;
        }


        .terms-contact-text a:hover {
          color: ${COLORS.gold};
        }


        /* =================================================
           MOBILE NAV
        ================================================= */

        .terms-mobile-nav {
          display: none;
        }


        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1000px) {

          .terms-layout {
            grid-template-columns:
              190px
              minmax(0, 1fr);

            gap: 18px;
          }

          .terms-content {
            padding: 28px;
          }

          .terms-title {
            font-size: 47px;
          }

          .terms-highlight-grid {
            grid-template-columns: 1fr;
          }

        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 700px) {

          .terms-page {
            width: 100%;

            padding:
              28px 0 45px;

            overflow-x: hidden;
          }


          /* MAIN CONTAINER */

          .terms-container {
            width: 100%;
            max-width: 100%;

            margin: 0;

            padding:
              0 16px;

            box-sizing: border-box;
          }


          /* BREADCRUMB */

          .terms-breadcrumb {
            width: 100%;

            display: flex;

            align-items: center;

            gap: 5px;

            margin-bottom:
              13px;

            font-size:
              9px;

            line-height:
              1.35;

            overflow: hidden;
          }

          .terms-breadcrumb a,
          .terms-breadcrumb-current {
            min-width: 0;

            white-space:
              nowrap;

            overflow:
              hidden;

            text-overflow:
              ellipsis;
          }

          .terms-breadcrumb svg {
            width: 10px;
            height: 10px;

            flex-shrink: 0;
          }


          /* HEADER */

          .terms-header {
            width: 100%;

            padding:
              22px 16px;

            margin-bottom:
              15px;

            border-radius:
              10px;

            box-sizing:
              border-box;
          }


          .terms-eyebrow {
            gap:
              7px;

            margin-bottom:
              8px;

            font-size:
              8px;

            letter-spacing:
              2.4px;

            line-height:
              1.2;
          }

          .terms-eyebrow-line {
            width:
              23px;

            flex-shrink: 0;
          }


          .terms-title {
            width: 100%;

            margin:
              0 0 8px;

            font-size:
              36px;

            line-height:
              .98;

            overflow-wrap:
              anywhere;
          }


          .terms-intro {
            width: 100%;
            max-width: 100%;

            font-size:
              9.5px;

            line-height:
              1.6;

            overflow-wrap:
              anywhere;
          }


          .terms-updated {
            margin-top:
              9px;

            font-size:
              8px;

            line-height:
              1.4;
          }


          /* MOBILE TOP NAV */

          .terms-mobile-nav {
            width: 100%;

            display: flex;

            align-items: center;

            gap: 6px;

            margin:
              0 0 12px;

            padding:
              1px 0 3px;

            overflow-x:
              auto;

            overflow-y:
              hidden;

            scrollbar-width:
              none;

            -webkit-overflow-scrolling:
              touch;

            box-sizing:
              border-box;
          }


          .terms-mobile-nav::-webkit-scrollbar {
            display: none;
          }


          .terms-mobile-link {
            flex:
              0 0 auto;

            min-height:
              31px;

            display:
              inline-flex;

            align-items:
              center;

            justify-content:
              center;

            padding:
              0 10px;

            border:
              1px solid #E1D9D1;

            border-radius:
              999px;

            background:
              #FFFFFF;

            color:
              ${COLORS.navGray};

            text-decoration:
              none;

            font-family:
              "Poppins",
              Arial,
              sans-serif;

            font-size:
              8px;

            line-height:
              1;

            white-space:
              nowrap;

            box-sizing:
              border-box;

            transition:
              background .2s ease,
              border-color .2s ease,
              color .2s ease;
          }


          .terms-mobile-link:first-child {
            background:
              #EAF0EE;

            border-color:
              #D5E2DF;

            color:
              ${COLORS.teal};
          }


          /* MAIN LAYOUT */

          .terms-layout {
            width: 100%;

            display:
              block;

            box-sizing:
              border-box;
          }


          /* DESKTOP SIDEBAR OFF */

          .terms-sidebar {
            display:
              none;
          }


          /* CONTENT */

          .terms-content {
            width:
              100%;

            min-width:
              0;

            padding:
              20px 16px;

            border-radius:
              10px;

            box-sizing:
              border-box;

            overflow:
              hidden;
          }


          /* SECTION */

          .terms-section {
            width:
              100%;

            min-width:
              0;

            scroll-margin-top:
              18px;
          }


          .terms-section + .terms-section {
            margin-top:
              27px;

            padding-top:
              25px;
          }


          .terms-section h2 {
            width:
              100%;

            margin:
              0 0 9px;

            font-size:
              23px;

            line-height:
              1.08;

            overflow-wrap:
              anywhere;
          }


          .terms-section h3 {
            margin:
              15px 0 6px;

            font-size:
              11px;

            line-height:
              1.4;
          }


          .terms-section p {
            width:
              100%;

            margin:
              0 0 9px;

            font-size:
              9.8px;

            line-height:
              1.68;

            overflow-wrap:
              anywhere;
            word-break:
              normal;
          }


          .terms-section ul,
          .terms-section ol {
            width:
              100%;

            margin:
              6px 0 10px;

            padding-left:
              17px;

            font-size:
              9.8px;

            line-height:
              1.68;

            box-sizing:
              border-box;
          }


          .terms-section li {
            margin-bottom:
              4px;

            overflow-wrap:
              anywhere;
          }


          /* INFO BOX */

          .terms-info-box {
            width:
              100%;

            margin:
              12px 0;

            padding:
              11px 12px;

            box-sizing:
              border-box;
          }


          .terms-info-box p {
            margin:
              0;

            font-size:
              8.8px;

            line-height:
              1.6;
          }


          /* HIGHLIGHT CARDS */

          .terms-highlight-grid {
            width:
              100%;

            grid-template-columns:
              1fr;

            gap:
              8px;

            margin:
              12px 0;
          }


          .terms-highlight-card {
            width:
              100%;

            padding:
              11px;

            border-radius:
              7px;

            box-sizing:
              border-box;
          }


          .terms-highlight-title {
            margin:
              0 0 4px;

            font-size:
              9.5px;

            line-height:
              1.3;
          }


          .terms-highlight-text {
            margin:
              0;

            font-size:
              8.8px;

            line-height:
              1.55;

            overflow-wrap:
              anywhere;
          }


          /* CONTACT */

          .terms-contact-box {
            width:
              100%;

            display:
              flex;

            align-items:
              flex-start;

            gap:
              9px;

            margin-top:
              12px;

            padding:
              11px;

            border-radius:
              7px;

            box-sizing:
              border-box;
          }


          .terms-contact-icon {
            width:
              32px;

            height:
              32px;

            flex-shrink:
              0;
          }


          .terms-contact-icon svg {
            width:
              15px;

            height:
              15px;
          }


          .terms-contact-content {
            min-width:
              0;
          }


          .terms-contact-title {
            margin:
              0 0 3px;

            font-size:
              9.2px;

            line-height:
              1.3;
          }


          .terms-contact-text {
            margin:
              0;

            font-size:
              8.8px;

            line-height:
              1.55;

            overflow-wrap:
              anywhere;
          }

        }


        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 480px) {

          .terms-page {
            padding:
              24px 0 40px;
          }


          .terms-container {
            padding:
              0 16px;
          }


          .terms-breadcrumb {
            font-size:
              8.5px;

            margin-bottom:
              12px;
          }


          .terms-header {
            padding:
              20px 14px;

            margin-bottom:
              13px;
          }


          .terms-eyebrow {
            font-size:
              7.5px;

            letter-spacing:
              2.2px;

            gap:
              6px;
          }


          .terms-eyebrow-line {
            width:
              21px;
          }


          .terms-title {
            font-size:
              33px;
          }


          .terms-intro {
            font-size:
              9px;

            line-height:
              1.58;
          }


          .terms-updated {
            font-size:
              7.5px;
          }


          .terms-mobile-nav {
            gap:
              5px;

            margin-bottom:
              10px;
          }


          .terms-mobile-link {
            min-height:
              29px;

            padding:
              0 9px;

            font-size:
              7.5px;
          }


          .terms-content {
            padding:
              18px 13px;
          }


          .terms-section + .terms-section {
            margin-top:
              24px;

            padding-top:
              23px;
          }


          .terms-section h2 {
            font-size:
              21px;

            line-height:
              1.08;
          }


          .terms-section h3 {
            font-size:
              10px;

            margin:
              14px 0 6px;
          }


          .terms-section p,
          .terms-section ul,
          .terms-section ol {
            font-size:
              9.1px;

            line-height:
              1.64;
          }


          .terms-info-box {
            padding:
              10px 11px;
          }


          .terms-info-box p {
            font-size:
              8.3px;
          }


          .terms-highlight-card {
            padding:
              10px;
          }


          .terms-highlight-title {
            font-size:
              9px;
          }


          .terms-highlight-text {
            font-size:
              8.4px;
          }


          .terms-contact-box {
            padding:
              10px;
          }


          .terms-contact-icon {
            width:
              30px;

            height:
              30px;
          }


          .terms-contact-title {
            font-size:
              9px;
          }


          .terms-contact-text {
            font-size:
              8.4px;
          }

        }


        /* =================================================
           VERY SMALL MOBILE
        ================================================= */

        @media (max-width: 380px) {

          .terms-title {
            font-size:
              31px;
          }


          .terms-header {
            padding:
              19px 13px;
          }


          .terms-intro {
            font-size:
              8.7px;
          }


          .terms-content {
            padding:
              17px 12px;
          }


          .terms-section h2 {
            font-size:
              20px;
          }


          .terms-section p,
          .terms-section ul,
          .terms-section ol {
            font-size:
              8.9px;
          }

        }


        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {

          .terms-page * {
            transition:
              none !important;
          }

        }

      `}</style>


      <div className="terms-container">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="terms-breadcrumb">

          <Link href="/">
            Home
          </Link>

          <ChevronRight size={12} />

          <span className="terms-breadcrumb-current">
            Terms of Use
          </span>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="terms-header">

          <div className="terms-eyebrow">

            <span className="terms-eyebrow-line" />

            LEGAL & TERMS

          </div>


          <h1 className="terms-title">
            Terms of Use
          </h1>


          <p className="terms-intro">
            These Terms of Use govern your use
            of the Bhavya Fabrics website,
            including browsing, account
            registration, product purchases,
            quotations, wholesale enquiries,
            custom manufacturing requests and
            other services provided through the
            website.
          </p>


          <p className="terms-updated">
            Last updated: {LAST_UPDATED}
          </p>

        </header>


        {/* =================================================
            MOBILE NAV
        ================================================= */}

        <nav
          className="terms-mobile-nav"
          aria-label="Terms sections"
        >

          <a
            href="#acceptance"
            className="terms-mobile-link"
          >
            Acceptance
          </a>

          <a
            href="#website"
            className="terms-mobile-link"
          >
            Website
          </a>

          <a
            href="#accounts"
            className="terms-mobile-link"
          >
            Accounts
          </a>

          <a
            href="#orders"
            className="terms-mobile-link"
          >
            Orders
          </a>

          <a
            href="#enquiries"
            className="terms-mobile-link"
          >
            Enquiries
          </a>

          <a
            href="#pricing"
            className="terms-mobile-link"
          >
            Pricing
          </a>

          <a
            href="#intellectual"
            className="terms-mobile-link"
          >
            IP
          </a>

          <a
            href="#liability"
            className="terms-mobile-link"
          >
            Liability
          </a>

          <a
            href="#contact"
            className="terms-mobile-link"
          >
            Contact
          </a>

        </nav>


        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="terms-layout">

          {/* =================================================
              DESKTOP SIDEBAR
          ================================================= */}

          <aside className="terms-sidebar">

            <p className="terms-sidebar-title">
              On this page
            </p>


            <nav className="terms-sidebar-nav">

              <a
                href="#acceptance"
                className="terms-sidebar-link active"
              >
                <FileText size={14} />
                Acceptance
              </a>


              <a
                href="#website"
                className="terms-sidebar-link"
              >
                <ShieldCheck size={14} />
                Website Use
              </a>


              <a
                href="#accounts"
                className="terms-sidebar-link"
              >
                <UserRound size={14} />
                Accounts
              </a>


              <a
                href="#products"
                className="terms-sidebar-link"
              >
                <ShoppingBag size={14} />
                Products
              </a>


              <a
                href="#orders"
                className="terms-sidebar-link"
              >
                <ShoppingBag size={14} />
                Orders & Payments
              </a>


              <a
                href="#enquiries"
                className="terms-sidebar-link"
              >
                <Mail size={14} />
                B2B Enquiries
              </a>


              <a
                href="#pricing"
                className="terms-sidebar-link"
              >
                <FileText size={14} />
                Pricing & Availability
              </a>


              <a
                href="#shipping"
                className="terms-sidebar-link"
              >
                <ShoppingBag size={14} />
                Shipping & Delivery
              </a>


              <a
                href="#intellectual"
                className="terms-sidebar-link"
              >
                <ShieldCheck size={14} />
                Intellectual Property
              </a>


              <a
                href="#liability"
                className="terms-sidebar-link"
              >
                <ShieldCheck size={14} />
                Liability
              </a>


              <a
                href="#termination"
                className="terms-sidebar-link"
              >
                <FileText size={14} />
                Termination
              </a>


              <a
                href="#law"
                className="terms-sidebar-link"
              >
                <FileText size={14} />
                Governing Law
              </a>


              <a
                href="#contact"
                className="terms-sidebar-link"
              >
                <Mail size={14} />
                Contact Us
              </a>

            </nav>

          </aside>


          {/* =================================================
              CONTENT
          ================================================= */}

          <article className="terms-content">

            {/* =================================================
                1
            ================================================= */}

            <section
              id="acceptance"
              className="terms-section"
            >

              <h2>
                1. Acceptance of Terms
              </h2>


              <p>
                By accessing or using the
                Bhavya Fabrics website, you
                agree to be bound by these
                Terms of Use and any policies
                referenced in them.
              </p>


              <p>
                If you do not agree with these
                terms, please do not use the
                website or its services.
              </p>


              <div className="terms-info-box">

                <p>
                  These Terms apply to both
                  individual customers purchasing
                  fabrics online and businesses
                  submitting wholesale, sourcing,
                  manufacturing or export enquiries.
                </p>

              </div>

            </section>


            {/* =================================================
                2
            ================================================= */}

            <section
              id="website"
              className="terms-section"
            >

              <h2>
                2. Use of the Website
              </h2>


              <p>
                You may use the website only
                for lawful purposes and in
                accordance with these Terms.
              </p>


              <p>
                You agree not to:
              </p>


              <ul>

                <li>
                  Use the website for unlawful,
                  fraudulent or deceptive
                  activities.
                </li>

                <li>
                  Attempt to gain unauthorized
                  access to the website,
                  accounts or systems.
                </li>

                <li>
                  Interfere with the security,
                  availability or operation of
                  the website.
                </li>

                <li>
                  Copy, reproduce or commercially
                  exploit website content without
                  authorization.
                </li>

                <li>
                  Submit false, misleading or
                  unauthorized information.
                </li>

              </ul>

            </section>


            {/* =================================================
                3 ACCOUNTS
            ================================================= */}

            <section
              id="accounts"
              className="terms-section"
            >

              <h2>
                3. Customer Accounts
              </h2>


              <p>
                Certain website features may
                require you to create an account.
                You are responsible for keeping
                your account information accurate
                and your login credentials secure.
              </p>


              <p>
                You are responsible for activity
                conducted through your account
                unless you notify us of
                unauthorized access.
              </p>


              <p>
                We may suspend or restrict an
                account where reasonably necessary
                to protect the website, prevent
                fraud, enforce these Terms or
                comply with applicable law.
              </p>

            </section>


            {/* =================================================
                4 PRODUCTS
            ================================================= */}

            <section
              id="products"
              className="terms-section"
            >

              <h2>
                4. Products & Product Information
              </h2>


              <p>
                We make reasonable efforts to
                present product descriptions,
                specifications, photographs,
                colors, prices and availability
                accurately.
              </p>


              <p>
                Fabric characteristics such as
                color, texture, weave, GSM,
                finish and appearance may vary
                slightly between production lots,
                photographs and physical samples.
              </p>


              <div className="terms-highlight-grid">

                <div className="terms-highlight-card">

                  <h3 className="terms-highlight-title">
                    Fabric Samples
                  </h3>

                  <p className="terms-highlight-text">
                    Samples may be requested for
                    certain products and commercial
                    enquiries before larger orders.
                  </p>

                </div>


                <div className="terms-highlight-card">

                  <h3 className="terms-highlight-title">
                    Availability
                  </h3>

                  <p className="terms-highlight-text">
                    Product availability may
                    change without prior notice,
                    especially for limited or
                    made-to-order fabrics.
                  </p>

                </div>

              </div>

            </section>


            {/* =================================================
                5 ORDERS
            ================================================= */}

            <section
              id="orders"
              className="terms-section"
            >

              <h2>
                5. Orders & Payments
              </h2>


              <p>
                When you place an order through
                the website, you are making a
                request to purchase the selected
                products under the applicable
                order terms.
              </p>


              <p>
                An order may be subject to
                verification, availability,
                pricing confirmation and payment
                authorization before acceptance.
              </p>


              <h3>
                Payment
              </h3>

              <p>
                Payments may be processed through
                third-party payment providers.
                Additional terms of those providers
                may apply to the payment transaction.
              </p>


              <h3>
                Order Confirmation
              </h3>

              <p>
                After receiving an order request,
                we may send confirmation details
                electronically. An order confirmation
                does not prevent us from correcting
                obvious pricing, inventory or
                technical errors where reasonably
                necessary.
              </p>

            </section>


            {/* =================================================
                6 ENQUIRIES
            ================================================= */}

            <section
              id="enquiries"
              className="terms-section"
            >

              <h2>
                6. Wholesale & B2B Enquiries
              </h2>


              <p>
                The website may allow businesses
                and other buyers to submit enquiries
                regarding wholesale supply, bulk
                purchasing, custom fabrics, private
                labelling, manufacturing or exports.
              </p>


              <p>
                Submitting an enquiry does not by
                itself create a binding contract or
                guarantee product availability,
                pricing, MOQ, production capacity
                or delivery dates.
              </p>


              <ul>

                <li>
                  Quotations may have a stated
                  validity period.
                </li>

                <li>
                  MOQ may vary according to
                  product and customization.
                </li>

                <li>
                  Custom production may require
                  separate specifications and
                  approvals.
                </li>

                <li>
                  Production timelines may depend
                  on material availability,
                  quantity and customization.
                </li>

              </ul>

            </section>


            {/* =================================================
                7 PRICING
            ================================================= */}

            <section
              id="pricing"
              className="terms-section"
            >

              <h2>
                7. Pricing & Availability
              </h2>


              <p>
                Product prices displayed on the
                website may be stated per meter,
                per unit or according to the
                applicable product description.
              </p>


              <p>
                Unless explicitly stated otherwise,
                taxes, shipping charges, duties or
                other applicable fees may be
                calculated separately.
              </p>


              <p>
                For wholesale and B2B enquiries,
                pricing may depend on quantity,
                specifications, customization,
                delivery location and other
                commercial terms.
              </p>


              <div className="terms-info-box">

                <p>
                  We reserve the right to correct
                  obvious typographical, pricing or
                  technical errors and to update
                  product availability when necessary.
                </p>

              </div>

            </section>


            {/* =================================================
                8 SHIPPING
            ================================================= */}

            <section
              id="shipping"
              className="terms-section"
            >

              <h2>
                8. Shipping & Delivery
              </h2>


              <p>
                Delivery timelines shown on the
                website or communicated during an
                enquiry are estimates unless a
                specific written commitment has
                been provided.
              </p>


              <p>
                Delivery may be affected by
                production schedules, courier
                availability, public holidays,
                weather, customs procedures or
                circumstances outside our reasonable
                control.
              </p>


              <p>
                For international shipments, the
                buyer may be responsible for
                applicable customs duties, taxes,
                import requirements or other local
                charges unless otherwise agreed.
              </p>

            </section>


            {/* =================================================
                9 RETURNS
            ================================================= */}

            <section
              id="returns"
              className="terms-section"
            >

              <h2>
                9. Returns, Cancellation & Adjustments
              </h2>


              <p>
                Any return, cancellation, exchange
                or order adjustment is subject to
                the specific policy applicable to
                the product and order.
              </p>


              <p>
                Custom-made, specially dyed,
                specially printed, cut or
                personalized fabrics may be subject
                to different cancellation or return
                conditions because they are produced
                according to specific requirements.
              </p>


              <p>
                Please review the applicable order
                or product policy before placing
                a customized or bulk order.
              </p>

            </section>


            {/* =================================================
                10 IP
            ================================================= */}

            <section
              id="intellectual"
              className="terms-section"
            >

              <h2>
                10. Intellectual Property
              </h2>


              <p>
                Unless otherwise stated, the
                website and its content, including
                text, photographs, graphics, logos,
                branding, layouts, product materials
                and design elements, are owned by
                or licensed to Bhavya Fabrics.
              </p>


              <p>
                You may not reproduce, modify,
                distribute, publish, sell,
                commercially exploit or create
                derivative works from website
                content without prior written
                permission, except where permitted
                by applicable law.
              </p>

            </section>


            {/* =================================================
                11 USER CONTENT
            ================================================= */}

            <section
              id="user-content"
              className="terms-section"
            >

              <h2>
                11. Information Submitted by You
              </h2>


              <p>
                When you submit an enquiry,
                review, message, specification or
                other content through the website,
                you represent that you have the
                right to provide that information.
              </p>


              <p>
                You should not submit confidential
                third-party information, copyrighted
                material without authorization,
                malicious code or unlawful content.
              </p>

            </section>


            {/* =================================================
                12 LIABILITY
            ================================================= */}

            <section
              id="liability"
              className="terms-section"
            >

              <h2>
                12. Disclaimers & Limitation of Liability
              </h2>


              <p>
                We aim to keep the website available,
                accurate and secure, but we do not
                guarantee that the website will always
                be uninterrupted, error-free or free
                from all technical issues.
              </p>


              <p>
                To the extent permitted by applicable
                law, Bhavya Fabrics will not be
                responsible for indirect, incidental,
                special or consequential losses arising
                from use of the website or inability
                to use the website.
              </p>


              <p>
                Nothing in these Terms is intended
                to exclude or limit liability that
                cannot lawfully be excluded or limited.
              </p>

            </section>


            {/* =================================================
                13 THIRD PARTY
            ================================================= */}

            <section
              id="third-party"
              className="terms-section"
            >

              <h2>
                13. Third-Party Services & Links
              </h2>


              <p>
                The website may include links to
                or integrations with third-party
                services such as payment providers,
                courier platforms, maps, analytics
                tools or social networks.
              </p>


              <p>
                Third-party services are governed
                by their own terms and policies.
                We are not responsible for the
                independent practices, availability
                or content of third-party services.
              </p>

            </section>


            {/* =================================================
                14 TERMINATION
            ================================================= */}

            <section
              id="termination"
              className="terms-section"
            >

              <h2>
                14. Suspension & Termination
              </h2>


              <p>
                We may suspend or terminate your
                access to certain website features
                where reasonably necessary to
                protect our services, enforce these
                Terms, investigate misuse or comply
                with applicable law.
              </p>


              <p>
                Provisions that by their nature
                should continue after termination,
                including intellectual property,
                payment obligations, disclaimers,
                limitations of liability and
                dispute provisions, may continue
                to apply.
              </p>

            </section>


            {/* =================================================
                15 CHANGES
            ================================================= */}

            <section
              id="changes"
              className="terms-section"
            >

              <h2>
                15. Changes to These Terms
              </h2>


              <p>
                We may update these Terms of Use
                from time to time to reflect changes
                in our business, services, website,
                technology or legal requirements.
              </p>


              <p>
                The updated Terms will be posted
                on this page with a revised
                &quot;Last updated&quot; date. Your
                continued use of the website after
                an update may constitute acceptance
                of the revised Terms to the extent
                permitted by applicable law.
              </p>

            </section>


            {/* =================================================
                16 LAW
            ================================================= */}

            <section
              id="law"
              className="terms-section"
            >

              <h2>
                16. Governing Law & Disputes
              </h2>


              <p>
                These Terms are intended to be
                interpreted in accordance with
                applicable laws governing the
                relationship between you and
                Bhavya Fabrics.
              </p>


              <p>
                Any dispute arising from or
                relating to the website, an order,
                enquiry or these Terms will be
                subject to the jurisdiction and
                dispute-resolution process applicable
                to the relevant transaction and
                governing law.
              </p>


              <div className="terms-info-box">

                <p>
                  For significant commercial,
                  customized or international
                  transactions, the parties may
                  enter into separate written
                  commercial agreements containing
                  additional terms.
                </p>

              </div>

            </section>


            {/* =================================================
                17 CONTACT
            ================================================= */}

            <section
              id="contact"
              className="terms-section"
            >

              <h2>
                17. Contact Us
              </h2>


              <p>
                For questions regarding these
                Terms, online orders, product
                information or wholesale and
                manufacturing enquiries, please
                contact Bhavya Fabrics.
              </p>


              <div className="terms-contact-box">

                <div className="terms-contact-icon">
                  <Mail size={18} />
                </div>


                <div className="terms-contact-content">

                  <p className="terms-contact-title">
                    Bhavya Fabrics
                  </p>


                  <p className="terms-contact-text">

                    Email:{" "}

                    <a href="mailto:info@bhavyafabrics.com">
                      info@bhavyafabrics.com
                    </a>

                    <br />

                    Phone:{" "}

                    <a href="tel:+918302906190">
                      +91 83029 06190
                    </a>

                  </p>

                </div>

              </div>

            </section>

          </article>

        </div>

      </div>

    </main>
  );
}
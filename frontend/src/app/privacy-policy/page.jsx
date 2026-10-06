"use client";

import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Mail,
  ShieldCheck,
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

export default function PrivacyPolicyPage() {
  return (
    <main className="privacy-page">
      <style>{`

        /* =================================================
           PAGE
        ================================================= */

        .privacy-page {
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

        .privacy-container {
          width: 100%;
          max-width: 1400px;

          margin: 0 auto;

          padding: 0 32px;

          box-sizing: border-box;
        }


        /* =================================================
           BREADCRUMB
        ================================================= */

        .privacy-breadcrumb {
          display: flex;
          align-items: center;

          gap: 7px;

          margin-bottom: 22px;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;

          line-height: 1.4;
        }


        .privacy-breadcrumb a {
          color: ${COLORS.navGray};

          text-decoration: none;

          transition:
            color 0.2s ease;
        }


        .privacy-breadcrumb a:hover {
          color: ${COLORS.teal};
        }


        .privacy-breadcrumb-current {
          color: ${COLORS.teal};

          font-weight: 500;

          white-space: nowrap;
        }


        /* =================================================
           HERO / HEADER
        ================================================= */

        .privacy-header {
          width: 100%;

          padding: 34px 38px;

          background: ${COLORS.darkCream};

          border:
            1px solid #E7DFD6;

          border-radius: 14px;

          box-sizing: border-box;

          margin-bottom: 25px;
        }


        .privacy-eyebrow {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-bottom: 10px;

          color: ${COLORS.gold};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 10px;

          font-weight: 600;

          letter-spacing: 3px;

          line-height: 1.2;

          text-transform: uppercase;
        }


        .privacy-eyebrow-line {
          width: 30px;

          height: 1px;

          display: inline-block;

          flex-shrink: 0;

          background: ${COLORS.gold};
        }


        .privacy-title {
          margin: 0 0 9px;

          color: ${COLORS.teal};

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 54px;

          font-weight: 600;

          line-height: 0.98;
        }


        .privacy-intro {
          width: 100%;

          max-width: 760px;

          margin: 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 13px;

          line-height: 1.65;
        }


        .privacy-updated {
          margin: 14px 0 0;

          color: #817A72;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 10px;

          line-height: 1.4;
        }


        /* =================================================
           MAIN LAYOUT
        ================================================= */

        .privacy-layout {
          width: 100%;

          display: grid;

          grid-template-columns:
            230px
            minmax(0, 1fr);

          gap: 28px;

          align-items: start;

          box-sizing: border-box;
        }


        /* =================================================
           SIDEBAR
        ================================================= */

        .privacy-sidebar {
          position: sticky;

          top: 24px;

          width: 100%;

          background: ${COLORS.white};

          border:
            1px solid #E7E0D8;

          border-radius: 12px;

          padding: 14px;

          box-sizing: border-box;
        }


        .privacy-sidebar-title {
          margin: 0 0 11px;

          padding: 2px 8px;

          color: #20363C;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;

          font-weight: 600;

          letter-spacing: 1px;

          line-height: 1.3;

          text-transform: uppercase;
        }


        .privacy-sidebar-nav {
          display: flex;

          flex-direction: column;

          gap: 2px;
        }


        .privacy-sidebar-link {
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
            Helvetica,
            sans-serif;

          font-size: 10px;

          line-height: 1.25;

          box-sizing: border-box;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }


        .privacy-sidebar-link:hover,
        .privacy-sidebar-link.active {
          background: #EAF0EE;

          color: ${COLORS.teal};
        }


        .privacy-sidebar-link svg {
          width: 14px;

          height: 14px;

          flex-shrink: 0;
        }


        /* =================================================
           CONTENT
        ================================================= */

        .privacy-content {
          width: 100%;

          min-width: 0;

          background: ${COLORS.white};

          border:
            1px solid #E7E0D8;

          border-radius: 12px;

          padding: 35px 40px;

          box-sizing: border-box;
        }


        /* =================================================
           SECTION
        ================================================= */

        .privacy-section {
          width: 100%;

          min-width: 0;

          scroll-margin-top: 25px;

          box-sizing: border-box;
        }


        .privacy-section + .privacy-section {
          margin-top: 36px;

          padding-top: 34px;

          border-top:
            1px solid #ECE5DE;
        }


        .privacy-section h2 {
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


        .privacy-section h3 {
          margin: 20px 0 8px;

          color: #20383F;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 14px;

          font-weight: 600;

          line-height: 1.4;
        }


        .privacy-section p {
          margin: 0 0 12px;

          color: #646462;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12.5px;

          line-height: 1.75;

          overflow-wrap: anywhere;
        }


        .privacy-section ul {
          margin: 8px 0 13px;

          padding-left: 20px;

          color: #646462;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12.5px;

          line-height: 1.75;

          box-sizing: border-box;
        }


        .privacy-section li {
          margin-bottom: 5px;

          overflow-wrap: anywhere;
        }


        .privacy-section strong {
          color: #354C52;

          font-weight: 600;
        }


        /* =================================================
           INFO BOX
        ================================================= */

        .privacy-info-box {
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


        .privacy-info-box p {
          margin: 0;

          font-size: 11.5px;

          line-height: 1.65;
        }


        /* =================================================
           DATA CARDS
        ================================================= */

        .privacy-data-list {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 10px;

          margin: 15px 0;

          box-sizing: border-box;
        }


        .privacy-data-card {
          min-width: 0;

          padding: 14px;

          border:
            1px solid #E9E2DA;

          border-radius: 8px;

          background: #FCFAF8;

          box-sizing: border-box;
        }


        .privacy-data-card-title {
          margin: 0 0 5px;

          color: ${COLORS.teal};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;

          font-weight: 600;

          line-height: 1.35;
        }


        .privacy-data-card-text {
          margin: 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 10.5px;

          line-height: 1.55;

          overflow-wrap: anywhere;
        }


        /* =================================================
           CONTACT
        ================================================= */

        .privacy-contact-box {
          width: 100%;

          display: flex;

          align-items: flex-start;

          gap: 12px;

          margin-top: 16px;

          padding: 17px;

          border:
            1px solid #E7E0D8;

          border-radius: 8px;

          background: #FCFAF8;

          box-sizing: border-box;
        }


        .privacy-contact-icon {
          width: 38px;

          height: 38px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #EAF0EE;

          color: ${COLORS.teal};

          border-radius: 50%;
        }


        .privacy-contact-content {
          min-width: 0;
        }


        .privacy-contact-title {
          margin: 0 0 3px;

          color: #20383F;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;

          font-weight: 600;

          line-height: 1.35;
        }


        .privacy-contact-text {
          margin: 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 10.5px;

          line-height: 1.55;

          overflow-wrap: anywhere;
        }


        .privacy-contact-text a {
          color: ${COLORS.teal};

          text-decoration: none;
        }


        .privacy-contact-text a:hover {
          color: ${COLORS.gold};
        }


        /* =================================================
           MOBILE NAV
        ================================================= */

        .privacy-mobile-nav {
          display: none;

          width: 100%;

          box-sizing: border-box;
        }


        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1000px) {

          .privacy-layout {
            grid-template-columns:
              190px
              minmax(0, 1fr);

            gap: 18px;
          }


          .privacy-content {
            padding:
              28px;
          }


          .privacy-title {
            font-size:
              47px;
          }


          .privacy-data-list {
            grid-template-columns:
              1fr;
          }

        }


        /* =================================================
           MOBILE / TABLET
        ================================================= */

        @media (max-width: 700px) {

          .privacy-page {
            padding:
              28px 0 45px;
          }


          /* -----------------------------------------------
             MAIN CONTAINER
          ----------------------------------------------- */

          .privacy-container {
            width:
              100%;

            max-width:
              100%;

            margin:
              0;

            padding:
              0 16px;

            box-sizing:
              border-box;
          }


          /* -----------------------------------------------
             BREADCRUMB
          ----------------------------------------------- */

          .privacy-breadcrumb {
            gap:
              5px;

            margin-bottom:
              13px;

            font-size:
              9px;

            line-height:
              1.35;

            overflow:
              hidden;
          }


          .privacy-breadcrumb a,
          .privacy-breadcrumb-current {
            white-space:
              nowrap;
          }


          .privacy-breadcrumb svg {
            width:
              10px;

            height:
              10px;

            flex-shrink:
              0;
          }


          /* -----------------------------------------------
             HEADER
          ----------------------------------------------- */

          .privacy-header {
            padding:
              22px 16px;

            margin-bottom:
              15px;

            border-radius:
              10px;
          }


          .privacy-eyebrow {
            gap:
              7px;

            margin-bottom:
              8px;

            font-size:
              8px;

            letter-spacing:
              2.4px;
          }


          .privacy-eyebrow-line {
            width:
              23px;
          }


          .privacy-title {
            margin-bottom:
              8px;

            font-size:
              36px;

            line-height:
              .98;
          }


          .privacy-intro {
            max-width:
              100%;

            font-size:
              9.5px;

            line-height:
              1.6;
          }


          .privacy-updated {
            margin-top:
              9px;

            font-size:
              8px;
          }


          /* -----------------------------------------------
             MOBILE SECTION NAV
          ----------------------------------------------- */

          .privacy-mobile-nav {
            display:
              flex;

            align-items:
              center;

            gap:
              6px;

            overflow-x:
              auto;

            overflow-y:
              hidden;

            scrollbar-width:
              none;

            -webkit-overflow-scrolling:
              touch;

            padding:
              1px 0 3px;

            margin-bottom:
              12px;
          }


          .privacy-mobile-nav::-webkit-scrollbar {
            display:
              none;
          }


          .privacy-mobile-link {
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
              0 11px;

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
              Helvetica,
              sans-serif;

            font-size:
              8px;

            line-height:
              1;

            white-space:
              nowrap;

            box-sizing:
              border-box;
          }


          .privacy-mobile-link:first-child {
            background:
              #EAF0EE;

            border-color:
              #D5E2DF;

            color:
              ${COLORS.teal};
          }


          /* -----------------------------------------------
             HIDE SIDEBAR
          ----------------------------------------------- */

          .privacy-sidebar {
            display:
              none;
          }


          /* -----------------------------------------------
             LAYOUT
          ----------------------------------------------- */

          .privacy-layout {
            width:
              100%;

            display:
              block;

            box-sizing:
              border-box;
          }


          /* -----------------------------------------------
             CONTENT
          ----------------------------------------------- */

          .privacy-content {
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
          }


          /* -----------------------------------------------
             SECTIONS
          ----------------------------------------------- */

          .privacy-section {
            width:
              100%;

            min-width:
              0;
          }


          .privacy-section + .privacy-section {
            margin-top:
              27px;

            padding-top:
              25px;
          }


          .privacy-section h2 {
            margin-bottom:
              9px;

            font-size:
              23px;

            line-height:
              1.05;
          }


          .privacy-section h3 {
            margin:
              15px 0 6px;

            font-size:
              11px;

            line-height:
              1.35;
          }


          .privacy-section p {
            margin-bottom:
              9px;

            font-size:
              9.8px;

            line-height:
              1.68;
          }


          .privacy-section ul {
            margin:
              6px 0 10px;

            padding-left:
              17px;

            font-size:
              9.8px;

            line-height:
              1.68;
          }


          .privacy-section li {
            margin-bottom:
              4px;
          }


          /* -----------------------------------------------
             INFO BOX
          ----------------------------------------------- */

          .privacy-info-box {
            padding:
              11px 12px;

            margin:
              12px 0;
          }


          .privacy-info-box p {
            font-size:
              8.8px;

            line-height:
              1.6;
          }


          /* -----------------------------------------------
             DATA LIST
          ----------------------------------------------- */

          .privacy-data-list {
            grid-template-columns:
              1fr;

            gap:
              8px;

            margin:
              12px 0;
          }


          .privacy-data-card {
            padding:
              11px;

            border-radius:
              7px;
          }


          .privacy-data-card-title {
            margin-bottom:
              4px;

            font-size:
              9.5px;

            line-height:
              1.3;
          }


          .privacy-data-card-text {
            font-size:
              8.8px;

            line-height:
              1.55;
          }


          /* -----------------------------------------------
             CONTACT
          ----------------------------------------------- */

          .privacy-contact-box {
            gap:
              9px;

            padding:
              11px;

            margin-top:
              12px;

            border-radius:
              7px;
          }


          .privacy-contact-icon {
            width:
              32px;

            height:
              32px;
          }


          .privacy-contact-icon svg {
            width:
              15px;

            height:
              15px;
          }


          .privacy-contact-title {
            font-size:
              9.2px;

            line-height:
              1.3;
          }


          .privacy-contact-text {
            font-size:
              8.8px;

            line-height:
              1.55;
          }

        }


        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 380px) {

          .privacy-page {
            padding:
              24px 0 38px;
          }


          .privacy-container {
            padding:
              0 16px;
          }


          .privacy-title {
            font-size:
              33px;
          }


          .privacy-header {
            padding:
              20px 14px;
          }


          .privacy-intro {
            font-size:
              9px;

            line-height:
              1.58;
          }


          .privacy-content {
            padding:
              18px 13px;
          }


          .privacy-section + .privacy-section {
            margin-top:
              24px;

            padding-top:
              23px;
          }


          .privacy-section h2 {
            font-size:
              21px;
          }


          .privacy-section h3 {
            font-size:
              10px;
          }


          .privacy-section p,
          .privacy-section ul {
            font-size:
              9.1px;

            line-height:
              1.65;
          }


          .privacy-info-box p {
            font-size:
              8.3px;
          }


          .privacy-data-card-text {
            font-size:
              8.4px;
          }


          .privacy-contact-text {
            font-size:
              8.4px;
          }

        }


        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {

          .privacy-page * {
            transition:
              none !important;
          }

        }

      `}</style>


      <div className="privacy-container">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="privacy-breadcrumb">

          <Link href="/">
            Home
          </Link>

          <ChevronRight size={12} />

          <span className="privacy-breadcrumb-current">
            Privacy Policy
          </span>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="privacy-header">

          <div className="privacy-eyebrow">

            <span className="privacy-eyebrow-line" />

            LEGAL & PRIVACY

          </div>


          <h1 className="privacy-title">
            Privacy Policy
          </h1>


          <p className="privacy-intro">
            This Privacy Policy explains how
            Bhavya Fabrics collects, uses,
            stores and protects information
            when you browse our website,
            purchase products, create an
            account, or submit an enquiry
            for wholesale, manufacturing or
            export requirements.
          </p>


          <p className="privacy-updated">
            Last updated: {LAST_UPDATED}
          </p>

        </header>


        {/* =================================================
            MOBILE NAV
        ================================================= */}

        <nav
          className="privacy-mobile-nav"
          aria-label="Privacy policy sections"
        >

          <a
            href="#information"
            className="privacy-mobile-link"
          >
            Information
          </a>

          <a
            href="#usage"
            className="privacy-mobile-link"
          >
            Usage
          </a>

          <a
            href="#orders"
            className="privacy-mobile-link"
          >
            Orders
          </a>

          <a
            href="#enquiries"
            className="privacy-mobile-link"
          >
            Enquiries
          </a>

          <a
            href="#cookies"
            className="privacy-mobile-link"
          >
            Cookies
          </a>

          <a
            href="#rights"
            className="privacy-mobile-link"
          >
            Your Rights
          </a>

          <a
            href="#contact"
            className="privacy-mobile-link"
          >
            Contact
          </a>

        </nav>


        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="privacy-layout">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="privacy-sidebar">

            <p className="privacy-sidebar-title">
              On this page
            </p>


            <nav className="privacy-sidebar-nav">

              <a
                href="#information"
                className="privacy-sidebar-link active"
              >
                <UserRound size={14} />
                Information We Collect
              </a>


              <a
                href="#usage"
                className="privacy-sidebar-link"
              >
                <FileText size={14} />
                How We Use Data
              </a>


              <a
                href="#orders"
                className="privacy-sidebar-link"
              >
                <ShieldCheck size={14} />
                Orders & Payments
              </a>


              <a
                href="#enquiries"
                className="privacy-sidebar-link"
              >
                <Mail size={14} />
                Enquiries & B2B
              </a>


              <a
                href="#cookies"
                className="privacy-sidebar-link"
              >
                <FileText size={14} />
                Cookies
              </a>


              <a
                href="#sharing"
                className="privacy-sidebar-link"
              >
                <ShieldCheck size={14} />
                Data Sharing
              </a>


              <a
                href="#security"
                className="privacy-sidebar-link"
              >
                <ShieldCheck size={14} />
                Data Security
              </a>


              <a
                href="#retention"
                className="privacy-sidebar-link"
              >
                <FileText size={14} />
                Data Retention
              </a>


              <a
                href="#rights"
                className="privacy-sidebar-link"
              >
                <UserRound size={14} />
                Your Rights
              </a>


              <a
                href="#contact"
                className="privacy-sidebar-link"
              >
                <Mail size={14} />
                Contact Us
              </a>

            </nav>

          </aside>


          {/* =================================================
              POLICY CONTENT
          ================================================= */}

          <article className="privacy-content">

            {/* =================================================
                1 INFORMATION
            ================================================= */}

            <section
              id="information"
              className="privacy-section"
            >

              <h2>
                1. Information We Collect
              </h2>


              <p>
                We may collect information that
                you provide directly to us and
                information generated when you
                use our website and services.
              </p>


              <div className="privacy-data-list">

                <div className="privacy-data-card">

                  <h3 className="privacy-data-card-title">
                    Account Information
                  </h3>

                  <p className="privacy-data-card-text">
                    Name, email address, phone
                    number, login information,
                    saved preferences and other
                    details provided when you
                    create or manage an account.
                  </p>

                </div>


                <div className="privacy-data-card">

                  <h3 className="privacy-data-card-title">
                    Order Information
                  </h3>

                  <p className="privacy-data-card-text">
                    Products ordered, quantities,
                    delivery address, billing
                    information, order history
                    and related transaction details.
                  </p>

                </div>


                <div className="privacy-data-card">

                  <h3 className="privacy-data-card-title">
                    Enquiry Information
                  </h3>

                  <p className="privacy-data-card-text">
                    Business name, contact details,
                    fabric requirements, quantities,
                    specifications, message content
                    and other information submitted
                    through enquiry forms.
                  </p>

                </div>


                <div className="privacy-data-card">

                  <h3 className="privacy-data-card-title">
                    Technical Information
                  </h3>

                  <p className="privacy-data-card-text">
                    Device type, browser type,
                    IP address, approximate
                    location, pages viewed and
                    information about how the
                    website is used.
                  </p>

                </div>

              </div>


              <div className="privacy-info-box">

                <p>
                  Please do not submit confidential
                  business secrets, payment card
                  details or other sensitive
                  information through general
                  enquiry forms unless specifically
                  requested through a secure channel.
                </p>

              </div>

            </section>


            {/* =================================================
                2 USAGE
            ================================================= */}

            <section
              id="usage"
              className="privacy-section"
            >

              <h2>
                2. How We Use Your Information
              </h2>


              <p>
                We use collected information for
                legitimate business and service
                purposes, including:
              </p>


              <ul>

                <li>
                  Processing and fulfilling
                  product orders.
                </li>

                <li>
                  Managing customer accounts,
                  saved items and order history.
                </li>

                <li>
                  Responding to product,
                  wholesale and manufacturing
                  enquiries.
                </li>

                <li>
                  Preparing quotations,
                  samples and custom manufacturing
                  discussions.
                </li>

                <li>
                  Communicating about orders,
                  enquiries, shipping and support.
                </li>

                <li>
                  Improving our website,
                  products, services and
                  customer experience.
                </li>

                <li>
                  Detecting fraud, abuse,
                  security issues and technical
                  problems.
                </li>

                <li>
                  Complying with applicable legal,
                  tax and regulatory requirements.
                </li>

              </ul>

            </section>


            {/* =================================================
                3 ORDERS
            ================================================= */}

            <section
              id="orders"
              className="privacy-section"
            >

              <h2>
                3. Orders, Payments & Shipping
              </h2>


              <p>
                When you place an order, we
                process the information necessary
                to confirm, fulfill and deliver
                that order.
              </p>


              <h3>
                Payment Information
              </h3>

              <p>
                Payment transactions may be
                processed through third-party
                payment providers. We generally
                do not need to store your complete
                card or banking credentials on
                our website when those details
                are processed directly by the
                payment provider.
              </p>


              <h3>
                Shipping Information
              </h3>

              <p>
                We may share the required delivery
                information with courier,
                logistics or shipping partners
                so that your order can be delivered
                to the address you provide.
              </p>


              <h3>
                Transaction Communications
              </h3>

              <p>
                We may send order confirmations,
                invoices, shipping updates,
                delivery notifications and other
                service-related messages.
              </p>

            </section>


            {/* =================================================
                4 ENQUIRIES
            ================================================= */}

            <section
              id="enquiries"
              className="privacy-section"
            >

              <h2>
                4. Product Enquiries & B2B
              </h2>


              <p>
                Bhavya Fabrics also operates as a
                wholesale and enquiry-based textile
                business. When you submit a business
                enquiry, we may use the information
                you provide to understand your
                requirements and communicate with
                you about suitable products or
                services.
              </p>


              <ul>

                <li>
                  Wholesale and bulk order
                  requirements.
                </li>

                <li>
                  Custom fabric, dyeing, printing
                  or finishing enquiries.
                </li>

                <li>
                  Private-label or manufacturing
                  enquiries.
                </li>

                <li>
                  Export and international
                  sourcing requests.
                </li>

                <li>
                  Sampling, quotation and MOQ
                  discussions.
                </li>

              </ul>


              <p>
                Business contact information may
                be retained as necessary to manage
                the enquiry, continue the commercial
                relationship and maintain appropriate
                business records.
              </p>

            </section>


            {/* =================================================
                5 COOKIES
            ================================================= */}

            <section
              id="cookies"
              className="privacy-section"
            >

              <h2>
                5. Cookies & Similar Technologies
              </h2>


              <p>
                Our website may use cookies and
                similar technologies to support
                essential website functionality,
                remember preferences, understand
                website usage and improve the
                user experience.
              </p>


              <p>
                Depending on the technologies used
                on the website, cookies may be
                associated with authentication,
                shopping cart functionality,
                analytics, performance or marketing.
              </p>


              <p>
                You can manage cookie settings
                through your browser. Disabling
                certain cookies may affect some
                website functionality.
              </p>

            </section>


            {/* =================================================
                6 SHARING
            ================================================= */}

            <section
              id="sharing"
              className="privacy-section"
            >

              <h2>
                6. When We Share Information
              </h2>


              <p>
                We do not sell your personal
                information as a product. We may
                share limited information with
                service providers and partners
                where necessary to operate the
                business or provide requested
                services.
              </p>


              <ul>

                <li>
                  Payment processing providers.
                </li>

                <li>
                  Shipping and logistics partners.
                </li>

                <li>
                  Website hosting and technology
                  providers.
                </li>

                <li>
                  Email, communication and support
                  providers.
                </li>

                <li>
                  Analytics or performance service
                  providers.
                </li>

                <li>
                  Professional advisers where
                  reasonably required.
                </li>

                <li>
                  Authorities where disclosure is
                  required by law.
                </li>

              </ul>

            </section>


            {/* =================================================
                7 SECURITY
            ================================================= */}

            <section
              id="security"
              className="privacy-section"
            >

              <h2>
                7. Data Security
              </h2>


              <p>
                We take reasonable technical and
                organizational measures to protect
                personal information against
                unauthorized access, loss, misuse,
                alteration or disclosure.
              </p>


              <p>
                However, no website, internet
                transmission or electronic storage
                system can be guaranteed to be
                completely secure.
              </p>

            </section>


            {/* =================================================
                8 RETENTION
            ================================================= */}

            <section
              id="retention"
              className="privacy-section"
            >

              <h2>
                8. Data Retention
              </h2>


              <p>
                We retain information only for as
                long as reasonably necessary for
                the purposes described in this
                policy, including order fulfillment,
                customer service, business enquiries,
                accounting, legal compliance and
                legitimate business record keeping.
              </p>


              <p>
                When information is no longer
                reasonably required, it may be
                deleted, anonymized or securely
                archived in accordance with applicable
                requirements.
              </p>

            </section>


            {/* =================================================
                9 RIGHTS
            ================================================= */}

            <section
              id="rights"
              className="privacy-section"
            >

              <h2>
                9. Your Choices & Rights
              </h2>


              <p>
                Depending on applicable law, you
                may have rights regarding the
                personal information we hold about
                you, which may include:
              </p>


              <ul>

                <li>
                  Requesting access to personal
                  information.
                </li>

                <li>
                  Requesting correction of
                  inaccurate information.
                </li>

                <li>
                  Requesting deletion where
                  legally applicable.
                </li>

                <li>
                  Objecting to or restricting
                  certain processing where
                  legally applicable.
                </li>

                <li>
                  Withdrawing consent where
                  processing is based on consent.
                </li>

                <li>
                  Opting out of non-essential
                  marketing communications.
                </li>

              </ul>


              <p>
                Some information may need to be
                retained where required by law,
                accounting requirements, contractual
                obligations or legitimate business
                purposes.
              </p>

            </section>


            {/* =================================================
                10 THIRD PARTY
            ================================================= */}

            <section
              id="third-party"
              className="privacy-section"
            >

              <h2>
                10. Third-Party Websites & Services
              </h2>


              <p>
                Our website may contain links,
                integrations or services operated
                by third parties. Their privacy
                practices are governed by their
                own policies, and we encourage you
                to review them before providing
                information through those services.
              </p>


              <p>
                This may include payment platforms,
                logistics services, social platforms,
                analytics tools, map services or
                other external technologies used to
                provide website functionality.
              </p>

            </section>


            {/* =================================================
                11 CHILDREN
            ================================================= */}

            <section
              id="children"
              className="privacy-section"
            >

              <h2>
                11. Children&apos;s Privacy
              </h2>


              <p>
                Our website and services are
                intended for customers, businesses
                and other users who can legally
                enter into relevant transactions
                or enquiries. We do not knowingly
                collect personal information from
                children for commercial purposes.
              </p>

            </section>


            {/* =================================================
                12 CHANGES
            ================================================= */}

            <section
              id="changes"
              className="privacy-section"
            >

              <h2>
                12. Changes to This Privacy Policy
              </h2>


              <p>
                We may update this Privacy Policy
                from time to time to reflect changes
                in our services, technology, legal
                requirements or business practices.
              </p>


              <p>
                The updated version will be posted
                on this page with a revised
                &quot;Last updated&quot; date.
              </p>

            </section>


            {/* =================================================
                13 CONTACT
            ================================================= */}

            <section
              id="contact"
              className="privacy-section"
            >

              <h2>
                13. Contact Us
              </h2>


              <p>
                If you have questions about this
                Privacy Policy, your personal
                information, an order or a business
                enquiry, please contact Bhavya
                Fabrics.
              </p>


              <div className="privacy-contact-box">

                <div className="privacy-contact-icon">
                  <Mail size={18} />
                </div>


                <div className="privacy-contact-content">

                  <p className="privacy-contact-title">
                    Bhavya Fabrics
                  </p>


                  <p className="privacy-contact-text">

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
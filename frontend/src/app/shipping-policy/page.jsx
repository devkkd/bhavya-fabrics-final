"use client";

import Link from "next/link";
import {
  ChevronRight,
  Truck,
  Package,
  Globe,
  Clock3,
  MapPin,
  ShieldCheck,
  Mail,
  ArrowRight,
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

export default function ShippingPolicyPage() {
  return (
    <main className="shipping-page">
      <style>{`

        /* =================================================
           PAGE
        ================================================= */

        .shipping-page {
          width: 100%;
          min-height: 100vh;

          background: ${COLORS.cream};
          color: ${COLORS.ink};

          padding: 42px 0 70px;

          box-sizing: border-box;

          overflow-x: hidden;
        }


        /* =================================================
           CONTAINER
        ================================================= */

        .shipping-container {
          width: 100%;
          max-width: 1400px;

          margin: 0 auto;

          padding: 0 32px;

          box-sizing: border-box;
        }


        /* =================================================
           BREADCRUMB
        ================================================= */

        .shipping-breadcrumb {
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


        .shipping-breadcrumb a {
          color: ${COLORS.navGray};

          text-decoration: none;
        }


        .shipping-breadcrumb a:hover {
          color: ${COLORS.teal};
        }


        .shipping-breadcrumb-current {
          color: ${COLORS.teal};

          font-weight: 500;
        }


        /* =================================================
           HERO
        ================================================= */

        .shipping-header {
          width: 100%;

          padding: 34px 38px;

          background: ${COLORS.darkCream};

          border: 1px solid #E7DFD6;

          border-radius: 14px;

          box-sizing: border-box;

          margin-bottom: 25px;
        }


        .shipping-eyebrow {
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


        .shipping-eyebrow-line {
          width: 30px;
          height: 1px;

          display: inline-block;

          background: ${COLORS.gold};
        }


        .shipping-title {
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


        .shipping-intro {
          width: 100%;
          max-width: 850px;

          margin: 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 13px;

          line-height: 1.65;
        }


        .shipping-updated {
          margin: 14px 0 0;

          color: #817A72;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10px;
        }


        /* =================================================
           QUICK INFO
        ================================================= */

        .shipping-highlights {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 10px;

          margin-bottom: 25px;
        }


        .shipping-highlight {
          min-width: 0;

          padding: 15px;

          background: ${COLORS.white};

          border:
            1px solid #E7E0D8;

          border-radius: 9px;

          box-sizing: border-box;
        }


        .shipping-highlight-icon {
          width: 38px;
          height: 38px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 10px;

          border-radius: 50%;

          background: #EAF0EE;

          color: ${COLORS.teal};
        }


        .shipping-highlight-title {
          margin: 0 0 4px;

          color: #243A40;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;

          font-weight: 600;
        }


        .shipping-highlight-text {
          margin: 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10px;

          line-height: 1.5;
        }


        /* =================================================
           LAYOUT
        ================================================= */

        .shipping-layout {
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

        .shipping-sidebar {
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


        .shipping-sidebar-title {
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


        .shipping-sidebar-nav {
          display: flex;

          flex-direction: column;

          gap: 2px;
        }


        .shipping-sidebar-link {
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


        .shipping-sidebar-link:hover,
        .shipping-sidebar-link.active {
          background: #EAF0EE;

          color: ${COLORS.teal};
        }


        .shipping-sidebar-link svg {
          width: 14px;
          height: 14px;

          flex-shrink: 0;
        }


        /* =================================================
           CONTENT
        ================================================= */

        .shipping-content {
          width: 100%;
          min-width: 0;

          padding: 35px 40px;

          background: ${COLORS.white};

          border:
            1px solid #E7E0D8;

          border-radius: 12px;

          box-sizing: border-box;
        }


        /* =================================================
           SECTION
        ================================================= */

        .shipping-section {
          width: 100%;

          scroll-margin-top: 25px;
        }


        .shipping-section + .shipping-section {
          margin-top: 36px;

          padding-top: 34px;

          border-top:
            1px solid #ECE5DE;
        }


        .shipping-section h2 {
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


        .shipping-section h3 {
          margin: 20px 0 8px;

          color: #20383F;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 14px;

          font-weight: 600;
        }


        .shipping-section p {
          margin: 0 0 12px;

          color: #646462;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 12.5px;

          line-height: 1.75;
        }


        .shipping-section ul {
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


        .shipping-section li {
          margin-bottom: 5px;
        }


        .shipping-section strong {
          color: #354C52;

          font-weight: 600;
        }


        /* =================================================
           SHIPPING TABLE
        ================================================= */

        .shipping-table-wrap {
          width: 100%;

          overflow-x: auto;

          border:
            1px solid #E8E1DA;

          border-radius:
            8px;

          margin:
            15px 0;

          box-sizing:
            border-box;
        }


        .shipping-table {
          width: 100%;

          min-width: 580px;

          border-collapse:
            collapse;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;
        }


        .shipping-table th {
          padding:
            12px 13px;

          text-align:
            left;

          color:
            #29474F;

          font-weight:
            600;

          background:
            #F1EDE7;

          border-bottom:
            1px solid #E4DCD4;
        }


        .shipping-table td {
          padding:
            12px 13px;

          color:
            #676764;

          line-height:
            1.45;

          border-bottom:
            1px solid #ECE6DF;
        }


        .shipping-table tr:last-child td {
          border-bottom:
            none;
        }


        /* =================================================
           INFO BOX
        ================================================= */

        .shipping-info-box {
          width: 100%;

          margin: 16px 0;

          padding: 16px 18px;

          background:
            #F5F1EB;

          border-left:
            3px solid
            ${COLORS.gold};

          border-radius: 7px;

          box-sizing: border-box;
        }


        .shipping-info-box p {
          margin: 0;

          font-size: 11.5px;

          line-height: 1.65;
        }


        /* =================================================
           CONTACT
        ================================================= */

        .shipping-contact-box {
          width: 100%;

          display: flex;

          align-items: flex-start;

          gap: 12px;

          margin-top: 16px;

          padding: 17px;

          background:
            #FCFAF8;

          border:
            1px solid #E7E0D8;

          border-radius: 8px;

          box-sizing: border-box;
        }


        .shipping-contact-icon {
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


        .shipping-contact-title {
          margin: 0 0 3px;

          color: #20383F;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;

          font-weight: 600;
        }


        .shipping-contact-text {
          margin: 0;

          color: ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10.5px;

          line-height: 1.55;
        }


        .shipping-contact-text a {
          color:
            ${COLORS.teal};

          text-decoration:
            none;
        }


        .shipping-contact-text a:hover {
          color:
            ${COLORS.gold};
        }


        /* =================================================
           MOBILE NAV
        ================================================= */

        .shipping-mobile-nav {
          display: none;
        }


        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1000px) {

          .shipping-highlights {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }


          .shipping-layout {
            grid-template-columns:
              190px
              minmax(
                0,
                1fr
              );

            gap:
              18px;
          }


          .shipping-content {
            padding:
              28px;
          }


          .shipping-title {
            font-size:
              47px;
          }

        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 700px) {

          .shipping-page {
            padding:
              30px 0 45px;
          }


          .shipping-container {
            width:
              100%;

            max-width:
              100%;

            margin:
              0;

            padding:
              0 16px;
          }


          .shipping-breadcrumb {
            margin-bottom:
              14px;

            font-size:
              9px;
          }


          .shipping-header {
            padding:
              23px 18px;

            border-radius:
              10px;

            margin-bottom:
              16px;
          }


          .shipping-eyebrow {
            font-size:
              8px;

            letter-spacing:
              2.5px;

            gap:
              7px;

            margin-bottom:
              8px;
          }


          .shipping-eyebrow-line {
            width:
              24px;
          }


          .shipping-title {
            font-size:
              37px;

            line-height:
              1;
          }


          .shipping-intro {
            font-size:
              9.5px;

            line-height:
              1.55;
          }


          .shipping-updated {
            font-size:
              8px;

            margin-top:
              10px;
          }


          /* HIGHLIGHTS */

          .shipping-highlights {
            grid-template-columns:
              1fr 1fr;

            gap:
              7px;

            margin-bottom:
              16px;
          }


          .shipping-highlight {
            padding:
              10px;
          }


          .shipping-highlight-icon {
            width:
              30px;

            height:
              30px;

            margin-bottom:
              7px;
          }


          .shipping-highlight-icon svg {
            width:
              15px;

            height:
              15px;
          }


          .shipping-highlight-title {
            font-size:
              9px;
          }


          .shipping-highlight-text {
            font-size:
              8px;

            line-height:
              1.45;
          }


          /* MOBILE NAV */

          .shipping-mobile-nav {
            width:
              100%;

            display:
              flex;

            gap:
              6px;

            overflow-x:
              auto;

            scrollbar-width:
              none;

            padding-bottom:
              2px;

            margin-bottom:
              12px;
          }


          .shipping-mobile-nav::-webkit-scrollbar {
            display:
              none;
          }


          .shipping-mobile-link {
            flex:
              0 0 auto;

            min-height:
              32px;

            display:
              inline-flex;

            align-items:
              center;

            justify-content:
              center;

            padding:
              0 11px;

            border:
              1px solid #E2DAD2;

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

            white-space:
              nowrap;
          }


          .shipping-mobile-link:first-child {
            background:
              #EAF0EE;

            color:
              ${COLORS.teal};

            border-color:
              #D5E2DF;
          }


          /* LAYOUT */

          .shipping-layout {
            display:
              block;
          }


          .shipping-sidebar {
            display:
              none;
          }


          .shipping-content {
            width:
              100%;

            padding:
              20px 17px;

            border-radius:
              10px;
          }


          /* SECTIONS */

          .shipping-section + .shipping-section {
            margin-top:
              28px;

            padding-top:
              27px;
          }


          .shipping-section h2 {
            font-size:
              23px;

            margin-bottom:
              9px;
          }


          .shipping-section h3 {
            font-size:
              11px;

            margin:
              16px 0 6px;
          }


          .shipping-section p {
            font-size:
              10px;

            line-height:
              1.68;

            margin-bottom:
              9px;
          }


          .shipping-section ul {
            font-size:
              10px;

            line-height:
              1.68;

            margin:
              6px 0 10px;

            padding-left:
              17px;
          }


          /* TABLE */

          .shipping-table-wrap {
            margin:
              12px 0;
          }


          .shipping-table {
            min-width:
              540px;

            font-size:
              9px;
          }


          .shipping-table th,
          .shipping-table td {
            padding:
              9px 10px;
          }


          /* INFO */

          .shipping-info-box {
            padding:
              12px 13px;

            margin:
              13px 0;
          }


          .shipping-info-box p {
            font-size:
              9px;
          }


          /* CONTACT */

          .shipping-contact-box {
            gap:
              9px;

            padding:
              12px;
          }


          .shipping-contact-icon {
            width:
              32px;

            height:
              32px;
          }


          .shipping-contact-icon svg {
            width:
              15px;

            height:
              15px;
          }


          .shipping-contact-title {
            font-size:
              9.5px;
          }


          .shipping-contact-text {
            font-size:
              9px;

            line-height:
              1.5;
          }

        }


        /* =================================================
           VERY SMALL MOBILE
        ================================================= */

        @media (max-width: 380px) {

          .shipping-title {
            font-size:
              34px;
          }


          .shipping-header {
            padding:
              21px 15px;
          }


          .shipping-intro {
            font-size:
              9px;
          }


          .shipping-highlight-title {
            font-size:
              8.5px;
          }


          .shipping-highlight-text {
            font-size:
              7.5px;
          }


          .shipping-content {
            padding:
              18px 14px;
          }


          .shipping-section h2 {
            font-size:
              21px;
          }


          .shipping-section p,
          .shipping-section ul {
            font-size:
              9.2px;
          }

        }


        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {

          .shipping-page * {
            transition:
              none !important;
          }

        }

      `}</style>


      <div className="shipping-container">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="shipping-breadcrumb">

          <Link href="/">
            Home
          </Link>

          <ChevronRight size={12} />

          <span className="shipping-breadcrumb-current">
            Shipping Policy
          </span>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="shipping-header">

          <div className="shipping-eyebrow">

            <span className="shipping-eyebrow-line" />

            DELIVERY & SHIPPING

          </div>


          <h1 className="shipping-title">
            Shipping Policy
          </h1>


          <p className="shipping-intro">
            This Shipping Policy explains how
            Bhavya Fabrics processes, packs and
            delivers retail, bulk, wholesale and
            international orders, including
            applicable delivery timelines,
            shipping responsibilities and
            customs-related requirements.
          </p>


          <p className="shipping-updated">
            Last updated: {LAST_UPDATED}
          </p>

        </header>


        {/* =================================================
            HIGHLIGHTS
        ================================================= */}

        <section className="shipping-highlights">

          <div className="shipping-highlight">

            <div className="shipping-highlight-icon">
              <Package size={18} />
            </div>

            <h3 className="shipping-highlight-title">
              Secure Packaging
            </h3>

            <p className="shipping-highlight-text">
              Orders are packed appropriately
              for the product and shipment type.
            </p>

          </div>


          <div className="shipping-highlight">

            <div className="shipping-highlight-icon">
              <Clock3 size={18} />
            </div>

            <h3 className="shipping-highlight-title">
              Processing Time
            </h3>

            <p className="shipping-highlight-text">
              Orders are processed after
              verification and payment approval.
            </p>

          </div>


          <div className="shipping-highlight">

            <div className="shipping-highlight-icon">
              <Truck size={18} />
            </div>

            <h3 className="shipping-highlight-title">
              Domestic Delivery
            </h3>

            <p className="shipping-highlight-text">
              Delivery timelines depend on
              destination and courier service.
            </p>

          </div>


          <div className="shipping-highlight">

            <div className="shipping-highlight-icon">
              <Globe size={18} />
            </div>

            <h3 className="shipping-highlight-title">
              International Shipping
            </h3>

            <p className="shipping-highlight-text">
              International orders may be subject
              to customs and import requirements.
            </p>

          </div>

        </section>


        {/* =================================================
            MOBILE NAV
        ================================================= */}

        <nav
          className="shipping-mobile-nav"
          aria-label="Shipping policy sections"
        >

          <a
            href="#processing"
            className="shipping-mobile-link"
          >
            Processing
          </a>

          <a
            href="#domestic"
            className="shipping-mobile-link"
          >
            Domestic
          </a>

          <a
            href="#international"
            className="shipping-mobile-link"
          >
            International
          </a>

          <a
            href="#bulk"
            className="shipping-mobile-link"
          >
            Bulk Orders
          </a>

          <a
            href="#tracking"
            className="shipping-mobile-link"
          >
            Tracking
          </a>

          <a
            href="#delivery"
            className="shipping-mobile-link"
          >
            Delivery
          </a>

          <a
            href="#contact"
            className="shipping-mobile-link"
          >
            Contact
          </a>

        </nav>


        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="shipping-layout">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="shipping-sidebar">

            <p className="shipping-sidebar-title">
              On this page
            </p>


            <nav className="shipping-sidebar-nav">

              <a
                href="#processing"
                className="shipping-sidebar-link active"
              >
                <Clock3 size={14} />
                Order Processing
              </a>


              <a
                href="#domestic"
                className="shipping-sidebar-link"
              >
                <Truck size={14} />
                Domestic Shipping
              </a>


              <a
                href="#international"
                className="shipping-sidebar-link"
              >
                <Globe size={14} />
                International Shipping
              </a>


              <a
                href="#bulk"
                className="shipping-sidebar-link"
              >
                <Package size={14} />
                Bulk & Wholesale
              </a>


              <a
                href="#tracking"
                className="shipping-sidebar-link"
              >
                <ArrowRight size={14} />
                Tracking
              </a>


              <a
                href="#delivery"
                className="shipping-sidebar-link"
              >
                <MapPin size={14} />
                Delivery
              </a>


              <a
                href="#customs"
                className="shipping-sidebar-link"
              >
                <Globe size={14} />
                Customs & Duties
              </a>


              <a
                href="#delays"
                className="shipping-sidebar-link"
              >
                <Clock3 size={14} />
                Delays
              </a>


              <a
                href="#contact"
                className="shipping-sidebar-link"
              >
                <Mail size={14} />
                Contact Us
              </a>

            </nav>

          </aside>


          {/* =================================================
              CONTENT
          ================================================= */}

          <article className="shipping-content">

            {/* =================================================
                1 PROCESSING
            ================================================= */}

            <section
              id="processing"
              className="shipping-section"
            >

              <h2>
                1. Order Processing
              </h2>


              <p>
                Orders are generally processed
                after the required product,
                quantity, delivery and payment
                details have been verified.
              </p>


              <p>
                Processing time may vary depending
                on product availability, order
                quantity, customization requirements
                and whether the order is made from
                existing stock or requires production.
              </p>


              <h3>
                Standard Orders
              </h3>

              <p>
                Ready-stock orders may be processed
                faster than made-to-order or
                customized products.
              </p>


              <h3>
                Custom Orders
              </h3>

              <p>
                Custom printing, dyeing, finishing,
                private labelling and other
                manufacturing requirements may
                require additional production time.
              </p>


              <div className="shipping-info-box">

                <p>
                  The estimated timeline communicated
                  at checkout, quotation or order
                  confirmation should be treated as
                  an estimate unless a specific
                  delivery commitment has been
                  agreed in writing.
                </p>

              </div>

            </section>


            {/* =================================================
                2 DOMESTIC
            ================================================= */}

            <section
              id="domestic"
              className="shipping-section"
            >

              <h2>
                2. Domestic Shipping
              </h2>


              <p>
                We may ship orders within India
                using suitable courier, logistics
                or transport partners depending
                on the destination, package size,
                order quantity and service selected.
              </p>


              <div className="shipping-table-wrap">

                <table className="shipping-table">

                  <thead>
                    <tr>
                      <th>
                        Order Type
                      </th>

                      <th>
                        Typical Processing
                      </th>

                      <th>
                        Delivery
                      </th>

                      <th>
                        Notes
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    <tr>
                      <td>
                        Ready Stock
                      </td>

                      <td>
                        1–3 business days
                      </td>

                      <td>
                        3–7 business days
                      </td>

                      <td>
                        Destination dependent
                      </td>
                    </tr>


                    <tr>
                      <td>
                        Bulk Order
                      </td>

                      <td>
                        As confirmed
                      </td>

                      <td>
                        As quoted
                      </td>

                      <td>
                        Quantity dependent
                      </td>
                    </tr>


                    <tr>
                      <td>
                        Custom Production
                      </td>

                      <td>
                        Production schedule
                      </td>

                      <td>
                        As confirmed
                      </td>

                      <td>
                        Depends on specifications
                      </td>
                    </tr>

                  </tbody>

                </table>

              </div>

            </section>


            {/* =================================================
                3 INTERNATIONAL
            ================================================= */}

            <section
              id="international"
              className="shipping-section"
            >

              <h2>
                3. International Shipping
              </h2>


              <p>
                International orders may be shipped
                through courier, freight or logistics
                partners appropriate for the shipment.
              </p>


              <p>
                Delivery time can vary significantly
                by destination, shipping method,
                customs clearance, documentation,
                public holidays and other factors
                outside our control.
              </p>


              <ul>

                <li>
                  International shipping charges
                  may be calculated separately.
                </li>

                <li>
                  The buyer may need to provide
                  additional information for customs
                  or delivery.
                </li>

                <li>
                  Import taxes, duties and local
                  charges may be payable by the
                  recipient unless otherwise agreed.
                </li>

                <li>
                  Customs clearance may extend the
                  expected delivery timeline.
                </li>

              </ul>

            </section>


            {/* =================================================
                4 BULK
            ================================================= */}

            <section
              id="bulk"
              className="shipping-section"
            >

              <h2>
                4. Bulk, Wholesale & B2B Orders
              </h2>


              <p>
                Large-volume and B2B orders may
                follow a separate production,
                packing and dispatch schedule.
              </p>


              <p>
                Shipping timelines for wholesale
                orders depend on factors such as
                quantity, fabric availability,
                customization, finishing, packaging,
                destination and agreed commercial
                terms.
              </p>


              <h3>
                Dispatch Planning
              </h3>

              <p>
                For larger orders, we may coordinate
                dispatch in one shipment or multiple
                shipments where commercially suitable.
              </p>


              <h3>
                International B2B Shipments
              </h3>

              <p>
                Export documentation, freight
                arrangements and customs requirements
                may be handled according to the
                agreed quotation or commercial
                arrangement.
              </p>

            </section>


            {/* =================================================
                5 TRACKING
            ================================================= */}

            <section
              id="tracking"
              className="shipping-section"
            >

              <h2>
                5. Shipment Tracking
              </h2>


              <p>
                Where tracking is available, tracking
                information may be shared through
                order updates, email, customer
                communication or the relevant courier
                or logistics provider.
              </p>


              <p>
                Tracking information is provided by
                the shipping partner and may take
                some time to update after dispatch.
              </p>


              <div className="shipping-info-box">

                <p>
                  If tracking does not update
                  immediately after dispatch, please
                  allow reasonable time for the carrier
                  to register the shipment in its
                  tracking system.
                </p>

              </div>

            </section>


            {/* =================================================
                6 DELIVERY
            ================================================= */}

            <section
              id="delivery"
              className="shipping-section"
            >

              <h2>
                6. Delivery & Address Information
              </h2>


              <p>
                Customers are responsible for
                providing a complete and accurate
                delivery address, including applicable
                phone numbers and postal information.
              </p>


              <p>
                Delays or failed deliveries caused
                by incorrect, incomplete or inaccessible
                delivery information may result in
                additional charges or re-delivery
                requirements.
              </p>


              <h3>
                Receiving the Shipment
              </h3>

              <p>
                Please inspect the external packaging
                at the time of delivery where reasonably
                possible and report any visible
                shipment issue promptly to us and
                the delivery partner.
              </p>

            </section>


            {/* =================================================
                7 CUSTOMS
            ================================================= */}

            <section
              id="customs"
              className="shipping-section"
            >

              <h2>
                7. Customs, Duties & Import Charges
              </h2>


              <p>
                International shipments may be
                subject to customs duties, import
                taxes, brokerage charges, clearance
                fees and other requirements imposed
                by the destination country.
              </p>


              <p>
                Unless specifically agreed otherwise,
                such charges are the responsibility
                of the buyer or recipient.
              </p>


              <p>
                Customs authorities may inspect,
                hold or delay shipments according to
                their own procedures. Bhavya Fabrics
                does not control the actions or timing
                of destination-country customs
                authorities.
              </p>

            </section>


            {/* =================================================
                8 DELAYS
            ================================================= */}

            <section
              id="delays"
              className="shipping-section"
            >

              <h2>
                8. Shipping Delays
              </h2>


              <p>
                Delivery may be delayed because of
                circumstances beyond our reasonable
                control, including:
              </p>


              <ul>

                <li>
                  Courier or transport disruptions.
                </li>

                <li>
                  Severe weather or natural events.
                </li>

                <li>
                  Public holidays.
                </li>

                <li>
                  Customs or regulatory procedures.
                </li>

                <li>
                  Incorrect or incomplete address
                  information.
                </li>

                <li>
                  High-volume periods or logistics
                  network disruptions.
                </li>

                <li>
                  Production delays affecting
                  made-to-order goods.
                </li>

              </ul>

            </section>


            {/* =================================================
                9 NON DELIVERY
            ================================================= */}

            <section
              id="non-delivery"
              className="shipping-section"
            >

              <h2>
                9. Failed or Returned Deliveries
              </h2>


              <p>
                A shipment may be returned to the
                sender where delivery cannot be
                completed because of an incorrect
                address, refusal, repeated absence,
                non-payment of applicable charges,
                customs issues or other carrier
                restrictions.
              </p>


              <p>
                Additional shipping or re-dispatch
                charges may apply where the failed
                delivery is not caused by us.
              </p>

            </section>


            {/* =================================================
                10 CONTACT
            ================================================= */}

            <section
              id="contact"
              className="shipping-section"
            >

              <h2>
                10. Shipping Support
              </h2>


              <p>
                For questions regarding an order,
                dispatch, tracking, delivery,
                wholesale shipment or international
                logistics requirement, please contact
                Bhavya Fabrics.
              </p>


              <div className="shipping-contact-box">

                <div className="shipping-contact-icon">
                  <Mail size={18} />
                </div>


                <div>

                  <p className="shipping-contact-title">
                    Bhavya Fabrics
                  </p>


                  <p className="shipping-contact-text">

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
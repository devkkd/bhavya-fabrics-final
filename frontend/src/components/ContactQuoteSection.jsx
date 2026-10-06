"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  X,
} from "lucide-react";

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  darkCream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
};

export default function ContactCTA() {
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    fabric: "",
    quantity: "",
    city: "",
    message: "",
  });

  /* =====================================================
     OPEN FORM
  ===================================================== */

  const openForm = () => {
    setIsOpen(true);
  };

  /* =====================================================
     CLOSE FORM
  ===================================================== */

  const closeForm = () => {
    setIsOpen(false);
  };

  /* =====================================================
     BODY SCROLL LOCK
  ===================================================== */

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* =====================================================
     ESCAPE
  ===================================================== */

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeForm();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen]);

  /* =====================================================
     INPUT
  ===================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    /*
      API call baad me yahan add kar sakte ho.
    */

    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      fabric: "",
      quantity: "",
      city: "",
      message: "",
    });

    closeForm();
  };

  return (
    <>
      {/* =====================================================
          CONTACT CTA
      ===================================================== */}

      <section
        className="contact-cta-section"
        style={styles.section}
      >
        <style>{`
          /* =================================================
             CTA CONTAINER
          ================================================= */

          .contact-cta-container {
            width: 100%;
            max-width: 1400px;

            margin: 0 auto;

            padding: 0 32px;

            box-sizing: border-box;
          }

          /* =================================================
             CTA BOX
          ================================================= */

          .contact-cta-box {
            width: 100%;

            min-height: 300px;

            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            padding: 48px 32px;

            box-sizing: border-box;

            text-align: center;

            border-radius: 24px;

            background:#FAF8F5;
             

            overflow: hidden;

            position: relative;
          }

          /* =================================================
             SUBTLE GLOW
          ================================================= */

          .contact-cta-box::before {
            content: "";

            position: absolute;

            width: 420px;
            height: 420px;

            top: -240px;
            left: -120px;

            border-radius: 50%;

            background:
              rgba(255,255,255,0.08);

            pointer-events: none;
          }

          .contact-cta-box::after {
            content: "";

            position: absolute;

            width: 380px;
            height: 380px;

            right: -180px;
            bottom: -240px;

            border-radius: 50%;

            background:
              rgba(0,0,0,0.08);

            pointer-events: none;
          }

          /* =================================================
             EYEBROW
          ================================================= */

          .contact-cta-eyebrow {
            position: relative;
            z-index: 1;

            display: flex;
            align-items: center;

            gap: 10px;

            margin-bottom: 14px;

            font-family:
              "Poppins",
              Arial,
              Helvetica,
              sans-serif;

            font-size: 11px;

            font-weight: 600;

            letter-spacing: 2.5px;

            color: black;

            text-transform: uppercase;
          }

          .contact-cta-line {
            width: 24px;
            height: 1px;

            background:
              rgba(255,255,255,0.72);

            flex-shrink: 0;
          }

          /* =================================================
             HEADING
          ================================================= */

          .contact-cta-title {
            position: relative;
            z-index: 1;

            margin: 0;

            max-width: 900px;

            color: black;

            font-family:
              "Cormorant Garamond",
              Georgia,
              serif;

            font-size: 48px;

            font-weight: 600;

            line-height: 1.08;

            text-align: center;
          }

          /* =================================================
             DESCRIPTION
          ================================================= */

          .contact-cta-description {
            position: relative;
            z-index: 1;

            width: 100%;
            max-width: 620px;

            margin: 14px auto 24px;

            color: black;

            font-family:
              "Poppins",
              Arial,
              Helvetica,
              sans-serif;

            font-size: 14px;

            font-weight: 400;

            line-height: 1.6;

            text-align: center;
          }

          /* =================================================
             BUTTON
          ================================================= */

          .contact-cta-button {
            position: relative;
            z-index: 1;

            min-width: 180px;

            min-height: 52px;

            padding: 14px 28px;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            gap: 9px;

            border: none;

            border-radius: 999px;

            background: #FFFFFF;

            color: #1A1A1A;

            font-family:
              "Poppins",
              Arial,
              Helvetica,
              sans-serif;

            font-size: 14px;

            font-weight: 600;

            cursor: pointer;

            box-sizing: border-box;

            transition:
              transform 0.25s ease,
              box-shadow 0.25s ease;
          }

          .contact-cta-button:hover {
            transform: translateY(-2px);

            box-shadow:
              0 10px 25px
              rgba(0,0,0,0.14);
          }

          /* =================================================
             MODAL
          ================================================= */

          .quote-modal {
            position: fixed;

            inset: 0;

            z-index: 99999;

            display: flex;

            align-items: center;
            justify-content: center;

            padding: 20px;

            background:
              rgba(15,20,22,0.74);

            backdrop-filter:
              blur(5px);

            -webkit-backdrop-filter:
              blur(5px);

            overflow-y: auto;

            box-sizing: border-box;

            animation:
              quote-fade
              0.2s
              ease-out;
          }

          @keyframes quote-fade {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          /* =================================================
             MODAL CARD
          ================================================= */

          .quote-modal-card {
            position: relative;

            width: 100%;

            max-width: 920px;

            max-height:
              calc(100vh - 40px);

            overflow-y: auto;

            padding: 34px 38px 32px;

            box-sizing: border-box;

            border-radius: 24px;

            background: #295C65;

            box-shadow:
              0 30px 80px
              rgba(0,0,0,0.32);

            animation:
              quote-up
              0.24s
              ease-out;
          }

          @keyframes quote-up {
            from {
              opacity: 0;

              transform:
                translateY(15px)
                scale(0.99);
            }

            to {
              opacity: 1;

              transform:
                translateY(0)
                scale(1);
            }
          }

          /* =================================================
             CLOSE
          ================================================= */

          .quote-close {
            position: absolute;

            top: 15px;
            right: 15px;

            width: 38px;
            height: 38px;

            display: flex;
            align-items: center;
            justify-content: center;

            border:
              1px solid
              rgba(255,255,255,0.28);

            border-radius: 50%;

            background:
              rgba(255,255,255,0.07);

            color: #FFFFFF;

            cursor: pointer;

            transition:
              transform 0.2s ease,
              background 0.2s ease;
          }

          .quote-close:hover {
            transform: rotate(90deg);

            background:
              rgba(255,255,255,0.15);
          }

          /* =================================================
             MODAL HEADER
          ================================================= */

          .quote-header {
            width: 100%;

            text-align: center;

            margin-bottom: 26px;

            padding: 0 44px;

            box-sizing: border-box;
          }

          .quote-eyebrow {
            display: flex;

            align-items: center;
            justify-content: center;

            gap: 10px;

            margin-bottom: 10px;
          }

          .quote-eyebrow-line {
            width: 22px;
            height: 1px;

            background:
              #BE9D6B;
          }

          .quote-eyebrow-text {
            font-family:
              "Poppins",
              Arial,
              Helvetica,
              sans-serif;

            font-size: 10px;

            font-weight: 600;

            letter-spacing: 2px;

            color: #BE9D6B;

            text-transform: uppercase;
          }

          .quote-heading {
            margin: 0;

            color: #FFFFFF;

            font-family:
              "Cormorant Garamond",
              Georgia,
              serif;

            font-size: 38px;

            font-weight: 600;

            line-height: 1.08;
          }

          .quote-subheading {
            max-width: 600px;

            margin: 9px auto 0;

            color:
              rgba(255,255,255,0.72);

            font-family:
              "Poppins",
              Arial,
              Helvetica,
              sans-serif;

            font-size: 12px;

            line-height: 1.55;
          }

          /* =================================================
             FORM GRID
          ================================================= */

          .quote-form {
            width: 100%;
          }

          .quote-grid {
            width: 100%;

            display: grid;

            grid-template-columns:
              repeat(2, minmax(0,1fr));

            gap: 16px 20px;
          }

          .quote-field {
            width: 100%;

            min-width: 0;
          }

          .quote-field-full {
            grid-column: 1 / -1;
          }

          .quote-label {
            display: block;

            margin-bottom: 6px;

            color: #FFFFFF;

            font-family:
              "Poppins",
              Arial,
              Helvetica,
              sans-serif;

            font-size: 12px;

            font-weight: 600;

            line-height: 1.3;
          }

          .quote-input,
          .quote-textarea {
            width: 100%;

            display: block;

            padding: 8px 2px;

            border: none;

            border-bottom:
              1px solid
              rgba(255,255,255,0.42);

            border-radius: 0;

            background: transparent;

            color: #FFFFFF;

            outline: none;

            font-family:
              "Poppins",
              Arial,
              Helvetica,
              sans-serif;

            font-size: 13px;

            font-weight: 400;

            line-height: 1.4;

            box-sizing: border-box;
          }

          .quote-input {
            height: 38px;
          }

          .quote-textarea {
            min-height: 65px;

            resize: vertical;
          }

          .quote-input::placeholder,
          .quote-textarea::placeholder {
            color:
              rgba(255,255,255,0.56);
          }

          .quote-input:focus,
          .quote-textarea:focus {
            border-bottom-color:
              #BE9D6B;
          }

          /* =================================================
             SUBMIT
          ================================================= */

          .quote-submit {
            width: 100%;

            height: 50px;

            margin-top: 20px;

            display: flex;

            align-items: center;
            justify-content: center;

            gap: 9px;

            border: none;

            border-radius: 999px;

            background: #BE9D6B;

            color: #FFFFFF;

            font-family:
              "Poppins",
              Arial,
              Helvetica,
              sans-serif;

            font-size: 14px;

            font-weight: 600;

            cursor: pointer;

            transition:
              transform 0.2s ease,
              filter 0.2s ease;
          }

          .quote-submit:hover {
            transform: translateY(-1px);

            filter: brightness(1.06);
          }

          /* =================================================
             TABLET
          ================================================= */

          @media (max-width: 900px) {
            .contact-cta-container {
              padding: 0 32px;
            }

            .contact-cta-box {
              min-height: 280px;

              padding:
                42px 28px;
            }

            .contact-cta-title {
              font-size: 42px;
            }

            .quote-modal-card {
              max-width: 760px;

              padding:
                32px 30px 28px;
            }
          }

          /* =================================================
             MOBILE
          ================================================= */

          @media (max-width: 700px) {
            .contact-cta-container {
              width: 100%;

              max-width: 100%;

              margin: 0;

              padding: 0 16px;
            }

            .contact-cta-box {
              width: 100%;

              min-height: 220px;

              padding:
                34px 18px;

              border-radius: 18px;
            }

            .contact-cta-eyebrow {
              font-size: 9px;

              letter-spacing: 2px;

              margin-bottom: 10px;
            }

            .contact-cta-line {
              width: 20px;
            }

            .contact-cta-title {
              max-width: 340px;

              font-size: 31px;

              line-height: 1.08;
            }

            .contact-cta-description {
              max-width: 330px;

              margin:
                10px auto 18px;

              font-size: 11.5px;

              line-height: 1.5;
            }

            .contact-cta-button {
              min-width: 150px;

              min-height: 44px;

              padding:
                11px 22px;

              font-size: 12.5px;
            }

            /* =============================================
               MOBILE MODAL
            ============================================= */

            .quote-modal {
              align-items: flex-start;

              padding: 10px;
            }

            .quote-modal-card {
              width: 100%;

              max-width: 100%;

              max-height:
                calc(100vh - 20px);

              padding:
                26px 17px 20px;

              border-radius: 19px;
            }

            .quote-close {
              top: 11px;
              right: 11px;

              width: 34px;
              height: 34px;
            }

            .quote-header {
              padding: 0 30px;

              margin-bottom: 21px;
            }

            .quote-heading {
              font-size: 29px;

              line-height: 1.08;
            }

            .quote-subheading {
              font-size: 10.5px;

              line-height: 1.5;
            }

            .quote-eyebrow-text {
              font-size: 9px;

              letter-spacing: 1.6px;
            }

            .quote-grid {
              grid-template-columns: 1fr;

              gap: 14px;
            }

            .quote-field-full {
              grid-column: auto;
            }

            .quote-label {
              font-size: 11.5px;

              margin-bottom: 4px;
            }

            .quote-input {
              height: 36px;

              font-size: 12px;
            }

            .quote-textarea {
              min-height: 62px;

              font-size: 12px;
            }

            .quote-submit {
              height: 46px;

              margin-top: 17px;

              font-size: 12.5px;
            }
          }

          /* =================================================
             SMALL MOBILE
          ================================================= */

          @media (max-width: 380px) {
            .contact-cta-box {
              min-height: 205px;

              padding:
                30px 16px;
            }

            .contact-cta-title {
              font-size: 28px;
            }

            .contact-cta-description {
              font-size: 11px;

              max-width: 300px;
            }

            .quote-modal {
              padding: 7px;
            }

            .quote-modal-card {
              max-height:
                calc(100vh - 14px);

              padding:
                24px 14px 18px;
            }

            .quote-header {
              padding: 0 25px;
            }

            .quote-heading {
              font-size: 27px;
            }
          }

          /* =================================================
             REDUCED MOTION
          ================================================= */

          @media (prefers-reduced-motion: reduce) {
            .contact-cta-button,
            .quote-modal,
            .quote-modal-card,
            .quote-close,
            .quote-submit {
              animation: none !important;

              transition: none !important;
            }
          }
        `}</style>

        <div className="contact-cta-container">
          <div className="contact-cta-box">

            <div className="contact-cta-eyebrow">
              <span className="contact-cta-line" />

              <span>
                Get in Touch
              </span>

              <span className="contact-cta-line" />
            </div>

            <h2 className="contact-cta-title">
              Still Have Questions? Let&apos;s Talk.
            </h2>

            <p className="contact-cta-description">
              Have a question or a fabric requirement?
              Tell us what you need and our team will
              help you find the right solution.
            </p>

            <button
              type="button"
              className="contact-cta-button"
              onClick={openForm}
            >
              Contact Us

              <ArrowRight
                size={17}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUOTE MODAL
      ===================================================== */}

      {isOpen && (
        <div
          className="quote-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-heading"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <div className="quote-modal-card">

            {/* CLOSE */}

            <button
              type="button"
              className="quote-close"
              onClick={closeForm}
              aria-label="Close quote form"
            >
              <X
                size={18}
                strokeWidth={2}
              />
            </button>

            {/* HEADER */}

            <div className="quote-header">
              <div className="quote-eyebrow">
                <span className="quote-eyebrow-line" />

                <span className="quote-eyebrow-text">
                  Contact Us
                </span>

                <span className="quote-eyebrow-line" />
              </div>

              <h2
                id="quote-heading"
                className="quote-heading"
              >
                Send a Quote Request
              </h2>

              <p className="quote-subheading">
                Share your fabric requirements and
                our team will get back to you shortly.
              </p>
            </div>

            {/* FORM */}

            <form
              className="quote-form"
              onSubmit={handleSubmit}
            >
              <div className="quote-grid">

                {/* FULL NAME */}

                <div className="quote-field">
                  <label
                    htmlFor="quote-name"
                    className="quote-label"
                  >
                    Full Name
                  </label>

                  <input
                    id="quote-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={handleChange}
                    className="quote-input"
                  />
                </div>

                {/* COMPANY */}

                <div className="quote-field">
                  <label
                    htmlFor="quote-company"
                    className="quote-label"
                  >
                    Company
                  </label>

                  <input
                    id="quote-company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    placeholder="Company Name"
                    value={form.company}
                    onChange={handleChange}
                    className="quote-input"
                  />
                </div>

                {/* PHONE */}

                <div className="quote-field">
                  <label
                    htmlFor="quote-phone"
                    className="quote-label"
                  >
                    Phone
                  </label>

                  <input
                    id="quote-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    className="quote-input"
                  />
                </div>

                {/* EMAIL */}

                <div className="quote-field">
                  <label
                    htmlFor="quote-email"
                    className="quote-label"
                  >
                    Email
                  </label>

                  <input
                    id="quote-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                    className="quote-input"
                  />
                </div>

                {/* FABRIC */}

                <div className="quote-field quote-field-full">
                  <label
                    htmlFor="quote-fabric"
                    className="quote-label"
                  >
                    Fabric Requirement
                  </label>

                  <input
                    id="quote-fabric"
                    name="fabric"
                    type="text"
                    required
                    placeholder="e.g. Cotton Cambric, Ajrakh..."
                    value={form.fabric}
                    onChange={handleChange}
                    className="quote-input"
                  />
                </div>

                {/* QUANTITY */}

                <div className="quote-field">
                  <label
                    htmlFor="quote-quantity"
                    className="quote-label"
                  >
                    Quantity / MOQ
                  </label>

                  <input
                    id="quote-quantity"
                    name="quantity"
                    type="text"
                    required
                    placeholder="e.g. 500 metres"
                    value={form.quantity}
                    onChange={handleChange}
                    className="quote-input"
                  />
                </div>

                {/* CITY */}

                <div className="quote-field">
                  <label
                    htmlFor="quote-city"
                    className="quote-label"
                  >
                    Country / City
                  </label>

                  <input
                    id="quote-city"
                    name="city"
                    type="text"
                    required
                    placeholder="Destination"
                    value={form.city}
                    onChange={handleChange}
                    className="quote-input"
                  />
                </div>

                {/* MESSAGE */}

                <div className="quote-field quote-field-full">
                  <label
                    htmlFor="quote-message"
                    className="quote-label"
                  >
                    Message
                  </label>

                  <textarea
                    id="quote-message"
                    name="message"
                    placeholder="Tell us more about your requirements..."
                    value={form.message}
                    onChange={handleChange}
                    className="quote-textarea"
                  />
                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="quote-submit"
              >
                <span>
                  Submit Quote Request
                </span>

                <ArrowRight
                  size={18}
                  strokeWidth={2}
                />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  section: {
    width: "100%",

    background: "#F2EEE9",

    /*
      Vertical spacing only.
      Horizontal spacing is controlled
      by the single container.
    */
    padding: "48px 0",

    boxSizing: "border-box",
  },
};
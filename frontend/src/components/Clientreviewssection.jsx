"use client";

const testimonials = [
  {
    quote:
      "Bhavya Fabrics has been our primary supplier for three seasons. The consistency in GSM, color, and finish is exceptional. Truly export-grade quality at wholesale pricing.",
    name: "Priya Mehta",
    role: "Owner, Studio Drape – Mumbai",
  },
  {
    quote:
      "We source Ajrakh and block print fabrics from Bhavya for our Middle Eastern clientele. The packaging, documentation, and delivery timelines meet international standards.",
    name: "Amir Al-Rashid",
    role: "Procurement Director, Dubai Fashion House",
  },
  {
    quote:
      "Their mulmul and cotton cambric quality is unmatched in Rajasthan. The MOQ flexibility and custom printing capability make them our go-to manufacturer.",
    name: "Sunita Kapoor",
    role: "CEO, Kapoor Garment Exports – Jaipur",
  },
];

function StarRating() {
  return (
    <div className="review-stars" aria-label="5 star rating">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="review-star"
        >
          &#9733;
        </span>
      ))}
    </div>
  );
}

export default function ClientReviewsSection() {
  return (
    <section
      className="reviews-section"
      style={styles.section}
    >
      <style>{`
        /* =====================================================
           ONE MAIN CONTAINER
        ===================================================== */

        .reviews-container {
          width: 100%;
          max-width: 1400px;

          margin: 0 auto;

          padding: 0 32px;

          box-sizing: border-box;
        }

        /* =====================================================
           TOP TAG
        ===================================================== */

        .reviews-tag {
          display: flex;
          align-items: center;

          gap: 12px;

          margin-bottom: 20px;
        }

        .reviews-tag-line {
          width: 24px;
          height: 1px;

          flex-shrink: 0;

          display: inline-block;

          background: #BE9D6B;
        }

        .reviews-tag-text {
          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;

          font-weight: 500;

          letter-spacing: 2px;

          line-height: 1.2;

          color: #BE9D6B;

          text-transform: uppercase;
        }

        /* =====================================================
           HEADING
        ===================================================== */

      .reviews-heading {
  width: 100%;

  margin: 0 0 56px 0;

  font-family:
    "Cormorant Garamond",
    Georgia,
    serif;

  font-size: 40px;

  font-weight: 600;

  line-height: 1.2;

  color: #1A1A1A;

  text-align: center;
}

        /* =====================================================
           CARDS GRID
        ===================================================== */

        .reviews-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 24px;

          box-sizing: border-box;
        }

        /* =====================================================
           CARD
        ===================================================== */

        .review-card {
          width: 100%;
          min-width: 0;

          display: flex;
          flex-direction: column;

          box-sizing: border-box;

          background: #FFFFFF;

          border-radius: 16px;

          padding: 32px;

          box-shadow:
            0 2px 8px
            rgba(0, 0, 0, 0.04);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        /* =====================================================
           CARD HOVER
        ===================================================== */

        @media (hover: hover) and (pointer: fine) {
          .review-card:hover {
            transform: translateY(-6px);

            box-shadow:
              0 14px 28px
              rgba(41, 92, 101, 0.10);
          }
        }

        /* =====================================================
           STARS
        ===================================================== */

        .review-stars {
          display: flex;

          align-items: center;

          gap: 4px;

          margin-bottom: 20px;
        }

        .review-star {
          display: inline-block;

          color: #BE9D6B;

          font-size: 16px;

          line-height: 1;
        }

        /* =====================================================
           QUOTE
        ===================================================== */

        .review-quote {
          width: 100%;

          margin: 0 0 28px 0;

          flex-grow: 1;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 18px;

          font-style: italic;

          font-weight: 400;

          line-height: 1.6;

          color: #3A3A3A;
        }

        /* =====================================================
           NAME
        ===================================================== */

        .review-name {
          margin: 0 0 4px 0;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 16px;

          font-weight: 500;

          line-height: 1.4;

          color: #1A1A1A;
        }

        /* =====================================================
           ROLE
        ===================================================== */

        .review-role {
          margin: 0;

          font-family:
            "Poppins",
            Arial,
            Helvetica,
            sans-serif;

          font-size: 14px;

          font-weight: 400;

          line-height: 1.45;

          color: #BE9D6B;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1000px) {
          .reviews-container {
            padding: 0 32px;
          }

          .reviews-grid {
            grid-template-columns:
              1fr;
          }

          .review-card {
            padding: 28px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .reviews-container {
            width: 100%;
            max-width: 100%;

            margin: 0;

            padding: 0 16px;
          }

          .reviews-tag {
            margin-bottom: 16px;
          }

          .reviews-tag-line {
            width: 22px;
          }

          .reviews-tag-text {
            font-size: 11px;
            letter-spacing: 1.8px;
          }

          .reviews-heading {
            font-size: 34px;

            line-height: 1.15;

            margin-bottom: 36px;
          }

          .reviews-grid {
            grid-template-columns: 1fr;

            gap: 14px;
          }

          .review-card {
            padding: 24px;

            border-radius: 14px;
          }

          .review-stars {
            margin-bottom: 16px;
          }

          .review-star {
            font-size: 17px;
          }

          .review-quote {
            font-size: 17px;

            line-height: 1.55;

            margin-bottom: 24px;
          }

          .review-name {
            font-size: 15px;
          }

          .review-role {
            font-size: 13px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {
          .reviews-container {
            padding: 0 16px;
          }

          .reviews-heading {
            font-size: 30px;

            margin-bottom: 30px;
          }

          .review-card {
            padding: 20px;
          }

          .review-quote {
            font-size: 16px;

            line-height: 1.5;
          }

          .review-name {
            font-size: 14px;
          }

          .review-role {
            font-size: 12.5px;
          }
        }

        /* =====================================================
           VERY SMALL MOBILE
        ===================================================== */

        @media (max-width: 360px) {
          .reviews-heading {
            font-size: 28px;
          }

          .review-card {
            padding: 18px;
          }

          .review-quote {
            font-size: 15px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .review-card {
            transition: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          ONE CONTAINER ONLY
      ===================================================== */}

      <div className="reviews-container">
        {/* =====================================================
            TAG
        ===================================================== */}

        <div className="reviews-tag">
          <span className="reviews-tag-line" />

          <span className="reviews-tag-text">
            Client Reviews
          </span>
        </div>

        {/* =====================================================
            HEADING
        ===================================================== */}

        <h2 className="reviews-heading">
          Trusted by Fashion Brands Worldwide
        </h2>

        {/* =====================================================
            TESTIMONIAL CARDS
        ===================================================== */}

        <div className="reviews-grid">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="review-card"
            >
              <StarRating />

              <p className="review-quote">
                &quot;
                {testimonial.quote}
                &quot;
              </p>

              <p className="review-name">
                {testimonial.name}
              </p>

              <p className="review-role">
                {testimonial.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    width: "100%",

    /*
      Background fixed directly.
      Global --cream variable cannot override it.
    */
    background: "#F2EEE9",

    /*
      Vertical section spacing only.
      Horizontal spacing is controlled
      by the single reviews-container.
    */
    padding: "64px 0",

    boxSizing: "border-box",
  },
};
const COLORS = {
  teal: "#295c65",
  tealDeep: "#1f4a53",
  gold: "#be9d6b",
  goldLight: "#d8bf94",
  white: "#ffffff",
};

// 🔧 apna WhatsApp number yahan daalo (country code ke saath, bina + ya space ke)
const WHATSAPP_URL =
  "https://wa.me/91XXXXXXXXXX?text=Hello%20Bhavya%20Fabrics%2C%20I%20would%20like%20to%20know%20more%20about%20your%20fabric%20collections.";

export default function JoinSection() {
  return (
    <section className="join-section" aria-label="Contact Bhavya Fabrics">
      <span className="join-diamond" aria-hidden="true" />

      <div className="join-inner">
        <div className="join-copy">
          <h2 className="join-heading">Join Bhavya Fabrics</h2>
          <p className="join-subtext">
            Latest fabric collections, export updates and wholesale offers.
          </p>
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="join-btn"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.2A8.5 8.5 0 1 1 21 11.5z" />
          </svg>
          <span>Chat on WhatsApp</span>
        </a>
      </div>

      <style>{`
        .join-section {
          position: relative;
          width: 100%;
          box-sizing: border-box;
          padding: 44px 32px;
          overflow: hidden;
          background-color: ${COLORS.teal};
          background-image:
            repeating-linear-gradient(45deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 6px),
            repeating-linear-gradient(-45deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 6px),
            linear-gradient(135deg, #2f6a74 0%, ${COLORS.teal} 45%, ${COLORS.tealDeep} 100%);
          border-top: 1px solid ${COLORS.gold};
        }

        /* inner gold frame */
        .join-section::before {
          content: "";
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(190, 157, 107, 0.28);
          pointer-events: none;
        }

        /* small diamond on the top line */
        .join-diamond {
          position: absolute;
          top: -5px;
          left: 50%;
          width: 9px;
          height: 9px;
          background: ${COLORS.gold};
          transform: translateX(-50%) rotate(45deg);
          box-shadow: 0 0 0 3px ${COLORS.teal};
        }

        .join-inner {
          position: relative;
          max-width: 1180px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .join-copy { min-width: 0; }

        .join-heading {
          margin: 0 0 8px 0;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: 40px;
          line-height: 1.1;
          letter-spacing: 0.4px;
          color: ${COLORS.white};
        }

        .join-subtext {
          margin: 0;
          max-width: 520px;
          font-family: 'Poppins', sans-serif;
          font-size: 14.5px;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.7);
        }

        .join-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-sizing: border-box;
          padding: 15px 34px;
          border-radius: 999px;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 600;
          line-height: 1;
          letter-spacing: 0.3px;
          white-space: nowrap;
          text-decoration: none;
          color: ${COLORS.tealDeep};
          background: linear-gradient(135deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 100%);
          border: 1px solid ${COLORS.goldLight};
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
          transition: filter 0.2s ease, box-shadow 0.2s ease;
        }
        .join-btn:hover {
          filter: brightness(1.06);
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.3);
        }
        .join-btn:focus-visible {
          outline: 2px solid ${COLORS.white};
          outline-offset: 3px;
        }

        @media (max-width: 820px) {
          .join-section { padding: 38px 24px; }
          .join-inner {
            flex-direction: column;
            text-align: center;
            gap: 24px;
          }
          .join-subtext { margin: 0 auto; }
          .join-heading { font-size: 32px; }
        }

        @media (max-width: 480px) {
          .join-section { padding: 34px 18px; }
          .join-heading { font-size: 28px; }
          .join-subtext { font-size: 14px; }
          .join-btn { width: 100%; }
        }
      `}</style>
    </section>
  );
}
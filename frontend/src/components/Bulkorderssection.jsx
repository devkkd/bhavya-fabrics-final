import Image from "next/image";

export default function BulkOrdersSection() {
  return (
    <section
      style={{
        width: "100%",
        background: "var(--cream, #FAF8F5)",
        padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 62px)",
        boxSizing: "border-box",
      }}
    >
      <div
        className="wex-container"
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "clamp(24px, 4vw, 64px)",
          alignItems: "center",
          background: "var(--teal, #295C65)",
          borderRadius: "clamp(16px, 2vw, 24px)",
          overflow: "hidden",
        }}
      >
        {/* Left image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "4 / 3",
            minHeight: "220px",
          }}
        >
          <Image
            src="/images/home/facility/4.png"
            alt="Fabric manufacturing warehouse"
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* Right content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(24px, 4vw, 56px) clamp(20px, 4vw, 64px)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "1px",
                background: "var(--gold, #BE9D6B)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                letterSpacing: "2px",
                fontSize: "12px",
                color: "var(--gold, #BE9D6B)",
                textTransform: "uppercase",
              }}
            >
              Bulk Orders
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              color: "#FFFFFF",
              fontSize: "clamp(25px, 4vw, 40px)",
              lineHeight: 1.15,
              margin: "0 0 24px 0",
            }}
          >
            Looking for a Bulk Fabric Supplier?
          </h2>

          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(13px, 1.5vw, 15px)",
              lineHeight: 1.6,
              color: "var(--dark-cream, #F2EEE9)",
              margin: "0 0 32px 0",
              maxWidth: "560px",
            }}
          >
            Direct manufacturer prices with export quality assurance. Get
            custom printing, bespoke dyeing, and private labelling for your
            brand.
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <a
              href="#"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "clamp(13px, 1.4vw, 15px)",
                padding: "clamp(12px, 1.5vw, 16px) clamp(18px, 2vw, 28px)",
                borderRadius: "999px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                background: "var(--gold, #BE9D6B)",
                color: "#FFFFFF",
                border: "none",
                flex: "1 1 160px",
              }}
            >
              Request Quote <span aria-hidden="true">&rarr;</span>
            </a>
            <a
              href="#"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "clamp(13px, 1.4vw, 15px)",
                padding: "clamp(12px, 1.5vw, 16px) clamp(18px, 2vw, 28px)",
                borderRadius: "999px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                whiteSpace: "nowrap",
                background: "transparent",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                flex: "1 1 160px",
              }}
            >
              Download Catalogue
            </a>
          </div>
        </div>
      </div>

      {/* Only media query needed: stack columns below 700px.
          A plain <style> tag (not styled-jsx) renders identically on server
          and client, so there is no flash/glitch on refresh. */}
      <style>{`
        @media (max-width: 700px) {
          .wex-container {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
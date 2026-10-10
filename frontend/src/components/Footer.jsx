"use client";



import { useEffect, useState } from "react";



// public/images/logo.png -> in code this is just "/images/logo.png"

const LOGO_IMAGE_SRC = "/images/logo.png";



const QUICK_LINKS = [

  { label: "Blog", href: "/blog" },

  { label: "New Arrivals", href: "/newArrivals" },

  { label: "Collections", href: "/collection" },

  { label: "Sale", href: "/sale" },

  { label: "About", href: "/about" },

  { label: "Contact", href: "/contact" },

  { label: "Exhibitions", href: "/exhibitions" },

];



const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/+$/, "");

const FALLBACK_COLLECTIONS = [
  { label: "Cotton Fabrics", href: "/collection/cotton" },
  { label: "Silk Fabrics", href: "/collection/silk" },
  { label: "Printed Fabrics", href: "/collection/printed" },
  { label: "Embroidered Fabrics", href: "/collection/embroidered" },
];

function slugify(value = "") {
  return String(value).trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function extractCategoryRows(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.data?.categories)) return payload.data.categories;
  if (Array.isArray(payload)) return payload;
  return [];
}

const CONTACT_DETAILS = {

  phone: "+91 8302906190",

  email: "info@bhavyafabrics.com",

  address: "38 Gupta Garden, Govind Nagar West, Amar Road, Jaipur, Rajasthan – 302002",

  hours: "Mon–Sat · 9:30 AM – 7:00 PM",

};



const BOTTOM_LINKS = [

  { label: "Privacy Policy", href: "/privacy-policy" },

  { label: "Terms of Use", href: "/terms-of-use" },

  { label: "Shipping Policy", href: "/shipping-policy" },

];



/* ---------------- Social icons (real brand marks + brand colors) ---------------- */



function LinkedInIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">

      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />

    </svg>

  );

}



function InstagramIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">

      <rect x="3" y="3" width="18" height="18" rx="5" />

      <circle cx="12" cy="12" r="4.2" />

      <circle cx="17.35" cy="6.65" r="1.15" fill="currentColor" stroke="none" />

    </svg>

  );

}



function FacebookIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">

      <path d="M13.9 21.9v-8.4h2.82l.42-3.27h-3.24V8.15c0-.95.26-1.6 1.63-1.6h1.74V3.64C17 3.6 15.98 3.5 14.8 3.5c-2.47 0-4.16 1.5-4.16 4.27v2.38H7.8v3.27h2.84v8.4h3.26z" />

    </svg>

  );

}



function WhatsAppIcon() {

  return (

    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">

      <path d="M16.03 3C9.06 3 3.4 8.63 3.4 15.57c0 2.4.65 4.63 1.87 6.6L3 29l7.03-2.24a12.9 12.9 0 0 0 6 1.5h.01c6.97 0 12.63-5.63 12.63-12.57C28.67 8.75 23.01 3 16.03 3zm0 22.96h-.01a10.6 10.6 0 0 1-5.38-1.48l-.39-.23-4.17 1.33 1.36-4.06-.25-.42a10.35 10.35 0 0 1-1.59-5.53c0-5.73 4.68-10.4 10.44-10.4 2.79 0 5.41 1.09 7.38 3.05a10.3 10.3 0 0 1 3.06 7.36c0 5.73-4.68 10.38-10.45 10.38zm5.72-7.78c-.31-.16-1.85-.91-2.14-1.02-.29-.1-.5-.16-.71.16-.21.31-.81 1.02-1 1.23-.18.21-.37.23-.68.08-.31-.16-1.32-.49-2.51-1.55-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.4 5.38 4.77.75.32 1.34.52 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.85-.75 2.11-1.48.26-.73.26-1.35.18-1.48-.08-.13-.29-.21-.6-.37z" />

    </svg>

  );

}



const SOCIAL_LINKS = [

  { name: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon, bg: "#0A66C2" },

  {

    name: "Instagram",

    href: "https://instagram.com",

    icon: InstagramIcon,

    bg: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af,#515bd4)",

  },

  { name: "Facebook", href: "https://facebook.com", icon: FacebookIcon, bg: "#1877F2" },

  { name: "WhatsApp", href: "https://wa.me/918302906190", icon: WhatsAppIcon, bg: "#25D366" },

];



/* ---------------- Contact row icons ---------------- */



function PhoneIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">

      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.8 2.1z" />

    </svg>

  );

}



function MailIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">

      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />

      <path d="M3 6.5l9 6.5 9-6.5" />

    </svg>

  );

}



function PinIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">

      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />

      <circle cx="12" cy="9" r="2.4" />

    </svg>

  );

}



function ClockIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">

      <circle cx="12" cy="12" r="9" />

      <path d="M12 7v5l3.5 2" />

    </svg>

  );

}



function ChevronIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">

      <path d="M6 9l6 6 6-6" />

    </svg>

  );

}



/* ---------------- Accordion column (mobile) / plain column (desktop) ---------------- */



function FooterColumn({ id, title, isOpen, onToggle, children }) {

  return (

    <div className="ft-col">

      <button

        type="button"

        className="ft-col-heading"

        onClick={() => onToggle(id)}

        aria-expanded={isOpen}

        aria-controls={`ft-panel-${id}`}

      >

        <span>{title}</span>

        <span className={`ft-chevron${isOpen ? " ft-chevron--open" : ""}`}>

          <ChevronIcon />

        </span>

      </button>

      <div id={`ft-panel-${id}`} className={`ft-col-content${isOpen ? " ft-col-content--open" : ""}`}>

        <div className="ft-col-content-inner">{children}</div>

      </div>

    </div>

  );

}



export default function Footer() {

  // All sections start closed on mobile. Opening one closes the other (accordion).

  const [openSection, setOpenSection] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [collectionsLinks, setCollectionsLinks] = useState(FALLBACK_COLLECTIONS);

  function toggleSection(id) {
    setOpenSection((prev) => (prev === id ? null : id));
  }

  useEffect(() => {
    let mounted = true;

    async function loadCollections() {
      try {
        const response = await fetch(`${API_URL}/categories`, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch collections");

        const payload = await response.json();
        const rows = extractCategoryRows(payload);
        const sortedRows = [...rows]
          .filter((item) => item?.category || item?.name || item?.label || item?.title)
          .sort((a, b) => {
            const aOrder = Number(a?.order || 0);
            const bOrder = Number(b?.order || 0);
            return aOrder - bOrder;
          });

        const latest = [];
        const seen = new Set();
        for (const item of sortedRows) {
          const label = String(item?.category || item?.name || item?.label || item?.title || "").trim();
          if (!label) continue;
          const slug = slugify(item?.slug || label);
          if (!slug || seen.has(slug)) continue;
          seen.add(slug);
          latest.push({ label, href: `/collection/${item?.slug || slug}` });
          if (latest.length === 6) break;
        }

        if (mounted) setCollectionsLinks(latest.length ? latest : FALLBACK_COLLECTIONS);
      } catch (error) {
        console.error("Footer Collections API Error:", error);
        if (mounted) setCollectionsLinks(FALLBACK_COLLECTIONS);
      }
    }

    loadCollections();

    const refreshCollections = () => loadCollections();
    window.addEventListener("focus", refreshCollections);
    document.addEventListener("visibilitychange", refreshCollections);

    return () => {
      mounted = false;
      window.removeEventListener("focus", refreshCollections);
      document.removeEventListener("visibilitychange", refreshCollections);
    };
  }, []);



  return (

    <footer className="ft-footer">

      <div className="ft-container">

        <div className="ft-grid">

          {/* Brand column - always visible */}

          <div className="ft-brand">

            <a href="/" className="ft-logo" aria-label="Bhavya Fabrics home">

              <span className="ft-logo-icon">

                {!logoError ? (

                  <img src={LOGO_IMAGE_SRC} alt="Bhavya Fabrics Logo" onError={() => setLogoError(true)} />

                ) : (

                  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">

                    <circle cx="30" cy="30" r="28" stroke="#BE9D6B" strokeWidth="1.2" />

                    <path

                      d="M30 12c-6 4-9 10-9 16 0 7 4 12 9 16 5-4 9-9 9-16 0-6-3-12-9-16z"

                      stroke="#BE9D6B"

                      strokeWidth="1.3"

                      fill="none"

                    />

                  </svg>

                )}

              </span>

              <span className="ft-logo-text">

                <span className="ft-logo-title">Bhavya Fabrics</span>

                <span className="ft-logo-tagline">Premium Textile Manufacturer</span>

              </span>

            </a>



            <p className="ft-desc">

              Premium wholesale textile manufacturer based in Jaipur, Rajasthan. Supplying

              export-quality fabrics to fashion brands, garment manufacturers and global buyers

              since years.

            </p>



            <div className="ft-social">

              {SOCIAL_LINKS.map(({ name, href, icon: Icon, bg }) => (

                <a

                  key={name}

                  href={href}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="ft-social-btn"

                  aria-label={name}

                  style={{ "--ft-social-bg": bg }}

                >

                  <Icon />

                </a>

              ))}

            </div>

          </div>



          {/* Quick Links */}

          <FooterColumn id="quick" title="Quick Links" isOpen={openSection === "quick"} onToggle={toggleSection}>

            <ul className="ft-list">

              {QUICK_LINKS.map((l) => (

                <li key={l.href}>

                  <a href={l.href}>{l.label}</a>

                </li>

              ))}

            </ul>

          </FooterColumn>



          {/* Collections */}

          <FooterColumn

            id="collections"

            title="Collections"

            isOpen={openSection === "collections"}

            onToggle={toggleSection}

          >

            <ul className="ft-list">

              {collectionsLinks.map((l) => (

                <li key={l.href}>

                  <a href={l.href}>{l.label}</a>

                </li>

              ))}

            </ul>

          </FooterColumn>



          {/* Contact */}

          <FooterColumn id="contact" title="Contact" isOpen={openSection === "contact"} onToggle={toggleSection}>

            <ul className="ft-contact-list">

              <li>

                <span className="ft-contact-icon">

                  <PhoneIcon />

                </span>

                <a href={`tel:${CONTACT_DETAILS.phone.replace(/\s+/g, "")}`}>{CONTACT_DETAILS.phone}</a>

              </li>

              <li>

                <span className="ft-contact-icon">

                  <MailIcon />

                </span>

                <a href={`mailto:${CONTACT_DETAILS.email}`}>{CONTACT_DETAILS.email}</a>

              </li>

              <li>

                <span className="ft-contact-icon">

                  <PinIcon />

                </span>

                <span>{CONTACT_DETAILS.address}</span>

              </li>

              <li>

                <span className="ft-contact-icon">

                  <ClockIcon />

                </span>

                <span>{CONTACT_DETAILS.hours}</span>

              </li>

            </ul>

          </FooterColumn>

        </div>



       <div className="ft-bottom">

  <p className="ft-copyright">

    © {new Date().getFullYear()} Bhavya Fabrics. All Rights Reserved.

  </p>



  <p className="ft-crafted">

    Crafted by{" "}

    <a

      href="https://www.kontentkraftdigital.com/"

      target="_blank"

      rel="noopener noreferrer"

    >

      Kontent Kraft Digital

    </a>

  </p>



  <div className="ft-bottom-links">

    {BOTTOM_LINKS.map((l) => (

      <a key={l.href} href={l.href}>

        {l.label}

      </a>

    ))}

  </div>

</div>

      </div>



      <style>{`

        :root {

          \--teal: #295C65;

          \--cream: #FAF8F5;

          \--gold: #BE9D6B;

          \--nav-gray: #696968;

          \--white: #FFFFFF;



          \--ft-bg: #17181a;

          \--ft-bg-soft: #1f2022;

          \--ft-border: rgba(255, 255, 255, 0.09);

          \--ft-text: #FFFFFF;

          \--ft-text-dim: rgba(255, 255, 255, 0.78);

          \--ft-text-faint: rgba(255, 255, 255, 0.5);

        }



        \* {

          box-sizing: border-box;

        }



        .ft-footer {

          background: var(--ft-bg);

          color: var(--ft-text);

          font-family: "Poppins", "Segoe UI", system-ui, sans-serif;

        }



        .ft-container {

          max-width: 1400px;

          margin: 0 auto;

          padding: 56px 32px 0;

        }



        @media (max-width: 768px) {

          .ft-container {

            padding: 40px 20px 0;

          }

        }



        .ft-grid {

          display: grid;

          grid-template-columns: 1.3fr 1fr 1fr 1.2fr;

          gap: 40px;

        }



        @media (max-width: 1100px) {

          .ft-grid {

            grid-template-columns: 1fr 1fr;

            row-gap: 36px;

          }

          .ft-brand {

            grid-column: 1 / -1;

          }

        }



        @media (max-width: 640px) {

          .ft-grid {

            grid-template-columns: 1fr;

            row-gap: 0;

          }

        }



        /* ---------- Brand column ---------- */

        .ft-brand {

          display: flex;

          flex-direction: column;

          gap: 18px;

        }



        .ft-logo {

          display: flex;

          align-items: center;

          gap: 12px;

          text-decoration: none;

        }



        .ft-logo-icon {

          display: flex;

          align-items: center;

          justify-content: center;

          width: 52px;

          height: 52px;

          flex-shrink: 0;

          border-radius: 50%;

          overflow: hidden;

          background: #fff;

        }



        .ft-logo-icon img {

          width: 100%;

          height: 100%;

          object-fit: contain;

          display: block;

        }



        .ft-logo-icon svg {

          width: 78%;

          height: 78%;

        }



        .ft-logo-text {

          display: flex;

          flex-direction: column;

          gap: 2px;

          line-height: 1.15;

        }



        .ft-logo-title {

          font-family: "Cormorant Garamond", "Playfair Display", Georgia, serif;

          font-size: 24px;

          font-weight: 600;

          color: var(--white);

        }



        .ft-logo-tagline {

          font-family: "Poppins", sans-serif;

          font-size: 10.5px;

          font-weight: 500;

          letter-spacing: 2px;

          color: var(--gold);

          text-transform: uppercase;

        }



        .ft-desc {

          margin: 0;

          font-size: 14.5px;

          line-height: 1.7;

          color: var(--ft-text-dim);

          max-width: 420px;

        }



        .ft-social {

          display: flex;

          align-items: center;

          gap: 12px;

          margin-top: 4px;

        }



        .ft-social-btn {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          width: 40px;

          height: 40px;

          border-radius: 50%;

          background: var(--ft-bg-soft);

          color: var(--white);

          text-decoration: none;

          transition: transform 0.2s ease, background 0.25s ease, box-shadow 0.25s ease, color 0.2s ease;

        }



        .ft-social-btn svg {

          width: 18px;

          height: 18px;

        }



        .ft-social-btn:hover {

          background: var(--ft-social-bg);

          color: #fff;

          transform: translateY(-2px);

          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);

        }



        /* ---------- Column headings ---------- */

        .ft-col-heading {

          display: flex;

          align-items: center;

          justify-content: space-between;

          width: 100%;

          background: none;

          border: none;

          padding: 0 0 18px;

          cursor: default;

          text-align: left;

          font-family: "Poppins", sans-serif;

          font-size: 13.5px;

          font-weight: 700;

          letter-spacing: 1.6px;

          text-transform: uppercase;

          color: var(--gold);

        }



        .ft-chevron {

          display: none;

          color: var(--ft-text-faint);

          transition: transform 0.25s ease;

        }



        .ft-chevron svg {

          width: 18px;

          height: 18px;

        }



        /* ---------- Lists ---------- */

        .ft-list {

          list-style: none;

          margin: 0;

          padding: 0;

          display: flex;

          flex-direction: column;

          gap: 14px;

        }



        .ft-list a {

          color: var(--ft-text);

          text-decoration: none;

          font-size: 14.5px;

          transition: color 0.2s ease, padding-left 0.2s ease;

        }



        .ft-list a:hover {

          color: var(--gold);

          padding-left: 3px;

        }



        .ft-contact-list {

          list-style: none;

          margin: 0;

          padding: 0;

          display: flex;

          flex-direction: column;

          gap: 18px;

        }



        .ft-contact-list li {

          display: flex;

          align-items: flex-start;

          gap: 12px;

          font-size: 14.5px;

          line-height: 1.55;

          color: var(--ft-text);

        }



        .ft-contact-list a {

          color: var(--ft-text);

          text-decoration: none;

        }



        .ft-contact-list a:hover {

          color: var(--gold);

        }



        .ft-contact-icon {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          flex-shrink: 0;

          width: 20px;

          height: 20px;

          margin-top: 2px;

          color: var(--gold);

        }



        .ft-contact-icon svg {

          width: 18px;

          height: 18px;

        }



        /* ---------- Bottom bar ---------- */

        .ft-bottom {

          margin-top: 48px;

          padding: 22px 0;

          border-top: 1px solid var(--ft-border);

          display: flex;

          align-items: center;

          justify-content: space-between;

          flex-wrap: wrap;

          gap: 12px;

        }



        .ft-copyright {

          margin: 0;

          font-size: 13.5px;

          color: var(--ft-text-faint);

        }



        .ft-bottom-links {

          display: flex;

          align-items: center;

          gap: 24px;

          flex-wrap: wrap;

        }



        .ft-bottom-links a {

          font-size: 13.5px;

          color: var(--ft-text-faint);

          text-decoration: none;

          transition: color 0.2s ease;

        }



        .ft-bottom-links a:hover {

          color: var(--white);

        }

          .ft-crafted {

  margin: 0;

  font-size: 13.5px;

  color: var(--ft-text-faint);

  text-align: center;

  white-space: nowrap;

}



.ft-crafted a {

  color: var(--ft-text);

  text-decoration: none;

  font-weight: 600;

  transition: color 0.2s ease;

}



.ft-crafted a:hover {

  color: var(--gold);

}



     /* =========================================================

   MOBILE FOOTER - COMPLETE RESPONSIVE CSS

   \========================================================= */



@media (max-width: 900px) {



  /* ---------- Main container ---------- */



  .ft-container {

    width: 100%;

    max-width: 100%;

    margin: 0;

    padding: 34px 18px 0;

  }



  /* ---------- Footer grid ---------- */



  .ft-grid {

    display: grid;

    grid-template-columns: 1fr;

    gap: 0;

    width: 100%;

  }



  /* ---------- Brand ---------- */



  .ft-brand {

    width: 100%;

    gap: 17px;

    padding-bottom: 28px;

  }



  .ft-logo {

    display: flex;

    align-items: center;

    gap: 10px;

    width: 100%;

  }



  .ft-logo-icon {

    width: 56px;

    height: 56px;

    flex-shrink: 0;

    border-radius: 50%;

  }



  .ft-logo-icon img {

    width: 100%;

    height: 100%;

    object-fit: contain;

  }



  .ft-logo-text {

    min-width: 0;

    gap: 3px;

  }



  .ft-logo-title {

    font-size: 27px;

    line-height: 1.05;

    white-space: nowrap;

  }



  .ft-logo-tagline {

    font-size: 9.5px;

    letter-spacing: 1.35px;

    line-height: 1.2;

    white-space: nowrap;

  }



  /* ---------- Description ---------- */



  .ft-desc {

    width: 100%;

    max-width: 100%;

    margin: 0;

    font-size: 15.5px;

    line-height: 1.7;

    color: var(--ft-text-dim);

  }



  /* ---------- Social buttons ---------- */



  .ft-social {

    display: flex;

    align-items: center;

    gap: 14px;

    margin-top: 2px;

  }



  .ft-social-btn {

    width: 48px;

    height: 48px;

    border-radius: 50%;

    flex-shrink: 0;



    display: inline-flex;

    align-items: center;

    justify-content: center;



    background: #202123;

    color: #ffffff;



    box-shadow: none;

    transform: none;

  }



  .ft-social-btn svg {

    width: 21px;

    height: 21px;

  }



  .ft-social-btn:active {

    transform: scale(0.96);

  }



  /* ---------- Accordion sections ---------- */



  .ft-col {

    width: 100%;

    border-top: 1px solid var(--ft-border);

  }



  .ft-col:last-child {

    border-bottom: 1px solid var(--ft-border);

  }



  .ft-col-heading {

    width: 100%;

    min-height: 68px;



    margin: 0;

    padding: 0;



    display: flex;

    align-items: center;

    justify-content: space-between;



    background: transparent;

    border: 0;

    outline: none;



    color: var(--gold);



    font-family: "Poppins", sans-serif;

    font-size: 16px;

    font-weight: 700;

    letter-spacing: 1.5px;

    text-transform: uppercase;



    text-align: left;

    cursor: pointer;



    -webkit-tap-highlight-color: transparent;

  }



  .ft-col-heading:focus,

  .ft-col-heading:focus-visible,

  .ft-col-heading:active {

    outline: none;

    box-shadow: none;

  }



  .ft-chevron {

    width: 26px;

    height: 26px;



    display: inline-flex;

    align-items: center;

    justify-content: center;



    color: rgba(255, 255, 255, 0.55);



    transition:

      transform 0.25s ease,

      color 0.25s ease;

  }



  .ft-chevron svg {

    width: 19px;

    height: 19px;

  }



  .ft-chevron--open {

    transform: rotate(180deg);

    color: var(--gold);

  }



  /* ---------- Accordion content ---------- */



  .ft-col-content {

    max-height: 0;

    overflow: hidden;

    opacity: 0;



    transition:

      max-height 0.35s ease,

      opacity 0.25s ease;

  }



  .ft-col-content--open {

    max-height: 650px;

    opacity: 1;

  }



  .ft-col-content-inner {

    padding: 0 0 20px;

  }



  /* ---------- Quick links ---------- */



  .ft-list {

    margin: 0;

    padding: 0;

    gap: 0;



    display: flex;

    flex-direction: column;

  }



  .ft-list li {

    margin: 0;

    padding: 0;

  }



  .ft-list a {

    display: block;

    width: 100%;



    padding: 9px 0;



    color: var(--ft-text-dim);

    font-size: 14.5px;

    line-height: 1.4;



    transition: color 0.2s ease;

  }



  .ft-list a:hover {

    color: var(--gold);

    padding-left: 0;

  }



  /* ---------- Contact ---------- */



  .ft-contact-list {

    margin: 0;

    padding: 0;



    display: flex;

    flex-direction: column;

    gap: 14px;

  }



  .ft-contact-list li {

    display: flex;

    align-items: flex-start;

    gap: 10px;



    font-size: 14px;

    line-height: 1.5;

  }



  .ft-contact-icon {

    width: 20px;

    height: 20px;

    margin-top: 1px;

    flex-shrink: 0;

  }



  .ft-contact-icon svg {

    width: 17px;

    height: 17px;

  }



  .ft-contact-list a {

    word-break: break-word;

  }



  /* ---------- Bottom section ---------- */



  .ft-bottom {

    width: 100%;



    margin-top: 0;

    padding: 24px 0 26px;



    border-top: 0;



    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;



    gap: 14px;



    text-align: center;

  }



  /* Copyright */



  .ft-copyright {

    width: 100%;



    margin: 0;



    font-size: 13px;

    line-height: 1.5;

    color: var(--ft-text-faint);



    text-align: center;

  }



  /* Crafted By */



  .ft-crafted {

    width: 100%;



    margin: 0;



    font-size: 13.5px;

    line-height: 1.5;



    color: var(--ft-text-faint);



    text-align: center;

    white-space: normal;

  }



  .ft-crafted a {

    color: var(--ft-text);

    font-weight: 600;

    text-decoration: none;



    transition: color 0.2s ease;

  }



  .ft-crafted a:hover {

    color: var(--gold);

  }



  /* Bottom policy links */



  .ft-bottom-links {

    width: 100%;



    display: flex;

    align-items: center;

    justify-content: center;



    gap: 0;

    flex-wrap: wrap;



    margin-top: 0;

  }



  .ft-bottom-links a {

    position: relative;



    padding: 0 10px;



    font-size: 12.5px;

    line-height: 1.6;



    color: var(--ft-text-faint);



    white-space: nowrap;

  }



  .ft-bottom-links a:hover {

    color: var(--white);

  }



  /* Small separators between policy links */



  .ft-bottom-links a:not(:last-child)::after {

    content: "";



    position: absolute;

    right: 0;

    top: 50%;



    width: 1px;

    height: 12px;



    background: rgba(255, 255, 255, 0.18);



    transform: translateY(-50%);

  }



  /* =====================================================

     IMPORTANT:

     Remove browser blue outline/focus look completely

     \===================================================== */



  .ft-col-heading,

  .ft-col-heading:focus,

  .ft-col-heading:focus-visible,

  .ft-col-heading:active {

    -webkit-appearance: none;

    appearance: none;

    outline: none !important;

    box-shadow: none !important;

  }



  /* =====================================================

     600px and below

     \===================================================== */



  @media (max-width: 600px) {



    .ft-container {

      padding: 30px 16px 0;

    }



    .ft-brand {

      gap: 16px;

      padding-bottom: 24px;

    }



    .ft-logo-icon {

      width: 54px;

      height: 54px;

    }



    .ft-logo-title {

      font-size: 25px;

    }



    .ft-logo-tagline {

      font-size: 8.8px;

      letter-spacing: 1.2px;

    }



    .ft-desc {

      font-size: 15px;

      line-height: 1.72;

    }



    .ft-social {

      gap: 12px;

    }



    .ft-social-btn {

      width: 47px;

      height: 47px;

    }



    .ft-col-heading {

      min-height: 64px;

      font-size: 15px;

      letter-spacing: 1.4px;

    }



    .ft-col-content-inner {

      padding-bottom: 18px;

    }



    .ft-bottom {

      padding: 23px 0 24px;

      gap: 13px;

    }



    .ft-copyright {

      font-size: 12.5px;

    }



    .ft-crafted {

      font-size: 13px;

    }



    .ft-bottom-links a {

      font-size: 12px;

      padding: 0 9px;

    }

  }



  /* =====================================================

     480px and below

     \===================================================== */



  @media (max-width: 480px) {



    .ft-container {

      padding: 28px 16px 0;

    }



    .ft-brand {

      padding-bottom: 22px;

      gap: 15px;

    }



    .ft-logo {

      gap: 9px;

    }



    .ft-logo-icon {

      width: 50px;

      height: 50px;

    }



    .ft-logo-title {

      font-size: 23px;

    }



    .ft-logo-tagline {

      font-size: 7.7px;

      letter-spacing: 1px;

    }



    .ft-desc {

      font-size: 14px;

      line-height: 1.7;

    }



    .ft-social {

      gap: 11px;

    }



    .ft-social-btn {

      width: 45px;

      height: 45px;

    }



    .ft-social-btn svg {

      width: 19px;

      height: 19px;

    }



    .ft-col-heading {

      min-height: 61px;

      font-size: 14px;

      letter-spacing: 1.25px;

    }



    .ft-list a {

      font-size: 14px;

    }



    .ft-contact-list li {

      font-size: 13.5px;

    }



    .ft-bottom {

      padding: 21px 0 23px;

      gap: 12px;

    }



    .ft-copyright {

      font-size: 12px;

    }



    .ft-crafted {

      font-size: 12.5px;

    }



    .ft-bottom-links {

      row-gap: 8px;

    }



    .ft-bottom-links a {

      font-size: 11.5px;

      padding: 0 8px;

    }

  }



  /* =====================================================

     380px and below

     \===================================================== */



  @media (max-width: 380px) {



    .ft-container {

      padding-left: 14px;

      padding-right: 14px;

    }



    .ft-logo-icon {

      width: 47px;

      height: 47px;

    }



    .ft-logo-title {

      font-size: 21px;

    }



    .ft-logo-tagline {

      font-size: 7px;

      letter-spacing: 0.8px;

    }



    .ft-desc {

      font-size: 13.5px;

    }



    .ft-social-btn {

      width: 43px;

      height: 43px;

    }



    .ft-col-heading {

      font-size: 13.5px;

    }



    .ft-bottom-links a {

      font-size: 11px;

      padding: 0 7px;

    }

  }

}

      `}</style>

    </footer>

  );

}
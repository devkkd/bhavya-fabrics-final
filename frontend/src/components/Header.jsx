"use client";



import { useEffect, useRef, useState } from "react";

import { usePathname, useRouter } from "next/navigation";



import CustomerLoginModal from "./CustomerLoginModal";



// Primary navigation: Home, New Arrivals, Materials, Products,

// Collections (dropdown), Sale, About, Contact.

const API_URL =

  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";



const FALLBACK_COLLECTIONS = [

  { name: "Cotton Fabrics", slug: "cotton" },

  { name: "Silk Fabrics", slug: "silk" },

  { name: "Printed Fabrics", slug: "printed" },

  { name: "Embroidered Fabrics", slug: "embroidered" },

];



function buildNavLinks(collectionLinks) {

  return [

    // { label: "Home", href: "/" },

    { label: "New Arrivals", href: "/newArrivals" },

  

    {

      label: "Collections",

      href: "/collection",

      ...(collectionLinks ? { dropdown: collectionLinks } : {}),

    },

    { label: "Sale", href: "/sale", accent: true },
      { label: "Materials", href: "/materials" },

    { label: "Products", href: "/products" },

    { label: "About", href: "/about" },

    { label: "Contact", href: "/contact" },

  ];

}



const BASE_NAV_LINKS = buildNavLinks(null);



const MARQUEE_ITEMS = [

  { icon: "truck", text: "Free Shipping" },

  { icon: "globe", text: "Worldwide Export" },

  { icon: "box", text: "Bulk Orders Accepted" },

  { icon: "medal", text: "MOQ Available" },

  { icon: "truck", text: "PAN India Shipping" },

  { icon: "globe", text: "Worldwide Export" },

];



const WHATSAPP_NUMBER = "919829000000";



// 👉 Put your logo image file inside the /public folder (e.g. /public/logo.png)

// and just update this path. Nothing else needs to change.

const LOGO_IMAGE_SRC = "/images/logo.png";



/* =========================================================

   HELPERS

========================================================= */

function slugify(value = "") {

  return String(value)

    .trim()

    .toLowerCase()

    .replace(/&/g, "and")

    .replace(/[^a-z0-9]+/g, "-")

    .replace(/^-+|-+$/g, "");

}



function imageValue(value) {

  if (!value) return "";

  if (typeof value === "string") return value;



  return (

    value?.url ||

    value?.src ||

    value?.secure_url ||

    value?.deliveryUrl ||

    value?.imageUrl ||

    ""

  );

}



/* =========================================================

   ICONS

========================================================= */

function MarqueeIcon({ name }) {

  switch (name) {

    case "globe":

      return (

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">

          <circle cx="12" cy="12" r="9" />

          <path d="M3 12h18M12 3c2.8 2.6 4.2 5.7 4.2 9s-1.4 6.4-4.2 9c-2.8-2.6-4.2-5.7-4.2-9s1.4-6.4 4.2-9z" />

        </svg>

      );

    case "box":

      return (

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">

          <path d="M3 8l9-5 9 5-9 5-9-5z" />

          <path d="M3 8v8l9 5 9-5V8" />

          <path d="M12 13v8" />

        </svg>

      );

    case "medal":

      return (

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">

          <circle cx="12" cy="9" r="5" />

          <path d="M9 13.5L7 21l5-2.5L17 21l-2-7.5" />

        </svg>

      );

    case "truck":

      return (

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">

          <path d="M2 7h13v9H2z" />

          <path d="M15 10h4l3 3v3h-7z" />

          <circle cx="6.5" cy="18" r="1.7" />

          <circle cx="17.5" cy="18" r="1.7" />

        </svg>

      );

    default:

      return null;

  }

}



function SearchIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

      <circle cx="11" cy="11" r="7" />

      <path d="M21 21l-4.3-4.3" />

    </svg>

  );

}



function ArrowIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

      <path d="M5 12h14M13 6l6 6-6 6" />

    </svg>

  );

}



function WhatsAppIcon() {

  return (

    <svg viewBox="0 0 32 32" fill="currentColor">

      <path d="M16.03 3C9.06 3 3.4 8.63 3.4 15.57c0 2.4.65 4.63 1.87 6.6L3 29l7.03-2.24a12.9 12.9 0 0 0 6 1.5h.01c6.97 0 12.63-5.63 12.63-12.57C28.67 8.75 23.01 3 16.03 3zm0 22.96h-.01a10.6 10.6 0 0 1-5.38-1.48l-.39-.23-4.17 1.33 1.36-4.06-.25-.42a10.35 10.35 0 0 1-1.59-5.53c0-5.73 4.68-10.4 10.44-10.4 2.79 0 5.41 1.09 7.38 3.05a10.3 10.3 0 0 1 3.06 7.36c0 5.73-4.68 10.38-10.45 10.38zm5.72-7.78c-.31-.16-1.85-.91-2.14-1.02-.29-.1-.5-.16-.71.16-.21.31-.81 1.02-1 1.23-.18.21-.37.23-.68.08-.31-.16-1.32-.49-2.51-1.55-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.4 5.38 4.77.75.32 1.34.52 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.85-.75 2.11-1.48.26-.73.26-1.35.18-1.48-.08-.13-.29-.21-.6-.37z" />

    </svg>

  );

}



function AccountIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">

      <circle cx="12" cy="8" r="4" />

      <path d="M4 20c0-3.6 3.6-6.5 8-6.5s8 2.9 8 6.5" />

    </svg>

  );

}



function HeartIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">

      <path d="M12 20.5s-7.5-4.6-9.8-9.2C.7 8 2 4.5 5.4 3.6c2-.5 4 .3 5.2 2 1.2-1.7 3.2-2.5 5.2-2C19.2 4.5 20.5 8 18.8 11.3 16.5 15.9 12 20.5 12 20.5z" />

    </svg>

  );

}



function CartIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">

      <circle cx="9" cy="20" r="1.4" />

      <circle cx="18" cy="20" r="1.4" />

      <path d="M2.5 3h2.2l2 12.2a2 2 0 0 0 2 1.7h8.3a2 2 0 0 0 2-1.6L21 7.5H6" />

    </svg>

  );

}



function MenuIcon({ open }) {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">

      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}

    </svg>

  );

}



function ChevronIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

      <path d="M6 9l6 6 6-6" />

    </svg>

  );

}



/* =========================================================

   HEADER

========================================================= */

export default function Header({ wishlistCount = 0, cartCount = 0 }) {

  const pathname = usePathname();

  const router = useRouter();



  const [hideTopbar, setHideTopbar] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [searchSuggestions, setSearchSuggestions] = useState([]);

  const [searchLoading, setSearchLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [logoError, setLogoError] = useState(false);

  const [navLinks, setNavLinks] = useState(BASE_NAV_LINKS);



  const [customer, setCustomer] = useState(null);

  const [loginPopupOpen, setLoginPopupOpen] = useState(false);



  // desktop dropdown: which nav item (by href) is currently open

  const [openDropdown, setOpenDropdown] = useState(null);

  // mobile drawer accordion: which nav item (by href) is expanded

  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);



  const lastScrollY = useRef(0);

  const searchInputRef = useRef(null);

  const closeTimer = useRef(null);

  const searchAbortRef = useRef(null);



  /* ---------- collections dropdown ---------- */

  useEffect(() => {

    let isMounted = true;



    const fallbackLinks = FALLBACK_COLLECTIONS.map((item) => ({

      label: item.name,

      href: `/collection/${item.slug}`,

    }));



    async function loadCollections() {

      try {

        const response = await fetch(

          `${API_URL}/categories?all=true&navigation=true`,

          { cache: "no-store" }

        );



        if (!response.ok) throw new Error("No categories");



        const payload = await response.json();



        const categories = Array.isArray(payload?.categories)

          ? payload.categories

          : Array.isArray(payload?.data?.categories)

          ? payload.data.categories

          : [];



        const collectionLinks =

          categories.length > 0

            ? categories.map((item) => ({

                label: item?.name || item?.label || "Collection",

                href: `/collection/${item?.slug || item?._id || item?.id}`,

              }))

            : fallbackLinks;



        if (isMounted) setNavLinks(buildNavLinks(collectionLinks));

      } catch (error) {

        if (isMounted) setNavLinks(buildNavLinks(fallbackLinks));

      }

    }



    loadCollections();



    return () => {

      isMounted = false;

    };

  }, []);



  /* ---------- hide topbar on scroll down ---------- */

  useEffect(() => {

    lastScrollY.current = window.scrollY;



    function onScroll() {

      const currentY = window.scrollY;

      const goingDown = currentY > lastScrollY.current;

      const pastThreshold = currentY > 80;



      setHideTopbar(goingDown && pastThreshold);

      lastScrollY.current = currentY;

    }



    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);

  }, []);



  useEffect(() => {

    if (searchOpen && searchInputRef.current) {

      searchInputRef.current.focus();

    }

  }, [searchOpen]);



  /* ---------- live search suggestions ---------- */

  useEffect(() => {

    if (!searchOpen) {

      setSearchSuggestions([]);

      setSearchLoading(false);



      if (searchAbortRef.current) {

        searchAbortRef.current.abort();

        searchAbortRef.current = null;

      }



      return;

    }



    const term = searchQuery.trim();



    if (term.length < 2) {

      setSearchSuggestions([]);

      setSearchLoading(false);



      if (searchAbortRef.current) {

        searchAbortRef.current.abort();

        searchAbortRef.current = null;

      }



      return;

    }



    if (searchAbortRef.current) {

      searchAbortRef.current.abort();

    }



    const controller = new AbortController();

    searchAbortRef.current = controller;

    setSearchLoading(true);



    const timer = window.setTimeout(async () => {

      try {

        // GET ${API_URL}/products?search=${query}&page=1&limit=6

        const response = await fetch(

          `${API_URL}/products?search=${encodeURIComponent(term)}&page=1&limit=6`,

          {

            method: "GET",

            cache: "no-store",

            signal: controller.signal,

          }

        );



        const payload = await response.json();



        if (!response.ok) {

          throw new Error(payload?.message || "Search failed");

        }



        const products = Array.isArray(payload?.products)

          ? payload.products

          : Array.isArray(payload?.data)

          ? payload.data

          : Array.isArray(payload?.data?.products)

          ? payload.data.products

          : [];



        const suggestions = products.slice(0, 6).map((item) => {

          const regularPrice =

            Number(

              item?.pricing?.regularPrice ?? item?.regularPrice ?? item?.price ?? 0

            ) || 0;



          const salePrice =

            Number(item?.pricing?.salePrice ?? item?.salePrice ?? 0) || 0;



          const hasSale =

            regularPrice > 0 && salePrice > 0 && salePrice < regularPrice;



          const discount = hasSale

            ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)

            : 0;



          const name =

            item?.title ||

            item?.name ||

            item?.productName ||

            item?.sku ||

            "Product";



          return {

            id: item?._id || item?.id || item?.slug || item?.sku,

            // slug preserve: product detail page isi se khulega

            slug: String(item?.slug || slugify(name) || "").trim(),

            name,

            sku: item?.sku || "",

            image:

              imageValue(item?.mainImage) ||

              imageValue(item?.image) ||

              imageValue(item?.imageUrl) ||

              imageValue(Array.isArray(item?.images) ? item.images[0] : "") ||

              imageValue(Array.isArray(item?.gallery) ? item.gallery[0] : ""),

            regularPrice,

            salePrice,

            hasSale,

            discount,

          };

        });



        if (!controller.signal.aborted) {

          setSearchSuggestions(suggestions);

        }

      } catch (error) {

        if (error?.name !== "AbortError") {

          console.error("Header search failed:", error);

          setSearchSuggestions([]);

        }

      } finally {

        if (!controller.signal.aborted) {

          setSearchLoading(false);

        }

      }

    }, 220);



    return () => {

      window.clearTimeout(timer);

      controller.abort();



      if (searchAbortRef.current === controller) {

        searchAbortRef.current = null;

      }

    };

  }, [searchOpen, searchQuery]);



  useEffect(() => {

    return () => {

      if (searchAbortRef.current) {

        searchAbortRef.current.abort();

      }

    };

  }, []);



  useEffect(() => {

    document.body.style.overflow = menuOpen ? "hidden" : "";



    return () => {

      document.body.style.overflow = "";

    };

  }, [menuOpen]);



  // close any open menus whenever the route changes

  useEffect(() => {

    setOpenDropdown(null);

    setMobileOpenDropdown(null);

    setMenuOpen(false);

  }, [pathname]);



  /* ---------- handlers ---------- */

  function resetSearch() {

    if (searchAbortRef.current) {

      searchAbortRef.current.abort();

      searchAbortRef.current = null;

    }



    setSearchOpen(false);

    setSearchQuery("");

    setSearchSuggestions([]);

    setSearchLoading(false);

  }



  function toggleSearch() {

    setMenuOpen(false);

    setSearchOpen((prev) => !prev);

  }



  function toggleMenu() {

    setSearchOpen(false);

    setMenuOpen((prev) => !prev);

  }



  async function handleAccountClick(event) {

    event.preventDefault();

    event.stopPropagation();



    setMenuOpen(false);



    /*

     * Popup FIRST open hoga.

     * Isliye 401 aaye ya backend slow ho,

     * user ko popup immediately dikhega.

     */

    setLoginPopupOpen(true);



    try {

      const response = await fetch(`${API_URL}/customer-auth/me`, {

        method: "GET",

        credentials: "include",

        cache: "no-store",

      });



      if (!response.ok) {

        // Logged out user -> popup open hi rahega

        setCustomer(null);

        return;

      }



      const payload = await response.json();

      const user = payload?.user || null;



      if (user) {

        setCustomer(user);

        setLoginPopupOpen(false);

        router.push("/account");

      }

    } catch (error) {

      console.error("Customer session check failed:", error);



      // Backend/session problem ke case mein bhi

      // popup close nahi hoga.

      setCustomer(null);

    }

  }



  function handleSearchSubmit(e) {

    e.preventDefault();



    const query =

      searchQuery.trim() || searchInputRef.current?.value?.trim() || "";



    if (!query) return;



    resetSearch();

    router.push(`/search?q=${encodeURIComponent(query)}`);

  }



  /*

   * Suggestion par click:

   * search page NAHI khulega, seedha product detail page khulega.

   * Route: /product/[slug]

   */

 function handleSearchSuggestionClick(item) {

  const slug = String(item?.slug || "").trim();



  if (!slug) return;



  if (searchAbortRef.current) {

    searchAbortRef.current.abort();

    searchAbortRef.current = null;

  }



  setSearchSuggestions([]);

  setSearchLoading(false);

  setSearchOpen(false);

  setSearchQuery("");



  router.push(`/products/${encodeURIComponent(slug)}`);

}



  function isLinkActive(href) {

    return pathname === href || (href !== "/" && pathname.startsWith(href));

  }



  // desktop: open immediately on hover, close after a short delay so moving

  // the mouse from the link down into the panel doesn't close it early

  function openDesktopDropdown(href) {

    if (closeTimer.current) {

      clearTimeout(closeTimer.current);

      closeTimer.current = null;

    }



    setOpenDropdown(href);

  }



  function scheduleCloseDesktopDropdown() {

    closeTimer.current = setTimeout(() => {

      setOpenDropdown(null);

    }, 150);

  }



  function toggleMobileDropdown(href) {

    setMobileOpenDropdown((prev) => (prev === href ? null : href));

  }



  const showSearchResults = searchOpen && searchQuery.trim().length >= 2;



  return (

    <>

      <header className={`bf-header${hideTopbar ? " bf-header--compact" : ""}`}>

        <div className="bf-topbar">

          <div className="bf-topbar-track">

            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (

              <span className="bf-topbar-item" key={i}>

                <span className="bf-topbar-icon">

                  <MarqueeIcon name={item.icon} />

                </span>

                {item.text}

                <span className="bf-topbar-divider" aria-hidden="true">

                  |

                </span>

              </span>

            ))}

          </div>

        </div>



        <div className="bf-nav">

          <div className="bf-nav-inner">

            <a href="/" className="bf-logo" aria-label="Bhavya Fabrics home">

              <span className="bf-logo-icon">

                {!logoError ? (

                  <img

                    src={LOGO_IMAGE_SRC}

                    alt="Bhavya Fabrics Logo"

                    onError={() => setLogoError(true)}

                  />

                ) : (

                  // fallback placeholder shown only if the image is missing,

                  // so the layout never breaks before you add your logo

                  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">

                    <circle cx="30" cy="30" r="28" stroke="#8a6a3d" strokeWidth="1.2" />

                    <path

                      d="M30 12c-6 4-9 10-9 16 0 7 4 12 9 16 5-4 9-9 9-16 0-6-3-12-9-16z"

                      stroke="#8a6a3d"

                      strokeWidth="1.3"

                      fill="none"

                    />

                    <path d="M18 24c4-3 8-3 12 0M18 36c4 3 8 3 12 0" stroke="#8a6a3d" strokeWidth="1" fill="none" />

                  </svg>

                )}

              </span>



              <span className="bf-logo-text">

                <span className="bf-logo-title">Bhavya Fabrics</span>

                <span className="bf-logo-tagline">Premium Textile Manufacturer</span>

              </span>

            </a>



            <nav className="bf-links" aria-label="Primary">

              {navLinks.map((link) => {

                const active = isLinkActive(link.href);

                const hasDropdown = Array.isArray(link.dropdown) && link.dropdown.length > 0;

                const isOpen = openDropdown === link.href;

                const linkClass = `bf-link${active ? " bf-link--active" : ""}${

                  link.accent ? " bf-link--accent" : ""

                }`;



                if (!hasDropdown) {

                  return (

                    <a key={link.href} href={link.href} className={linkClass}>

                      {link.label}

                    </a>

                  );

                }



                return (

                  <div

                    key={link.href}

                    className={`bf-nav-item${isOpen ? " bf-nav-item--open" : ""}`}

                    onMouseEnter={() => openDesktopDropdown(link.href)}

                    onMouseLeave={scheduleCloseDesktopDropdown}

                  >

                    <a

                      href={link.href}

                      className={`${linkClass} bf-link-trigger`}

                      aria-expanded={isOpen}

                      onClick={(e) => {

                        // on touch devices there's no hover, so first tap opens the panel

                        if (window.matchMedia("(hover: none)").matches && !isOpen) {

                          e.preventDefault();

                          setOpenDropdown(link.href);

                        }

                      }}

                    >

                      {link.label}

                      <span className="bf-chevron">

                        <ChevronIcon />

                      </span>

                    </a>



                    <div className="bf-dropdown" role="menu">

                      {link.dropdown.map((item) => (

                        <a key={item.href} href={item.href} className="bf-dropdown-link" role="menuitem">

                          {item.label}

                        </a>

                      ))}

                    </div>

                  </div>

                );

              })}

            </nav>



            <div className="bf-actions">

              <button

                type="button"

                className={`bf-icon-btn${searchOpen ? " bf-icon-btn--active" : ""}`}

                aria-label="Toggle search"

                aria-expanded={searchOpen}

                onClick={toggleSearch}

              >

                <SearchIcon />

              </button>



              <span className="bf-action-divider" aria-hidden="true" />



              <a

                href={`https://wa.me/${WHATSAPP_NUMBER}`}

                target="_blank"

                rel="noopener noreferrer"

                className="bf-whatsapp-btn"

                aria-label="Chat on WhatsApp"

              >

                <WhatsAppIcon />

              </a>



              <span className="bf-action-divider" aria-hidden="true" />



              <button

                type="button"

                className="bf-plain-icon bf-account-icon"

                aria-label="Account"

                onClick={handleAccountClick}

                style={{

                  border: "none",

                  background: "transparent",

                  padding: 0,

                  margin: 0,

                  font: "inherit",

                }}

              >

                <AccountIcon />

              </button>



              <a

                href="/wishlist"

                className="bf-plain-icon bf-plain-icon--badged bf-wishlist-icon"

                aria-label="Wishlist"

              >

                <HeartIcon />

                <span className="bf-badge">{wishlistCount}</span>

              </a>



              <a href="/cart" className="bf-plain-icon bf-plain-icon--badged" aria-label="Cart">

                <CartIcon />

                <span className="bf-badge">{cartCount}</span>

              </a>



              <button

                type="button"

                className="bf-menu-btn"

                aria-label="Toggle menu"

                aria-expanded={menuOpen}

                onClick={toggleMenu}

              >

                <MenuIcon open={menuOpen} />

              </button>

            </div>

          </div>



          {/* ======================= SEARCH PANEL ======================= */}

          <div className={`bf-search-panel${searchOpen ? " bf-search-panel--open" : ""}`}>

            <form className="bf-search-form" onSubmit={handleSearchSubmit}>

              <SearchIcon />



              <input

                ref={searchInputRef}

                type="text"

                value={searchQuery}

                onChange={(event) => setSearchQuery(event.target.value)}

                onKeyDown={(event) => {

                  if (event.key === "Escape") resetSearch();

                }}

                placeholder="Search products, collections..."

                className="bf-search-input"

                autoComplete="off"

                aria-label="Search products"

              />



              {/* Mobile par text hide hota hai, isliye icon bhi diya hai */}

              <button type="submit" className="bf-search-submit" aria-label="Search">

                <span className="bf-search-submit-text">Search</span>

                <span className="bf-search-submit-icon">

                  <SearchIcon />

                </span>

              </button>



              <button

                type="button"

                className="bf-search-close"

                aria-label="Close search"

                onClick={resetSearch}

              >

                <MenuIcon open={true} />

              </button>

            </form>



            {showSearchResults && (

              <div className="bf-search-results">

                {searchLoading ? (

                  <div className="bf-search-state">Searching products...</div>

                ) : searchSuggestions.length > 0 ? (

                  <>

                    <div className="bf-search-results-list">

                      {searchSuggestions.map((item, index) => (

                        <button

                          key={`${item?.id || item?.name}-${index}`}

                          type="button"

                          className="bf-search-result-item"

                          onClick={() => handleSearchSuggestionClick(item)}

                        >

                          <span className="bf-search-result-image">

                            {item?.image ? <img src={item.image} alt="" /> : <SearchIcon />}

                          </span>



                          <span className="bf-search-result-copy">

                            <strong>{item?.name}</strong>



                            {item?.sku ? <small>SKU: {item.sku}</small> : null}



                            <span className="bf-search-result-price">

                              {item?.hasSale ? (

                                <>

                                  <span className="bf-search-result-sale-price">

                                    ₹{item.salePrice.toLocaleString("en-IN")}

                                  </span>

                                  <span className="bf-search-result-old-price">

                                    ₹{item.regularPrice.toLocaleString("en-IN")}

                                  </span>

                                  <span className="bf-search-result-off">

                                    {item.discount}% OFF

                                  </span>

                                </>

                              ) : (

                                <span className="bf-search-result-sale-price">

                                  ₹{item.regularPrice.toLocaleString("en-IN")}

                                </span>

                              )}

                            </span>

                          </span>



                          <span className="bf-search-result-arrow">

                            <ArrowIcon />

                          </span>

                        </button>

                      ))}

                    </div>



                    <button

                      type="button"

                      className="bf-search-view-all"

                      onClick={handleSearchSubmit}

                    >

                      <span>View all search results</span>

                      <ArrowIcon />

                    </button>

                  </>

                ) : (

                  <div className="bf-search-state">No matching products found.</div>

                )}

              </div>

            )}

          </div>

        </div>



        {/* ======================= MOBILE DRAWER ======================= */}

        <div className={`bf-drawer${menuOpen ? " bf-drawer--open" : ""}`}>

          <div className="bf-drawer-quickrow">

            <button

              type="button"

              className="bf-plain-icon"

              aria-label="Account"

              onClick={handleAccountClick}

              style={{

                border: "none",

                background: "transparent",

                padding: 0,

                margin: 0,

                font: "inherit",

              }}

            >

              <AccountIcon />

            </button>



            <a

              href="/wishlist"

              className="bf-plain-icon bf-plain-icon--badged"

              aria-label="Wishlist"

              onClick={() => setMenuOpen(false)}

            >

              <HeartIcon />

              <span className="bf-badge">{wishlistCount}</span>

            </a>



            <a

              href="/cart"

              className="bf-plain-icon bf-plain-icon--badged"

              aria-label="Cart"

              onClick={() => setMenuOpen(false)}

            >

              <CartIcon />

              <span className="bf-badge">{cartCount}</span>

            </a>

          </div>



          <nav className="bf-drawer-links" aria-label="Mobile">

            {navLinks.map((link) => {

              const active = isLinkActive(link.href);

              const hasDropdown = Array.isArray(link.dropdown) && link.dropdown.length > 0;

              const isMobileOpen = mobileOpenDropdown === link.href;

              const linkClass = `bf-drawer-link${active ? " bf-link--active" : ""}${

                link.accent ? " bf-link--accent" : ""

              }`;



              if (!hasDropdown) {

                return (

                  <a key={link.href} href={link.href} className={linkClass} onClick={() => setMenuOpen(false)}>

                    {link.label}

                  </a>

                );

              }



              return (

                <div key={link.href} className="bf-drawer-group">

                  <button

                    type="button"

                    className={`${linkClass} bf-drawer-link--trigger`}

                    aria-expanded={isMobileOpen}

                    onClick={() => toggleMobileDropdown(link.href)}

                  >

                    {link.label}

                    <span className={`bf-chevron${isMobileOpen ? " bf-chevron--open" : ""}`}>

                      <ChevronIcon />

                    </span>

                  </button>



                  <div className={`bf-drawer-submenu${isMobileOpen ? " bf-drawer-submenu--open" : ""}`}>

                    {link.dropdown.map((item) => (

                      <a

                        key={item.href}

                        href={item.href}

                        className="bf-drawer-sublink"

                        onClick={() => setMenuOpen(false)}

                      >

                        {item.label}

                      </a>

                    ))}

                  </div>

                </div>

              );

            })}

          </nav>



          <div className="bf-drawer-actions">

            <a

              href={`https://wa.me/${WHATSAPP_NUMBER}`}

              target="_blank"

              rel="noopener noreferrer"

              className="bf-drawer-whatsapp"

            >

              <WhatsAppIcon /> Chat on WhatsApp

            </a>

          </div>

        </div>



        <button

          type="button"

          className={`bf-overlay${menuOpen ? " bf-overlay--visible" : ""}`}

          aria-hidden={!menuOpen}

          tabIndex={-1}

          onClick={() => setMenuOpen(false)}

        />

      </header>



      {/* spacer so page content never sits behind the fixed header */}

      <div className="bf-header-spacer" aria-hidden="true" />



      <CustomerLoginModal

        open={loginPopupOpen}

        onClose={() => {

          setLoginPopupOpen(false);

        }}

        onSuccess={(user) => {

          setCustomer(user);

          setLoginPopupOpen(false);

        }}

      />



      <style>{`

        :root {

          --bf-teal: #1f5b63;

          --bf-teal-dark: #163f45;

          --bf-cream: #faf7f1;

          --bf-text: #2b2b2b;

          --bf-muted: #5c6a6c;

          --bf-gold: #ad8a52;

          --bf-green: #1f5b63;

          --bf-green-dark: #163f45;

          --bf-whatsapp: #25d366;

          --bf-whatsapp-dark: #1ebe5b;

          --bf-sale: #c1502c;

          --bf-topbar-h: 42px;

          --bf-topbar-h-mobile: 32px;

          --bf-nav-h: 92px;

          --bf-nav-h-mobile: 66px;

          --bf-radius: 10px;

        }



        * { box-sizing: border-box; }



        .bf-header {

          position: fixed;

          top: 0;

          left: 0;

          right: 0;

          z-index: 1000;

          font-family: "Poppins", "Segoe UI", system-ui, sans-serif;

          box-shadow: 0 2px 14px rgba(20, 40, 42, 0.08);

        }



        /* Header height is driven by the same breakpoint (900px) that swaps

           the desktop nav for the hamburger, so the spacer never jumps out

           of sync with the actual header height. */

        .bf-header-spacer { height: calc(var(--bf-topbar-h) + var(--bf-nav-h)); }



        @media (max-width: 900px) {

          .bf-header-spacer { height: calc(var(--bf-topbar-h-mobile) + var(--bf-nav-h-mobile)); }

        }



        /* ---------- Topbar / marquee ---------- */

        .bf-topbar {

          background: var(--bf-teal);

          height: var(--bf-topbar-h);

          overflow: hidden;

          transition: height 0.35s ease, opacity 0.3s ease;

        }

        .bf-header--compact .bf-topbar { height: 0; opacity: 0; }



        .bf-topbar-track {

          display: flex;

          align-items: center;

          width: max-content;

          height: 100%;

          white-space: nowrap;

          animation: bf-marquee 22s linear infinite;

        }

        .bf-header:hover .bf-topbar-track { animation-play-state: paused; }



        @keyframes bf-marquee {

          from { transform: translateX(0); }

          to { transform: translateX(-50%); }

        }



        .bf-topbar-item {

          display: inline-flex;

          align-items: center;

          gap: 8px;

          color: #f4f1ea;

          font-size: 13.5px;

          font-weight: 600;

          letter-spacing: 0.2px;

          padding: 0 22px;

        }

        .bf-topbar-icon { display: inline-flex; width: 15px; height: 15px; flex-shrink: 0; }

        .bf-topbar-icon svg { width: 100%; height: 100%; }

        .bf-topbar-divider { margin-left: 22px; color: rgba(244, 241, 234, 0.4); font-weight: 300; }



        @media (max-width: 900px) {

          .bf-topbar { height: var(--bf-topbar-h-mobile); }

          .bf-topbar-item { font-size: 12px; padding: 0 14px; }

          .bf-topbar-divider { margin-left: 14px; }

        }

        @media (max-width: 480px) {

          .bf-topbar-item { font-size: 11px; gap: 6px; padding: 0 10px; }

          .bf-topbar-icon { width: 13px; height: 13px; }

          .bf-topbar-divider { margin-left: 10px; }

        }

        @media (max-width: 360px) {

          .bf-topbar-item { font-size: 10px; }

        }



        /* ---------- Main nav ---------- */

        .bf-nav { background: var(--bf-cream); position: relative; }



        .bf-nav-inner {

          height: var(--bf-nav-h);

          max-width: 1400px;

          margin: 0 auto;

          padding: 0 32px;

          display: flex;

          align-items: center;

          gap: 20px;

          flex-wrap: nowrap;

        }

        @media (max-width: 900px) {

          .bf-nav-inner { height: var(--bf-nav-h-mobile); padding: 0 16px; gap: 10px; }

        }

        @media (max-width: 360px) {

          .bf-nav-inner { gap: 6px; }

        }



        /* Logo (image slot) */

        .bf-logo {

          display: flex;

          align-items: center;

          gap: 12px;

          text-decoration: none;

          flex-shrink: 0;

          min-width: 0;

        }

        .bf-logo-icon {

          display: flex;

          align-items: center;

          justify-content: center;

          width: 52px;

          height: 52px;

          flex-shrink: 0;

          border-radius: 50%;

          overflow: hidden;

          background: #fff;

          border: 1px solid rgba(138, 106, 61, 0.35);

        }

        .bf-logo-icon img { width: 100%; height: 100%; object-fit: contain; display: block; }

        .bf-logo-icon svg { width: 78%; height: 78%; }

        .bf-logo-text { display: flex; flex-direction: column; gap: 2px; line-height: 1.15; min-width: 0; }

        .bf-logo-title {

          font-family: "Playfair Display", Georgia, "Times New Roman", serif;

          font-size: clamp(15px, 4vw, 24px);

          font-weight: 700;

          color: var(--bf-teal);

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }

        .bf-logo-tagline {

          font-size: 10.5px;

          font-weight: 600;

          letter-spacing: 1.4px;

          color: var(--bf-gold);

          text-transform: uppercase;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }



        @media (max-width: 480px) {

          .bf-logo-icon { width: 40px; height: 40px; }

          .bf-logo { gap: 8px; }

          .bf-logo-tagline { font-size: 8.5px; letter-spacing: 0.8px; }

        }



        /* Links */

        .bf-links {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: clamp(10px, 1.55vw, 24px);

          flex: 1;

          min-width: 0;

        }

        .bf-link {

          display: inline-flex;

          align-items: center;

          gap: 4px;

          font-size: clamp(14px, 1.25vw, 17px);

          font-weight: 500;

          color: var(--bf-text);

          text-decoration: none;

          white-space: nowrap;

          position: relative;

          padding: 6px 2px;

          background: none;

          border: none;

          font-family: inherit;

          cursor: pointer;

          transition: color 0.2s ease;

        }

        .bf-link:hover { color: var(--bf-green); }

        .bf-link--active { color: var(--bf-green); font-weight: 700; }

        .bf-link--active::after {

          content: "";

          position: absolute;

          left: 0;

          right: 0;

          bottom: -2px;

          height: 2px;

          background: var(--bf-green);

          border-radius: 2px;

        }

        .bf-link--accent { color: var(--bf-sale); font-weight: 600; }

        .bf-link--accent:hover { color: var(--bf-sale); opacity: 0.85; }

        .bf-link--accent.bf-link--active { color: var(--bf-sale); }

        .bf-link--accent.bf-link--active::after { background: var(--bf-sale); }



        @media (max-width: 1150px) {

          .bf-links { gap: 10px; }

          .bf-link { font-size: 14px; }

        }

        @media (max-width: 900px) { .bf-links { display: none; } }



        /* Dropdown (Collections) — opens on hover, closes on mouse leave */

        .bf-nav-item {

          position: relative;

          display: flex;

          align-items: center;

          padding-bottom: 14px;

          margin-bottom: -14px;

        }

        .bf-chevron { display: inline-flex; width: 13px; height: 13px; transition: transform 0.2s ease; }

        .bf-nav-item--open .bf-chevron { transform: rotate(180deg); }



        .bf-dropdown {

          position: absolute;

          top: calc(100% + 2px);

          left: 50%;

          transform: translateX(-50%) translateY(6px);

          min-width: 210px;

          background: #fff;

          border-radius: var(--bf-radius);

          box-shadow: 0 14px 32px rgba(20, 40, 42, 0.16);

          padding: 8px;

          opacity: 0;

          visibility: hidden;

          pointer-events: none;

          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;

          z-index: 1100;

        }

        .bf-nav-item--open .bf-dropdown {

          opacity: 1;

          visibility: visible;

          pointer-events: auto;

          transform: translateX(-50%) translateY(0);

        }

        .bf-dropdown-link {

          display: block;

          padding: 9px 14px;

          border-radius: 6px;

          font-size: 14px;

          font-weight: 500;

          color: var(--bf-text);

          text-decoration: none;

          white-space: nowrap;

          transition: background 0.15s ease, color 0.15s ease;

        }

        .bf-dropdown-link:hover { background: rgba(31, 91, 99, 0.08); color: var(--bf-green); }



        /* Actions */

        .bf-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; margin-left: auto; }

        .bf-action-divider { width: 1px; height: 22px; background: rgba(31, 91, 99, 0.18); flex-shrink: 0; }

        @media (max-width: 640px) { .bf-action-divider { display: none; } }



        .bf-icon-btn {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          width: 40px;

          height: 40px;

          border-radius: 50%;

          border: 1px solid rgba(31, 91, 99, 0.25);

          background: transparent;

          color: var(--bf-teal);

          cursor: pointer;

          transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease, border-color 0.2s ease;

          flex-shrink: 0;

        }

        .bf-icon-btn svg { width: 18px; height: 18px; }

        .bf-icon-btn:hover,

        .bf-icon-btn--active {

          background: var(--bf-green);

          border-color: var(--bf-green);

          color: #fff;

          transform: translateY(-1px);

        }



        .bf-whatsapp-btn {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          width: 40px;

          height: 40px;

          border-radius: 50%;

          background: linear-gradient(145deg, var(--bf-whatsapp), var(--bf-whatsapp-dark));

          color: #fff;

          box-shadow: 0 4px 10px rgba(37, 211, 102, 0.35);

          transition: transform 0.2s ease, box-shadow 0.2s ease;

          flex-shrink: 0;

        }

        .bf-whatsapp-btn svg { width: 20px; height: 20px; }

        .bf-whatsapp-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 16px rgba(37, 211, 102, 0.45); }



        .bf-plain-icon {

          position: relative;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          width: 36px;

          height: 36px;

          color: var(--bf-text);

          text-decoration: none;

          flex-shrink: 0;

          transition: color 0.2s ease, transform 0.15s ease;

        }

        .bf-plain-icon svg { width: 21px; height: 21px; }

        .bf-plain-icon:hover { color: var(--bf-green); transform: translateY(-1px); }

        .bf-plain-icon--badged { margin-left: 2px; }



        .bf-badge {

          position: absolute;

          top: -2px;

          right: -2px;

          min-width: 16px;

          height: 16px;

          padding: 0 3px;

          border-radius: 999px;

          background: var(--bf-gold);

          color: #fff;

          font-size: 10px;

          font-weight: 700;

          line-height: 16px;

          text-align: center;

        }



        .bf-menu-btn {

          display: none;

          align-items: center;

          justify-content: center;

          width: 40px;

          height: 40px;

          border-radius: 8px;

          border: 1px solid rgba(31, 91, 99, 0.25);

          background: transparent;

          color: var(--bf-teal);

          cursor: pointer;

          flex-shrink: 0;

        }

        .bf-menu-btn svg { width: 20px; height: 20px; }

        @media (max-width: 900px) { .bf-menu-btn { display: inline-flex; } }



        @media (max-width: 480px) {

          .bf-icon-btn, .bf-whatsapp-btn, .bf-menu-btn { width: 34px; height: 34px; }

          .bf-icon-btn svg { width: 16px; height: 16px; }

          .bf-whatsapp-btn svg { width: 18px; height: 18px; }

          .bf-menu-btn svg { width: 18px; height: 18px; }

          .bf-actions { gap: 4px; }

          .bf-plain-icon { width: 30px; height: 30px; }

          .bf-plain-icon svg { width: 18px; height: 18px; }

          .bf-badge { min-width: 14px; height: 14px; font-size: 9px; line-height: 14px; }

        }



        /* Below 600px the top bar only keeps Search / WhatsApp / Cart / Menu —

           Account and Wishlist move into the drawer's quick-row instead, so the

           hamburger never gets pushed off-screen on phones. */

        @media (max-width: 600px) {

          .bf-account-icon, .bf-wishlist-icon, .bf-action-divider { display: none; }

          .bf-actions { gap: 6px; }

          .bf-logo-tagline { display: none; }

          .bf-logo { gap: 8px; }

          .bf-logo-icon { width: 38px; height: 38px; }

          .bf-logo-title { font-size: 16px; max-width: 42vw; }

        }

        @media (max-width: 360px) {

          .bf-logo-icon { width: 32px; height: 32px; }

          .bf-logo-title { font-size: 14.5px; max-width: 36vw; }

          .bf-actions { gap: 4px; }

        }



        /* =====================================================

           SEARCH PANEL

        ===================================================== */

        .bf-search-panel {

          max-height: 0;

          overflow: hidden;

          background: var(--bf-cream);

          border-top: 1px solid rgba(31, 91, 99, 0.12);

          transition: max-height 0.3s ease, padding 0.3s ease;

        }

        .bf-search-panel--open {

          max-height: 90vh;

          padding: 14px 32px 16px;

        }

        @media (max-width: 900px) {

          .bf-search-panel--open { padding: 12px 16px 14px; }

        }



        .bf-search-form {

          max-width: 1400px;

          margin: 0 auto;

          display: flex;

          align-items: center;

          gap: 10px;

          background: #fff;

          border: 1px solid rgba(31, 91, 99, 0.2);

          border-radius: 999px;

          padding: 8px 10px 8px 18px;

          color: var(--bf-teal);

          box-shadow: 0 2px 10px rgba(20, 40, 42, 0.04);

        }

        .bf-search-form svg { width: 18px; height: 18px; flex-shrink: 0; }



        .bf-search-input {

          flex: 1;

          border: none;

          outline: none;

          background: transparent;

          font-size: 14.5px;

          font-family: inherit;

          color: var(--bf-text);

          min-width: 0;

        }



        .bf-search-submit {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          border: none;

          background: var(--bf-green);

          color: #fff;

          font-family: inherit;

          font-size: 13.5px;

          font-weight: 600;

          padding: 9px 18px;

          border-radius: 999px;

          cursor: pointer;

          flex-shrink: 0;

          transition: background 0.2s ease;

        }

        .bf-search-submit:hover { background: var(--bf-green-dark); }

        .bf-search-submit-icon { display: none; }



        .bf-search-close {

          border: none;

          background: transparent;

          color: var(--bf-muted);

          width: 28px;

          height: 28px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          cursor: pointer;

          flex-shrink: 0;

        }



        /* mobile: Search text ki jagah icon button (ab hamesha dikhega) */

        @media (max-width: 480px) {

          .bf-search-form { padding: 5px 6px 5px 14px; gap: 8px; }

          .bf-search-input { font-size: 13.5px; }

          .bf-search-submit {

            width: 36px;

            height: 36px;

            padding: 0;

          }

          .bf-search-submit-text { display: none; }

          .bf-search-submit-icon { display: inline-flex; }

        }



        /* ---------- results: in-flow (no floating gap) ---------- */

        .bf-search-results {

          width: 100%;

          max-width: 1400px;

          margin: 8px auto 0;

          background: #fff;

          border: 1px solid rgba(31, 91, 99, 0.12);

          border-radius: 16px;

          overflow: hidden;

          box-shadow: 0 12px 30px rgba(20, 40, 42, 0.1);

        }



        /* desktop / tablet: ek line mein 2 cards */

        .bf-search-results-list {

          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 8px;

          padding: 8px;

          max-height: min(58vh, 440px);

          overflow-y: auto;

        }



        .bf-search-result-item {

          width: 100%;

          min-width: 0;

          display: grid;

          grid-template-columns: 64px minmax(0, 1fr) auto;

          align-items: center;

          gap: 12px;

          padding: 10px 12px;

          border: 1px solid #f0eae2;

          border-radius: 12px;

          background: #fdfbf8;

          text-align: left;

          font-family: inherit;

          color: var(--bf-text);

          cursor: pointer;

          transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

        }

        .bf-search-result-item:hover {

          background: #fff;

          border-color: rgba(31, 91, 99, 0.35);

          box-shadow: 0 6px 16px rgba(31, 91, 99, 0.1);

          transform: translateY(-1px);

        }

        .bf-search-result-item:active { transform: scale(0.99); }



        .bf-search-result-image {

          width: 64px;

          height: 64px;

          display: flex;

          align-items: center;

          justify-content: center;

          overflow: hidden;

          border-radius: 10px;

          background: #f6f2ec;

          border: 1px solid #ece4da;

          color: var(--bf-muted);

          flex-shrink: 0;

        }

        .bf-search-result-image img { width: 100%; height: 100%; object-fit: contain; display: block; }



        .bf-search-result-copy { min-width: 0; display: flex; flex-direction: column; gap: 4px; }

        .bf-search-result-copy strong {

          color: var(--bf-teal);

          font-size: 13.5px;

          font-weight: 600;

          line-height: 1.3;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }

        .bf-search-result-copy small { color: #8a8a87; font-size: 10.5px; font-weight: 500; }



        .bf-search-result-price { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; line-height: 1; }

        .bf-search-result-sale-price { color: var(--bf-teal); font-size: 14px; font-weight: 700; }

        .bf-search-result-old-price { color: #9a9a9a; font-size: 11px; text-decoration: line-through; }

        .bf-search-result-off {

          display: inline-flex;

          align-items: center;

          padding: 4px 7px;

          border-radius: 999px;

          background: rgba(193, 80, 44, 0.1);

          border: 1px solid rgba(193, 80, 44, 0.22);

          color: var(--bf-sale);

          font-size: 9px;

          font-weight: 700;

          letter-spacing: 0.3px;

          white-space: nowrap;

        }



        .bf-search-result-arrow {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          width: 28px;

          height: 28px;

          border-radius: 50%;

          background: rgba(31, 91, 99, 0.07);

          color: var(--bf-teal);

          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;

        }

        .bf-search-result-arrow svg { width: 14px; height: 14px; }

        .bf-search-result-item:hover .bf-search-result-arrow {

          background: var(--bf-teal);

          color: #fff;

          transform: translateX(2px);

        }



        .bf-search-state { padding: 18px 16px; font-size: 13px; color: var(--bf-muted); }



        .bf-search-view-all {

          width: 100%;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;

          border: 0;

          border-top: 1px solid rgba(31, 91, 99, 0.1);

          background: var(--bf-cream);

          color: var(--bf-teal);

          padding: 13px 18px;

          text-align: left;

          font-family: inherit;

          font-size: 13px;

          font-weight: 700;

          cursor: pointer;

          transition: background 0.2s ease;

        }

        .bf-search-view-all svg { width: 16px; height: 16px; }

        .bf-search-view-all:hover { background: #f3eee6; }



        /* mobile: 1 card per row, compact */

        @media (max-width: 640px) {

          .bf-search-results { margin-top: 8px; border-radius: 14px; }

          .bf-search-results-list {

            grid-template-columns: 1fr;

            gap: 6px;

            padding: 6px;

            max-height: 58vh;

          }

          .bf-search-result-item {

            grid-template-columns: 52px minmax(0, 1fr) auto;

            gap: 10px;

            padding: 8px 10px;

            border-radius: 10px;

          }

          .bf-search-result-image { width: 52px; height: 52px; border-radius: 8px; }

          .bf-search-result-copy strong { font-size: 12.5px; }

          .bf-search-result-sale-price { font-size: 13px; }

          .bf-search-result-old-price { font-size: 10px; }

          .bf-search-result-off { font-size: 8px; padding: 3px 6px; }

          .bf-search-result-arrow { width: 24px; height: 24px; }

          .bf-search-view-all { padding: 12px 14px; font-size: 12.5px; }

        }



        /* ---------- Mobile drawer ---------- */

        .bf-drawer {

          position: fixed;

          top: 0;

          right: 0;

          height: 100vh;

          height: 100dvh;

          width: min(320px, 84vw);

          background: var(--bf-cream);

          box-shadow: -8px 0 24px rgba(20, 40, 42, 0.18);

          transform: translateX(100%);

          transition: transform 0.32s ease;

          z-index: 1002;

          display: flex;

          flex-direction: column;

          padding: calc(var(--bf-topbar-h-mobile) + 24px) 24px 24px;

          overflow-y: auto;

        }

        .bf-drawer--open { transform: translateX(0); }



        @media (max-width: 380px) {

          .bf-drawer {

            width: min(280px, 88vw);

            padding: calc(var(--bf-topbar-h-mobile) + 18px) 18px 18px;

          }

        }



        .bf-drawer-quickrow {

          display: flex;

          align-items: center;

          gap: 18px;

          padding-bottom: 16px;

          margin-bottom: 12px;

          border-bottom: 1px solid rgba(31, 91, 99, 0.12);

        }

        .bf-drawer-links { display: flex; flex-direction: column; gap: 4px; }



        .bf-drawer-link {

          display: flex;

          align-items: center;

          justify-content: space-between;

          font-size: clamp(14px, 4vw, 16px);

          font-weight: 500;

          color: var(--bf-text);

          text-decoration: none;

          padding: 12px 4px;

          border-bottom: 1px solid rgba(31, 91, 99, 0.1);

        }

        .bf-drawer-link--trigger {

          width: 100%;

          background: none;

          border: none;

          border-bottom: 1px solid rgba(31, 91, 99, 0.1);

          font-family: inherit;

          cursor: pointer;

          text-align: left;

        }

        .bf-drawer-link.bf-link--active { color: var(--bf-green); font-weight: 700; border-bottom-color: var(--bf-green); }

        .bf-drawer-link.bf-link--accent { color: var(--bf-sale); }



        .bf-drawer-group { display: flex; flex-direction: column; }

        .bf-drawer-submenu {

          max-height: 0;

          overflow: hidden;

          display: flex;

          flex-direction: column;

          transition: max-height 0.3s ease;

        }

        .bf-drawer-submenu--open { max-height: 260px; }

        .bf-drawer-sublink {

          font-size: clamp(13px, 3.6vw, 14.5px);

          font-weight: 500;

          color: var(--bf-muted);

          text-decoration: none;

          padding: 10px 4px 10px 16px;

          border-bottom: 1px solid rgba(31, 91, 99, 0.06);

        }

        .bf-drawer-sublink:hover { color: var(--bf-green); }

        .bf-chevron--open { transform: rotate(180deg); }



        .bf-drawer-actions { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }

        .bf-drawer-whatsapp {

          display: flex;

          align-items: center;

          gap: 10px;

          font-size: 14.5px;

          font-weight: 600;

          text-decoration: none;

          color: var(--bf-whatsapp-dark);

        }

        .bf-drawer-whatsapp svg { width: 18px; height: 18px; }



        .bf-overlay {

          position: fixed;

          inset: 0;

          background: rgba(20, 30, 32, 0.45);

          border: none;

          padding: 0;

          opacity: 0;

          pointer-events: none;

          transition: opacity 0.3s ease;

          z-index: 1001;

        }

        .bf-overlay--visible { opacity: 1; pointer-events: auto; }



        @media (min-width: 901px) {

          .bf-drawer, .bf-overlay { display: none; }

        }



        @media (prefers-reduced-motion: reduce) {

          .bf-topbar-track, .bf-search-panel, .bf-search-result-item, .bf-search-result-arrow {

            transition: none !important;

            animation: none !important;

          }

        }

      `}</style>

    </>

  );

}
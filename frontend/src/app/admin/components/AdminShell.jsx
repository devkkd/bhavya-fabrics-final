"use client";

import {
  useState
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter
} from "next/navigation";

import {
  LayoutDashboard,
  Package,
  Tags,
  MessageSquare,
  ShoppingBag,
    BadgePercent,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserRound,
  ImageIcon,
  CheckSquare,
  BookOpen,
  Star,
  FileText,
  Upload
} from "lucide-react";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard
  },
   {
    label: "Hero Section",
    href: "/admin/hero",
    icon: ImageIcon
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package
  },
  {
    label: "Bulk Upload",
    href: "/admin/bulkUpload",
    icon: Upload
  },
  {
    label: "Sale",
    href: "/admin/sale",
    icon: BadgePercent,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: UserRound,
  },
  {
    label: "Enquiries",
    href: "/admin/enquiries",
    icon: MessageSquare
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag
  },
  { label: "Catalogue", href: "/admin/catalogue", icon: FileText },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Blogs", href: "/admin/blogs", icon: BookOpen },
  {
    label: "Requests",
    href: "/admin/requests",
    icon: CheckSquare
  }
];

export default function AdminShell({
  children
}) {
  const pathname =
    usePathname();

  const router = useRouter();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [logoutLoading, setLogoutLoading] =
    useState(false);

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    setLogoutLoading(true);

    try {
      await fetch(
        `${API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include"
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      router.replace("/admin");
      router.refresh();
      setLogoutLoading(false);
    }
  };

  const currentItem =
    navItems.find(
      (item) =>
        pathname === item.href ||
        pathname.startsWith(
          `${item.href}/`
        )
    );

  const pageTitle =
    currentItem?.label ||
    "Dashboard";

  const styles = {
    layout: {
      minHeight: "100vh",
      width: "100%",
      background: "#F7F4F0",
      fontFamily:
        "Arial, Helvetica, sans-serif"
    },

    logoWrap: {
      width: "40px",
      height: "40px",
      borderRadius: "12px",
      background: "#F1E7D9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      boxShadow: "inset 0 0 0 1px rgba(41, 92, 101, 0.1)",
      flexShrink: 0
    },

    logoImage: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      display: "block"
    },

    sidebar: {
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      width: "76px",
      height: "100vh",
      background: "#295C65",
      color: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
      transition: "width 0.25s ease",
      overflow: "hidden"
    },

    sidebarBrand: {
      height: "84px",
      minHeight: "84px",
      boxSizing: "border-box",
      padding:
        "0 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "11px",
      borderBottom:
        "1px solid rgba(255,255,255,0.12)"
    },

    logo: {
      width: "41px",
      height: "41px",
      borderRadius: "10px",
      background: "#BE9D6B",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily:
        "Georgia, 'Times New Roman', serif",
      fontSize: "15px",
      fontWeight: "700",
      flexShrink: 0
    },

    brandTitle: {
      fontFamily:
        "Georgia, 'Times New Roman', serif",
      fontSize: "17px",
      fontWeight: "600",
      color: "#FFFFFF",
      lineHeight: "1.2"
    },

    brandSub: {
      marginTop: "3px",
      fontSize: "8px",
      fontWeight: "700",
      letterSpacing:
        "1.7px",
      color: "#D7C5A5"
    },

    brandText: {
      opacity: 0,
      width: 0,
      overflow: "hidden",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap"
    },

    close: {
      marginLeft: "auto",
      width: "31px",
      height: "31px",
      border: 0,
      background:
        "transparent",
      color: "#FFFFFF",
      display: "none",
      alignItems: "center",
      justifyContent: "center"
    },

    nav: {
      flex: 1,
      padding:
        "24px 13px"
    },

    navLabel: {
      opacity: 0,
      width: 0,
      overflow: "hidden",
      whiteSpace: "nowrap",
      transition: "all 0.2s ease"
    },

    navHeading: {
      padding:
        "0 11px 10px",
      color: "#ABC0C4",
      fontSize: "9px",
      fontWeight: "700",
      letterSpacing:
        "1.5px"
    },

    navLink: {
      position: "relative",
      width: "100%",
      height: "47px",
      boxSizing: "border-box",
      padding:
        "0 12px",
      borderRadius: "9px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      
      textDecoration: "none",
      color: "#DCE7E8",
      fontSize: "13px",
      fontWeight: "600",
      transition: "background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease"
    },

    navActive: {
      background:
        "rgba(255,255,255,0.14)",
      color: "#FFFFFF",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)"
    },

    navArrow: {
      marginLeft: "auto",
      opacity: 0.75
    },

    main: {
      width:
        "calc(100% - 76px)",
      minHeight: "100vh",
      marginLeft: "76px",
      transition: "margin-left 0.25s ease, width 0.25s ease"
    },

    header: {
      position: "fixed",
      top: 0,
      right: 0,
      left: "76px",
      height: "84px",
      boxSizing: "border-box",
      padding:
        "0 30px",
      background: "#FAF8F5",
      borderBottom:
        "1px solid #E3DCD4",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 90,
      transition: "left 0.25s ease"
    },

    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },

    mobileMenu: {
      width: "37px",
      height: "37px",
      border:
        "1px solid #DDD5CC",
      borderRadius: "8px",
      background: "#FFFFFF",
      color: "#295C65",
      display: "none",
      alignItems: "center",
      justifyContent: "center"
    },

    breadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: "3px",
      color: "#89857F",
      fontSize: "9px"
    },

    title: {
      margin:
        "4px 0 0",
      color: "#292828",
      fontFamily:
        "Georgia, 'Times New Roman', serif",
      fontSize: "24px",
      fontWeight: "600"
    },

    headerUser: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },

    headerAvatar: {
      width: "37px",
      height: "37px",
      borderRadius: "50%",
      background: "#295C65",
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "700",
      flexShrink: 0
    },

    headerUserText: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "2px"
    },

    headerName: {
      color: "#363432",
      fontSize: "10px",
      fontWeight: "700"
    },

    headerRole: {
      color: "#89857F",
      fontSize: "8px"
    },

    headerEmail: {
      color: "#5E5C59",
      fontSize: "8px"
    },

    headerLogout: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      border: "1px solid #D9D0C5",
      borderRadius: "9px",
      background: "#FFFFFF",
      color: "#295C65",
      padding: "8px 12px",
      fontSize: "11px",
      fontWeight: "700",
      cursor: logoutLoading ? "not-allowed" : "pointer",
      opacity: logoutLoading ? 0.7 : 1
    },

    content: {
      width: "100%",
      boxSizing: "border-box",
      padding:
        "116px 32px 32px"
    },

    overlay: {
      position: "fixed",
      inset: 0,
      background:
        "rgba(0,0,0,0.38)",
      zIndex: 95
    }
  };

  return (
   <div
  className="admin-layout admin-shell"
  style={styles.layout}
>

      {/* Mobile overlay */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() =>
            setMobileOpen(false)
          }
          style={styles.overlay}
        />
      )}

      {/* Sidebar */}

      <aside
        className="admin-sidebar"
        style={{
          ...styles.sidebar,
          ...(mobileOpen
            ? {
                transform:
                  "translateX(0)"
              }
            : {})
        }}
      >

        <div
          style={styles.sidebarBrand}
        >
          <div style={styles.logoWrap}>
            <img
              src="/images/logo.png"
              alt="Bhavya Fabrics"
              style={styles.logoImage}
            />
          </div>

          <div className="admin-sidebar-brand-text" style={styles.brandText}>
            <div
              style={
                styles.brandTitle
              }
            >
              Bhavya Fabrics
            </div>

            <div
              style={styles.brandSub}
            >
              ADMIN PANEL
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            style={{
              ...styles.close,
              ...(mobileOpen
                ? {
                    display: "flex"
                  }
                : {})
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}

        <nav style={styles.nav}>
          <div
            style={
              styles.navHeading
            }
          >
            MAIN MENU
          </div>

          {navItems.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                pathname ===
                  item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link
                  key={item.href}
                  href={
                    item.href
                  }
                  onClick={() =>
                    setMobileOpen(
                      false
                    )
                  }
                  className={`admin-nav-link${active ? " admin-nav-link--active" : ""}`}
                  style={{
                    ...styles.navLink,
                    ...(active
                      ? styles.navActive
                      : {})
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <span
                      style={{
                        position:
                          "absolute",
                        left: 0,
                        top: "9px",
                        bottom: "9px",
                        width: "3px",
                        borderRadius:
                          "0 4px 4px 0",
                        background:
                          "#BE9D6B"
                      }}
                    />
                  )}

                  <span className="admin-nav-icon">
                    <Icon
                      size={20}
                      strokeWidth={2.3}
                    />
                  </span>

                  <span className="admin-nav-label" style={styles.navLabel}>
                    {item.label}
                  </span>

                  {/* {active && (
                    <ChevronRight
                      size={15}
                      style={
                        styles.navArrow
                      }
                    />
                  )} */}
                </Link>
              );
            }
          )}
        </nav>
      </aside>

      {/* Main */}

      <div className="admin-main" style={styles.main}>

        {/* Header */}

        <header
          className="admin-header"
          style={{
            ...styles.header
          }}
        >
          <div
            style={
              styles.headerLeft
            }
          >
            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  true
                )
              }
              style={{
                ...styles.mobileMenu,
                "@media": {}
              }}
            >
              <Menu size={20} />
            </button>

            <div>
              <div
                style={
                  styles.breadcrumb
                }
              >
                Admin

                <ChevronRight
                  size={12}
                />

                {pageTitle}
              </div>

              <h1
                style={styles.title}
              >
                {pageTitle}
              </h1>
            </div>
          </div>

          <div
            style={
              styles.headerUser
            }
          >
            <div
              style={
                styles.headerUserText
              }
            >
              <div
                style={
                  styles.headerName
                }
              >
                Admin
              </div>

              <div
                style={
                  styles.headerRole
                }
              >
                Administrator
              </div>

              <div style={styles.headerEmail}>bhavya@gmail.com</div>
            </div>

            <div
              style={
                styles.headerAvatar
              }
            >
              <UserRound
                size={16}
              />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              style={styles.headerLogout}
            >
              <LogOut size={15} />
              {logoutLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        {/* Content */}

        <main
          style={
            styles.content
          }
        >
          {children}
        </main>
      </div>

      {/* Responsive inline style */}

      <style jsx global>{`
        .admin-shell .admin-sidebar {
          width: 76px !important;
          position: fixed !important;
          background: linear-gradient(180deg, #295c65 0%, #224e58 100%) !important;
          box-shadow: 8px 0 22px rgba(15, 46, 53, 0.18) !important;
        }

        .admin-shell .admin-sidebar:hover {
          width: 228px !important;
          box-shadow: 10px 0 26px rgba(10, 39, 45, 0.18);
        }

        .admin-shell .admin-sidebar:hover .admin-sidebar-brand-text,
        .admin-shell .admin-sidebar:hover .admin-nav-label,
        .admin-shell .admin-sidebar:hover nav > div:first-child {
          opacity: 1 !important;
          width: auto !important;
        }

        .admin-shell .admin-nav-link {
          position: relative;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.02);
        }

        .admin-shell .admin-nav-link:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          transform: translateX(1px);
        }

        .admin-shell .admin-nav-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .admin-shell .admin-nav-link svg {
          width: 22px !important;
          height: 22px !important;
          flex-shrink: 0;
          color: #edf3f4 !important;
          transition: transform 0.2s ease, opacity 0.2s ease, color 0.2s ease, filter 0.2s ease;
        }

        .admin-shell .admin-nav-link--active {
          background: linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.08)) !important;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10), 0 14px 28px rgba(10, 39, 45, 0.12) !important;
        }

        .admin-shell .admin-nav-link--active .admin-nav-icon {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(240, 210, 163, 0.45);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 18px rgba(10, 39, 45, 0.12);
        }

        .admin-shell .admin-nav-link--active svg {
          transform: scale(1.12);
          color: #f4d7a8 !important;
          filter: drop-shadow(0 0 6px rgba(244, 215, 168, 0.38));
        }

        .admin-shell .admin-sidebar:hover .admin-nav-link {
          justify-content: flex-start !important;
          gap: 12px !important;
          padding: 0 12px !important;
        }

        .admin-shell .admin-sidebar:hover .admin-nav-link .admin-nav-icon {
          width: 34px !important;
          height: 34px !important;
        }

        .admin-shell .admin-sidebar:hover .admin-nav-link svg {
          width: 22px !important;
          height: 22px !important;
        }

        .admin-shell .admin-sidebar:hover ~ .admin-main {
          width: calc(100% - 228px) !important;
          margin-left: 228px !important;
        }

        .admin-shell .admin-sidebar:hover ~ .admin-main .admin-header {
          left: 228px !important;
        }

        .admin-shell .admin-main {
          width: calc(100% - 76px) !important;
          margin-left: 76px !important;
          transition: width 0.25s ease, margin-left 0.25s ease;
        }

        .admin-shell .admin-header {
          position: fixed !important;
          top: 0 !important;
          right: 0 !important;
          left: 76px !important;
          z-index: 90 !important;
          transition: left 0.25s ease !important;
        }

        @media (max-width: 900px) {
          .admin-shell .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.2s ease;
          }

          .admin-shell .admin-header {
            left: 0 !important;
          }

          .admin-shell .admin-main {
            margin-left: 0 !important;
            width: 100% !important;
          }

          .admin-shell .admin-header button {
            display: flex !important;
          }

          .admin-shell .admin-sidebar button {
            display: flex !important;
          }
        }

        @media (max-width: 600px) {
          .admin-shell .admin-header {
            height: 70px !important;
            padding: 0 16px !important;
          }

          .admin-shell .admin-main {
            padding: 94px 16px 24px !important;
          }

          .admin-shell .admin-header h1 {
            font-size: 21px !important;
          }

          .admin-shell .admin-header div[style*="headerUserText"] {
            display: none;
          }

          .admin-shell .admin-sidebar {
            width: 255px !important;
          }
        }
      `}</style>
    </div>
  );
}
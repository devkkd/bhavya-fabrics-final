"use client";

import {
  Suspense,
  useState
} from "react";

import {
  useRouter,
  useSearchParams
} from "next/navigation";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2
} from "lucide-react";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginLoader />}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginLoader() {
  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "#F2EEE9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
      boxSizing: "border-box",
      fontFamily: "Arial, Helvetica, sans-serif"
    },
    card: {
      width: "460px",
      maxWidth: "100%",
      background: "#FAF8F5",
      border: "1px solid #DED7CF",
      borderRadius: "20px",
      padding: "40px 38px 28px",
      boxSizing: "border-box",
      boxShadow: "0 20px 50px rgba(41,92,101,0.08)"
    }
  };

  return (
    <main className="admin-login-page" style={styles.page}>
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "220px", color: "#295C65" }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      </div>
    </main>
  );
}

function AdminLoginForm() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const callbackUrl =
    searchParams.get(
      "callbackUrl"
    ) || "/admin/dashboard";

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
              email:
                email.trim(),
              password
            })
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Invalid email or password"
        );
      }

      router.replace(
        callbackUrl
      );

      router.refresh();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "#F2EEE9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
      boxSizing: "border-box",
      fontFamily:
        "Arial, Helvetica, sans-serif"
    },

    card: {
      width: "460px",
      maxWidth: "100%",
      background: "#FAF8F5",
      border:
        "1px solid #DED7CF",
      borderRadius: "20px",
      padding:
        "40px 38px 28px",
      boxSizing: "border-box",
      boxShadow:
        "0 20px 50px rgba(41,92,101,0.08)"
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: "13px",
      paddingBottom: "25px",
      borderBottom:
        "1px solid #E5DED5"
    },

    logo: {
      width: "49px",
      height: "49px",
      borderRadius: "11px",
      background: "#295C65",
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily:
        "Georgia, 'Times New Roman', serif",
      fontSize: "17px",
      fontWeight: "700",
      flexShrink: 0
    },

    brandTitle: {
      margin: 0,
      color: "#295C65",
      fontFamily:
        "Georgia, 'Times New Roman', serif",
      fontSize: "24px",
      lineHeight: "1.2",
      fontWeight: "600"
    },

    brandSub: {
      margin:
        "4px 0 0",
      color: "#BE9D6B",
      fontSize: "9px",
      fontWeight: "700",
      letterSpacing:
        "2px"
    },

    heading: {
      display: "flex",
      alignItems:
        "flex-start",
      gap: "12px",
      marginTop: "28px",
      marginBottom: "25px"
    },

    security: {
      width: "38px",
      height: "38px",
      borderRadius: "9px",
      background: "#F2EEE9",
      color: "#295C65",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    },

    headingTitle: {
      margin: 0,
      color: "#272727",
      fontFamily:
        "Georgia, 'Times New Roman', serif",
      fontSize: "23px",
      fontWeight: "600"
    },

    headingText: {
      margin:
        "5px 0 0",
      color: "#77736E",
      fontSize: "12px",
      lineHeight: "1.5"
    },

    form: {
      display: "flex",
      flexDirection: "column",
      gap: "19px"
    },

    field: {
      display: "flex",
      flexDirection:
        "column",
      gap: "8px"
    },

    label: {
      color: "#494744",
      fontSize: "12px",
      fontWeight: "600"
    },

    inputWrap: {
      position: "relative",
      width: "100%"
    },

    input: {
      width: "100%",
      height: "50px",
      boxSizing: "border-box",
      border:
        "1px solid #D5CEC6",
      borderRadius: "9px",
      outline: "none",
      background: "#FFFFFF",
      color: "#272727",
      padding:
        "0 44px",
      fontSize: "14px"
    },

    icon: {
      position: "absolute",
      left: "14px",
      top: "50%",
      transform:
        "translateY(-50%)",
      color: "#8A8782",
      pointerEvents:
        "none"
    },

    eye: {
      position: "absolute",
      right: "13px",
      top: "50%",
      transform:
        "translateY(-50%)",
      width: "28px",
      height: "28px",
      padding: 0,
      border: 0,
      background:
        "transparent",
      color: "#77736E",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer"
    },

    error: {
      width: "100%",
      boxSizing:
        "border-box",
      padding:
        "10px 12px",
      border:
        "1px solid #EAC8C8",
      background:
        "#FBEEEE",
      borderRadius: "8px",
      color: "#A33F3F",
      fontSize: "11px",
      lineHeight: "1.4"
    },

    button: {
      width: "100%",
      height: "51px",
      border: 0,
      borderRadius: "9px",
      background: "#295C65",
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "9px",
      fontSize: "13px",
      fontWeight: "700",
      cursor: loading
        ? "not-allowed"
        : "pointer",
      opacity: loading
        ? 0.7
        : 1
    },

    footer: {
      marginTop: "25px",
      paddingTop: "17px",
      borderTop:
        "1px solid #E5DED5",
      display: "flex",
      justifyContent:
        "space-between",
      gap: "10px"
    },

    footerText: {
      color: "#89857F",
      fontSize: "9px"
    }
  };

  return (
    <main
  className="admin-login-page"
  style={styles.page}
>
      <div style={styles.card}>

        {/* Brand */}

        <div style={styles.brand}>
          <div style={styles.logo}>
            BF
          </div>

          <div>
            <h1
              style={styles.brandTitle}
            >
              Bhavya Fabrics
            </h1>

            <p
              style={styles.brandSub}
            >
              ADMIN PANEL
            </p>
          </div>
        </div>

        {/* Heading */}

        <div style={styles.heading}>
          <div
            style={styles.security}
          >
            <ShieldCheck
              size={20}
            />
          </div>

          <div>
            <h2
              style={
                styles.headingTitle
              }
            >
              Welcome Back
            </h2>

            <p
              style={
                styles.headingText
              }
            >
              Sign in to access
              your admin dashboard.
            </p>
          </div>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          {/* Email */}

          <div style={styles.field}>
            <label
              htmlFor="admin-email"
              style={styles.label}
            >
              Email Address
            </label>

            <div
              style={styles.inputWrap}
            >
              <Mail
                size={18}
                style={styles.icon}
              />

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="Enter admin email"
                autoComplete="email"
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Password */}

          <div style={styles.field}>
            <label
              htmlFor="admin-password"
              style={styles.label}
            >
              Password
            </label>

            <div
              style={styles.inputWrap}
            >
              <Lock
                size={18}
                style={styles.icon}
              />

              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter admin password"
                autoComplete="current-password"
                required
                style={styles.input}
              />

              <button
                type="button"
                style={styles.eye}
                onClick={() =>
                  setShowPassword(
                    (value) =>
                      !value
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div
              style={styles.error}
            >
              {error}
            </div>
          )}

          {/* Button */}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  style={{
                    animation:
                      "spin 1s linear infinite"
                  }}
                />

                Signing in...
              </>
            ) : (
              <>
                Sign In

                <ArrowRight
                  size={17}
                />
              </>
            )}
          </button>
        </form>

        {/* Footer */}

        <div style={styles.footer}>
          <span
            style={styles.footerText}
          >
            Bhavya Fabrics
          </span>

          <span
            style={styles.footerText}
          >
            Secure Admin Access
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        input:focus {
          border-color: #295c65 !important;
          box-shadow:
            0 0 0 3px
            rgba(41, 92, 101, 0.08);
        }

        input::placeholder {
          color: #9b9893;
        }

        button:hover:not(:disabled) {
          opacity: 0.94;
        }

        @media (max-width: 600px) {
          main {
            padding: 16px !important;
          }

          main > div {
            padding:
              29px 20px 22px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>
    </main>
  );
}
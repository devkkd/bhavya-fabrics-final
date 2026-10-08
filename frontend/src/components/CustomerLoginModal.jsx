"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { notifyCustomerAuthChanged } from "@/utils/storefrontSync";
import {
  X,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api"
).replace(/\/$/, "");

export default function CustomerLoginModal({
  open,
  onClose,
  onSuccess,
}) {
  const [mode, setMode] = useState("login");
  const [loginMethod, setLoginMethod] = useState("password");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  /* ── body scroll lock ── */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setMessage("");
  }, [open]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((c) => Math.max(0, c - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  /* ── close on Escape ── */
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape" && !loading) closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading]);

  if (!open) return null;

  function resetMessages() {
    setError("");
    setMessage("");
  }

  function resetFlow() {
    setMode("login");
    setLoginMethod("password");
    setOtp("");
    setResetToken("");
    resetMessages();
  }

  function closeModal() {
    if (loading) return;
    resetFlow();
    onClose?.();
  }

  async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(payload?.message || "Something went wrong");
    }
    return payload;
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    resetMessages();
    if (!email || !password) { setError("Email and password are required."); return; }
    try {
      setLoading(true);
      const payload = await apiRequest("/customer-auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (payload?.success && payload?.user) {
        notifyCustomerAuthChanged();
        onSuccess?.(payload.user);
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function requestLoginOtp(e) {
    e?.preventDefault();
    resetMessages();
    if (!email) { setError("Enter your email address."); return; }
    try {
      setLoading(true);
      const payload = await apiRequest("/customer-auth/login/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(payload?.message || "OTP sent to your email.");
      setResendSeconds(Number(payload?.resendAfterSeconds || 60));
      setLoginMethod("otp");
    } catch (err) {
      setError(err.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyLoginOtp(e) {
    e.preventDefault();
    resetMessages();
    if (!otp) { setError("Enter the OTP."); return; }
    try {
      setLoading(true);
      const payload = await apiRequest("/customer-auth/login/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      if (payload?.success && payload?.user) {
        notifyCustomerAuthChanged();
        onSuccess?.(payload.user);
      }
    } catch (err) {
      setError(err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function requestRegisterOtp(e) {
    e.preventDefault();
    resetMessages();
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      setLoading(true);
      const payload = await apiRequest("/customer-auth/register/request-otp", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, birthday, gender, password, confirmPassword, subscribe }),
      });
      setMessage(payload?.message || "Verification OTP sent.");
      setResendSeconds(Number(payload?.resendAfterSeconds || 60));
      setMode("register-otp");
    } catch (err) {
      setError(err.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyRegisterOtp(e) {
    e.preventDefault();
    resetMessages();
    if (!otp) { setError("Enter the OTP."); return; }
    try {
      setLoading(true);
      const payload = await apiRequest("/customer-auth/register/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      if (payload?.success && payload?.user) {
        notifyCustomerAuthChanged();
        onSuccess?.(payload.user);
      }
    } catch (err) {
      setError(err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function requestForgotOtp(e) {
    e.preventDefault();
    resetMessages();
    if (!email) { setError("Enter your registered email."); return; }
    try {
      setLoading(true);
      const payload = await apiRequest("/customer-auth/forgot-password/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(payload?.message || "Reset OTP sent.");
      setResendSeconds(Number(payload?.resendAfterSeconds || 60));
      setMode("forgot-otp");
    } catch (err) {
      setError(err.message || "Unable to send reset OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyForgotOtp(e) {
    e.preventDefault();
    resetMessages();
    try {
      setLoading(true);
      const payload = await apiRequest("/customer-auth/forgot-password/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      setResetToken(payload?.resetToken || "");
      setMode("reset-password");
      setMessage("OTP verified. Create your new password.");
    } catch (err) {
      setError(err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    resetMessages();
    try {
      setLoading(true);
      const payload = await apiRequest("/customer-auth/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify({ resetToken, newPassword: password, confirmPassword }),
      });
      setMessage(payload?.message || "Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => setMode("login"), 900);
    } catch (err) {
      setError(err.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  const headingMap = {
    login: "Welcome Back",
    register: "Create Account",
    "register-otp": "Verify Email",
    forgot: "Forgot Password",
    "forgot-otp": "Verify OTP",
    "reset-password": "New Password",
  };

  const subtitleMap = {
    login: "Sign in to your Bhavya Fabrics account.",
    register: "Fill in the details below to get started.",
    "register-otp": `OTP sent to ${email}`,
    forgot: "Enter your registered email address.",
    "forgot-otp": `Enter the OTP sent to ${email}`,
    "reset-password": "Choose a strong new password.",
  };

  const showBackButton =
    mode !== "login" && mode !== "register" && mode !== "register-otp";

  return (
    <>
      {/* ── Full-screen overlay ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        {/* ── Backdrop ── */}
        <div
          onClick={closeModal}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10, 22, 24, 0.72)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        />

        {/* ── Modal card ── */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Customer account"
          className="clm-card"
        >
          {/* Close button */}
          <button
            type="button"
            className="clm-close"
            onClick={closeModal}
            disabled={loading}
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Logo + brand */}
          <div className="clm-header">
            <div className="clm-logo-wrap">
              <Image
                src="/images/logo.png"
                alt="Bhavya Fabrics"
                width={72}
                height={72}
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
                priority
              />
            </div>
            <div className="clm-brand-name">Bhavya Fabrics</div>
            <div className="clm-brand-tag">Premium Textile Manufacturer</div>
          </div>

          {/* Divider */}
          <div className="clm-divider-line" />

          {/* Back button */}
          {showBackButton && (
            <button
              type="button"
              className="clm-back"
              onClick={() => { resetMessages(); setMode("login"); }}
            >
              <ArrowLeft size={13} /> Back to Login
            </button>
          )}

          {/* Heading */}
          <h2 className="clm-heading">{headingMap[mode]}</h2>
          <p className="clm-subtitle">{subtitleMap[mode]}</p>

          {/* Messages */}
          {error && <div className="clm-msg clm-msg--error">{error}</div>}
          {message && <div className="clm-msg clm-msg--success">{message}</div>}

          {/* ────── LOGIN ────── */}
          {mode === "login" && (
            <>
              {/* Method tabs */}
              <div className="clm-tabs">
                <button
                  type="button"
                  className={`clm-tab${loginMethod === "password" ? " clm-tab--active" : ""}`}
                  onClick={() => { resetMessages(); setLoginMethod("password"); }}
                >
                  Password
                </button>
                <button
                  type="button"
                  className={`clm-tab${loginMethod === "otp" ? " clm-tab--active" : ""}`}
                  onClick={() => { resetMessages(); setLoginMethod("otp"); }}
                >
                  Login with OTP
                </button>
              </div>

              {loginMethod === "password" && (
                <form onSubmit={handlePasswordLogin} className="clm-form">
                  <div className="clm-field">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="clm-input"
                      autoComplete="email"
                    />
                  </div>
                  <div className="clm-field clm-pw-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="clm-input"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="clm-eye"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="clm-btn clm-btn--primary"
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={15} className="clm-spin" /> : null}
                    {loading ? "Signing in…" : "LOGIN"}
                  </button>

                  <button
                    type="button"
                    className="clm-link-btn"
                    onClick={() => { resetMessages(); setMode("forgot"); }}
                  >
                    Forgot Password?
                  </button>
                </form>
              )}

              {loginMethod === "otp" && (
                <>
                  <form onSubmit={requestLoginOtp} className="clm-form">
                    <div className="clm-field">
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="clm-input"
                        autoComplete="email"
                      />
                    </div>
                    <button
                      type="submit"
                      className="clm-btn clm-btn--primary"
                      disabled={loading || resendSeconds > 0}
                    >
                      {loading
                        ? "Sending…"
                        : resendSeconds > 0
                        ? `Resend in ${resendSeconds}s`
                        : "SEND OTP"}
                    </button>
                  </form>

                  {message && (
                    <form onSubmit={verifyLoginOtp} className="clm-form" style={{ marginTop: 12 }}>
                      <div className="clm-field">
                        <input
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="clm-input clm-input--center"
                          autoComplete="one-time-code"
                        />
                      </div>
                      <button
                        type="submit"
                        className="clm-btn clm-btn--primary"
                        disabled={loading}
                      >
                        VERIFY OTP
                      </button>
                    </form>
                  )}
                </>
              )}

              <div className="clm-or">
                <span>OR</span>
              </div>

              <button
                type="button"
                className="clm-btn clm-btn--outline"
                onClick={() => { resetMessages(); setMode("register"); }}
              >
                CREATE AN ACCOUNT
              </button>
            </>
          )}

          {/* ────── REGISTER ────── */}
          {mode === "register" && (
            <form onSubmit={requestRegisterOtp} className="clm-form">
              <div className="clm-field">
                <input type="text" placeholder="Full name *" value={name} onChange={(e) => setName(e.target.value)} className="clm-input" />
              </div>
              <div className="clm-field">
                <input type="tel" placeholder="Mobile number *" value={phone} onChange={(e) => setPhone(e.target.value)} className="clm-input" />
              </div>
              <div className="clm-field">
                <input type="email" placeholder="Email address *" value={email} onChange={(e) => setEmail(e.target.value)} className="clm-input" autoComplete="email" />
              </div>
              <div className="clm-field">
                <input type="text" placeholder="Birthday MM/DD/YYYY" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="clm-input" />
              </div>
              <div className="clm-field">
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="clm-input clm-select">
                  <option value="">Gender (Optional)</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="clm-field clm-pw-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="clm-input"
                  autoComplete="new-password"
                />
                <button type="button" className="clm-eye" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="clm-pw-hint">Min 8 chars · Uppercase · Lowercase · Number · Special char (e.g. @#$!)</p>
              <div className="clm-field clm-pw-wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password *"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="clm-input"
                  autoComplete="new-password"
                />
                <button type="button" className="clm-eye" onClick={() => setShowConfirmPassword((v) => !v)} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <label className="clm-check-row">
                <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} />
                <span>Keep me updated with Bhavya Fabrics news &amp; offers.</span>
              </label>
              <button type="submit" className="clm-btn clm-btn--primary" disabled={loading}>
                {loading ? "SENDING OTP…" : "CREATE ACCOUNT"}
              </button>
              <button type="button" className="clm-link-btn" onClick={() => { resetMessages(); setMode("login"); }}>
                Already have an account? Sign in
              </button>
            </form>
          )}

          {/* ────── REGISTER OTP ────── */}
          {mode === "register-otp" && (
            <form onSubmit={verifyRegisterOtp} className="clm-form">
              <div className="clm-field">
                <input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="clm-input clm-input--center"
                  autoComplete="one-time-code"
                />
              </div>
              <button type="submit" className="clm-btn clm-btn--primary" disabled={loading}>
                VERIFY &amp; LOGIN
              </button>
            </form>
          )}

          {/* ────── FORGOT PASSWORD ────── */}
          {mode === "forgot" && (
            <form onSubmit={requestForgotOtp} className="clm-form">
              <div className="clm-field">
                <input type="email" placeholder="Registered email address" value={email} onChange={(e) => setEmail(e.target.value)} className="clm-input" autoComplete="email" />
              </div>
              <button type="submit" className="clm-btn clm-btn--primary" disabled={loading}>
                {loading ? "SENDING…" : "SEND RESET OTP"}
              </button>
            </form>
          )}

          {/* ────── FORGOT OTP ────── */}
          {mode === "forgot-otp" && (
            <form onSubmit={verifyForgotOtp} className="clm-form">
              <div className="clm-field">
                <input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="clm-input clm-input--center"
                  autoComplete="one-time-code"
                />
              </div>
              <button type="submit" className="clm-btn clm-btn--primary" disabled={loading}>
                VERIFY OTP
              </button>
            </form>
          )}

          {/* ────── RESET PASSWORD ────── */}
          {mode === "reset-password" && (
            <form onSubmit={resetPassword} className="clm-form">
              <div className="clm-field clm-pw-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="clm-input"
                  autoComplete="new-password"
                />
                <button type="button" className="clm-eye" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="clm-field clm-pw-wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="clm-input"
                  autoComplete="new-password"
                />
                <button type="button" className="clm-eye" onClick={() => setShowConfirmPassword((v) => !v)} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button type="submit" className="clm-btn clm-btn--primary" disabled={loading}>
                {loading ? "UPDATING…" : "UPDATE PASSWORD"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        /* ── Card ── */
        .clm-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          max-height: calc(100dvh - 32px);
          overflow-y: auto;
          overscroll-behavior: contain;
          background: #ffffff;
          border-radius: 20px;
          padding: 36px 32px 32px;
          box-shadow:
            0 32px 80px rgba(0, 0, 0, 0.35),
            0 0 0 1px rgba(255,255,255,0.08);
          animation: clm-slide-up 0.28s cubic-bezier(0.34, 1.3, 0.64, 1) both;
        }

        @keyframes clm-slide-up {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* ── Scrollbar ── */
        .clm-card::-webkit-scrollbar { width: 4px; }
        .clm-card::-webkit-scrollbar-track { background: transparent; }
        .clm-card::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

        /* ── Close ── */
        .clm-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid #e8e1d9;
          background: #faf7f3;
          color: #5c6a6c;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
          z-index: 1;
        }
        .clm-close:hover {
          background: #1f5b63;
          border-color: #1f5b63;
          color: #fff;
        }

        /* ── Header / Logo area ── */
        .clm-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          padding-top: 4px;
        }

        .clm-logo-wrap {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #faf7f1;
          border: 2px solid rgba(173, 138, 82, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(31, 91, 99, 0.12);
          padding: 4px;
        }

        .clm-brand-name {
          font-family: "Playfair Display", Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 700;
          color: #1f5b63;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .clm-brand-tag {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #ad8a52;
          text-align: center;
        }

        /* ── Divider ── */
        .clm-divider-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e8dfd4 30%, #e8dfd4 70%, transparent);
          margin: 0 0 20px;
        }

        /* ── Back button ── */
        .clm-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: #1f5b63;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-bottom: 14px;
          letter-spacing: 0.2px;
          transition: opacity 0.15s;
        }
        .clm-back:hover { opacity: 0.7; }

        /* ── Heading ── */
        .clm-heading {
          margin: 0 0 5px;
          font-family: "Playfair Display", Georgia, "Times New Roman", serif;
          font-size: 26px;
          font-weight: 600;
          color: #173c46;
          letter-spacing: 0.2px;
        }

        .clm-subtitle {
          margin: 0 0 20px;
          font-size: 13px;
          color: #7a8a8c;
          line-height: 1.5;
        }

        /* ── Messages ── */
        .clm-msg {
          margin-bottom: 14px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.5;
          font-weight: 500;
        }
        .clm-msg--error   { background: #fdf0ee; color: #b94a3a; border: 1px solid #f0cdc8; }
        .clm-msg--success { background: #edf6f3; color: #1f7255; border: 1px solid #c2e0d5; }

        /* ── Method tabs ── */
        .clm-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          background: #f2ece5;
          padding: 4px;
          border-radius: 999px;
          margin-bottom: 18px;
        }

        .clm-tab {
          min-height: 36px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #7a8a8c;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          letter-spacing: 0.2px;
        }
        .clm-tab--active {
          background: #1f5b63;
          color: #fff;
          box-shadow: 0 2px 8px rgba(31,91,99,0.25);
        }

        /* ── Form ── */
        .clm-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .clm-field {
          position: relative;
        }

        .clm-input {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border: 1.5px solid #e2dbd2;
          border-radius: 10px;
          background: #fdfcfa;
          color: #1c2f33;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .clm-input::placeholder { color: #aaa; }
        .clm-input:focus {
          border-color: #1f5b63;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(31, 91, 99, 0.10);
        }
        .clm-input--center { text-align: center; letter-spacing: 4px; font-size: 18px; font-weight: 600; }

        .clm-select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a8a8c' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }

        /* ── Password wrap ── */
        .clm-pw-wrap { position: relative; }
        .clm-pw-wrap .clm-input { padding-right: 46px; }
        .clm-eye {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #9aabae;
          cursor: pointer;
          padding: 4px;
          line-height: 0;
          transition: color 0.15s;
        }
        .clm-eye:hover { color: #1f5b63; }

        /* ── Buttons ── */
        .clm-btn {
          width: 100%;
          min-height: 46px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
          font-family: inherit;
        }
        .clm-btn--primary {
          background: #1f5b63;
          border: 1.5px solid #1f5b63;
          color: #fff;
          box-shadow: 0 4px 14px rgba(31, 91, 99, 0.3);
        }
        .clm-btn--primary:hover:not(:disabled) {
          background: #163f45;
          border-color: #163f45;
          box-shadow: 0 6px 20px rgba(31, 91, 99, 0.4);
          transform: translateY(-1px);
        }
        .clm-btn--primary:disabled { opacity: 0.65; cursor: not-allowed; }

        .clm-btn--outline {
          background: transparent;
          border: 1.5px solid #1f5b63;
          color: #1f5b63;
        }
        .clm-btn--outline:hover {
          background: rgba(31, 91, 99, 0.05);
        }

        /* ── Link / text buttons ── */
        .clm-link-btn {
          border: 0;
          background: transparent;
          color: #1f5b63;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          font-family: inherit;
          transition: opacity 0.15s;
          margin-top: 2px;
        }
        .clm-link-btn:hover { opacity: 0.7; }

        /* ── OR divider ── */
        .clm-or {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #c0b8af;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          margin: 6px 0;
        }
        .clm-or::before,
        .clm-or::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e8e1d9;
        }

        /* ── Checkbox row ── */
        .clm-check-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          color: #7a8a8c;
          line-height: 1.5;
          cursor: pointer;
        }
        .clm-check-row input[type="checkbox"] {
          width: 15px;
          height: 15px;
          min-width: 15px;
          margin-top: 1px;
          accent-color: #1f5b63;
          cursor: pointer;
        }

        /* ── Password hint ── */
        .clm-pw-hint {
          margin: -4px 0 0;
          font-size: 10.5px;
          color: #9aabae;
          line-height: 1.5;
        }

        /* ── Spinner ── */
        .clm-spin {
          animation: clm-spin 0.9s linear infinite;
          flex-shrink: 0;
        }
        @keyframes clm-spin { to { transform: rotate(360deg); } }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .clm-card {
            padding: 28px 20px 24px;
            border-radius: 16px;
            max-height: calc(100dvh - 20px);
          }
          .clm-heading { font-size: 22px; }
          .clm-brand-name { font-size: 17px; }
          .clm-logo-wrap { width: 68px; height: 68px; }
          .clm-input { height: 44px; font-size: 13px; }
          .clm-btn  { min-height: 44px; }
        }

        @media (max-width: 360px) {
          .clm-card { padding: 24px 16px 20px; }
          .clm-heading { font-size: 20px; }
        }
      `}</style>
    </>
  );
}

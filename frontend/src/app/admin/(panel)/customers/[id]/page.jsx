"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldBan,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  AlertTriangle,
  Cake,
  Venus,
  Mars,
  CircleDot,
  Bell,
  Hash,
  Trash2,
  RefreshCw,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/$/, "");

/* ────────────────────────── helpers ────────────────────────── */
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });
}
function fmtFull(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function timeAgo(d) {
  if (!d) return null;
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}yr ago`;
}
function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "").join("");
}

const AVATAR_COLORS = [
  "#295C65","#3d7a62","#7a5c3d","#5c3d7a",
  "#3d5c7a","#7a3d5c","#5c7a3d","#7a6a3d",
];
function avatarColor(id = "") {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

const STATUS_META = {
  active:  { bg: "#e6f4ec", color: "#1a7a45", border: "#b2dfc0", icon: CheckCircle2,  label: "Active"  },
  blocked: { bg: "#fdecea", color: "#b83c30", border: "#f0c8c4", icon: XCircle,       label: "Blocked" },
  pending: { bg: "#fff8e6", color: "#976800", border: "#f5dfa0", icon: AlertTriangle,  label: "Pending" },
};

/* ────────────────────────── sub-components ─────────────────── */

function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "13px 0",
      borderBottom: "1px solid #f0ebe5",
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: "#f2ede8", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={14} color="#295C65" />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#9aabae", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{
          fontSize: 13, color: "#1c2f33", fontWeight: 500,
          fontFamily: mono ? "monospace" : "inherit",
          wordBreak: "break-all",
        }}>
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children, action }) {
  return (
    <div style={{
      background: "#fff",
      border: "1.5px solid #e8e1d9",
      borderRadius: 14,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 20px",
        borderBottom: "1.5px solid #f0ebe5",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#faf8f5",
      }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 600, color: "#1c2f33" }}>
          {title}
        </span>
        {action}
      </div>
      <div style={{ padding: "4px 20px 16px" }}>
        {children}
      </div>
    </div>
  );
}

function Badge({ label, yes }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      background: yes ? "#e6f4ec" : "#fdecea",
      color: yes ? "#1a7a45" : "#b83c30",
      fontSize: 11, fontWeight: 700,
    }}>
      {yes ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
      {label}
    </span>
  );
}

function TimelineDot({ color = "#295C65" }) {
  return (
    <div style={{
      width: 10, height: 10, borderRadius: "50%",
      background: color, flexShrink: 0, marginTop: 4,
      boxShadow: `0 0 0 3px ${color}22`,
    }} />
  );
}

/* ────────────────────────── main page ──────────────────────── */
export default function CustomerDetailPage() {
  const { id }  = useParams();
  const router  = useRouter();

  const [customer, setCustomer]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [toast, setToast]               = useState(null);

  /* fetch */
  async function load() {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/customers/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setCustomer(data.customer);
      else showToast(data.message || "Failed to load", "error");
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  /* block / unblock */
  async function toggleBlock() {
    if (!customer) return;
    const action = customer.status === "blocked" ? "unblock" : "block";
    setActionLoading(true);
    try {
      const res  = await fetch(`${API_URL}/customers/${id}/${action}`, {
        method: "PATCH", credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        showToast(data.message, "success");
      } else {
        showToast(data.message || "Action failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setActionLoading(false);
    }
  }

  /* delete */
  async function deleteCustomer() {
    setActionLoading(true);
    try {
      const res  = await fetch(`${API_URL}/customers/${id}`, {
        method: "DELETE", credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setTimeout(() => router.replace("/admin/customers"), 1200);
      } else {
        showToast(data.message || "Delete failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setActionLoading(false);
      setDeleteConfirm(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <div style={{
          width: 32, height: 32, border: "3px solid #e8e1d9",
          borderTopColor: "#295C65", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <User size={40} color="#d0cac3" />
        <p style={{ color: "#9aabae", fontSize: 14, marginTop: 12 }}>Customer not found.</p>
        <Link href="/admin/customers" style={{ color: "#295C65", fontSize: 13, fontWeight: 600 }}>
          ← Back to Customers
        </Link>
      </div>
    );
  }

  const st       = STATUS_META[customer.status] || STATUS_META.pending;
  const StatusIcon = st.icon;
  const isBlocked = customer.status === "blocked";
  const color     = avatarColor(id);

  /* timeline events derived from customer data */
  const timeline = [
    customer.lastLoginAt && {
      label: "Last login",
      time: fmtFull(customer.lastLoginAt),
      ago: timeAgo(customer.lastLoginAt),
      color: "#295C65",
    },
    customer.emailVerified && customer.updatedAt && {
      label: "Email verified",
      time: fmtFull(customer.updatedAt),
      ago: timeAgo(customer.updatedAt),
      color: "#1a7a45",
    },
    customer.createdAt && {
      label: "Account created",
      time: fmtFull(customer.createdAt),
      ago: timeAgo(customer.createdAt),
      color: "#ad8a52",
    },
  ].filter(Boolean);

  return (
    <div style={{ width: "100%", fontFamily: "Arial, sans-serif" }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10,
          background: toast.type === "success" ? "#1a7a45" : "#b83c30",
          color: "#fff", fontSize: 13, fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          animation: "toastIn 0.22s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 8000,
          background: "rgba(10,22,24,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "32px 28px",
            maxWidth: 400, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
            animation: "toastIn 0.22s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fdecea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={20} color="#b83c30" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1c2f33" }}>Delete Customer</div>
                <div style={{ fontSize: 12, color: "#7a8a8c", marginTop: 2 }}>This action cannot be undone</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#4a5c60", lineHeight: 1.6, margin: "0 0 20px" }}>
              Are you sure you want to permanently delete{" "}
              <strong>{customer.name}</strong>? All their data will be removed.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(false)}
                style={{
                  flex: 1, height: 42, borderRadius: 8, border: "1.5px solid #e2dbd2",
                  background: "#fff", color: "#4a5c60", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={deleteCustomer}
                disabled={actionLoading}
                style={{
                  flex: 1, height: 42, borderRadius: 8, border: "none",
                  background: "#b83c30", color: "#fff", fontSize: 13, fontWeight: 700,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  opacity: actionLoading ? 0.7 : 1,
                }}
              >
                {actionLoading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Back + actions bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12, marginBottom: 24,
      }}>
        <Link href="/admin/customers" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          color: "#295C65", fontWeight: 700, fontSize: 13, textDecoration: "none",
        }}>
          <ArrowLeft size={15} /> Back to Customers
        </Link>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={load} style={outlineBtn} title="Refresh">
            <RefreshCw size={13} /> Refresh
          </button>

          {customer.status !== "pending" && (
            <button
              onClick={toggleBlock}
              disabled={actionLoading}
              style={{
                ...outlineBtn,
                background: isBlocked ? "#e6f4ec" : "#fdecea",
                borderColor: isBlocked ? "#b2dfc0" : "#f0c8c4",
                color: isBlocked ? "#1a7a45" : "#b83c30",
                opacity: actionLoading ? 0.6 : 1,
                cursor: actionLoading ? "not-allowed" : "pointer",
              }}
            >
              {actionLoading
                ? <div style={{ width: 13, height: 13, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : isBlocked ? <ShieldCheck size={13} /> : <ShieldBan size={13} />}
              {isBlocked ? "Unblock Customer" : "Block Customer"}
            </button>
          )}

          <button
            onClick={() => setDeleteConfirm(true)}
            style={{ ...outlineBtn, background: "#fdecea", borderColor: "#f0c8c4", color: "#b83c30" }}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* ── Hero profile strip ── */}
      <div style={{
        background: "#fff",
        border: "1.5px solid #e8e1d9",
        borderRadius: 16,
        padding: "28px 28px",
        marginBottom: 20,
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: color, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700,
            opacity: isBlocked ? 0.5 : 1,
            boxShadow: `0 0 0 4px ${color}28`,
          }}>
            {initials(customer.name)}
          </div>
          {/* status dot */}
          <span style={{
            position: "absolute", bottom: 2, right: 2,
            width: 16, height: 16, borderRadius: "50%",
            background: st.color, border: "2.5px solid #fff",
          }} />
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{
              margin: 0, fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700,
              color: isBlocked ? "#9aabae" : "#1c2f33",
              textDecoration: isBlocked ? "line-through" : "none",
            }}>
              {customer.name}
            </h2>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 12px", borderRadius: 999,
              background: st.bg, color: st.color,
              border: `1px solid ${st.border}`,
              fontSize: 11, fontWeight: 700,
            }}>
              <StatusIcon size={11} />
              {st.label}
            </span>
            {customer.emailVerified && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 999,
                background: "#edf3f5", color: "#295C65",
                fontSize: 11, fontWeight: 700,
              }}>
                <BadgeCheck size={11} /> Verified
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
            <MetaChip icon={Mail}   label={customer.email} />
            <MetaChip icon={Phone}  label={customer.phone || "No phone"} />
            <MetaChip icon={Clock}  label={`Joined ${fmt(customer.createdAt)}`} />
            {customer.lastLoginAt && (
              <MetaChip icon={Clock} label={`Last login ${timeAgo(customer.lastLoginAt)}`} muted />
            )}
          </div>
        </div>

        {/* ID chip */}
        <div style={{
          padding: "8px 14px", borderRadius: 8,
          background: "#f2ede8", border: "1px solid #e2dbd2",
          fontSize: 10, color: "#7a8a8c", fontWeight: 600,
          fontFamily: "monospace", letterSpacing: "0.5px",
          whiteSpace: "nowrap",
        }}>
          ID: {id}
        </div>
      </div>

      {/* ── 3-column grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="detail-grid">

        {/* ── Column 1: Personal info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Card title="Personal Information">
            <InfoRow icon={User}     label="Full Name"  value={customer.name} />
            <InfoRow icon={Mail}     label="Email"      value={customer.email} mono />
            <InfoRow icon={Phone}    label="Phone"      value={customer.phone} />
            <InfoRow icon={Cake}     label="Birthday"   value={fmt(customer.birthday)} />
            <InfoRow
              icon={customer.gender === "Female" ? Venus : customer.gender === "Male" ? Mars : CircleDot}
              label="Gender"
              value={customer.gender || "Not provided"}
            />
            <div style={{ paddingTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge label="Email verified"   yes={customer.emailVerified} />
              <Badge label="Marketing opt-in" yes={customer.marketingOptIn} />
            </div>
          </Card>

          {/* Marketing pref */}
          <Card title="Preferences">
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 0", borderBottom: "1px solid #f0ebe5",
            }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "#f2ede8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bell size={14} color="#295C65" />
              </span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1c2f33" }}>Marketing Emails</div>
                <div style={{ fontSize: 11, color: "#9aabae", marginTop: 2 }}>
                  {customer.marketingOptIn ? "Subscribed to newsletters & offers" : "Not subscribed"}
                </div>
              </div>
              <span style={{ marginLeft: "auto" }}>
                <Badge label={customer.marketingOptIn ? "Subscribed" : "Unsubscribed"} yes={customer.marketingOptIn} />
              </span>
            </div>
          </Card>
        </div>

        {/* ── Column 2: Account status ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Card title="Account Status">
            {/* Big status block */}
            <div style={{
              margin: "12px 0 16px",
              padding: "18px",
              borderRadius: 12,
              background: st.bg,
              border: `1.5px solid ${st.border}`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: st.color + "22",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <StatusIcon size={22} color={st.color} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: st.color, fontFamily: "Georgia, serif" }}>
                  {st.label}
                </div>
                <div style={{ fontSize: 12, color: st.color + "cc", marginTop: 3 }}>
                  {customer.status === "active"  && "This customer can log in and place orders."}
                  {customer.status === "blocked" && "This customer is blocked — cannot log in."}
                  {customer.status === "pending" && "Email not yet verified."}
                </div>
              </div>
            </div>

            <InfoRow icon={Hash}         label="Customer ID"     value={id} mono />
            <InfoRow icon={ShieldAlert}  label="Account Role"    value={customer.role || "customer"} />
            <InfoRow icon={CheckCircle2} label="Email Verified"  value={customer.emailVerified ? "Yes" : "No"} />

            {/* Block / Unblock CTA inside card */}
            {customer.status !== "pending" && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={toggleBlock}
                  disabled={actionLoading}
                  style={{
                    width: "100%", height: 44, borderRadius: 10,
                    border: "none",
                    background: isBlocked ? "#1a7a45" : "#b83c30",
                    color: "#fff", fontSize: 13, fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    opacity: actionLoading ? 0.7 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {actionLoading
                    ? <div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.5)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    : isBlocked ? <ShieldCheck size={15} /> : <ShieldBan size={15} />}
                  {isBlocked ? "Unblock this Customer" : "Block this Customer"}
                </button>
                <p style={{ fontSize: 10, color: "#9aabae", textAlign: "center", margin: "8px 0 0" }}>
                  {isBlocked
                    ? "Unblocking will restore login access."
                    : "Blocking prevents login and order placement."}
                </p>
              </div>
            )}
          </Card>

          {/* Danger zone */}
          <Card title="Danger Zone">
            <p style={{ fontSize: 12, color: "#7a8a8c", lineHeight: 1.6, margin: "12px 0 16px" }}>
              Permanently delete this customer and all associated data. This action <strong>cannot be undone</strong>.
            </p>
            <button
              onClick={() => setDeleteConfirm(true)}
              style={{
                width: "100%", height: 42, borderRadius: 10,
                border: "1.5px solid #f0c8c4",
                background: "#fff5f4", color: "#b83c30",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.15s",
              }}
            >
              <Trash2 size={14} /> Delete Customer
            </button>
          </Card>
        </div>

        {/* ── Column 3: Timeline + dates ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Card title="Activity Timeline">
            <div style={{ padding: "12px 0" }}>
              {timeline.length === 0 ? (
                <p style={{ fontSize: 12, color: "#9aabae", textAlign: "center", padding: "16px 0" }}>
                  No activity yet.
                </p>
              ) : (
                <div style={{ position: "relative", paddingLeft: 22 }}>
                  {/* vertical line */}
                  <div style={{
                    position: "absolute", left: 4, top: 10, bottom: 10,
                    width: 2, background: "#f0ebe5", borderRadius: 2,
                  }} />

                  {timeline.map((ev, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < timeline.length - 1 ? 22 : 0 }}>
                      <TimelineDot color={ev.color} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2f33" }}>{ev.label}</div>
                        <div style={{ fontSize: 11, color: "#7a8a8c", marginTop: 3 }}>{ev.time}</div>
                        {ev.ago && (
                          <div style={{
                            display: "inline-block", marginTop: 4,
                            fontSize: 10, fontWeight: 700, padding: "2px 8px",
                            borderRadius: 999, background: ev.color + "14", color: ev.color,
                          }}>
                            {ev.ago}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="Important Dates">
            <InfoRow icon={Calendar} label="Account Created"  value={fmtFull(customer.createdAt)} />
            <InfoRow icon={Calendar} label="Last Updated"     value={fmtFull(customer.updatedAt)} />
            <InfoRow icon={Clock}    label="Last Login"       value={fmtFull(customer.lastLoginAt)} />
            {customer.birthday && (
              <InfoRow icon={Cake}   label="Birthday"         value={fmt(customer.birthday)} />
            )}
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

        @media (max-width: 1100px) {
          .detail-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 700px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ── tiny helpers ── */
const outlineBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "8px 14px", borderRadius: 8,
  background: "#fff", border: "1.5px solid #e2dbd2",
  color: "#295C65", fontSize: 12, fontWeight: 600,
  cursor: "pointer", transition: "all 0.15s",
};

function MetaChip({ icon: Icon, label, muted }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: muted ? "#9aabae" : "#4a5c60" }}>
      <Icon size={12} color={muted ? "#b0c0c4" : "#295C65"} />
      {label}
    </span>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldBan,
  ShieldCheck,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/$/, "");

/* ── helpers ── */
function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function fmtTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
}

const STATUS_STYLES = {
  active:  { bg: "#e6f4ec", color: "#1a7a45", dot: "#22a55a", label: "Active"  },
  blocked: { bg: "#fdecea", color: "#b83c30", dot: "#e04b3a", label: "Blocked" },
  pending: { bg: "#fff8e6", color: "#976800", dot: "#f0a500", label: "Pending" },
};

const AVATAR_COLORS = [
  "#295C65","#3d7a62","#7a5c3d","#5c3d7a",
  "#3d5c7a","#7a3d5c","#5c7a3d","#7a6a3d",
];

function avatarColor(id = "") {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

/* ── stat card ── */
function StatCard({ icon: Icon, label, value, active, onClick, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: "1 1 0",
        minWidth: 0,
        padding: "16px 20px",
        background: active ? "#295C65" : "#fff",
        border: `1.5px solid ${active ? "#295C65" : "#e8e1d9"}`,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: active ? "0 4px 14px rgba(41,92,101,0.22)" : "none",
        textAlign: "left",
      }}
    >
      <span style={{
        width: 40, height: 40, borderRadius: "10px",
        background: active ? "rgba(255,255,255,0.18)" : color + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={18} color={active ? "#fff" : color} />
      </span>
      <span>
        <span style={{ display: "block", fontSize: 22, fontWeight: 700,
          color: active ? "#fff" : "#1c2f33",
          fontFamily: "Georgia, serif", lineHeight: 1 }}>
          {value ?? "—"}
        </span>
        <span style={{ display: "block", fontSize: 11, fontWeight: 600,
          color: active ? "rgba(255,255,255,0.75)" : "#7a8a8c",
          marginTop: 3, letterSpacing: "0.3px" }}>
          {label}
        </span>
      </span>
    </button>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers]   = useState([]);
  const [counts, setCounts]         = useState({ all: 0, active: 0, blocked: 0, pending: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]             = useState(1);
  const [actionLoading, setActionLoading] = useState(null); // customerId
  const [toast, setToast]           = useState(null);
  const searchTimer = useRef(null);

  /* ── fetch ── */
  const fetchCustomers = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page:   opts.page   ?? page,
        limit:  20,
        search: opts.search ?? search,
        status: opts.status ?? statusFilter,
      });
      const res  = await fetch(`${API_URL}/customers?${q}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setCounts(data.counts || {});
        setPagination(data.pagination || {});
      }
    } catch (e) {
      showToast("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchCustomers(); }, [page, statusFilter]);

  /* debounced search */
  function handleSearch(val) {
    setSearch(val);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchCustomers({ search: val, page: 1, status: statusFilter });
    }, 380);
  }

  function handleStatusFilter(val) {
    setStatusFilter(val);
    setPage(1);
  }

  /* ── block / unblock ── */
  async function toggleBlock(customer) {
    const action = customer.status === "blocked" ? "unblock" : "block";
    setActionLoading(customer._id || customer.id);
    try {
      const res  = await fetch(
        `${API_URL}/customers/${customer._id || customer.id}/${action}`,
        { method: "PATCH", credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchCustomers({ page, search, status: statusFilter });
      } else {
        showToast(data.message || "Action failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setActionLoading(null);
    }
  }

  /* ── toast ── */
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  /* ── export CSV ── */
  function exportCSV() {
    if (!customers.length) return;
    const header = ["Name", "Email", "Phone", "Status", "Verified", "Joined", "Last Login"];
    const rows = customers.map((c) => [
      c.name, c.email, c.phone || "",
      c.status, c.emailVerified ? "Yes" : "No",
      fmt(c.createdAt), fmt(c.lastLoginAt),
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "customers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

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
          animation: "slideIn 0.22s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 600, color: "#1c2f33" }}>
            Customers
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: 12, color: "#7a8a8c" }}>
            Manage registered customers — view profiles, block suspicious accounts.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => fetchCustomers()} style={btnStyle("#fff", "#e8e1d9", "#295C65")} title="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportCSV} style={btnStyle("#295C65", "#295C65", "#fff")}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon={Users}     label="All Customers" value={counts.all}     color="#295C65" active={statusFilter === ""}        onClick={() => handleStatusFilter("")} />
        <StatCard icon={UserCheck} label="Active"        value={counts.active}  color="#1a7a45" active={statusFilter === "active"}  onClick={() => handleStatusFilter("active")} />
        <StatCard icon={UserX}     label="Blocked"       value={counts.blocked} color="#b83c30" active={statusFilter === "blocked"} onClick={() => handleStatusFilter("blocked")} />
        <StatCard icon={Clock}     label="Pending"       value={counts.pending} color="#976800" active={statusFilter === "pending"} onClick={() => handleStatusFilter("pending")} />
      </div>

      {/* ── Search + filter bar ── */}
      <div style={{
        background: "#fff", border: "1.5px solid #e8e1d9", borderRadius: 12,
        padding: "14px 18px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9aabae" }} />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%", height: 40, paddingLeft: 36, paddingRight: 14,
              border: "1.5px solid #e2dbd2", borderRadius: 8,
              fontSize: 13, outline: "none", background: "#fdfcfa",
              color: "#1c2f33", boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, color: "#7a8a8c", fontSize: 12 }}>
          <Filter size={13} />
          <span>{pagination.total ?? 0} results</span>
        </div>
      </div>

      {/* ── Table card ── */}
      <div style={{ background: "#fff", border: "1.5px solid #e8e1d9", borderRadius: 14, overflow: "hidden" }}>

        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2.8fr 2fr 1.4fr 1.1fr 1.1fr 1.1fr 100px",
          padding: "11px 20px", background: "#f7f3ef",
          borderBottom: "1.5px solid #e8e1d9",
          fontSize: 10, fontWeight: 700, color: "#7a8a8c",
          letterSpacing: "0.7px", textTransform: "uppercase",
        }}>
          <span>Customer</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Status</span>
          <span>Verified</span>
          <span>Joined</span>
          <span style={{ textAlign: "center" }}>Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ display: "inline-block", width: 28, height: 28, border: "3px solid #e8e1d9", borderTopColor: "#295C65", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ marginTop: 12, color: "#9aabae", fontSize: 13 }}>Loading customers…</p>
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Users size={36} color="#d0cac3" />
            <p style={{ marginTop: 12, color: "#9aabae", fontSize: 14, fontWeight: 600 }}>No customers found</p>
            <p style={{ color: "#b0a89f", fontSize: 12 }}>
              {search || statusFilter ? "Try changing your search or filter." : "No customers have registered yet."}
            </p>
          </div>
        ) : (
          customers.map((c, idx) => {
            const id    = c._id || c.id;
            const st    = STATUS_STYLES[c.status] || STATUS_STYLES.pending;
            const color = avatarColor(id);
            const isBlocked  = c.status === "blocked";
            const isActioning = actionLoading === id;

            return (
              <div
                key={id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.8fr 2fr 1.4fr 1.1fr 1.1fr 1.1fr 100px",
                  padding: "14px 20px", alignItems: "center",
                  borderTop: idx === 0 ? "none" : "1px solid #f0ebe5",
                  background: isBlocked ? "#fffafa" : "#fff",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!isBlocked) e.currentTarget.style.background = "#faf8f5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isBlocked ? "#fffafa" : "#fff"; }}
              >
                {/* Customer name + avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: color, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700,
                    opacity: isBlocked ? 0.55 : 1,
                  }}>
                    {initials(c.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: isBlocked ? "#9aabae" : "#1c2f33",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      textDecoration: isBlocked ? "line-through" : "none",
                    }}>
                      {c.name || "—"}
                    </div>
                    <div style={{ fontSize: 10, color: "#9aabae", marginTop: 1 }}>
                      Last login: {fmt(c.lastLoginAt)}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{ fontSize: 12, color: "#4a5c60", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.email || "—"}
                </div>

                {/* Phone */}
                <div style={{ fontSize: 12, color: "#4a5c60" }}>
                  {c.phone || "—"}
                </div>

                {/* Status badge */}
                <div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 999,
                    background: st.bg, color: st.color,
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.3px",
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                    {st.label}
                  </span>
                </div>

                {/* Verified */}
                <div style={{ fontSize: 11, fontWeight: 600, color: c.emailVerified ? "#1a7a45" : "#b83c30" }}>
                  {c.emailVerified ? "✓ Yes" : "✗ No"}
                </div>

                {/* Joined */}
                <div style={{ fontSize: 11, color: "#7a8a8c" }}>
                  {fmt(c.createdAt)}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Link href={`/admin/customers/${id}`} title="View details" style={{
                    width: 30, height: 30, borderRadius: 7,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#edf4f5", border: "1px solid #ccdde0",
                    color: "#295C65", textDecoration: "none", transition: "all 0.15s",
                  }}>
                    <Eye size={13} />
                  </Link>

                  <button
                    title={isBlocked ? "Unblock customer" : "Block customer"}
                    disabled={isActioning || c.status === "pending"}
                    onClick={() => toggleBlock(c)}
                    style={{
                      width: 30, height: 30, borderRadius: 7, border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isBlocked ? "#e6f4ec" : "#fdecea",
                      color: isBlocked ? "#1a7a45" : "#b83c30",
                      cursor: isActioning || c.status === "pending" ? "not-allowed" : "pointer",
                      opacity: isActioning ? 0.55 : c.status === "pending" ? 0.4 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {isActioning
                      ? <div style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      : isBlocked
                        ? <ShieldCheck size={13} />
                        : <ShieldBan size={13} />
                    }
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* ── Pagination footer ── */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{
            padding: "14px 20px",
            borderTop: "1.5px solid #e8e1d9",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#faf8f5", flexWrap: "wrap", gap: 12,
          }}>
            <span style={{ fontSize: 12, color: "#7a8a8c" }}>
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
              &nbsp;·&nbsp; {pagination.total} total customers
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <PagBtn
                icon={<ChevronLeft size={14} />}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === pagination.totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, i, arr) => {
                  if (i > 0 && arr[i - 1] !== n - 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === "…" ? (
                    <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#9aabae", lineHeight: "32px" }}>…</span>
                  ) : (
                    <PagBtn key={n} label={n} active={n === page} onClick={() => setPage(n)} />
                  )
                )}
              <PagBtn
                icon={<ChevronRight size={14} />}
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes slideIn  { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 900px) {
          .cust-table-grid { grid-template-columns: 1fr 1fr 80px !important; }
          .cust-col-phone,
          .cust-col-verified,
          .cust-col-joined { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ── tiny helpers ── */
function btnStyle(bg, border, color) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 14px", borderRadius: 8,
    background: bg, border: `1.5px solid ${border}`, color,
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    transition: "all 0.15s",
  };
}

function PagBtn({ icon, label, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 32, height: 32, borderRadius: 7, border: "1.5px solid",
        borderColor: active ? "#295C65" : "#e2dbd2",
        background: active ? "#295C65" : "#fff",
        color: active ? "#fff" : disabled ? "#ccc" : "#295C65",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        padding: "0 6px",
      }}
    >
      {icon || label}
    </button>
  );
}

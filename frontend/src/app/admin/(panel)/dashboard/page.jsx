"use client";

import { useCallback, useState } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import Link from "next/link";
import {
  Package, ShoppingBag, MessageSquare, IndianRupee, Users, Tags,
  Layers3, Star, BookOpen, FileText, Bell, Image as ImageIcon,
  RefreshCw, AlertCircle, CheckCircle2, ArrowUpRight, Clock3, Upload, Ticket
} from "lucide-react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/+$/, "");

const navItems = [
  { title: "Products", href: "/admin/products", icon: Package, key: "products", desc: "Manage product listings" },
  { title: "Bulk Upload", href: "/admin/bulkUpload", icon: Upload, desc: "Import multiple products" },
  { title: "Categories", href: "/admin/categories", icon: Tags, key: "categories", desc: "Categories and collections" },
  { title: "Customers", href: "/admin/customers", icon: Users, key: "customers", desc: "Customer accounts" },
  { title: "Orders", href: "/admin/orders", icon: ShoppingBag, key: "orders", desc: "Review and fulfil orders" },
  { title: "Enquiries", href: "/admin/enquiries", icon: MessageSquare, key: "enquiries", desc: "Customer messages and quotes" },
  { title: "Requests", href: "/admin/requests", icon: FileText, key: "pendingOrders", desc: "Pending order requests" },
  { title: "Reviews", href: "/admin/reviews", icon: Star, key: "reviews", desc: "Customer reviews" },
  { title: "Blogs", href: "/admin/blogs", icon: BookOpen, key: "blogs", desc: "Articles and SEO content" },
  { title: "Catalogue", href: "/admin/catalogue", icon: FileText, key: "catalogues", desc: "PDF catalogue management" },
  { title: "Exhibitions", href: "/admin/exhibitions", icon: Ticket, key: "exhibitions", desc: "Manage exhibitions" },
  { title: "Hero Settings", href: "/admin/hero", icon: ImageIcon, key: "heroSettings", desc: "Homepage hero content" },
  { title: "Sale", href: "/admin/sale", icon: Bell, key: "saleSubscribers", desc: "Sale and subscriber settings" },
];

const primaryStats = [
  { key: "products", title: "Total Products", icon: Package, tone: "#295C65" },
  { key: "orders", title: "Total Orders", icon: ShoppingBag, tone: "#8A5D38" },
  { key: "enquiries", title: "Customer Enquiries", icon: MessageSquare, tone: "#725563" },
  { key: "revenue", title: "Paid Revenue", icon: IndianRupee, tone: "#527A60", money: true },
];

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async (initial = false) => {
    initial ? setLoading(true) : setRefreshing(true);
    setError("");
    try {
      const response = await fetch(`${API}/dashboard/admin/summary`, {
        method: "GET", credentials: "include", cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Admin session expired. Sign in again, then refresh this page.");
        }
        throw new Error(payload.message || `Dashboard request failed (${response.status}).`);
      }
      setData(payload.data || {});
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useAutoRefresh(() => load(false), 60000);

  const stats = data?.stats || {};
  const styles = {
    page: { width: "100%", minWidth: 0, color: "#292828", boxSizing: "border-box" },
    top: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 22 },
    eyebrow: { margin: "0 0 7px", color: "#9B8551", fontSize: 9, fontWeight: 800, letterSpacing: "1.8px" },
    title: { margin: 0, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(24px, 3vw, 31px)", lineHeight: 1.2, fontWeight: 600 },
    subtitle: { margin: "7px 0 0", color: "#77736D", fontSize: 12, lineHeight: 1.6 },
    button: { minHeight: 39, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 13px", border: "1px solid #DCD6CE", borderRadius: 9, background: "#fff", color: "#295C65", fontSize: 11, fontWeight: 700, cursor: refreshing ? "wait" : "pointer" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 14 },
    card: { minWidth: 0, minHeight: 138, padding: 18, background: "#FAF8F5", border: "1px solid #E1DAD2", borderRadius: 13, boxSizing: "border-box" },
    cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
    label: { margin: 0, color: "#7C7872", fontSize: 9, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase" },
    value: { margin: "10px 0 0", minHeight: 34, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(25px, 2.5vw, 31px)", fontWeight: 600, lineHeight: 1.2, overflowWrap: "anywhere", fontVariantNumeric: "tabular-nums" },
    icon: { width: 39, height: 39, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 9, background: "#F2EEE9" },
    section: { marginTop: 25 },
    sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 13 },
    sectionTitle: { margin: 0, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 20, fontWeight: 600 },
    small: { color: "#88847E", fontSize: 10 },
    links: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 11 },
    link: { display: "flex", alignItems: "center", gap: 12, minWidth: 0, padding: 14, textDecoration: "none", color: "#292828", background: "#fff", border: "1px solid #E1DAD2", borderRadius: 11, boxSizing: "border-box" },
    linkIcon: { width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#F2EEE9", color: "#295C65", borderRadius: 9 },
    linkTitle: { margin: 0, fontSize: 12, fontWeight: 800 },
    linkDesc: { margin: "4px 0 0", color: "#88847E", fontSize: 10, lineHeight: 1.45 },
    count: { marginLeft: "auto", paddingLeft: 8, color: "#295C65", fontSize: 12, fontWeight: 800 },
    panel: { minWidth: 0, background: "#FAF8F5", border: "1px solid #E1DAD2", borderRadius: 13, overflow: "hidden" },
    tableWrap: { width: "100%", overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 11, textAlign: "left" },
    th: { padding: "12px 14px", color: "#77736D", fontSize: 9, textTransform: "uppercase", letterSpacing: ".6px", borderBottom: "1px solid #E1DAD2", whiteSpace: "nowrap" },
    td: { padding: "12px 14px", borderBottom: "1px solid #ECE6DF", color: "#4D4944", whiteSpace: "nowrap" },
    notice: { display: "flex", gap: 9, marginTop: 15, padding: "12px 14px", border: "1px solid #F0D5CF", borderRadius: 9, background: "#FFF4F1", color: "#914B3C", fontSize: 11, lineHeight: 1.5 },
    status: { display: "inline-block", padding: "4px 7px", borderRadius: 6, background: "#F0EBE3", color: "#725563", fontSize: 9, fontWeight: 800 },
    empty: { padding: 22, textAlign: "center", color: "#88847E", fontSize: 11 },
  };

  const showDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const orderLabel = (o) => o.orderNumber || o.orderId || String(o._id || "").slice(-8).toUpperCase() || "Order";

  return (
    <main style={styles.page}>
      <header style={styles.top}>
        <div>
          <p style={styles.eyebrow}>BHAVYA FABRICS · ADMIN</p>
          <h1 style={styles.title}>Dashboard Overview</h1>
          <p style={styles.subtitle}>Live business activity, store statistics and shortcuts to every admin section.</p>
        </div>
        <button type="button" style={styles.button} onClick={() => load(false)} disabled={refreshing}>
          <RefreshCw size={14} /> {refreshing ? "Updating…" : "Refresh"}
        </button>
      </header>

      {error && <div style={styles.notice} role="alert"><AlertCircle size={16} /><div><strong>Dashboard could not refresh.</strong><div>{error}</div></div></div>}

      <section style={styles.grid} aria-label="Store statistics">
        {primaryStats.map((item) => {
          const Icon = item.icon;
          return <article key={item.key} style={styles.card}>
            <div style={styles.cardTop}>
              <div style={{ minWidth: 0 }}>
                <p style={styles.label}>{item.title}</p>
                <p style={{ ...styles.value, color: item.tone }}>{loading && !data ? "—" : item.money ? money(stats[item.key]) : fmt(stats[item.key])}</p>
              </div>
              <div style={{ ...styles.icon, color: item.tone }}><Icon size={19} strokeWidth={1.8} /></div>
            </div>
          </article>;
        })}
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHead}><h2 style={styles.sectionTitle}>Admin shortcuts</h2><span style={styles.small}>Open any section directly</span></div>
        <div style={styles.links}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} style={styles.link}>
              <span style={styles.linkIcon}><Icon size={18} /></span>
              <span style={{ minWidth: 0 }}><p style={styles.linkTitle}>{item.title}</p><p style={styles.linkDesc}>{item.desc}</p></span>
              {item.key && <span style={styles.count}>{loading && !data ? "—" : fmt(stats[item.key])}</span>}
              <ArrowUpRight size={14} color="#9B8551" />
            </Link>;
          })}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHead}><h2 style={styles.sectionTitle}>Recent orders</h2><Link href="/admin/orders" style={{ color: "#295C65", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>View all ↗</Link></div>
        <div style={styles.panel}><div style={styles.tableWrap}><table style={styles.table}>
          <thead><tr><th style={styles.th}>Order</th><th style={styles.th}>Status</th><th style={styles.th}>Payment</th><th style={styles.th}>Total</th><th style={styles.th}>Date</th></tr></thead>
          <tbody>{(data?.recentOrders || []).length ? data.recentOrders.map((o) => <tr key={o._id}>
            <td style={styles.td}>{orderLabel(o)}</td><td style={styles.td}><span style={styles.status}>{String(o.status || "unknown").replaceAll("_", " ")}</span></td><td style={styles.td}>{o.payment?.status || "—"}</td><td style={styles.td}>{money(o.pricing?.total)}</td><td style={styles.td}>{showDate(o.createdAt)}</td>
          </tr>) : <tr><td colSpan={5} style={styles.empty}>{loading ? "Loading recent orders…" : "No orders found yet."}</td></tr>}</tbody>
        </table></div></div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHead}><h2 style={styles.sectionTitle}>Recent enquiries</h2><Link href="/admin/enquiries" style={{ color: "#295C65", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>View all ↗</Link></div>
        <div style={styles.panel}><div style={styles.tableWrap}><table style={styles.table}>
          <thead><tr><th style={styles.th}>Customer</th><th style={styles.th}>Contact</th><th style={styles.th}>Request</th><th style={styles.th}>Status</th><th style={styles.th}>Date</th></tr></thead>
          <tbody>{(data?.recentEnquiries || []).length ? data.recentEnquiries.map((e) => <tr key={e._id}>
            <td style={styles.td}>{e.name || "—"}</td><td style={styles.td}>{e.email || e.phone || "—"}</td><td style={styles.td}>{e.requestType || e.fabric || "Enquiry"}</td><td style={styles.td}><span style={styles.status}>{e.status || "new"}</span></td><td style={styles.td}>{showDate(e.createdAt)}</td>
          </tr>) : <tr><td colSpan={5} style={styles.empty}>{loading ? "Loading recent enquiries…" : "No enquiries found yet."}</td></tr>}</tbody>
        </table></div></div>
      </section>

      <section style={styles.section}>
        <div className={styles.sectionHead}><h2 style={styles.sectionTitle}>Recent exhibitions</h2><Link href="/admin/exhibitions" style={{ color: "#295C65", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>Manage exhibitions</Link></div>
        <div style={styles.panel}><div style={styles.tableWrap}><table style={styles.table}>
          <thead><tr><th style={styles.th}>Exhibition</th><th style={styles.th}>Location</th><th style={styles.th}>Status</th><th style={styles.th}>Dates</th></tr></thead>
          <tbody>{(data?.recentExhibitions || []).length ? data.recentExhibitions.map((exhibition) => <tr key={exhibition._id}>
            <td style={styles.td}>{exhibition.title || "—"}</td><td style={styles.td}>{exhibition.location || "—"}</td><td style={styles.td}><span style={styles.status}>{exhibition.status || "—"}</span></td><td style={styles.td}>{showDate(exhibition.startDate)} - {showDate(exhibition.endDate)}</td>
          </tr>) : <tr><td colSpan={4} style={styles.empty}>{loading ? "Loading exhibitions…" : "No exhibitions found yet."}</td></tr>}</tbody>
        </table></div></div>
      </section>

      <p style={{ ...styles.small, display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
        {updatedAt ? <><CheckCircle2 size={13} color="#527A60" /> Updated {updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</> : <><Clock3 size={13} /> {loading ? "Connecting to database…" : "Waiting for data"}</>}
        {" · "}Automatic refresh every 60 seconds
      </p>
    </main>
  );
}

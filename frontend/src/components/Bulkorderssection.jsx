"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import CustomerLoginModal from "@/components/CustomerLoginModal";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

export default function BulkOrdersSection() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [catalogue, setCatalogue] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState("");
  const [pendingDownload, setPendingDownload] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`${API_URL}/catalogue/active`, { cache: "no-store" })
      .then(r => r.json()).then(p => { if (alive && p?.success) setCatalogue(p.data); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const downloadCatalogue = useCallback(async () => {
    setDownloading(true); setNotice("");
    try {
      const response = await fetch(`${API_URL}/catalogue/download`, { method: "GET", credentials: "include", cache: "no-store" });
      if (response.status === 401) { setPendingDownload(true); setLoginOpen(true); return; }
      if (!response.ok) {
        let message = "Unable to download the catalogue right now.";
        try { const data = await response.json(); message = data.message || message; } catch {}
        setNotice(message); return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = catalogue?.fileName || "Bhavya-Fabrics-Catalogue.pdf";
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setPendingDownload(false);
    } catch { setNotice("Network error. Please try again."); }
    finally { setDownloading(false); }
  }, [catalogue]);

  const handleLoginSuccess = async () => {
    setLoginOpen(false);
    if (pendingDownload) await downloadCatalogue();
  };

  return <>
    <section style={{ width: "100%", background: "var(--cream, #FAF8F5)", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 62px)", boxSizing: "border-box" }}>
      <div className="wex-container" style={{ width: "100%", maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "clamp(24px, 4vw, 64px)", alignItems: "center", background: "var(--teal, #295C65)", borderRadius: "clamp(16px, 2vw, 24px)", overflow: "hidden" }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", minHeight: 220 }}><Image src="/images/home/facility/4.png" alt="Fabric manufacturing warehouse" fill sizes="(max-width: 700px) 100vw, 50vw" style={{ objectFit: "cover" }} priority /></div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(24px, 4vw, 56px) clamp(20px, 4vw, 64px)", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}><span style={{ width: 24, height: 1, background: "var(--gold, #BE9D6B)" }} /><span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, letterSpacing: 2, fontSize: 12, color: "var(--gold, #BE9D6B)", textTransform: "uppercase" }}>Bulk Orders</span></div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: "#fff", fontSize: "clamp(25px, 4vw, 40px)", lineHeight: 1.15, margin: "0 0 24px" }}>Looking for a Bulk Fabric Supplier?</h2>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(13px, 1.5vw, 15px)", lineHeight: 1.6, color: "var(--dark-cream, #F2EEE9)", margin: "0 0 28px", maxWidth: 560 }}>Direct manufacturer prices with export quality assurance. Get custom printing, bespoke dyeing, and private labelling for your brand.</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", width: "100%" }}>
            <a href="/contact" style={buttonStyle}>Request Quote <span aria-hidden="true">→</span></a>
            <button type="button" onClick={downloadCatalogue} disabled={downloading || !catalogue} style={{ ...buttonStyle, cursor: catalogue && !downloading ? "pointer" : "not-allowed", opacity: catalogue ? 1 : .65, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.5)" }}>{downloading ? "Preparing catalogue…" : catalogue ? "Download Catalogue" : "Catalogue Coming Soon"}</button>
          </div>
          {notice && <p role="status" style={{ color: "#fff", marginTop: 14 }}>{notice}</p>}
        </div>
      </div>
      <style>{`@media(max-width:700px){.wex-container{grid-template-columns:minmax(0,1fr)!important}}`}</style>
    </section>
    <CustomerLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={handleLoginSuccess} />
  </>;
}
const buttonStyle = { fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "clamp(13px, 1.4vw, 15px)", padding: "clamp(12px, 1.5vw, 16px) clamp(18px, 2vw, 28px)", borderRadius: 999, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, whiteSpace: "nowrap", background: "var(--gold, #BE9D6B)", color: "#fff", border: "none", flex: "1 1 160px" };

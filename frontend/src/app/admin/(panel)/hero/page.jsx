"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Loader2, Save, Upload } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const FALLBACK = {
  desktopHeroImage: "/images/hero.png",
  mobileHeroImage: "/images/hero-mobile.png",
  eyebrowText: "Jaipur, Rajasthan — Est. Since Years",
  heading: "Premium Wholesale Fabrics for Global Fashion Brands",
  subtext:
    "Manufacturer of Premium Cotton, Linen, Rayon, Mulmul, Ajrakh, Block Print and Designer Fabrics for Bulk Orders Worldwide.",
  primaryButtonText: "Explore Collections",
  secondaryButtonText: "Request Catalogue",
};

export default function HeroAdminPage() {
  const [settings, setSettings] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`${API_URL}/hero-settings/admin`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data?.message || "Failed to load hero settings.");
        }

        if (!cancelled) {
          setSettings({
            ...FALLBACK,
            ...(data.settings || {}),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load hero settings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const update = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const uploadImage = async (file, field) => {
    if (!file) return;

    try {
      setUploading(field);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "hero");
      formData.append("filename", file.name);

      const response = await fetch(`${API_URL}/uploads/direct`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Image upload failed.");
      }

      const url =
        data?.upload?.url ||
        data?.url ||
        data?.imageUrl ||
        data?.upload?.imageUrl ||
        "";

      if (!url) {
        throw new Error("Upload succeeded but no image URL was returned.");
      }

      update(field, url);
      setMessage("Image uploaded. Click Save Changes.");
    } catch (err) {
      setError(err?.message || "Image upload failed.");
    } finally {
      setUploading("");
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/hero-settings/admin`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to save hero settings.");
      }

      setSettings({ ...FALLBACK, ...(data.settings || {}) });
      setMessage("Homepage hero settings saved successfully.");
    } catch (err) {
      setError(err?.message || "Failed to save hero settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading Hero Section...</div>;
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>HOMEPAGE</div>
          <h1 style={styles.title}>Hero Section</h1>
          <p style={styles.description}>
            Upload desktop/mobile images and control the homepage hero text
            from the admin panel. Empty values automatically use frontend
            fallbacks.
          </p>
        </div>

        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          style={styles.saveButton}
        >
          {saving ? <Loader2 size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message ? <div style={styles.success}>{message}</div> : null}
      {error ? <div style={styles.error}>{error}</div> : null}

      <section style={styles.card}>
        <div style={styles.sectionTitle}>
          <ImageIcon size={18} />
          Hero Images
        </div>

        <div style={styles.imageGrid}>
          <ImageCard
            title="Desktop Hero Image"
            recommended="1600 × 700 px recommended"
            value={settings.desktopHeroImage}
            fallback={FALLBACK.desktopHeroImage}
            uploading={uploading === "desktopHeroImage"}
            onUpload={(file) => uploadImage(file, "desktopHeroImage")}
            onChange={(value) => update("desktopHeroImage", value)}
          />

          <ImageCard
            title="Mobile Hero Image"
            recommended="750 × 1000 px recommended"
            value={settings.mobileHeroImage}
            fallback={FALLBACK.mobileHeroImage}
            uploading={uploading === "mobileHeroImage"}
            onUpload={(file) => uploadImage(file, "mobileHeroImage")}
            onChange={(value) => update("mobileHeroImage", value)}
          />
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionTitle}>Hero Text</div>

        <Field label="Small eyebrow text">
          <input
            value={settings.eyebrowText}
            onChange={(e) => update("eyebrowText", e.target.value)}
            style={styles.input}
          />
        </Field>

        <Field label="Main Heading">
          <textarea
            rows={3}
            value={settings.heading}
            onChange={(e) => update("heading", e.target.value)}
            style={styles.textarea}
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={5}
            value={settings.subtext}
            onChange={(e) => update("subtext", e.target.value)}
            style={styles.textarea}
          />
        </Field>

        <div style={styles.twoColumns}>
          <Field label="Primary Button">
            <input
              value={settings.primaryButtonText}
              onChange={(e) =>
                update("primaryButtonText", e.target.value)
              }
              style={styles.input}
            />
          </Field>

          <Field label="Secondary Button">
            <input
              value={settings.secondaryButtonText}
              onChange={(e) =>
                update("secondaryButtonText", e.target.value)
              }
              style={styles.input}
            />
          </Field>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 800px) {
          .hero-admin-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-admin-header {
            flex-direction: column !important;
          }
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.label}>
      {label}
      {children}
    </label>
  );
}

function ImageCard({
  title,
  recommended,
  value,
  fallback,
  uploading,
  onUpload,
  onChange,
}) {
  return (
    <div style={styles.imageCard}>
      <strong style={styles.imageTitle}>{title}</strong>
      <small style={styles.imageRecommended}>{recommended}</small>

      <div style={styles.preview}>
        <img
          src={value || fallback}
          alt={title}
          style={styles.previewImage}
        />

        <label style={styles.uploadButton}>
          {uploading ? <Loader2 size={14} /> : <Upload size={14} />}
          {uploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            disabled={uploading}
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
        </label>
      </div>

      <input
        type="url"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Image URL — fallback: ${fallback}`}
        style={styles.input}
      />

      <button
        type="button"
        onClick={() => onChange("")}
        style={styles.fallbackButton}
      >
        Use Frontend Fallback
      </button>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    padding: "28px 32px 50px",
    boxSizing: "border-box",
    background: "#FAF8F5",
    minHeight: "100%",
  },
  loading: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#295C65",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 24,
  },
  kicker: {
    color: "#BE9D6B",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
  },
  title: {
    margin: "6px 0 8px",
    fontFamily: "Georgia, serif",
    fontSize: 32,
    color: "#295C65",
  },
  description: {
    margin: 0,
    maxWidth: 700,
    color: "#696968",
    fontSize: 13,
    lineHeight: 1.6,
  },
  saveButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    padding: "0 18px",
    border: "none",
    borderRadius: 9,
    background: "#295C65",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  success: {
    padding: 12,
    marginBottom: 18,
    borderRadius: 9,
    background: "#E8F5EF",
    color: "#286A4A",
  },
  error: {
    padding: 12,
    marginBottom: 18,
    borderRadius: 9,
    background: "#FCEBEC",
    color: "#A23A42",
  },
  card: {
    background: "#fff",
    border: "1px solid #E4DCD4",
    borderRadius: 14,
    padding: 22,
    marginBottom: 20,
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
    color: "#295C65",
    fontWeight: 700,
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },
  imageCard: {
    border: "1px solid #E8E0D7",
    borderRadius: 12,
    padding: 14,
  },
  imageTitle: {
    display: "block",
    color: "#343434",
    fontSize: 14,
  },
  imageRecommended: {
    display: "block",
    marginTop: 4,
    marginBottom: 12,
    color: "#8A837C",
    fontSize: 11,
  },
  preview: {
    position: "relative",
    minHeight: 250,
    borderRadius: 10,
    overflow: "hidden",
    background: "#F2EEE9",
    marginBottom: 12,
  },
  previewImage: {
    width: "100%",
    height: 250,
    objectFit: "cover",
    display: "block",
  },
  uploadButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 12px",
    borderRadius: 8,
    background: "rgba(41,92,101,.96)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    marginBottom: 18,
    color: "#444",
    fontSize: 12,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    minHeight: 44,
    padding: "10px 12px",
    border: "1px solid #D9D0C5",
    borderRadius: 8,
    background: "#fff",
    color: "#222",
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: 13,
  },
  textarea: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #D9D0C5",
    borderRadius: 8,
    background: "#fff",
    color: "#222",
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: 13,
    lineHeight: 1.55,
    resize: "vertical",
  },
  fallbackButton: {
    marginTop: 8,
    border: "1px solid #D9D0C5",
    borderRadius: 8,
    background: "#FAF8F5",
    color: "#295C65",
    minHeight: 36,
    padding: "0 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  twoColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },
};

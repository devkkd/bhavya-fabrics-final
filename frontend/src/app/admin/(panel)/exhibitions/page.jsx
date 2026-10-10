"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Loader,
  MapPin,
  CalendarDays,
  Clock,
  Star,
  ImagePlus,
  X,
} from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

const shortDate = (value, withYear = true) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });

export default function ExhibitionsAdminPage() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(null); // "upcoming" or "past"
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    time: "",
    boothDetails: "",
    featured: false,
  });

  const [imageFile, setImageFile] = useState(null);

  // Separate upcoming and past
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcomingList = exhibitions
      .filter((ex) => new Date(ex.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    const pastList = exhibitions
      .filter((ex) => new Date(ex.endDate) < now)
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

    return { upcoming: upcomingList, past: pastList };
  }, [exhibitions]);

  async function fetchExhibitions() {
    const res = await fetch(`${API_URL}/exhibitions/admin`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to load exhibitions");
    }
    return data.exhibitions;
  }

  const refreshExhibitions = async () => {
    try {
      setExhibitions(await fetchExhibitions());
    } catch (err) {
      console.error("Error fetching exhibitions:", err);
      setError(err.message || "Failed to load exhibitions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchExhibitions()
      .then((data) => {
        if (active) setExhibitions(data);
      })
      .catch((err) => {
        console.error("Error fetching exhibitions:", err);
        if (active) setError(err.message || "Failed to load exhibitions");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append("title", formData.title);
      formDataObj.append("description", formData.description);
      formDataObj.append("location", formData.location);
      formDataObj.append("startDate", formData.startDate);
      formDataObj.append("endDate", formData.endDate);

      // Only send time for upcoming exhibitions
      if (formType === "upcoming") {
        formDataObj.append("time", formData.time);
      } else {
        formDataObj.append("time", ""); // Empty for past
      }

      formDataObj.append("boothDetails", formData.boothDetails);
      formDataObj.append("featured", formData.featured);

      if (imageFile) {
        formDataObj.append("image", imageFile);
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/exhibitions/admin/${editingId}`
        : `${API_URL}/exhibitions/admin`;

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: formDataObj,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to save exhibition");
      }

      await refreshExhibitions();
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (exhibition) => {
    setFormData({
      title: exhibition.title,
      description: exhibition.description,
      location: exhibition.location,
      startDate: exhibition.startDate.split("T")[0],
      endDate: exhibition.endDate.split("T")[0],
      time: exhibition.time,
      boothDetails: exhibition.boothDetails || "",
      featured: exhibition.featured || false,
    });
    setEditingId(exhibition._id);

    // Determine if upcoming or past
    const now = new Date();
    const exType = new Date(exhibition.startDate) > now ? "upcoming" : "past";
    setFormType(exType);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exhibition?")) return;

    try {
      const res = await fetch(`${API_URL}/exhibitions/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to delete");
      }

      await refreshExhibitions();
    } catch (err) {
      setError(err.message);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setFormType(null);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      time: "",
      boothDetails: "",
      featured: false,
    });
    setImageFile(null);
  };

  // same state changes as the header buttons; also scrolls up so the form is visible
  const scrollToTop = () => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAddForm = (type) => {
    setFormType(type);
    setShowForm(true);
    setEditingId(null);
    scrollToTop();
  };

  /* ---------- reusable photo picker (same input, same state) ---------- */
  const renderPhotoField = (helpText) => (
    <div className="adm-field">
      <label className="adm-label">Exhibition Photo</label>
      <label className="adm-file">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        <span className="adm-file-icon">
          <ImagePlus size={18} strokeWidth={1.9} />
        </span>
        <span className="adm-file-text">
          <strong>{imageFile ? imageFile.name : "Choose a photo"}</strong>
          <small>{imageFile ? "Click to change" : "JPG, PNG or WEBP"}</small>
        </span>
      </label>
      {helpText && <p className="adm-help">{helpText}</p>}
    </div>
  );

  /* ---------- reusable exhibition card ---------- */
  const renderCard = (ex, type) => (
    <article className="adm-card" key={ex._id}>
      <div className="adm-card-media">
        {ex.image?.url ? (
          <img src={ex.image.url} alt={ex.title} loading="lazy" />
        ) : (
          <div className="adm-card-placeholder" aria-hidden="true">
            <CalendarDays size={32} strokeWidth={1.4} />
          </div>
        )}
        <span className={`adm-chip adm-chip--${type}`}>
          {type === "upcoming" ? "Upcoming" : "Concluded"}
        </span>
        {type === "upcoming" && ex.featured && (
          <span className="adm-chip adm-chip--featured">
            <Star size={12} strokeWidth={2.2} fill="currentColor" /> Featured
          </span>
        )}
      </div>

      <div className="adm-card-body">
        <h3 className="adm-card-title">{ex.title}</h3>

        <ul className="adm-meta">
          <li>
            <MapPin size={15} strokeWidth={1.9} className="adm-meta-teal" />
            <span>{ex.location}</span>
          </li>
          <li>
            <CalendarDays size={15} strokeWidth={1.9} className="adm-meta-gold" />
            <span>
              {type === "upcoming"
                ? shortDate(ex.startDate)
                : `${shortDate(ex.startDate, false)} to ${shortDate(ex.endDate)}`}
            </span>
          </li>
          {type === "upcoming" && (
            <li>
              <Clock size={15} strokeWidth={1.9} className="adm-meta-gold" />
              <span>{ex.time}</span>
            </li>
          )}
        </ul>

        <div className="adm-card-actions">
          <button
            type="button"
            onClick={() => {
              handleEdit(ex);
              scrollToTop();
            }}
            className="adm-icon-btn"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(ex._id)}
            className="adm-icon-btn adm-icon-btn--danger"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );

  return (
    <div className="adm-page">
      <div className="adm-container">
        {error && (
          <div className="adm-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ---------- Header ---------- */}
        <header className="adm-header">
          <div className="adm-header-text">
            <h1 className="adm-title">Manage Exhibitions</h1>
            <p className="adm-subtitle">Add, edit, and manage upcoming and past exhibitions</p>
          </div>

          <div className="adm-header-actions">
            <button
              type="button"
              onClick={() => openAddForm("upcoming")}
              className="adm-btn adm-btn--primary"
            >
              <Plus size={18} />
              Add Upcoming Exhibition
            </button>
            <button
              type="button"
              onClick={() => openAddForm("past")}
              className="adm-btn adm-btn--gold"
            >
              <Plus size={18} />
              Add Past Exhibition
            </button>
          </div>
        </header>

        {/* ---------- Form ---------- */}
        {showForm && (
          <form onSubmit={handleSubmit} className="adm-form">
            <div className="adm-form-head">
              <h2 className="adm-form-title">
                {editingId
                  ? `Edit ${formType === "upcoming" ? "Upcoming" : "Past"} Exhibition`
                  : `Create New ${formType === "upcoming" ? "Upcoming" : "Past"} Exhibition`}
              </h2>
              <span className={`adm-chip-inline adm-chip-inline--${formType}`}>
                {formType === "upcoming" ? "Upcoming" : "Past"}
              </span>
            </div>

            {/* Common Fields - Both Upcoming & Past */}
            <div className="adm-grid-form">
              <div className="adm-field">
                <label className="adm-label">Title *</label>
                <input
                  type="text"
                  placeholder="e.g., IHGF Delhi Fair - Spring 2026"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="adm-input"
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">Location *</label>
                <input
                  type="text"
                  placeholder="e.g., India Expo Centre, Greater Noida"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="adm-input"
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="adm-input"
                />
              </div>

              <div className="adm-field">
                <label className="adm-label">End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="adm-input"
                />
                {formType === "past" && <p className="adm-help">Must be in the past</p>}
              </div>
            </div>

            {/* Upcoming-Only Fields */}
            {formType === "upcoming" && (
              <div className="adm-grid-form">
                <div className="adm-field">
                  <label className="adm-label">Timing *</label>
                  <input
                    type="text"
                    placeholder="e.g., 10:00 AM - 6:00 PM"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="adm-input"
                  />
                </div>

                {renderPhotoField()}
              </div>
            )}

            {/* Past-Only Fields */}
            {formType === "past" && (
              <div className="adm-grid-form">
                {renderPhotoField("Upload a photo from your booth")}
              </div>
            )}

            {/* Description - Both */}
            <div className="adm-field">
              <label className="adm-label">Description *</label>
              <textarea
                required
                placeholder={
                  formType === "upcoming"
                    ? "What will be showcased, highlights, etc."
                    : "What was showcased, highlights, products displayed, etc."
                }
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="adm-input adm-textarea"
              />
            </div>

            {/* Booth Details - Both */}
            <div className="adm-field">
              <label className="adm-label">Booth Details (Optional)</label>
              <textarea
                placeholder="Any additional information..."
                value={formData.boothDetails}
                onChange={(e) => setFormData({ ...formData, boothDetails: e.target.value })}
                className="adm-input adm-textarea"
              />
            </div>

            {/* Featured - Upcoming Only */}
            {formType === "upcoming" && (
              <div className="adm-field">
                <label htmlFor="featured" className="adm-check">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span className="adm-check-box" aria-hidden="true" />
                  <span className="adm-check-text">
                    <Star size={15} strokeWidth={2} /> Featured Exhibition
                  </span>
                </label>
              </div>
            )}

            {/* Form Actions */}
            <div className="adm-form-actions">
              <button
                type="submit"
                disabled={uploading}
                className="adm-btn adm-btn--primary"
                style={{ opacity: uploading ? 0.7 : 1 }}
              >
                {uploading ? <Loader size={16} className="adm-spin" /> : <Upload size={16} />}
                {uploading ? "Saving..." : "Save Exhibition"}
              </button>
              <button type="button" onClick={closeForm} className="adm-btn adm-btn--ghost">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ---------- Content ---------- */}
        {loading ? (
          <div className="adm-loading">
            <div className="adm-spinner" role="status" aria-label="Loading exhibitions" />
          </div>
        ) : (
          <>
            {/* Upcoming Exhibitions Section */}
            <section className="adm-section">
              <div className="adm-section-head">
                <h2 className="adm-section-title">Upcoming Exhibitions</h2>
                <span className="adm-count">{upcoming.length}</span>
                <button
                  type="button"
                  onClick={() => openAddForm("upcoming")}
                  className="adm-btn adm-btn--primary adm-btn--sm"
                >
                  <Plus size={16} />
                  Add Upcoming
                </button>
              </div>

              {upcoming.length > 0 ? (
                <div className="adm-grid">{upcoming.map((ex) => renderCard(ex, "upcoming"))}</div>
              ) : (
                <div className="adm-empty">
                  <p>No upcoming exhibitions yet</p>
                </div>
              )}
            </section>

            {/* Past Exhibitions Section */}
            <section className="adm-section">
              <div className="adm-section-head">
                <h2 className="adm-section-title">Past Exhibitions</h2>
                <span className="adm-count">{past.length}</span>
                <button
                  type="button"
                  onClick={() => openAddForm("past")}
                  className="adm-btn adm-btn--gold adm-btn--sm"
                >
                  <Plus size={16} />
                  Add Past
                </button>
              </div>

              {past.length > 0 ? (
                <div className="adm-grid">{past.map((ex) => renderCard(ex, "past"))}</div>
              ) : (
                <div className="adm-empty">
                  <p>No past exhibitions yet</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <style>{`
        .adm-page {
          --adm-teal: #295c65;
          --adm-teal-deep: #1b4047;
          --adm-gold: #be9d6b;
          --adm-gold-deep: #9c7c4d;
          --adm-cream: #faf8f5;
          --adm-ink: #1d2426;
          --adm-muted: #657173;
          --adm-line: #e6dfd3;
          --adm-danger: #b3362b;

          width: 100%;
          min-height: 100vh;
          background: var(--adm-cream);
          color: var(--adm-ink);
          font-family: "Poppins", "Segoe UI", system-ui, sans-serif;
        }

        .adm-page *, .adm-page *::before, .adm-page *::after { box-sizing: border-box; }

        .adm-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 36px 24px 72px;
        }

        /* ---------- Error ---------- */
        .adm-error {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
          padding: 13px 16px;
          border-radius: 12px;
          background: #fff1ee;
          border: 1px solid #efcfc8;
          border-left: 4px solid var(--adm-danger);
          color: #8c3326;
          font-size: 13.5px;
          line-height: 1.5;
        }

        .adm-error button {
          flex-shrink: 0;
          display: inline-flex;
          border: none;
          background: transparent;
          color: inherit;
          cursor: pointer;
          padding: 2px;
        }

        /* ---------- Header ---------- */
        .adm-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--adm-line);
          position: relative;
        }

        .adm-header::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 80px;
          height: 2px;
          background: var(--adm-gold);
        }

        .adm-title {
          margin: 0 0 6px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(25px, 3.4vw, 34px);
          font-weight: 700;
          line-height: 1.2;
          color: var(--adm-teal-deep);
        }

        .adm-subtitle { margin: 0; font-size: 14px; color: var(--adm-muted); }

        .adm-header-actions { display: flex; flex-wrap: wrap; gap: 12px; }

        /* ---------- Buttons ---------- */
        .adm-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.1px;
          cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
        }

        .adm-btn:disabled { cursor: not-allowed; }

        .adm-btn--primary {
          background: var(--adm-teal);
          color: #fff;
          box-shadow: 0 6px 14px rgba(41, 92, 101, 0.24);
        }
        .adm-btn--primary:hover:not(:disabled) { background: var(--adm-teal-deep); transform: translateY(-1px); }

        .adm-btn--gold {
          background: var(--adm-gold);
          color: #fff;
          box-shadow: 0 6px 14px rgba(190, 157, 107, 0.32);
        }
        .adm-btn--gold:hover { background: var(--adm-gold-deep); transform: translateY(-1px); }

        .adm-btn--sm { margin-left: auto; padding: 8px 16px; font-size: 12.5px; flex-shrink: 0; }

        .adm-btn--ghost {
          background: #fff;
          color: var(--adm-teal);
          border-color: #d9d0c3;
        }
        .adm-btn--ghost:hover { border-color: var(--adm-teal); background: #f6f3ed; }

        .adm-btn:focus-visible, .adm-icon-btn:focus-visible {
          outline: 3px solid rgba(190, 157, 107, 0.55);
          outline-offset: 2px;
        }

        .adm-spin, .adm-spinner { animation: adm-spin 0.9s linear infinite; }
        @keyframes adm-spin { to { transform: rotate(360deg); } }

        /* ---------- Form ---------- */
        .adm-form {
          margin-bottom: 44px;
          padding: 32px;
          background: #fff;
          border: 1px solid var(--adm-line);
          border-top: 3px solid var(--adm-gold);
          border-radius: 18px;
          box-shadow: 0 10px 34px rgba(27, 64, 71, 0.08);
        }

        .adm-form-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }

        .adm-form-title {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--adm-ink);
        }

        .adm-chip-inline {
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }
        .adm-chip-inline--upcoming { background: rgba(41, 92, 101, 0.1); color: var(--adm-teal); }
        .adm-chip-inline--past { background: rgba(190, 157, 107, 0.2); color: var(--adm-gold-deep); }

        .adm-grid-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0 22px;
        }

        .adm-field { margin-bottom: 20px; min-width: 0; }

        .adm-label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--adm-ink);
        }

        .adm-input {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #ddd4c7;
          border-radius: 10px;
          background: #fffefc;
          color: var(--adm-ink);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .adm-input::placeholder { color: #a9b0b1; }

        .adm-input:focus {
          border-color: var(--adm-teal);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(41, 92, 101, 0.12);
        }

        .adm-textarea { min-height: 110px; resize: vertical; line-height: 1.6; }

        .adm-help { margin: 7px 0 0; font-size: 12px; color: #8a9294; }

        /* file picker */
        .adm-file {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border: 1.5px dashed #cfc2a8;
          border-radius: 10px;
          background: #fffdf8;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .adm-file:hover { border-color: var(--adm-gold-deep); background: #fcf8ef; }

        .adm-file input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .adm-file-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 10px;
          background: rgba(190, 157, 107, 0.18);
          color: var(--adm-gold-deep);
        }

        .adm-file-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.35; }
        .adm-file-text strong { font-size: 13.5px; font-weight: 600; color: var(--adm-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .adm-file-text small { font-size: 12px; color: #8a9294; }

        /* checkbox */
        .adm-check { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
        .adm-check input { position: absolute; opacity: 0; width: 0; height: 0; }

        .adm-check-box {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          border: 1.5px solid #cbbfa9;
          border-radius: 6px;
          background: #fff;
          position: relative;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .adm-check input:checked + .adm-check-box { background: var(--adm-teal); border-color: var(--adm-teal); }

        .adm-check input:checked + .adm-check-box::after {
          content: "";
          position: absolute;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid #fff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .adm-check input:focus-visible + .adm-check-box { box-shadow: 0 0 0 4px rgba(41, 92, 101, 0.18); }

        .adm-check-text {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--adm-ink);
        }

        .adm-check-text svg { color: var(--adm-gold-deep); }

        .adm-form-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 10px;
          padding-top: 22px;
          border-top: 1px solid var(--adm-line);
        }

        /* ---------- Sections ---------- */
        .adm-section { margin-bottom: 48px; }

        .adm-section-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--adm-line);
          position: relative;
        }

        .adm-section-head::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 60px;
          height: 2px;
          background: var(--adm-gold);
        }

        .adm-section-head { flex-wrap: wrap; }

        .adm-section-title {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(20px, 2.6vw, 25px);
          font-weight: 700;
          color: var(--adm-ink);
        }

        .adm-count {
          min-width: 28px;
          padding: 3px 10px;
          border-radius: 999px;
          background: var(--adm-teal);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
        }

        /* ---------- Cards ---------- */
        .adm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
          gap: 22px;
        }

        .adm-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #fff;
          border: 1px solid var(--adm-line);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(27, 64, 71, 0.04), 0 8px 22px rgba(27, 64, 71, 0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        @media (hover: hover) {
          .adm-card:hover {
            transform: translateY(-4px);
            border-color: rgba(190, 157, 107, 0.6);
            box-shadow: 0 4px 10px rgba(27, 64, 71, 0.06), 0 18px 36px rgba(27, 64, 71, 0.12);
          }
        }

        .adm-card-media {
          position: relative;
          aspect-ratio: 16 / 10;
          background: linear-gradient(135deg, #e9e2d6, #f3eee5);
          overflow: hidden;
        }

        .adm-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .adm-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--adm-gold-deep);
          opacity: 0.7;
        }

        .adm-chip {
          position: absolute;
          top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.2px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .adm-chip--upcoming { left: 12px; background: rgba(255, 255, 255, 0.94); color: var(--adm-teal); box-shadow: 0 4px 12px rgba(15, 47, 52, 0.15); }
        .adm-chip--past { left: 12px; background: rgba(27, 64, 71, 0.9); color: #f6efe0; border: 1px solid rgba(230, 207, 159, 0.5); }
        .adm-chip--featured { right: 12px; background: var(--adm-gold); color: #fff; }

        .adm-card-body { display: flex; flex-direction: column; flex: 1; gap: 12px; padding: 18px 18px 18px; }

        .adm-card-title {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 17.5px;
          font-weight: 700;
          line-height: 1.35;
          color: var(--adm-ink);
          overflow-wrap: anywhere;
        }

        .adm-meta { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }

        .adm-meta li {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--adm-muted);
          overflow-wrap: anywhere;
        }

        .adm-meta svg { flex-shrink: 0; margin-top: 2px; }
        .adm-meta-teal { color: var(--adm-teal); }
        .adm-meta-gold { color: var(--adm-gold-deep); }

        .adm-card-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid #f0eadf;
        }

        .adm-icon-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          border: 1px solid #e3dbcd;
          border-radius: 10px;
          background: #f8f5ef;
          color: var(--adm-teal);
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .adm-icon-btn:hover { background: rgba(41, 92, 101, 0.1); border-color: rgba(41, 92, 101, 0.4); }

        .adm-icon-btn--danger { color: var(--adm-danger); }
        .adm-icon-btn--danger:hover { background: rgba(179, 54, 43, 0.08); border-color: rgba(179, 54, 43, 0.4); }

        /* ---------- Loading / empty ---------- */
        .adm-loading { text-align: center; padding: 70px 20px; }

        .adm-spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 3px solid #e8e1d9;
          border-top-color: var(--adm-teal);
          border-radius: 50%;
        }

        .adm-empty {
          padding: 44px 20px;
          text-align: center;
          border: 1.5px dashed #d8ccb5;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.6);
          color: #8a9294;
          font-size: 14px;
        }

        .adm-empty p { margin: 0; }

        /* =====================================================
           RESPONSIVE
        ===================================================== */
        @media (max-width: 760px) {
          .adm-container { padding: 26px 16px 56px; }
          .adm-form { padding: 22px 18px; border-radius: 16px; }
          .adm-grid-form { grid-template-columns: 1fr; }
          .adm-header { align-items: stretch; }
          .adm-header-actions { width: 100%; }
        }

        @media (max-width: 520px) {
          .adm-header-actions .adm-btn { width: 100%; }
          .adm-form-actions .adm-btn { flex: 1; }
          .adm-form-title { font-size: 19px; }
          .adm-grid { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .adm-card, .adm-btn { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/+$/, "");

export default function CatalogueAdminPage() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("Bulk Fabric Catalogue");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const r = await fetch(`${API}/catalogue/admin`, {
        credentials: "include",
        cache: "no-store",
      });
      const p = await r.json();

      if (r.ok) setItems(p.data || []);
      else setMessage(p.message || "Could not load catalogues. Please sign in again.");
    } catch {
      setMessage("Could not connect to the backend.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();

    if (!file) return setMessage("Please choose a PDF file.");

    setBusy(true);
    setMessage("");

    try {
      const fd = new FormData();
      fd.append("catalogue", file);
      fd.append("title", title);

      const r = await fetch(`${API}/catalogue/admin`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const p = await r.json();

      if (!r.ok) throw new Error(p.message || "Upload failed");

      setMessage("Catalogue uploaded. It is now the active customer download.");
      setFile(null);
      e.target.reset();
      await load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function activate(id) {
    const r = await fetch(`${API}/catalogue/admin/${id}/activate`, {
      method: "PATCH",
      credentials: "include",
    });
    const p = await r.json();

    setMessage(r.ok ? "Catalogue activated." : p.message || "Could not activate catalogue.");
    load();
  }

  const activeItem = items.find((item) => item.isActive);

  return (
    <main className="catalogueAdmin">
      <style jsx>{`
        .catalogueAdmin {
          --ink: #222922;
          --muted: #737b72;
          --line: #e5e9e2;
          --surface: #ffffff;
          --canvas: #f6f7f4;
          --brand: #295c65;
          --brandHover: #214b53;
          min-height: 100vh;
          padding: clamp(16px, 3vw, 36px);
          box-sizing: border-box;
          background: var(--canvas);
          color: var(--ink);
        }
        .shell { width: 100%; max-width: 1100px; margin: 0 auto; }
        .header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 20px; flex-wrap: wrap; margin-bottom: 26px;
        }
        .eyebrow {
          margin: 0 0 8px; color: var(--brand); font-size: 11px;
          font-weight: 800; letter-spacing: .15em; text-transform: uppercase;
        }
        h1 { margin: 0; font-size: clamp(27px, 3vw, 36px); letter-spacing: -.04em; line-height: 1.15; }
        .intro { max-width: 650px; margin: 10px 0 0; color: var(--muted); font-size: 14px; line-height: 1.7; }
        .headerBadge {
          display: inline-flex; align-items: center; gap: 8px; padding: 10px 13px;
          border: 1px solid var(--line); border-radius: 10px; background: var(--surface);
          color: #4b574c; font-size: 12px; font-weight: 700;
        }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #3d9b69; }
        .columns {
          display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr);
          gap: 20px; align-items: start;
        }
        .card {
          min-width: 0; overflow: hidden; background: var(--surface);
          border: 1px solid var(--line); border-radius: 16px;
        }
        .cardHeader { padding: 21px 22px; border-bottom: 1px solid var(--line); }
        .cardHeader h2 { margin: 0; font-size: 17px; letter-spacing: -.02em; }
        .cardHeader p { margin: 6px 0 0; color: var(--muted); font-size: 12px; line-height: 1.55; }
        .formBody { display: grid; gap: 18px; padding: 22px; }
        .label { display: block; color: #384138; font-size: 12px; font-weight: 750; }
        .input {
          display: block; width: 100%; box-sizing: border-box; margin-top: 8px;
          padding: 12px 13px; border: 1px solid #d9ded7; border-radius: 9px;
          outline: none; background: #fff; color: var(--ink); font: inherit;
          font-size: 13px; font-weight: 400; transition: border-color .15s, box-shadow .15s;
        }
        .input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(41, 92, 101, .10); }
        .fileBox {
          display: flex; align-items: flex-start; gap: 13px; padding: 16px;
          border: 1px dashed #c9d2c9; border-radius: 11px; background: #fafbf9;
        }
        .fileIcon {
          display: grid; place-items: center; flex: 0 0 42px; height: 42px;
          border-radius: 10px; background: #eaf1f0; color: var(--brand);
        }
        .fileDetails { min-width: 0; flex: 1; }
        .fileDetails strong { display: block; font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
        .fileDetails span { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; line-height: 1.5; }
        .fileInput { display: block; width: 100%; margin-top: 12px; color: #5b645b; font-size: 12px; }
        .fileInput::file-selector-button {
          margin-right: 10px; padding: 8px 10px; border: 1px solid #d9ded7;
          border-radius: 7px; background: #fff; color: #354239; font-size: 11px;
          font-weight: 700; cursor: pointer;
        }
        .primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          min-height: 42px; padding: 11px 16px; border: 1px solid var(--brand);
          border-radius: 9px; background: var(--brand); color: #fff; font-size: 12px;
          font-weight: 750; cursor: pointer; transition: background .15s, opacity .15s;
        }
        .primary:hover { background: var(--brandHover); }
        .primary:disabled { opacity: .6; cursor: not-allowed; }
        .message {
          margin: 0 22px 20px; padding: 11px 13px; border: 1px solid #d8e8e8;
          border-radius: 9px; background: #eff6f6; color: #38575d; font-size: 12px; line-height: 1.55;
          overflow-wrap: anywhere;
        }
        .activeCard {
          display: flex; align-items: flex-start; gap: 12px; margin: 18px 20px 8px;
          padding: 14px; border: 1px solid #d5e9db; border-radius: 11px; background: #f2faf4;
        }
        .activeMark {
          display: grid; place-items: center; flex: 0 0 34px; height: 34px;
          border-radius: 9px; background: #dff2e5; color: #267247;
        }
        .activeInfo { min-width: 0; flex: 1; }
        .activeLabel { color: #287047; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        .activeTitle { margin-top: 4px; color: #263a2c; font-size: 13px; font-weight: 750; overflow-wrap: anywhere; }
        .activeFile { margin-top: 4px; color: #637568; font-size: 11px; overflow-wrap: anywhere; }
        .list { padding: 4px 20px 12px; }
        .item {
          display: flex; align-items: center; justify-content: space-between; gap: 14px;
          padding: 16px 2px; border-bottom: 1px solid var(--line);
        }
        .item:last-child { border-bottom: 0; }
        .itemInfo { min-width: 0; flex: 1; }
        .itemTitle { color: var(--ink); font-size: 13px; font-weight: 750; line-height: 1.5; overflow-wrap: anywhere; }
        .itemFile { margin-top: 4px; color: var(--muted); font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }
        .itemDate { margin-top: 4px; color: #8a9188; font-size: 10px; }
        .itemActions { display: flex; align-items: center; flex-shrink: 0; }
        .status {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 9px;
          border-radius: 999px; background: #e9f6ed; color: #267047;
          font-size: 10px; font-weight: 800; white-space: nowrap;
        }
        .status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .secondary {
          min-height: 33px; padding: 7px 10px; border: 1px solid #d9ded7;
          border-radius: 7px; background: #fff; color: #354239; font-size: 11px;
          font-weight: 750; cursor: pointer; white-space: nowrap;
        }
        .secondary:hover { background: #f3f6f2; }
        .empty { padding: 30px 10px; color: var(--muted); text-align: center; font-size: 12px; line-height: 1.7; }
        @media (max-width: 850px) { .columns { grid-template-columns: 1fr; } }
        @media (max-width: 520px) {
          .catalogueAdmin { padding: 14px; }
          .header { margin-bottom: 17px; }
          .cardHeader { padding: 17px; }
          .formBody { padding: 17px; }
          .list { padding: 4px 15px 10px; }
          .activeCard { margin: 14px 15px 6px; }
          .item { align-items: flex-start; flex-direction: column; }
          .itemActions { width: 100%; }
          .message { margin: 0 17px 16px; }
        }
      `}</style>

      <div className="shell">
        <header className="header">
          <div>
            <p className="eyebrow">Bhavya Fabrics · Admin</p>
            <h1>Catalogue Management</h1>
            <p className="intro">
              Upload and manage your bulk fabric catalogue. Customers will be able to download
              the version marked as active.
            </p>
          </div>
          <div className="headerBadge"><span className="dot" /> Catalogue control panel</div>
        </header>

        <div className="columns">
          <section className="card">
            <div className="cardHeader">
              <h2>Upload new catalogue</h2>
              <p>Choose a PDF file and give it a clear title. Uploading activates it for customers.</p>
            </div>

            <form onSubmit={submit} className="formBody">
              <label className="label">
                Catalogue title
                <input
                  className="input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Bulk Fabric Catalogue"
                />
              </label>

              <div className="label">
                PDF document
                <div className="fileBox">
                  <div className="fileIcon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2V5.75a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                      <path d="M14 3.75v4.5h4M8 13h6M8 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="fileDetails">
                    <strong>{file ? file.name : "Select a catalogue PDF"}</strong>
                    <span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB selected` : "PDF format · Maximum file size 25 MB"}</span>
                    <input
                      className="fileInput"
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(event) => setFile(event.target.files?.[0] || null)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button className="primary" type="submit" disabled={busy}>
                {busy ? "Uploading catalogue…" : "Upload and activate"}
                {!busy && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15.5v3A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </form>

            {message && <p className="message" role="status">{message}</p>}
          </section>

          <section className="card">
            <div className="cardHeader">
              <h2>Catalogue library</h2>
              <p>Review previous uploads and choose which catalogue customers should receive.</p>
            </div>

            {activeItem && (
              <div className="activeCard">
                <div className="activeMark" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="activeInfo">
                  <div className="activeLabel">Currently active</div>
                  <div className="activeTitle">{activeItem.title}</div>
                  <div className="activeFile">{activeItem.fileName}</div>
                </div>
                <span className="status">Active</span>
              </div>
            )}

            <div className="list">
              {items.length === 0 ? (
                <div className="empty">No catalogue uploads found yet.<br />Your uploaded PDFs will appear here.</div>
              ) : (
                items.map((item) => (
                  <article className="item" key={item._id}>
                    <div className="itemInfo">
                      <div className="itemTitle">{item.title}</div>
                      <div className="itemFile">{item.fileName}</div>
                      <div className="itemDate">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                    <div className="itemActions">
                      {item.isActive ? (
                        <span className="status">Active</span>
                      ) : (
                        <button className="secondary" type="button" onClick={() => activate(item._id)}>
                          Set active
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

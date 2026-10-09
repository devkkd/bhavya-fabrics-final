"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/+$/, "");
const EMPTY = {
  title: "", slug: "", excerpt: "", contentHtml: "", featuredImage: "", imageAlt: "",
  category: "Fabric Knowledge", authorName: "Bhavya Fabrics", metaTitle: "", metaDescription: "",
  canonicalUrl: "", schemaMarkup: "", status: "draft", publishedAt: "",
};
const field = { display: "block", width: "100%", padding: "11px 12px", border: "1px solid #d6d3d1", borderRadius: 8, marginTop: 6, boxSizing: "border-box", font: "inherit", background: "#fff", color: "#292524" };
const label = { display: "block", fontSize: 13, fontWeight: 600, color: "#44403c" };
const button = { padding: "10px 14px", background: "#295C65", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer", fontWeight: 600 };
const secondary = { ...button, background: "#f5f5f4", color: "#292524", border: "1px solid #d6d3d1" };
const toolbarButton = { ...secondary, padding: "7px 10px", fontSize: 13 };

function toLocalDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
function getUploadUrl() { return `${API}/uploads/direct`; }

export default function BlogsAdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);
  const [imageAltInline, setImageAltInline] = useState("");
  const editorRef = useRef(null);
  const featuredFileRef = useRef(null);
  const inlineFileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API}/blogs/admin`, { credentials: "include", cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Could not load blogs. Sign in as admin.");
      setItems(Array.isArray(payload.data) ? payload.data : []);
    } catch (error) { setMessage(error.message || "Backend connection failed."); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = form.contentHtml || "";
    // editorVersion deliberately refreshes HTML only when creating/loading an article, not on every keystroke.
  }, [editorVersion]);

  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function syncEditor() { if (editorRef.current) setForm((current) => ({ ...current, contentHtml: editorRef.current.innerHTML })); }
  function runCommand(command, value = null) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditor();
  }
  function makeLink() {
    const url = window.prompt("Paste full link (https://…)");
    if (!url) return;
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim())) { setMessage("Link must start with https://, http:// or mailto:"); return; }
    runCommand("createLink", url.trim());
  }
  function insertTable() {
    const rows = Math.max(1, Math.min(12, Number(window.prompt("Number of table rows?", "3")) || 3));
    const cols = Math.max(1, Math.min(8, Number(window.prompt("Number of table columns?", "2")) || 2));
    let html = '<table border="1" cellpadding="8" cellspacing="0"><tbody>';
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) html += r === 0 ? '<th>Header</th>' : '<td>Enter text</td>';
      html += "</tr>";
    }
    html += "</tbody></table><p><br></p>";
    editorRef.current?.focus(); document.execCommand("insertHTML", false, html); syncEditor();
  }
  async function uploadImage(file) {
    if (!file) return "";
    if (!file.type.startsWith("image/")) throw new Error("Please select an image file.");
    if (file.size > 10 * 1024 * 1024) throw new Error("Image must be 10 MB or smaller.");
    const data = new FormData(); data.append("file", file); data.append("type", "blog"); data.append("filename", file.name);
    const response = await fetch(getUploadUrl(), { method: "POST", credentials: "include", body: data });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Image upload failed. Check admin login and R2 configuration.");
    const url = payload?.upload?.url || payload?.upload?.imageUrl || payload?.upload?.deliveryUrl || payload?.url;
    if (!url) throw new Error("Upload completed but backend did not return an image URL.");
    return url;
  }
  async function handleFeaturedFile(file) {
    if (!file) return;
    setUploading(true); setMessage("");
    try { const url = await uploadImage(file); setForm((current) => ({ ...current, featuredImage: url })); setMessage("Featured image uploaded."); }
    catch (error) { setMessage(error.message); }
    finally { setUploading(false); if (featuredFileRef.current) featuredFileRef.current.value = ""; }
  }
  async function handleInlineFile(file) {
    if (!file) return;
    setUploading(true); setMessage("");
    try {
      const url = await uploadImage(file);
      const alt = window.prompt("Alt text for this article image", file.name.replace(/\.[^.]+$/, "")) || "";
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, `<figure><img src="${url}" alt="${alt.replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;")}" loading="lazy" /><figcaption>${alt.replace(/</g, "&lt;")}</figcaption></figure><p><br></p>`);
      syncEditor(); setMessage("Image inserted into article content.");
    } catch (error) { setMessage(error.message); }
    finally { setUploading(false); if (inlineFileRef.current) inlineFileRef.current.value = ""; }
  }
  function startEdit(blog) {
    setEditId(blog._id);
    setForm({ ...EMPTY, ...blog, schemaMarkup: blog.schemaMarkup ? JSON.stringify(blog.schemaMarkup, null, 2) : "", publishedAt: toLocalDateTime(blog.publishedAt) });
    setEditorVersion((n) => n + 1); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function resetForm() { setEditId(null); setForm(EMPTY); setEditorVersion((n) => n + 1); setMessage(""); }
  async function save(event) {
    event.preventDefault(); syncEditor();
    const contentHtml = editorRef.current?.innerHTML || "";
    if (!contentHtml.replace(/<[^>]*>/g, " ").trim()) { setMessage("Please add article content before saving."); return; }
    setBusy(true); setMessage("");
    try {
      let schemaMarkup = null;
      if (form.schemaMarkup.trim()) { try { schemaMarkup = JSON.parse(form.schemaMarkup); } catch { throw new Error("Schema must be valid JSON."); } }
      const body = { ...form, contentHtml, schemaMarkup, publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null };
      const response = await fetch(`${API}/blogs${editId ? `/${editId}` : ""}`, {
        method: editId ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Could not save blog.");
      setMessage("Blog saved successfully."); resetForm(); await load();
    } catch (error) { setMessage(error.message || "Could not save blog."); }
    finally { setBusy(false); }
  }
  async function remove(id) {
    if (!window.confirm("Delete this blog permanently?")) return;
    try { const response = await fetch(`${API}/blogs/${id}`, { method: "DELETE", credentials: "include" }); const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Delete failed."); setMessage("Blog deleted."); await load(); }
    catch (error) { setMessage(error.message); }
  }

  return (
    <main style={{ maxWidth: 1180, padding: "28px clamp(14px, 3vw, 30px) 60px", margin: "0 auto", color: "#292524" }}>
      <style>{`
        .blog-editor-content { min-height: 320px; padding: 18px; outline: none; line-height: 1.75; color: #292524; overflow-wrap: anywhere; }
        .blog-editor-content:empty:before { content: 'Write your blog here… Select text and use Bold, link, heading or table tools above.'; color: #a8a29e; }
        .blog-editor-content a { color: #1769d2; text-decoration: underline; }
        .blog-editor-content table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        .blog-editor-content th, .blog-editor-content td { border: 1px solid #cfcac4; padding: 9px; min-width: 70px; }
        .blog-editor-content th { background: #f5f5f4; font-weight: 700; }
        .blog-editor-content img { max-width: 100%; height: auto; border-radius: 8px; }
        .blog-editor-content figure { margin: 18px 0; }
        .blog-editor-content figcaption { color: #78716c; font-size: 12px; }
        .blog-admin-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; }
        @media(max-width:700px){.blog-admin-grid{grid-template-columns:1fr}.blog-admin-content-toolbar{gap:6px!important}}
      `}</style>
      <header style={{ marginBottom: 22 }}>
        <p style={{ color: "#9b8059", letterSpacing: 2, fontSize: 11, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px" }}>Content management</p>
        <h1 style={{ fontSize: "clamp(28px,4vw,38px)", margin: 0 }}>Blog Management</h1>
        <p style={{ color: "#78716c", lineHeight: 1.6 }}>Create articles with rich text, tables, blue hyperlinks, images, SEO metadata and scheduled publication.</p>
      </header>

      <form onSubmit={save} style={{ display: "grid", gap: 18, padding: "clamp(14px,3vw,24px)", background: "#fff", border: "1px solid #e7e5e4", borderRadius: 14, boxShadow: "0 5px 20px #00000008" }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>{editId ? "Edit blog article" : "Create new blog"}</h2>
        <div className="blog-admin-grid">
          <label style={label}>Blog title *<input name="title" value={form.title} onChange={change} required maxLength={180} style={field} placeholder="Enter a clear blog title" /></label>
          <label style={label}>URL slug<input name="slug" value={form.slug} onChange={change} style={field} placeholder="Leave blank to generate from title" /></label>
        </div>
        <label style={label}>Short description / excerpt *<textarea name="excerpt" value={form.excerpt} onChange={change} required maxLength={500} rows={3} style={field} placeholder="Short summary shown on blog cards and search previews" /></label>

        <section style={{ border: "1px solid #e7e5e4", borderRadius: 10, padding: 12 }}>
          <label style={label}>Article content *</label>
          <div className="blog-admin-content-toolbar" style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 0", borderBottom: "1px solid #e7e5e4" }}>
            <button type="button" style={toolbarButton} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand("bold")}><b>Bold</b></button>
            <button type="button" style={toolbarButton} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand("italic")}><i>Italic</i></button>
            <button type="button" style={toolbarButton} onClick={() => runCommand("formatBlock", "<h2>")}>Heading 2</button>
            <button type="button" style={toolbarButton} onClick={() => runCommand("formatBlock", "<h3>")}>Heading 3</button>
            <button type="button" style={toolbarButton} onClick={() => runCommand("insertUnorderedList")}>• Bullets</button>
            <button type="button" style={toolbarButton} onClick={() => runCommand("insertOrderedList")}>1. Numbered</button>
            <button type="button" style={toolbarButton} onClick={makeLink}>🔗 Hyperlink</button>
            <button type="button" style={toolbarButton} onClick={insertTable}>▦ Insert table</button>
            <button type="button" style={toolbarButton} onClick={() => inlineFileRef.current?.click()} disabled={uploading}>＋ Insert image</button>
            <input ref={inlineFileRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" hidden onChange={(e) => handleInlineFile(e.target.files?.[0])} />
          </div>
          <div ref={editorRef} key={editorVersion} className="blog-editor-content" contentEditable suppressContentEditableWarning role="textbox" aria-label="Blog article rich text editor" aria-multiline="true" onInput={syncEditor} />
          <p style={{ margin: "8px 0 0", color: "#78716c", fontSize: 12 }}>Bold text stays bold, links appear blue on the website, and tables are supported. Avoid pasting scripts or unsafe embed code.</p>
        </section>

        <div className="blog-admin-grid">
          <label style={label}>Category<input name="category" value={form.category} onChange={change} style={field} placeholder="Fabric Knowledge" /></label>
          <label style={label}>Author name<input name="authorName" value={form.authorName} onChange={change} required style={field} placeholder="Author name" /></label>
          <label style={label}>Publish date and time<input type="datetime-local" name="publishedAt" value={form.publishedAt} onChange={change} style={field} /><small style={{ color: "#78716c", fontWeight: 400 }}>Set the date/time when this article should appear publicly.</small></label>
          <label style={label}>Status<select name="status" value={form.status} onChange={change} style={field}><option value="draft">Draft — hidden from clients</option><option value="published">Published</option></select></label>
        </div>

        <section style={{ border: "1px dashed #b8b1a8", borderRadius: 12, padding: 16, background: dragging ? "#f0fdfa" : "#fafaf9" }} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); handleFeaturedFile(e.dataTransfer.files?.[0]); }}>
          <label style={label}>Featured image</label>
          <p style={{ color: "#78716c", fontSize: 13 }}>Drag and drop an image here, or choose a file. JPG, PNG, WEBP or AVIF, maximum 10 MB.</p>
          <input ref={featuredFileRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => handleFeaturedFile(e.target.files?.[0])} style={{ ...field, maxWidth: 500 }} />
          {uploading && <p style={{ color: "#295C65" }}>Uploading image…</p>}
          {form.featuredImage && <div style={{ marginTop: 12, display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}><img src={form.featuredImage} alt={form.imageAlt || "Featured image preview"} style={{ width: 180, maxHeight: 130, objectFit: "cover", borderRadius: 8 }} /><button type="button" style={secondary} onClick={() => setForm((f) => ({ ...f, featuredImage: "" }))}>Remove image</button></div>}
          <label style={{ ...label, marginTop: 14 }}>Image alt text<input name="imageAlt" value={form.imageAlt} onChange={change} maxLength={250} style={field} placeholder="Describe the image for accessibility and SEO" /></label>
          <label style={{ ...label, marginTop: 14 }}>Or enter an existing image URL<input name="featuredImage" value={form.featuredImage} onChange={change} style={field} placeholder="https://…" /></label>
        </section>

        <h3 style={{ margin: "4px 0 -8px", fontSize: 18 }}>SEO settings</h3>
        <div className="blog-admin-grid">
          <label style={label}>Meta title<input name="metaTitle" value={form.metaTitle} onChange={change} maxLength={70} style={field} placeholder="SEO title (up to 70 characters)" /></label>
          <label style={label}>Canonical URL<input name="canonicalUrl" value={form.canonicalUrl} onChange={change} style={field} placeholder="https://bhavyafabrics.com/blog/your-slug" /></label>
        </div>
        <label style={label}>Meta description<textarea name="metaDescription" value={form.metaDescription} onChange={change} maxLength={200} rows={3} style={field} placeholder="Short search engine description" /><small style={{ color: "#78716c", fontWeight: 400 }}>{form.metaDescription.length}/200 characters</small></label>
        <label style={label}>Schema markup (JSON-LD)<textarea name="schemaMarkup" value={form.schemaMarkup} onChange={change} rows={7} style={{ ...field, fontFamily: "ui-monospace,monospace", fontSize: 12 }} placeholder={'{"@context":"https://schema.org","@type":"Article","headline":"Your article title"}'} /><small style={{ color: "#78716c", fontWeight: 400 }}>Optional. Leave blank to use the article schema generated on the details page.</small></label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button disabled={busy || uploading} type="submit" style={{ ...button, opacity: busy || uploading ? 0.65 : 1 }}>{busy ? "Saving…" : editId ? "Update blog" : "Save blog"}</button>
          {editId && <button type="button" style={secondary} onClick={resetForm}>Cancel edit</button>}
        </div>
        {message && <p role="status" style={{ margin: 0, padding: 12, borderRadius: 8, background: message.toLowerCase().includes("failed") || message.toLowerCase().includes("error") || message.toLowerCase().includes("required") ? "#fef2f2" : "#f0fdfa", color: "#44403c" }}>{message}</p>}
      </form>

      <section style={{ marginTop: 34 }}>
        <h2 style={{ fontSize: 23 }}>Existing blogs ({items.length})</h2>
        {items.length === 0 && <p style={{ color: "#78716c" }}>No blogs loaded yet. Create your first blog above.</p>}
        {items.map((blog) => <article key={blog._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderBottom: "1px solid #e7e5e4", flexWrap: "wrap" }}>
          {blog.featuredImage && <img src={blog.featuredImage} alt={blog.imageAlt || ""} style={{ width: 72, height: 58, objectFit: "cover", borderRadius: 7 }} />}
          <div style={{ flex: "1 1 250px", minWidth: 0 }}><strong>{blog.title}</strong><p style={{ margin: "5px 0", color: "#78716c", fontSize: 13 }}>/blog/{blog.slug} · {blog.status} · {blog.authorName || "Bhavya Fabrics"}{blog.publishedAt ? ` · ${new Date(blog.publishedAt).toLocaleString()}` : ""}</p></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button type="button" style={secondary} onClick={() => startEdit(blog)}>Edit</button><button type="button" style={{ ...secondary, color: "#b91c1c" }} onClick={() => remove(blog._id)}>Delete</button>{blog.status === "published" && <a href={`/blog/${blog.slug}`} target="_blank" rel="noreferrer" style={{ ...button, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>View article ↗</a>}</div>
        </article>)}
      </section>
    </main>
  );
}

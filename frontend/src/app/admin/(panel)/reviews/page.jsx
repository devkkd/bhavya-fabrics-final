 "use client";

import { useCallback, useEffect, useState } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/+$/, "");
const blank = { name: "", role: "", quote: "", rating: 5, isPublished: true, sortOrder: 0 };

export default function ReviewsAdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/reviews/admin`, { credentials: "include", cache: "no-store" });
      const p = await r.json();
      if (r.ok) { setItems(p.data || []); setMsg(""); }
      else { setMsg(p.message || "Please sign in as admin."); setMsgType("error"); }
    } catch {
      setMsg("Could not connect to the server. Please try again.");
      setMsgType("error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((old) => ({ ...old, [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value }));
  };
  const reset = () => { setEdit(null); setForm(blank); };

  async function save(e) {
    e.preventDefault(); setSaving(true); setMsg("");
    try {
      const r = await fetch(`${API}/reviews${edit ? `/${edit}` : ""}`, {
        method: edit ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const p = await r.json();
      if (!r.ok) { setMsg(p.message || "Could not save this review."); setMsgType("error"); return; }
      setMsg(edit ? "Review updated successfully." : "Review added successfully.");
      setMsgType("success"); reset(); await load();
    } catch { setMsg("Network error. Please try again."); setMsgType("error"); }
    finally { setSaving(false); }
  }

  async function remove(id) {
    if (!confirm("Delete this review? This action cannot be undone.")) return;
    setDeleting(id); setMsg("");
    try {
      const r = await fetch(`${API}/reviews/${id}`, { method: "DELETE", credentials: "include" });
      const p = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg(p.message || "Delete failed."); setMsgType("error"); return; }
      setMsg("Review deleted successfully."); setMsgType("success");
      if (edit === id) reset();
      await load();
    } catch { setMsg("Network error while deleting the review."); setMsgType("error"); }
    finally { setDeleting(null); }
  }

  function startEdit(x) {
    setEdit(x._id);
    setForm({ name: x.name || "", role: x.role || "", quote: x.quote || "", rating: x.rating || 5, isPublished: Boolean(x.isPublished), sortOrder: x.sortOrder || 0 });
    setMsg("");
    document.getElementById("review-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const published = items.filter((x) => x.isPublished).length;
  const hidden = items.length - published;

  return (
    <main className="reviews-page">
      <div className="shell">
        <header className="page-header">
          <div>
            <div className="eyebrow"><span /> CUSTOMER VOICE</div>
            <h1>Client reviews<span className="gold">.</span></h1>
            <p className="subtitle">Manage customer feedback and choose which reviews appear on your homepage.</p>
          </div>
          <button className="refresh" type="button" onClick={load} disabled={loading}><span className={loading ? "spin" : ""}>↻</span> Refresh</button>
        </header>

        <section className="stats">
          <article className="stat"><div className="stat-label"><i>✦</i> TOTAL REVIEWS</div><strong>{items.length}</strong><small>All customer submissions</small></article>
          <article className="stat"><div className="stat-label"><i className="green">✓</i> PUBLISHED</div><strong>{published}</strong><small>Visible on the homepage</small></article>
          <article className="stat"><div className="stat-label"><i className="grey">◷</i> HIDDEN</div><strong>{hidden}</strong><small>Saved, not displayed</small></article>
        </section>

        {msg && <div className={`notice ${msgType}`} role="status"><b>{msgType === "success" ? "✓" : msgType === "error" ? "!" : "i"}</b><span>{msg}</span><button type="button" onClick={() => setMsg("")} aria-label="Dismiss">×</button></div>}

        <div className="columns">
          <section className="panel editor" id="review-editor">
            <div className="panel-heading">
              <div><div className="kicker">{edit ? "UPDATE DETAILS" : "CREATE CONTENT"}</div><h2>{edit ? "Edit review" : "Add a review"}</h2><p>{edit ? "Update this customer testimonial." : "Add a customer testimonial to your collection."}</p></div>
              <span className="heading-icon">{edit ? "✎" : "+"}</span>
            </div>

            <form onSubmit={save}>
              <div className="field"><label htmlFor="review-name">Customer name <em>*</em></label><input id="review-name" name="name" placeholder="e.g. Priya Sharma" value={form.name} onChange={change} required maxLength={120} /></div>
              <div className="field"><label htmlFor="review-role">Role / company <small>OPTIONAL</small></label><input id="review-role" name="role" placeholder="e.g. Retail Partner, Jaipur" value={form.role} onChange={change} maxLength={160} /></div>
              <div className="field"><div className="label-row"><label htmlFor="review-quote">Customer review <em>*</em></label><small>{form.quote.length} characters</small></div><textarea id="review-quote" name="quote" placeholder="Write the customer's feedback here…" value={form.quote} onChange={change} required rows={5} maxLength={3000} /></div>
              <div className="field-row">
                <div className="field"><label htmlFor="review-rating">Star rating</label><select id="review-rating" name="rating" value={form.rating} onChange={change}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} {n === 1 ? "star" : "stars"}</option>)}</select><div className="stars">{"★".repeat(Number(form.rating))}<span>{"★".repeat(5 - Number(form.rating))}</span></div></div>
                <div className="field"><label htmlFor="review-order">Display order</label><input id="review-order" type="number" name="sortOrder" value={form.sortOrder} onChange={change} /><small className="hint">Lower numbers appear first if supported by homepage sorting.</small></div>
              </div>
              <label className={`publish ${form.isPublished ? "on" : ""}`}><span><strong>Publish this review</strong><small>{form.isPublished ? "This review can appear on the homepage." : "This review will stay hidden from visitors."}</small></span><input type="checkbox" name="isPublished" checked={form.isPublished} onChange={change} /><i className="switch"><b /></i></label>
              <div className="actions"><button className="primary" type="submit" disabled={saving}>{saving ? "Saving…" : edit ? "Save changes" : "Add review"} {!saving && <span>→</span>}</button>{edit && <button className="cancel" type="button" onClick={reset} disabled={saving}>Cancel</button>}</div>
            </form>
          </section>

          <section className="panel library">
            <div className="panel-heading list-heading"><div><div className="kicker">TESTIMONIAL LIBRARY</div><h2>All reviews <span className="count">{items.length}</span></h2></div><span className="heading-icon list-icon">☰</span></div>
            {loading ? <div className="empty"><span className="loader" /><p>Loading reviews…</p></div> : items.length === 0 ? <div className="empty"><span className="empty-icon">✦</span><h3>No reviews yet</h3><p>Customer testimonials will appear here once added.</p></div> : (
              <div className="review-list">{items.map(x => {
                const rating = Math.max(0, Math.min(5, Number(x.rating) || 5));
                return <article className={`review ${edit === x._id ? "editing" : ""}`} key={x._id}>
                  <div className="review-top"><div className="avatar">{(x.name || "C").trim().charAt(0).toUpperCase()}</div><div className="person"><strong>{x.name}</strong><small>{x.role || "Customer"}</small></div><span className={`status ${x.isPublished ? "published" : "hidden"}`}><i />{x.isPublished ? "Published" : "Hidden"}</span></div>
                  <div className="review-stars">{"★".repeat(rating)}<span>{"★".repeat(5-rating)}</span></div>
                  <p className="quote">“{x.quote}”</p>
                  <div className="review-bottom"><small>DISPLAY ORDER <b>{x.sortOrder ?? 0}</b></small><div className="item-actions"><button type="button" className="edit-btn" onClick={() => startEdit(x)}>✎ Edit</button><button type="button" className="delete-btn" onClick={() => remove(x._id)} disabled={deleting === x._id}>{deleting === x._id ? "Deleting…" : "Delete"}</button></div></div>
                </article>;
              })}</div>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .reviews-page{min-height:100vh;background:#f5f6f3;color:#253b32;padding:clamp(18px,3.5vw,44px);font-family:Arial,Helvetica,sans-serif}.shell{max-width:1440px;margin:auto}
        button,input,textarea,select{font:inherit}button{transition:all .18s ease}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid #28594e30;outline-offset:2px}
        .page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:28px}.eyebrow,.kicker{display:flex;align-items:center;gap:9px;font-size:10px;font-weight:800;letter-spacing:1.8px;color:#9b8551}.eyebrow span{width:24px;height:2px;background:#b69a5d}
        h1{font:500 clamp(34px,4vw,52px)/1.1 Georgia,serif;letter-spacing:-1.4px;margin:13px 0 10px;color:#213c36}.gold{color:#b69a5d}.subtitle{margin:0;color:#7e8982;font-size:13px;line-height:1.7}.refresh{display:flex;align-items:center;gap:8px;border:1px solid #dfe5df;border-radius:9px;padding:10px 14px;background:white;color:#3d5549;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap}.refresh span{font-size:20px;line-height:12px}.refresh:hover{background:#f9fbf8}.spin{display:inline-block;animation:rotate 1s linear infinite}
        .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px;margin-bottom:20px}.stat{padding:18px 21px;background:white;border:1px solid #e6ebe5;border-radius:13px;box-shadow:0 3px 14px #1d352b08}.stat-label{display:flex;align-items:center;gap:9px;color:#859088;font-size:10px;font-weight:800;letter-spacing:1.2px}.stat-label i{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:#f5f0e4;color:#a1874d;font-size:15px;font-style:normal}.stat-label i.green{background:#e9f3ec;color:#3c8061}.stat-label i.grey{background:#f0f1ef;color:#7c8580}.stat strong{display:block;font-size:31px;line-height:1.2;margin:12px 0 4px;color:#263e36}.stat small{font-size:10px;color:#929b95}
        .notice{display:flex;align-items:center;gap:10px;border:1px solid;border-radius:9px;padding:12px 14px;margin-bottom:18px;font-size:12px}.notice>b{display:grid;place-items:center;width:21px;height:21px;border-radius:50%;flex-shrink:0}.notice button{margin-left:auto;border:0;background:none;font-size:21px;cursor:pointer;color:inherit}.notice.success{background:#eef7f0;border-color:#d3e9d8;color:#286744}.notice.success>b{background:#d7eddd}.notice.error{background:#fff2ef;border-color:#f2d7d0;color:#984331}.notice.error>b{background:#f8ddd6}.notice.info{background:#f0f5f2;border-color:#dbe7df;color:#3c6250}
        .columns{display:grid;grid-template-columns:minmax(320px,.88fr) minmax(0,1.12fr);gap:20px;align-items:start}.panel{min-width:0;background:white;border:1px solid #e5e9e4;border-radius:15px;box-shadow:0 5px 24px #203a2d08;overflow:hidden}.editor{padding:clamp(19px,2.4vw,29px);scroll-margin-top:20px}.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding-bottom:20px;border-bottom:1px solid #edf0ec}.panel-heading h2{font:500 25px/1.2 Georgia,serif;letter-spacing:-.5px;margin:7px 0 6px;color:#263e36}.panel-heading p{font-size:11px;line-height:1.6;color:#8a938e;margin:0}.heading-icon{display:grid;place-items:center;width:37px;height:37px;border-radius:10px;background:#f5f1e7;color:#a18a53;font-size:22px;flex-shrink:0}
        form{display:grid;gap:17px;padding-top:21px}.field{display:flex;flex-direction:column;gap:8px;min-width:0}.field label,.label-row label{font-size:12px;font-weight:700;color:#43544c}.field label em,.label-row em{font-style:normal;color:#b16c55}.field label small{margin-left:7px;font-size:9px;color:#a0a8a2;letter-spacing:.6px}.field input,.field textarea,.field select{box-sizing:border-box;width:100%;min-width:0;border:1px solid #dfe5df;border-radius:8px;background:#fcfdfb;color:#263b32;padding:11px 12px;font-size:12px;outline:none}.field input:focus,.field textarea:focus,.field select:focus{border-color:#719386;box-shadow:0 0 0 3px #4c7e6917}.field input::placeholder,.field textarea::placeholder{color:#b0b7b1}.field textarea{resize:vertical;min-height:115px;line-height:1.65}.label-row{display:flex;justify-content:space-between;align-items:center;gap:8px}.label-row>small{font-size:10px;color:#a0a8a2}.field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.stars,.review-stars{font-size:14px;letter-spacing:2px;color:#b99a55}.stars span,.review-stars span{color:#e0e4de}.hint{font-size:10px;line-height:1.5;color:#929b95}
        .publish{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #e5eae4;background:#fafbf9;border-radius:10px;padding:13px;cursor:pointer}.publish.on{background:#f3f8f3;border-color:#dce9dc}.publish>span{display:grid;gap:5px}.publish strong{font-size:12px;color:#3c5146}.publish small{font-size:10px;line-height:1.5;color:#8a968d}.publish input{position:absolute;opacity:0;width:1px;height:1px}.switch{width:38px;height:22px;border-radius:30px;background:#cbd1cb;padding:3px;box-sizing:border-box;flex-shrink:0;transition:background .2s}.switch b{display:block;width:16px;height:16px;border-radius:50%;background:white;box-shadow:0 1px 3px #0002;transition:transform .2s}.publish input:checked+.switch{background:#39735a}.publish input:checked+.switch b{transform:translateX(16px)}.publish input:focus-visible+.switch{outline:3px solid #28594e30;outline-offset:3px}
        .actions{display:flex;gap:10px}.primary,.cancel{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:42px;border-radius:8px;padding:10px 16px;font-size:12px;font-weight:700;cursor:pointer}.primary{flex:1;background:#28594e;color:white;border:1px solid #28594e}.primary:hover:not(:disabled){background:#214b41;transform:translateY(-1px)}.primary span{font-size:17px;font-weight:400}.cancel{border:1px solid #dfe5df;background:white;color:#68756d}
        .library .panel-heading{padding:23px 24px 19px}.list-heading{align-items:center}.list-heading h2{display:flex;align-items:center;gap:10px;margin-bottom:0}.count{display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;box-sizing:border-box;border-radius:7px;background:#f0f3ef;color:#65766a;font:700 11px Arial,sans-serif;letter-spacing:0}.list-icon{background:#f2f5f1;color:#6c8375;font-size:16px}.review-list{padding:0 24px}.review{padding:21px 0;border-bottom:1px solid #edf0ec}.review:last-child{border-bottom:0}.review.editing{margin:0 -10px;padding:21px 10px;background:#f8faf6;border-radius:9px}.review-top{display:flex;align-items:center;gap:10px;min-width:0}.avatar{display:grid;place-items:center;flex-shrink:0;width:38px;height:38px;border-radius:11px;background:#e8eee8;color:#416451;font:19px Georgia,serif}.person{display:flex;flex:1;flex-direction:column;gap:4px;min-width:0}.person strong{font-size:12px;color:#34483e;overflow-wrap:anywhere}.person small{font-size:10px;color:#8d9890;overflow-wrap:anywhere}.status{display:inline-flex;align-items:center;gap:5px;border-radius:30px;padding:6px 8px;font-size:9px;font-weight:700;white-space:nowrap}.status i{width:5px;height:5px;border-radius:50%;background:currentColor}.status.published{background:#eaf5ed;color:#3f8059}.status.hidden{background:#f0f1ef;color:#7f8982}.review-stars{margin:14px 0 8px}.quote{font:14px/1.7 Georgia,serif;color:#58675e;margin:0;overflow-wrap:anywhere;white-space:pre-wrap}.review-bottom{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:16px;padding-top:12px;border-top:1px solid #f0f2ef}.review-bottom>small{font-size:9px;letter-spacing:.8px;color:#9ba49d;font-weight:700}.review-bottom b{color:#67776b;font-size:11px;letter-spacing:0;margin-left:4px}.item-actions{display:flex;gap:7px}.edit-btn,.delete-btn{border-radius:7px;padding:7px 10px;font-size:10px;font-weight:700;cursor:pointer}.edit-btn{border:1px solid #dce5dd;background:#f7faf6;color:#426450}.edit-btn:hover{background:#edf4ed}.delete-btn{border:1px solid #f0dfdc;background:#fff8f6;color:#a25b4d}.delete-btn:hover:not(:disabled){background:#fbece8}
        .empty{min-height:240px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px}.empty p{font-size:12px;line-height:1.6;color:#8b968e}.empty h3{font:500 20px Georgia,serif;color:#354a3f;margin:14px 0 0}.empty-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:#f4f0e5;color:#a58d53;font-size:22px}.loader{width:23px;height:23px;border:2px solid #dce6dd;border-top-color:#3d745b;border-radius:50%;animation:rotate .8s linear infinite}.loader+p{margin-top:13px}
        @keyframes rotate{to{transform:rotate(360deg)}}@media(max-width:1050px){.columns{grid-template-columns:minmax(0,1fr)}}@media(max-width:620px){.reviews-page{padding:17px 12px 28px}.page-header{align-items:flex-start;margin-bottom:19px}.refresh{padding:9px 10px;font-size:11px}.subtitle{font-size:12px}.stats{gap:8px;margin-bottom:15px}.stat{padding:12px 10px;border-radius:10px}.stat-label{align-items:flex-start;flex-direction:column;gap:6px;font-size:8px;letter-spacing:.6px}.stat-label i{width:24px;height:24px}.stat strong{font-size:25px;margin:9px 0 3px}.stat small{font-size:9px;line-height:1.4}.editor{padding:18px 14px}.panel-heading h2{font-size:22px}.field-row{grid-template-columns:1fr}.library .panel-heading{padding:20px 15px 17px}.review-list{padding:0 15px}.review{padding:18px 0}.status{font-size:8px;padding:5px 6px}.review-bottom{align-items:flex-start;flex-direction:column}.item-actions{width:100%}.edit-btn,.delete-btn{flex:1;padding:9px}.actions{flex-wrap:wrap}.primary{min-width:145px}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition:none!important}}
      `}</style>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/+$/, "");
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://bhavyafabrics.com").replace(/\/+$/, "");
const FALLBACK = {
  "natural-fibre-revival-linen-cotton-2026": { slug: "natural-fibre-revival-linen-cotton-2026", title: "Natural Fibre Revival: Why Linen and Cotton Dominate 2026 Fashion", excerpt: "Explore why natural fibres remain essential for breathable, versatile and timeless fabric collections.", category: "Textile Trends", featuredImage: "/images/home/facility/3.png", imageAlt: "Natural textile fibres and fabric production", authorName: "Bhavya Fabrics", publishedAt: "2026-07-18T09:00:00.000Z", contentHtml: "<p>Natural fibres remain an important choice for brands looking for breathable, versatile and timeless textiles.</p><h2>Why natural fibres matter</h2><p>Cotton is valued for softness and everyday comfort, while linen is appreciated for its distinctive texture and airy feel. The right choice depends on the intended garment, fabric construction and finishing.</p><h2>Choosing a fabric for your collection</h2><p>Compare hand feel, weight, weave, colour consistency and care requirements before finalising a production run.</p>" },
  "choose-right-gsm-garment-collection": { slug: "choose-right-gsm-garment-collection", title: "How to Choose the Right GSM for Your Garment Collection", excerpt: "A practical guide to fabric GSM and selecting the right weight for your product range.", category: "Wholesale Guide", featuredImage: "/images/home/1.png", imageAlt: "Fabric selection for a garment collection", authorName: "Bhavya Fabrics", publishedAt: "2026-07-10T09:00:00.000Z", contentHtml: "<p>GSM means grams per square metre and is a useful measure of fabric weight. It should be considered alongside fibre, weave and finish.</p><h2>Choose by end use</h2><table><thead><tr><th>Use</th><th>What to consider</th></tr></thead><tbody><tr><td>Light garments</td><td>Drape, breathability and opacity</td></tr><tr><td>Everyday apparel</td><td>Balance of comfort and durability</td></tr><tr><td>Structured products</td><td>Body, stability and finishing</td></tr></tbody></table><p>Always test fabric samples for the intended use before placing a bulk order.</p>" },
  "ajrakh-living-heritage-every-metre": { slug: "ajrakh-living-heritage-every-metre", title: "Ajrakh: A Living Heritage Woven Into Every Metre", excerpt: "Learn about the artistry, patterns and textile heritage behind Ajrakh-inspired fabrics.", category: "Fabric Knowledge", featuredImage: "/images/home/2.png", imageAlt: "Traditional textile pattern and fabric", authorName: "Bhavya Fabrics", publishedAt: "2026-06-28T09:00:00.000Z", contentHtml: "<p>Ajrakh is celebrated for its layered patterns, considered geometry and deep connection to textile heritage.</p><h2>Patterns and process</h2><p>Traditional block-printing processes depend on careful preparation, repeat alignment and thoughtful colour work. Each stage contributes to the character of the finished fabric.</p><p>When sourcing printed textiles, review colour, repeat, handle and finishing against the intended product requirements.</p>" },
};
async function getBlog(slug) {
  try {
    const response = await fetch(`${API}/blogs/${encodeURIComponent(slug)}`, { cache: "no-store", signal: AbortSignal.timeout(3500) });
    if (response.ok) { const payload = await response.json(); if (payload?.data) return payload.data; }
  } catch {}
  return FALLBACK[slug] || null;
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: "Blog not found | Bhavya Fabrics", robots: { index: false, follow: false } };
  const canonical = blog.canonicalUrl || `${SITE}/blog/${blog.slug}`;
  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt || blog.title,
    alternates: { canonical },
    openGraph: { type: "article", title: blog.metaTitle || blog.title, description: blog.metaDescription || blog.excerpt || blog.title, url: canonical, images: blog.featuredImage ? [{ url: blog.featuredImage, alt: blog.imageAlt || blog.title }] : [] },
  };
}
function dateText(value) { if (!value) return ""; const d = new Date(value); return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }); }
export default async function BlogDetailsPage({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();
  const articleSchema = blog.schemaMarkup || { "@context": "https://schema.org", "@type": "Article", headline: blog.metaTitle || blog.title, description: blog.metaDescription || blog.excerpt || blog.title, image: blog.featuredImage ? [blog.featuredImage] : undefined, author: { "@type": "Person", name: blog.authorName || "Bhavya Fabrics" }, publisher: { "@type": "Organization", name: "Bhavya Fabrics" }, datePublished: blog.publishedAt || blog.createdAt, dateModified: blog.updatedAt || blog.publishedAt, mainEntityOfPage: blog.canonicalUrl || `${SITE}/blog/${blog.slug}` };
  return <main style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(28px,5vw,64px) 20px 80px", color: "#292524" }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c") }} />
    <Link href="/blog" style={{ color: "#295C65", textDecoration: "none", fontSize: 14 }}>← All blogs</Link>
    <article>
      <header style={{ margin: "26px 0 28px" }}><p style={{ color: "#9b8059", letterSpacing: 1.5, textTransform: "uppercase", fontSize: 12 }}>{blog.category || "Fabric Knowledge"}</p><h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(38px,6vw,62px)", lineHeight: 1.04, margin: "12px 0 18px" }}>{blog.title}</h1><p style={{ color: "#666", lineHeight: 1.75, fontSize: 17 }}>{blog.excerpt}</p><div style={{ color: "#777", fontSize: 13, display: "flex", flexWrap: "wrap", gap: 10 }}><span>By {blog.authorName || "Bhavya Fabrics"}</span>{blog.publishedAt && <><span>·</span><time dateTime={new Date(blog.publishedAt).toISOString()}>{dateText(blog.publishedAt)}</time></>}</div></header>
      {blog.featuredImage && <div style={{ marginBottom: 34, borderRadius: 14, overflow: "hidden", background: "#f5f5f4" }}><img src={blog.featuredImage} alt={blog.imageAlt || blog.title} style={{ display: "block", width: "100%", maxHeight: 560, objectFit: "cover" }} /></div>}
      <style>{`.blog-article-content{font-size:17px;line-height:1.85;color:#3f3f46;overflow-wrap:anywhere}.blog-article-content h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(28px,4vw,38px);line-height:1.2;color:#1a1a1a;margin:34px 0 12px}.blog-article-content h3{font-size:23px;margin:28px 0 10px;color:#222}.blog-article-content p{margin:0 0 20px}.blog-article-content a{color:#1769d2;text-decoration:underline;text-underline-offset:3px}.blog-article-content strong,.blog-article-content b{font-weight:700;color:#222}.blog-article-content ul,.blog-article-content ol{padding-left:26px;margin:0 0 22px}.blog-article-content table{width:100%;border-collapse:collapse;margin:24px 0;font-size:15px;display:block;overflow-x:auto}.blog-article-content th,.blog-article-content td{border:1px solid #d6d3d1;padding:11px 13px;text-align:left;min-width:100px}.blog-article-content th{background:#f5f5f4;color:#222;font-weight:700}.blog-article-content img{max-width:100%;height:auto;border-radius:10px}.blog-article-content blockquote{margin:24px 0;padding:12px 20px;border-left:3px solid #be9d6b;background:#faf8f5}.blog-article-content figure{margin:24px 0}.blog-article-content figcaption{font-size:13px;color:#777}`}</style>
      <div className="blog-article-content" dangerouslySetInnerHTML={{ __html: blog.contentHtml || "" }} />
    </article>
  </main>;
}

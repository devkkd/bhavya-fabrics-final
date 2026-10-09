import Link from "next/link";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bhavyafabrics.com"
).replace(/\/+$/, "");

const FALLBACK_BLOGS = [
  {
    _id: "fallback-1",
    slug: "natural-fibre-revival-linen-cotton-2026",
    title:
      "Natural Fibre Revival: Why Linen and Cotton Dominate 2026 Fashion",
    excerpt:
      "Explore why natural fibres remain essential for breathable, versatile and timeless fabric collections.",
    category: "Textile Trends",
    featuredImage: "/images/home/facility/3.png",
    imageAlt: "Natural textile fibres and fabric production",
    authorName: "Bhavya Fabrics",
    publishedAt: "2026-07-18T09:00:00.000Z",
  },
  {
    _id: "fallback-2",
    slug: "choose-right-gsm-garment-collection",
    title: "How to Choose the Right GSM for Your Garment Collection",
    excerpt:
      "A practical guide to fabric GSM and selecting the right weight for your product range.",
    category: "Wholesale Guide",
    featuredImage: "/images/home/1.png",
    imageAlt: "Fabric selection for a garment collection",
    authorName: "Bhavya Fabrics",
    publishedAt: "2026-07-10T09:00:00.000Z",
  },
  {
    _id: "fallback-3",
    slug: "ajrakh-living-heritage-every-metre",
    title: "Ajrakh: A Living Heritage Woven Into Every Metre",
    excerpt:
      "Learn about the artistry, patterns and textile heritage behind Ajrakh-inspired fabrics.",
    category: "Fabric Knowledge",
    featuredImage: "/images/home/2.png",
    imageAlt: "Traditional textile pattern and fabric",
    authorName: "Bhavya Fabrics",
    publishedAt: "2026-06-28T09:00:00.000Z",
  },
];

export const metadata = {
  title: "Fabric Blog & Wholesale Textile Guides | Bhavya Fabrics",
  description:
    "Explore textile insights, fabric guides, printing techniques and wholesale sourcing advice from Bhavya Fabrics.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

async function getBlogs() {
  try {
    const response = await fetch(`${API}/blogs`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    });

    if (!response.ok) {
      throw new Error("Blog API unavailable");
    }

    const payload = await response.json();

    const blogs = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.blogs)
          ? payload.blogs
          : [];

    if (!blogs.length) return FALLBACK_BLOGS;

    const publishedBlogs = blogs.filter(
      (blog) => !blog.status || blog.status === "published"
    );

    const validBlogs = publishedBlogs.filter(
      (blog) => blog.slug && blog.title
    );

    if (!validBlogs.length) return FALLBACK_BLOGS;

    return validBlogs.sort((a, b) => {
      const dateA = new Date(
        a.publishedAt || a.publishDate || a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.publishedAt || b.publishDate || b.createdAt || 0
      ).getTime();

      return dateB - dateA;
    });
  } catch {
    return FALLBACK_BLOGS;
  }
}

function getDate(blog) {
  const value = blog.publishedAt || blog.publishDate || blog.createdAt;

  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getImage(blog) {
  return (
    blog.featuredImage ||
    blog.imageUrl ||
    blog.image ||
    "/images/home/1.png"
  );
}

function getExcerpt(blog) {
  return (
    blog.excerpt ||
    blog.shortDescription ||
    "Discover textile knowledge, industry insights and fresh inspiration from Bhavya Fabrics."
  );
}

function BlogCard({ blog }) {
  return (
    <article className="blog-card">
      <Link
        href={`/blog/${blog.slug}`}
        className="blog-card-image-link"
        aria-label={`Read ${blog.title}`}
      >
        <div className="blog-card-image">
          <img
            src={getImage(blog)}
            alt={blog.imageAlt || blog.title}
            loading="lazy"
          />
          <span className="blog-image-arrow" aria-hidden="true">
            ↗
          </span>
        </div>
      </Link>

      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span className="blog-category">
            {blog.category || "Fabric Knowledge"}
          </span>

          {getDate(blog) && (
            <>
              <span className="meta-dot" aria-hidden="true">
                •
              </span>
              <time
                dateTime={
                  blog.publishedAt || blog.publishDate || blog.createdAt
                }
              >
                {getDate(blog)}
              </time>
            </>
          )}
        </div>

        <h3>
          <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
        </h3>

        <p className="blog-card-excerpt">{getExcerpt(blog)}</p>

        <div className="blog-card-footer">
          <span className="blog-author">
            By {blog.authorName || "Bhavya Fabrics"}
          </span>

          <Link href={`/blog/${blog.slug}`} className="blog-read-link">
            Read article <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function BlogListingPage() {
  const blogs = await getBlogs();
  const latestBlog = blogs[0];

  return (
    <main className="journal-page">
      <section className="journal-intro">
        <span className="journal-eyebrow">
          <span className="eyebrow-line" />
          THE BHAVYA JOURNAL
          <span className="eyebrow-line" />
        </span>

        <h1>
          The Art of Fabric,
          <br />
          <span>Stories Behind Every Thread.</span>
        </h1>

        <p>
          Discover textile stories, fabric guides and creative inspiration —
          thoughtfully curated for designers, manufacturers and fabric lovers.
        </p>

        <div className="intro-bottom">
          <span>TEXTILE KNOWLEDGE</span>
          <span className="intro-dot" />
          <span>INDUSTRY INSIGHTS</span>
          <span className="intro-dot" />
          <span>CREATIVE INSPIRATION</span>
        </div>
      </section>

      {latestBlog && (
        <section className="latest-section">
          <div className="latest-heading">
            <span className="section-kicker">JUST PUBLISHED</span>
            <h2>Our Latest Story</h2>
            <p>A fresh perspective from the world of textiles.</p>
          </div>

          <article className="latest-feature">
            <Link
              href={`/blog/${latestBlog.slug}`}
              className="latest-image-link"
              aria-label={`Read ${latestBlog.title}`}
            >
              <div className="latest-image">
                <img
                  src={getImage(latestBlog)}
                  alt={latestBlog.imageAlt || latestBlog.title}
                  fetchPriority="high"
                />
                <span className="latest-image-label">LATEST ARTICLE</span>
              </div>
            </Link>

            <div className="latest-details">
              <div className="latest-meta">
                <span className="latest-category">
                  {latestBlog.category || "Fabric Knowledge"}
                </span>

                {getDate(latestBlog) && (
                  <>
                    <span className="meta-dot" aria-hidden="true">
                      •
                    </span>
                    <time
                      dateTime={
                        latestBlog.publishedAt ||
                        latestBlog.publishDate ||
                        latestBlog.createdAt
                      }
                    >
                      {getDate(latestBlog)}
                    </time>
                  </>
                )}
              </div>

              <h2>
                <Link href={`/blog/${latestBlog.slug}`}>
                  {latestBlog.title}
                </Link>
              </h2>

              <p className="latest-excerpt">{getExcerpt(latestBlog)}</p>

              <div className="latest-author">
                <span className="author-mark" aria-hidden="true">
                  B.
                </span>
                <div>
                  <strong>
                    {latestBlog.authorName || "Bhavya Fabrics"}
                  </strong>
                  <span>Textile stories &amp; industry insights</span>
                </div>
              </div>

              <Link
                href={`/blog/${latestBlog.slug}`}
                className="latest-cta"
              >
                Read Full Article <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        </section>
      )}

      <section className="all-blogs-section">
        <div className="all-blogs-heading">
          <div>
            <span className="section-kicker">EXPLORE OUR COLLECTION</span>
            <h2>All Blogs</h2>
          </div>

          <span className="blog-count">
            {String(blogs.length).padStart(2, "0")}{" "}
            {blogs.length === 1 ? "STORY" : "STORIES"}
          </span>
        </div>

        {blogs.length > 0 ? (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <BlogCard key={blog._id || blog.slug} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="empty-blogs">
            <h3>Stories are coming soon.</h3>
            <p>Check back soon for more fabric inspiration.</p>
          </div>
        )}
      </section>

      <section className="journal-footer">
        <span className="footer-ornament" aria-hidden="true">
          ✳
        </span>
        <p>Every fabric has a story. Let’s discover yours.</p>
        <span className="footer-caption">
          BHAVYA FABRICS · EST. IN TEXTILES
        </span>
      </section>

      <style>{`
        .journal-page {
          --journal-ink: #28251f;
          --journal-muted: #777167;
          --journal-gold: #987c4f;
          --journal-line: #e9e2d7;
          min-height: 100vh;
          padding: 0 0 30px;
          background: #fbf9f5;
          color: var(--journal-ink);
          font-family: Arial, Helvetica, sans-serif;
        }

        .journal-page,
        .journal-page * {
          box-sizing: border-box;
        }

        .journal-intro {
          max-width: 1000px;
          margin: 0 auto;
          padding: clamp(62px, 8vw, 104px) 22px 58px;
          text-align: center;
        }

        .journal-eyebrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          color: var(--journal-gold);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
        }

        .eyebrow-line {
          display: inline-block;
          width: 30px;
          height: 1px;
          background: #c8b695;
        }

        .journal-intro h1 {
          margin: 25px 0 22px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: clamp(42px, 6.2vw, 76px);
          font-weight: 500;
          line-height: 1.02;
          letter-spacing: -1.8px;
        }

        .journal-intro h1 span {
          color: #9a8057;
          font-style: italic;
          font-weight: 400;
        }

        .journal-intro > p {
          max-width: 620px;
          margin: 0 auto;
          color: var(--journal-muted);
          font-size: 15px;
          line-height: 1.9;
        }

        .intro-bottom {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-top: 29px;
          color: #827b70;
          font-size: 9px;
          letter-spacing: 1.5px;
        }

        .intro-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #b49a72;
        }

        .latest-section,
        .all-blogs-section {
          max-width: 1280px;
          margin: 0 auto;
          padding-right: 24px;
          padding-left: 24px;
        }

        .latest-section {
          padding-bottom: 82px;
        }

        .latest-heading {
          margin: 0 auto 29px;
          text-align: center;
        }

        .section-kicker {
          display: block;
          margin-bottom: 10px;
          color: var(--journal-gold);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.2px;
        }

        .latest-heading h2,
        .all-blogs-heading h2 {
          margin: 0;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: clamp(36px, 4vw, 48px);
          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.6px;
        }

        .latest-heading > p {
          margin: 12px 0 0;
          color: var(--journal-muted);
          font-size: 13px;
          line-height: 1.7;
        }

        /* Wide landscape featured article */
        .latest-feature {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          width: 100%;
          max-width: 1100px;
          min-height: 390px;
          margin: 0 auto;
          overflow: hidden;
          border: 1px solid #eae3d8;
          background: #fff;
          box-shadow: 0 16px 45px rgba(61, 48, 30, 0.07);
        }

        .latest-image-link {
          display: block;
          min-width: 0;
          color: inherit;
          overflow: hidden;
        }

        .latest-image {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 390px;
          overflow: hidden;
          background: #eee8df;
        }

        .latest-image img {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 390px;
          object-fit: cover;
          object-position: center;
          transition: transform 650ms ease;
        }

        .latest-image-link:hover .latest-image img,
        .blog-card-image-link:hover .blog-card-image img {
          transform: scale(1.045);
        }

        .latest-image-label {
          position: absolute;
          bottom: 22px;
          left: 22px;
          padding: 10px 14px;
          background: rgba(251, 249, 245, 0.97);
          color: #665237;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.8px;
        }

        .latest-details {
          display: flex;
          min-width: 0;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding: clamp(28px, 4vw, 48px);
        }

        .latest-meta,
        .blog-card-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          color: #8b8378;
          font-size: 10px;
        }

        .latest-category,
        .blog-category {
          color: var(--journal-gold);
          font-weight: 700;
        }

        .meta-dot {
          color: #b9a17c;
        }

        .latest-details h2 {
          margin: 20px 0 15px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: clamp(30px, 3.1vw, 43px);
          font-weight: 500;
          line-height: 1.12;
          letter-spacing: -0.5px;
        }

        .latest-details h2 a,
        .blog-card h3 a {
          color: inherit;
          text-decoration: none;
          transition: color 180ms ease;
        }

        .latest-details h2 a:hover,
        .blog-card h3 a:hover {
          color: #92754b;
        }

        .latest-excerpt {
          display: -webkit-box;
          overflow: hidden;
          margin: 0;
          color: #716b62;
          font-size: 13px;
          line-height: 1.9;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 4;
        }

        .latest-author {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 23px;
        }

        .author-mark {
          display: flex;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f0e9de;
          color: #8b7047;
          font-family: Georgia, serif;
          font-size: 19px;
        }

        .latest-author div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .latest-author strong {
          color: #28251f;
          font-size: 12px;
          font-weight: 600;
        }

        .latest-author div span {
          color: #91897e;
          font-size: 10px;
        }

        .latest-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 25px;
          padding: 14px 19px;
          background: #60511f;
          color: #fff;
          font-size: 11px;
          font-weight: 500;
          text-decoration: none;
          transition: background 180ms ease, gap 180ms ease;
        }

        .latest-cta:hover {
          gap: 27px;
          background: #423816;
        }

        /* All blog cards */
        .all-blogs-section {
          padding-bottom: 76px;
        }

        .all-blogs-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 30px;
          padding-bottom: 19px;
          border-bottom: 1px solid var(--journal-line);
        }

        .blog-count {
          padding-bottom: 5px;
          color: #918574;
          font-size: 10px;
          letter-spacing: 1.6px;
          white-space: nowrap;
        }

        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px;
        }

        .blog-card {
          display: flex;
          min-width: 0;
          flex-direction: column;
          border: 1px solid #eee8df;
          background: #fff;
          transition: transform 250ms ease, box-shadow 250ms ease;
        }

        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(61, 48, 30, 0.075);
        }

        .blog-card-image-link {
          display: block;
          color: inherit;
        }

        .blog-card-image {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1.48 / 1;
          background: #eee8df;
        }

        .blog-card-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 650ms ease;
        }

        .blog-image-arrow {
          position: absolute;
          right: 15px;
          bottom: 15px;
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          background: #fbf9f5;
          color: #5e4d2c;
          font-size: 18px;
          transition: background 180ms ease, color 180ms ease;
        }

        .blog-card:hover .blog-image-arrow {
          background: #60511f;
          color: #fff;
        }

        .blog-card-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: flex-start;
          padding: 23px 22px 21px;
        }

        .blog-card-meta {
          min-height: 15px;
          margin-bottom: 13px;
        }

        .blog-card h3 {
          margin: 0 0 13px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: clamp(24px, 2.2vw, 29px);
          font-weight: 500;
          line-height: 1.16;
        }

        .blog-card-excerpt {
          margin: 0 0 20px;
          color: #777167;
          font-size: 12px;
          line-height: 1.85;
        }

        .blog-card-footer {
          display: flex;
          width: 100%;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid #f0ece5;
        }

        .blog-author {
          color: #898174;
          font-size: 10px;
        }

        .blog-read-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #66552f;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
        }

        .blog-read-link span {
          transition: transform 180ms ease;
        }

        .blog-read-link:hover span {
          transform: translateX(4px);
        }

        .empty-blogs {
          padding: 60px 20px;
          border: 1px solid var(--journal-line);
          background: #fff;
          text-align: center;
        }

        .empty-blogs h3 {
          margin: 0 0 10px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 32px;
          font-weight: 500;
        }

        .empty-blogs p {
          color: var(--journal-muted);
          font-size: 13px;
        }

        .journal-footer {
          padding: 44px 20px 28px;
          border-top: 1px solid var(--journal-line);
          text-align: center;
        }

        .footer-ornament {
          color: #a28a63;
          font-size: 22px;
        }

        .journal-footer p {
          margin: 12px 0 16px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: clamp(25px, 3vw, 34px);
          font-style: italic;
        }

        .footer-caption {
          color: #938a7c;
          font-size: 9px;
          letter-spacing: 2px;
        }

        @media (min-width: 1500px) {
          .latest-section,
          .all-blogs-section {
            max-width: 1320px;
          }

          .latest-feature {
            max-width: 1140px;
          }
        }

        @media (max-width: 900px) {
          .latest-feature {
            grid-template-columns: 1fr 1fr;
            min-height: 320px;
          }

          .latest-image,
          .latest-image img {
            min-height: 320px;
          }

          .latest-details {
            padding: 25px;
          }

          .latest-details h2 {
            margin: 16px 0 12px;
            font-size: 31px;
          }

          .latest-excerpt {
            font-size: 12px;
            -webkit-line-clamp: 3;
          }

          .blogs-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }
        }

        @media (max-width: 600px) {
          .journal-intro {
            padding: 55px 20px 43px;
          }

          .journal-intro h1 {
            margin-top: 21px;
            letter-spacing: -0.9px;
          }

          .journal-intro > p {
            font-size: 13px;
            line-height: 1.8;
          }

          .journal-eyebrow {
            gap: 9px;
            font-size: 9px;
            letter-spacing: 2px;
          }

          .eyebrow-line {
            width: 19px;
          }

          .intro-bottom {
            gap: 9px;
            font-size: 8px;
            letter-spacing: 0.8px;
          }

          .latest-section,
          .all-blogs-section {
            padding-right: 16px;
            padding-left: 16px;
          }

          .latest-section {
            padding-bottom: 56px;
          }

          .latest-heading {
            margin-bottom: 23px;
          }

          .latest-heading h2,
          .all-blogs-heading h2 {
            font-size: 36px;
          }

          .latest-heading > p {
            font-size: 12px;
          }

          .latest-feature {
            grid-template-columns: 1fr;
            max-width: 480px;
          }

          .latest-image,
          .latest-image img {
            height: auto;
            min-height: 0;
            aspect-ratio: 16 / 10;
          }

          .latest-image-label {
            bottom: 13px;
            left: 13px;
            padding: 8px 10px;
            font-size: 8px;
          }

          .latest-details {
            padding: 25px 21px 27px;
          }

          .latest-details h2 {
            margin: 17px 0 13px;
            font-size: 34px;
          }

          .latest-excerpt {
            font-size: 12px;
            -webkit-line-clamp: unset;
          }

          .latest-author {
            margin-top: 21px;
          }

          .latest-cta {
            margin-top: 22px;
          }

          .all-blogs-section {
            padding-bottom: 52px;
          }

          .all-blogs-heading {
            margin-bottom: 22px;
          }

          .section-kicker {
            font-size: 8px;
            letter-spacing: 1.4px;
          }

          .blog-count {
            font-size: 8px;
            letter-spacing: 1px;
          }

          .blogs-grid {
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .blog-card-image {
            aspect-ratio: 1.5 / 1;
          }

          .blog-card-content {
            padding: 21px 19px;
          }

          .blog-card h3 {
            font-size: 29px;
          }

          .journal-footer {
            padding-top: 34px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .journal-page *,
          .journal-page *::before,
          .journal-page *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

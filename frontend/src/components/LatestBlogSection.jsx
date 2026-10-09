"use client";


import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";


const FALLBACK_BLOGS = [
  {
    _id: "fallback-natural-fibre-revival",
    slug: "natural-fibre-revival-linen-cotton-2026",
    category: "Textile Trends",
    date: "Jul 18, 2026",
    title: "Natural Fibre Revival: Why Linen and Cotton Dominate 2026 Fashion",
    image: "/images/home/facility/3.png",
  },
  {
    _id: "fallback-gsm-guide",
    slug: "choose-right-gsm-garment-collection",
    category: "Wholesale Guide",
    date: "Jul 10, 2026",
    title: "How to Choose the Right GSM for Your Garment Collection",
    image: "/images/home/1.png",
  },
  {
    _id: "fallback-ajrakh-heritage",
    slug: "ajrakh-living-heritage-every-metre",
    category: "Fabric Knowledge",
    date: "Jun 28, 2026",
    title: "Ajrakh: A Living Heritage Woven Into Every Metre",
    image: "/images/home/2.png",
  },
];

function getBlogsEndpoint() {
  const configuredBase =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5000";
  const base = configuredBase.replace(/\/+$/, "");
  return /\/api$/i.test(base) ? `${base}/blogs` : `${base}/api/blogs`;
}

function formatBlogDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeBlog(blog, index) {
  const title = blog?.title || blog?.name || "Untitled blog";
  const rawSlug = blog?.slug || title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const image =
    blog?.imageUrl ||
    blog?.featuredImage ||
    blog?.image ||
    "/images/home/1.png";
  const dateValue = blog?.publishDate || blog?.publishedAt || blog?.createdAt || blog?.date;

  return {
    _id: blog?._id || blog?.id || `${rawSlug}-${index}`,
    slug: rawSlug,
    category: blog?.category || "Fabric Knowledge",
    date: formatBlogDate(dateValue),
    title,
    image,
  };
}

function extractBlogs(payload) {
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload?.data,
    payload?.blogs,
    payload?.results,
    payload?.data?.blogs,
    payload?.data?.results,
  ];
  return candidates.find(Array.isArray) || [];
}


const COLORS = {

  teal: "#295C65",

  cream: "#FAF8F5",

  darkCream: "#F2EEE9",

  gold: "#BE9D6B",

  navGray: "#696968",

  white: "#FFFFFF",

  ink: "#1A1A1A",

};


export default function LatestBlogSection() {
  const [blogs, setBlogs] = useState(FALLBACK_BLOGS);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBlogs() {
      try {
        const response = await fetch(getBlogsEndpoint(), {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) throw new Error(`Blog API returned ${response.status}`);

        const payload = await response.json();
        const apiBlogs = extractBlogs(payload)
          .filter((blog) => blog && blog.status !== "draft" && blog.isPublished !== false)
          .map(normalizeBlog);

        // If the API is unavailable OR returns no published blogs, keep local fallback data.
        setBlogs(apiBlogs.length > 0 ? apiBlogs : FALLBACK_BLOGS);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Unable to load blogs from API; showing frontend fallback blogs.", error);
          setBlogs(FALLBACK_BLOGS);
        }
      }
    }

    loadBlogs();
    return () => controller.abort();
  }, []);

  return (

    <section

      className="blog-section"

      style={styles.section}

    >

      <style>{`

        /* =====================================================

           ONE MAIN CONTAINER

        \===================================================== */


        .blog-container {

          width: 100%;

          max-width: 1400px;


          margin: 0 auto;


          padding: 0 32px;


          box-sizing: border-box;

        }


        /* =====================================================

           HEADER

        \===================================================== */


        .blog-header {

          width: 100%;


          display: flex;

          align-items: flex-end;

          justify-content: space-between;


          gap: 30px;


          margin-bottom: 48px;

        }


        .blog-heading-wrap {

          min-width: 0;

        }


        .blog-eyebrow {

          display: flex;

          align-items: center;


          gap: 12px;


          margin-bottom: 18px;

        }


        .blog-eyebrow-line {

          width: 38px;

          height: 1px;


          display: inline-block;


          flex-shrink: 0;


          background: ${COLORS.gold};

        }


        .blog-eyebrow-text {

          font-family:

            "Poppins",

            Arial,

            Helvetica,

            sans-serif;


          color: ${COLORS.gold};


          font-size: 12px;


          font-weight: 500;


          letter-spacing: 3px;


          line-height: 1.2;


          text-transform: uppercase;

        }


        .blog-heading {

          margin: 0;


          color: ${COLORS.ink};


          font-family:

            "Cormorant Garamond",

            Georgia,

            serif;


          font-size: 40px;


          font-weight: 600;


          line-height: 1.05;

        }


        .blog-view-all {

          display: inline-flex;

          align-items: center;


          gap: 9px;


          padding-bottom: 7px;


          flex-shrink: 0;


          color: ${COLORS.teal};


          font-family:

            "Poppins",

            Arial,

            Helvetica,

            sans-serif;


          font-size: 14px;


          font-weight: 500;


          line-height: 1.2;


          text-decoration: none;


          white-space: nowrap;


          transition:

            gap 0.25s ease,

            opacity 0.25s ease;

        }


        .blog-view-all:hover {

          gap: 13px;

          opacity: 0.82;

        }


        /* =====================================================

           BLOG GRID

        \===================================================== */


        .blog-grid {

          width: 100%;


          display: grid;


          grid-template-columns:

            repeat(3, minmax(0, 1fr));


          gap: 30px;

        }


        /* =====================================================

           CARD

        \===================================================== */


        .blog-card {

          width: 100%;

          min-width: 0;


          overflow: hidden;


          background: ${COLORS.white};


          border:

            1px solid

            rgba(41, 92, 101, 0.08);


          border-radius: 18px;


          box-sizing: border-box;


          transition:

            transform 0.3s ease,

            box-shadow 0.3s ease,

            border-color 0.3s ease;

        }


        @media (hover: hover) and (pointer: fine) {

          .blog-card:hover {

            transform: translateY(-6px);


            border-color:

              rgba(41, 92, 101, 0.12);


            box-shadow:

              0 16px 32px

              rgba(41, 92, 101, 0.10);

          }


          .blog-card:hover .blog-image {

            transform: scale(1.04);

          }


          .blog-card:hover .blog-read-more {

            gap: 10px;

          }

        }


        /* =====================================================

           IMAGE

        \===================================================== */


        .blog-image-wrap {

          position: relative;


          width: 100%;


          aspect-ratio: 16 / 9;


          overflow: hidden;


          background: #ddd8d1;

        }


        .blog-image {

          width: 100%;

          height: 100%;


          display: block;


          object-fit: cover;


          transition:

            transform 0.5s ease;

        }


        /* =====================================================

           CATEGORY BADGE

        \===================================================== */


        .blog-category {

          position: absolute;


          top: 14px;

          left: 14px;


          z-index: 2;


          display: inline-flex;

          align-items: center;


          padding: 7px 14px;


          border-radius: 999px;


          background:

            rgba(190, 157, 107, 0.96);


          color: #FFFFFF;


          font-family:

            "Poppins",

            Arial,

            Helvetica,

            sans-serif;


          font-size: 12px;


          font-weight: 600;


          line-height: 1.2;


          white-space: nowrap;


          box-sizing: border-box;

        }


        /* =====================================================

           CARD CONTENT

        \===================================================== */


        .blog-content {

          width: 100%;


          padding: 28px 28px 26px;


          box-sizing: border-box;

        }


        /* =====================================================

           DATE

        \===================================================== */


        .blog-date {

          display: flex;

          align-items: center;


          gap: 8px;


          margin-bottom: 16px;


          color: ${COLORS.navGray};


          font-family:

            "Poppins",

            Arial,

            Helvetica,

            sans-serif;


          font-size: 12px;


          font-weight: 400;


          line-height: 1.2;

        }


        .blog-date-icon {

          width: 15px;

          height: 15px;


          flex-shrink: 0;


          color: ${COLORS.gold};

        }


        /* =====================================================

           TITLE

        \===================================================== */


        .blog-title {

          margin: 0;


          color: ${COLORS.ink};


          font-family:

            "Cormorant Garamond",

            Georgia,

            serif;


          font-size: 20px;


          font-weight: 400;


          line-height: 1.28;

        }


        /* =====================================================

           READ MORE

        \===================================================== */


        .blog-read-more {

          display: inline-flex;

          align-items: center;


          gap: 7px;


          margin-top: 18px;


          color: ${COLORS.teal};


          font-family:

            "Poppins",

            Arial,

            Helvetica,

            sans-serif;


          font-size: 13px;


          font-weight: 600;


          line-height: 1.2;


          text-decoration: none;


          transition:

            gap 0.25s ease,

            opacity 0.25s ease;

        }


        .blog-read-more:hover {

          opacity: 0.8;

        }


        /* =====================================================

           TABLET

        \===================================================== */


        @media (max-width: 1100px) {

          .blog-heading {

            font-size: 46px;

          }


          .blog-grid {

            gap: 20px;

          }


          .blog-content {

            padding: 24px 22px 24px;

          }


          .blog-title {

            font-size: 22px;

          }

        }


        /* =====================================================

           MOBILE

        \===================================================== */


        @media (max-width: 700px) {

          .blog-container {

            width: 100%;

            max-width: 100%;


            margin: 0;


            padding: 0 16px;

          }


          .blog-header {

            display: block;


            margin-bottom: 30px;

          }


          .blog-eyebrow {

            margin-bottom: 14px;

          }


          .blog-eyebrow-line {

            width: 24px;

          }


          .blog-eyebrow-text {

            font-size: 10px;

            letter-spacing: 2px;

          }


          .blog-heading {

            font-size: 34px;

            line-height: 1.08;

          }


          .blog-view-all {

            margin-top: 16px;


            padding-bottom: 0;


            font-size: 13px;

          }


          /* =================================================

             MOBILE SLIDER

          \================================================= */


          .blog-grid {

            display: flex;


            width: calc(100% + 32px);


            margin-left: -16px;


            padding:

              0 16px 12px;


            gap: 12px;


            overflow-x: auto;

            overflow-y: hidden;


            scroll-snap-type: x mandatory;


            -webkit-overflow-scrolling: touch;


            scrollbar-width: none;


            -ms-overflow-style: none;


            touch-action: pan-x;


            box-sizing: border-box;

          }


          .blog-grid::-webkit-scrollbar {

            display: none;

          }


          /* 2 cards visible at one time */


          .blog-card {

            flex:

              0 0 calc((100% - 12px) / 2);


            width:

              calc((100% - 12px) / 2);


            min-width:

              calc((100% - 12px) / 2);


            max-width:

              calc((100% - 12px) / 2);


            border-radius: 14px;


            scroll-snap-align: start;


            box-shadow:

              0 3px 10px

              rgba(0, 0, 0, 0.05);

          }


          .blog-image-wrap {

            aspect-ratio: 1 / 1;

          }


          .blog-category {

            top: 10px;

            left: 10px;


            padding:

              6px 10px;


            font-size: 9px;


            max-width:

              calc(100% - 20px);


            overflow: hidden;


            text-overflow: ellipsis;

          }


          .blog-content {

            padding:

              16px 13px 17px;

          }


          .blog-date {

            gap: 5px;


            margin-bottom: 10px;


            font-size: 9.5px;

          }


          .blog-date-icon {

            width: 12px;

            height: 12px;

          }


          .blog-title {

            font-size: 16px;


            line-height: 1.25;

          }


          .blog-read-more {

            gap: 5px;


            margin-top: 12px;


            font-size: 10px;

          }


          /* Disable desktop hover lift on touch */

          .blog-card:hover {

            transform: none;

          }


          .blog-card:active {

            transform: scale(0.99);

          }

        }


        /* =====================================================

           SMALL MOBILE

        \===================================================== */


        @media (max-width: 480px) {

          .blog-heading {

            font-size: 30px;

          }


          .blog-card {

            flex-basis:

              calc((100% - 10px) / 2);


            width:

              calc((100% - 10px) / 2);


            min-width:

              calc((100% - 10px) / 2);


            max-width:

              calc((100% - 10px) / 2);

          }


          .blog-grid {

            gap: 10px;

          }


          .blog-category {

            font-size: 8.5px;


            padding:

              5px 8px;

          }


          .blog-content {

            padding:

              14px 11px 15px;

          }


          .blog-date {

            font-size: 9px;

          }


          .blog-title {

            font-size: 15px;

          }


          .blog-read-more {

            font-size: 9.5px;

          }

        }


        /* =====================================================

           VERY SMALL MOBILE

        \===================================================== */


        @media (max-width: 360px) {

          .blog-heading {

            font-size: 28px;

          }


          .blog-title {

            font-size: 14px;

          }


          .blog-date {

            font-size: 8.5px;

          }


          .blog-read-more {

            font-size: 9px;

          }

        }


        /* =====================================================

           REDUCED MOTION

        \===================================================== */


        @media (prefers-reduced-motion: reduce) {

          .blog-card,

          .blog-image,

          .blog-view-all,

          .blog-read-more {

            transition: none !important;

          }


          .blog-grid {

            scroll-behavior: auto !important;

          }

        }

      `}</style>


      {/* =====================================================

          ONE MAIN CONTAINER

      \===================================================== */}


      <div className="blog-container">


        {/* =====================================================

            HEADER

        \===================================================== */}


        <div className="blog-header">


          <div className="blog-heading-wrap">

            <div className="blog-eyebrow">

              <span className="blog-eyebrow-line" />


              <span className="blog-eyebrow-text">

                Insights

              </span>

            </div>


            <h2 className="blog-heading">

              Latest from Our Blog

            </h2>

          </div>


          <a

            href="/blog"

            className="blog-view-all"

          >

            View All Posts


            <ArrowRight

              size={17}

              strokeWidth={2}

            />

          </a>

        </div>


        {/* =====================================================

            BLOG CARDS

        \===================================================== */}


        <div className="blog-grid">

          {blogs.slice(0, 3).map((blog) => (

            <article

              key={blog._id || blog.slug || blog.title}

              className="blog-card"

            >

              {/* IMAGE */}


              <div className="blog-image-wrap">


                <Image

                  src={blog.image}

                unoptimized

                  alt={blog.title}

                  fill

                  sizes="

                    (max-width: 700px) 50vw,

                    33vw

                  "

                  className="blog-image"

                />


                <span className="blog-category">

                  {blog.category}

                </span>

              </div>


              {/* CONTENT */}


              <div className="blog-content">


                <div className="blog-date">

                  <Clock3

                    className="blog-date-icon"

                    strokeWidth={1.8}

                  />


                  <span>

                    {blog.date}

                  </span>

                </div>


                <h3 className="blog-title">

                  {blog.title}

                </h3>


                <a

                  href={`/blog/${encodeURIComponent(blog.slug)}`}

                  className="blog-read-more"

                >

                  Read More


                  <ArrowRight

                    size={14}

                    strokeWidth={2}

                  />

                </a>

              </div>

            </article>

          ))}

        </div>

      </div>

    </section>

  );

}


const styles = {

  section: {

    width: "100%",


    background: COLORS.cream,


    /*

      Section controls only

      vertical spacing.

    */

    padding: "64px 0",


    boxSizing: "border-box",

  },

};
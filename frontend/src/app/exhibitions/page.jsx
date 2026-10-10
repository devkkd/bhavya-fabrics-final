"use client";

import { useEffect, useState, useMemo } from "react";
import { MapPin, Clock, CalendarDays, ArrowRight } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

/* =========================================================
   HELPERS
========================================================= */
function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTimeLeft(startDate) {
  const distance = new Date(startDate).getTime() - Date.now();

  if (Number.isNaN(distance) || distance < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
}

const pad = (n) => String(n).padStart(2, "0");

/* =========================================================
   COUNTDOWN
   (defined outside the page so it is not re-created on every
   render; the first value is calculated immediately, so there
   is no 0-0-0-0 flash on refresh)
========================================================= */
function CountdownTimer({ startDate }) {
  const [countdown, setCountdown] = useState(() => getTimeLeft(startDate));

  useEffect(() => {
    setCountdown(getTimeLeft(startDate));

    const interval = setInterval(() => {
      const distance = new Date(startDate).getTime() - Date.now();

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setCountdown(getTimeLeft(startDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  const cells = [
    { value: countdown.days, label: "Days" },
    { value: countdown.hours, label: "Hours" },
    { value: countdown.minutes, label: "Mins" },
    { value: countdown.seconds, label: "Secs" },
  ];

  return (
    <div className="ex-countdown" role="timer" aria-label="Time left until the exhibition starts">
      {cells.map((cell) => (
        <div className="ex-countdown-cell" key={cell.label}>
          <span className="ex-countdown-num">{pad(cell.value)}</span>
          <span className="ex-countdown-label">{cell.label}</span>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const res = await fetch(`${API_URL}/exhibitions`);
        const data = await res.json();
        if (data.success) {
          setExhibitions(data.exhibitions);
        }
      } catch (error) {
        console.error("Error fetching exhibitions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

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

  return (
    <div className="ex-page">
      <div className="ex-container">
        {/* ---------- Page header ---------- */}
        <header className="ex-hero">
          <h1 className="ex-hero-title">Our Exhibitions</h1>
          <span className="ex-ornament" aria-hidden="true" />
          <p className="ex-hero-sub">
            Discover Bhavya Fabrics at leading international trade fairs and exhibitions around the world
          </p>
        </header>

        {loading ? (
          <div className="ex-loading">
            <div className="ex-spinner" role="status" aria-label="Loading exhibitions" />
          </div>
        ) : (
          <>
            {/* ---------- Upcoming ---------- */}
            {upcoming.length > 0 && (
              <section className="ex-section">
                <div className="ex-section-head">
                  <div>
                    <p className="ex-section-kicker">Coming soon</p>
                    <h2 className="ex-section-title">Upcoming Exhibitions</h2>
                  </div>
                </div>

                <div className="ex-grid ex-grid--upcoming">
                  {upcoming.map((ex) => {
                    const start = new Date(ex.startDate);

                    return (
                      <article className="ex-card ex-card--upcoming" key={ex._id}>
                        <div className="ex-media">
                          {ex.image?.url ? (
                            <img
                              className="ex-media-img"
                              src={ex.image.url}
                              alt={ex.image.alt || ex.title}
                              loading="lazy"
                            />
                          ) : (
                            <div className="ex-media-placeholder" aria-hidden="true">
                              <CalendarDays size={36} strokeWidth={1.4} />
                            </div>
                          )}

                          <div className="ex-date-chip" aria-hidden="true">
                            <span className="ex-date-day">
                              {pad(start.getDate())}
                            </span>
                            <span className="ex-date-month">
                              {start.toLocaleDateString("en-IN", { month: "short" })}
                            </span>
                          </div>
                        </div>

                        <div className="ex-countdown-wrap">
                          <CountdownTimer startDate={ex.startDate} />
                        </div>

                        <div className="ex-body">
                          <h3 className="ex-card-title">{ex.title}</h3>

                          <ul className="ex-meta">
                            <li>
                              <MapPin size={16} strokeWidth={1.9} className="ex-meta-icon ex-meta-icon--teal" />
                              <span>{ex.location}</span>
                            </li>
                            <li>
                              <Clock size={16} strokeWidth={1.9} className="ex-meta-icon ex-meta-icon--gold" />
                              <span>
                                {formatDate(ex.startDate)}
                                {ex.time ? ` • ${ex.time}` : ""}
                              </span>
                            </li>
                          </ul>

                          {ex.description && <p className="ex-desc">{ex.description}</p>}

                          <a href="#contact" className="ex-cta">
                            Learn More
                            <ArrowRight size={16} strokeWidth={2.2} />
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ---------- Past ---------- */}
            {past.length > 0 && (
              <section className="ex-section ex-section--past">
                <div className="ex-past-head">
                  <p className="ex-section-kicker">Our journey continues</p>
                  <h2 className="ex-past-title">Past Exhibitions</h2>
                  <span className="ex-ornament" aria-hidden="true" />
                  <p className="ex-hero-sub">
                    Celebrating our presence at leading international trade fairs and exhibitions worldwide
                  </p>
                </div>

                <div className="ex-grid ex-grid--past">
                  {past.map((ex) => (
                    <article className="ex-card ex-card--past" key={ex._id}>
                      <div className="ex-media ex-media--past">
                        {ex.image?.url ? (
                          <img
                            className="ex-media-img"
                            src={ex.image.url}
                            alt={ex.image.alt || ex.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="ex-media-placeholder" aria-hidden="true">
                            <CalendarDays size={36} strokeWidth={1.4} />
                          </div>
                        )}
                        <span className="ex-concluded">Concluded</span>
                      </div>

                      <div className="ex-body ex-body--past">
                        <h3 className="ex-card-title ex-card-title--past">{ex.title}</h3>

                        <ul className="ex-meta">
                          <li>
                            <MapPin size={16} strokeWidth={1.9} className="ex-meta-icon ex-meta-icon--teal" />
                            <span>{ex.location}</span>
                          </li>
                          <li>
                            <Clock size={16} strokeWidth={1.9} className="ex-meta-icon ex-meta-icon--gold" />
                            <span>
                              {formatDate(ex.startDate)} to {formatDate(ex.endDate)}
                            </span>
                          </li>
                        </ul>

                        {ex.description && <p className="ex-desc ex-desc--past">{ex.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* ---------- Empty: nothing at all ---------- */}
            {upcoming.length === 0 && past.length === 0 && (
              <div className="ex-empty">
                <p className="ex-empty-title">No Exhibitions Yet</p>
                <p className="ex-empty-text">Check back soon for upcoming exhibitions</p>
              </div>
            )}

            {/* ---------- Empty: no past exhibitions ---------- */}
            {past.length === 0 && upcoming.length > 0 && (
              <section className="ex-section ex-section--past">
                <div className="ex-past-head">
                  <p className="ex-section-kicker">Our journey continues</p>
                  <h2 className="ex-past-title">Past Exhibitions</h2>
                  <span className="ex-ornament" aria-hidden="true" />
                  <p className="ex-hero-sub">
                    Celebrating our presence at leading international trade fairs and exhibitions worldwide
                  </p>
                </div>

                <div className="ex-coming">
                  <p className="ex-coming-title">Coming Soon</p>
                  <p className="ex-coming-text">
                    Our exhibition highlights and gallery will appear here as we continue our journey around the world
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <style>{`
        .ex-page {
          --ex-teal: #295c65;
          --ex-teal-deep: #1b4047;
          --ex-gold: #be9d6b;
          --ex-gold-deep: #9c7c4d;
          --ex-cream: #faf8f5;
          --ex-ink: #1d2426;
          --ex-muted: #5f6b6d;
          --ex-line: #e8e1d6;

          width: 100%;
          min-height: 100vh;
          background:
            radial-gradient(900px 340px at 50% -80px, rgba(190, 157, 107, 0.16), transparent 70%),
            var(--ex-cream);
          color: var(--ex-ink);
          font-family: "Poppins", "Segoe UI", system-ui, sans-serif;
        }

        .ex-page *, .ex-page *::before, .ex-page *::after { box-sizing: border-box; }

        .ex-container {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
          padding: 64px 32px 96px;
        }

        /* ---------- Hero ---------- */
        .ex-hero { text-align: center; margin-bottom: 72px; }

        .ex-hero-title {
          margin: 0;
          font-family: "Playfair Display", Georgia, "Times New Roman", serif;
          font-size: clamp(32px, 5.2vw, 54px);
          font-weight: 700;
          letter-spacing: -0.4px;
          line-height: 1.12;
          color: var(--ex-teal-deep);
        }

        .ex-ornament {
          display: block;
          position: relative;
          width: 96px;
          height: 1px;
          margin: 22px auto 20px;
          background: linear-gradient(90deg, transparent, var(--ex-gold), transparent);
        }

        .ex-ornament::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 7px;
          height: 7px;
          background: var(--ex-gold);
          transform: translate(-50%, -50%) rotate(45deg);
        }

        .ex-hero-sub {
          margin: 0 auto;
          max-width: 620px;
          font-size: 15.5px;
          line-height: 1.75;
          color: var(--ex-muted);
        }

        /* ---------- Sections ---------- */
        .ex-section { margin-bottom: 40px; }

        .ex-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--ex-line);
          position: relative;
        }

        .ex-section-head::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -1px;
          width: 72px;
          height: 2px;
          background: var(--ex-gold);
        }

        .ex-section-kicker {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.4px;
          color: var(--ex-gold-deep);
        }

        .ex-section-title {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(24px, 3.2vw, 34px);
          font-weight: 700;
          line-height: 1.2;
          color: var(--ex-ink);
        }

        .ex-section--past { margin-top: 96px; padding-top: 64px; position: relative; }

        .ex-section--past::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--ex-gold) 25%, var(--ex-gold) 75%, transparent);
        }

        .ex-past-head { text-align: center; margin-bottom: 52px; }

        .ex-past-head .ex-section-kicker { margin-bottom: 10px; }

        .ex-past-title {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(30px, 4.6vw, 46px);
          font-weight: 700;
          letter-spacing: -0.3px;
          line-height: 1.15;
          color: var(--ex-teal-deep);
        }

        /* ---------- Grids ---------- */
        .ex-grid { display: grid; gap: 28px; }
        .ex-grid--upcoming { grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); }
        .ex-grid--past { grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr)); gap: 32px; }

        /* ---------- Card ---------- */
        .ex-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-width: 0;
          background: #fff;
          border: 1px solid var(--ex-line);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(27, 64, 71, 0.04), 0 10px 28px rgba(27, 64, 71, 0.07);
          transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease;
        }

        @media (hover: hover) {
          .ex-card:hover {
            transform: translateY(-6px);
            border-color: rgba(190, 157, 107, 0.6);
            box-shadow: 0 4px 10px rgba(27, 64, 71, 0.06), 0 22px 44px rgba(27, 64, 71, 0.14);
          }
          .ex-card:hover .ex-media-img { transform: scale(1.05); }
        }

        .ex-media {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: linear-gradient(135deg, #e9e2d6, #f3eee5);
        }

        .ex-media--past { aspect-ratio: 4 / 3; }

        .ex-media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        .ex-media::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 47, 52, 0) 55%, rgba(15, 47, 52, 0.32) 100%);
          pointer-events: none;
        }

        .ex-media-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ex-gold-deep);
          opacity: 0.7;
        }

        .ex-date-chip {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 54px;
          padding: 8px 10px 7px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 6px 16px rgba(15, 47, 52, 0.18);
          line-height: 1;
        }

        .ex-date-day {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--ex-teal-deep);
        }

        .ex-date-month {
          margin-top: 4px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.6px;
          color: var(--ex-gold-deep);
        }

        .ex-concluded {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 1;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(27, 64, 71, 0.9);
          border: 1px solid rgba(230, 207, 159, 0.55);
          color: #f6efe0;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.4px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* ---------- Countdown ---------- */
        .ex-countdown-wrap {
          padding: 16px 18px;
          background: linear-gradient(120deg, var(--ex-teal-deep), var(--ex-teal));
          border-top: 2px solid var(--ex-gold);
        }

        .ex-countdown {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .ex-countdown-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 9px 4px 8px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(255, 255, 255, 0.16);
          line-height: 1;
        }

        .ex-countdown-num {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          font-variant-numeric: tabular-nums;
        }

        .ex-countdown-label {
          margin-top: 6px;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.4px;
          color: #e6cf9f;
        }

        /* ---------- Body ---------- */
        .ex-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
          padding: 22px 22px 24px;
        }

        .ex-body--past { padding: 26px 26px 28px; gap: 16px; }

        .ex-card-title {
          margin: 0;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 20px;
          font-weight: 700;
          line-height: 1.35;
          color: var(--ex-ink);
          overflow-wrap: anywhere;
        }

        .ex-card-title--past { font-size: 21px; }

        .ex-meta {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .ex-meta li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--ex-muted);
          overflow-wrap: anywhere;
        }

        .ex-meta-icon { flex-shrink: 0; margin-top: 3px; }
        .ex-meta-icon--teal { color: var(--ex-teal); }
        .ex-meta-icon--gold { color: var(--ex-gold-deep); }

        .ex-desc {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.7;
          color: #6d7779;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ex-desc--past { -webkit-line-clamp: 2; }

        .ex-cta {
          margin-top: auto;
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 999px;
          background: var(--ex-teal);
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.2px;
          text-decoration: none;
          box-shadow: 0 6px 14px rgba(41, 92, 101, 0.25);
          transition: background 0.25s ease, gap 0.25s ease, box-shadow 0.25s ease;
        }

        .ex-cta:hover {
          background: var(--ex-teal-deep);
          gap: 12px;
          box-shadow: 0 8px 18px rgba(27, 64, 71, 0.32);
        }

        .ex-cta:focus-visible,
        .ex-card:focus-visible {
          outline: 3px solid rgba(190, 157, 107, 0.6);
          outline-offset: 2px;
        }

        /* ---------- Loading / empty ---------- */
        .ex-loading { text-align: center; padding: 90px 20px; }

        .ex-spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 3px solid #e8e1d9;
          border-top-color: var(--ex-teal);
          border-radius: 50%;
          animation: ex-spin 0.9s linear infinite;
        }

        @keyframes ex-spin { to { transform: rotate(360deg); } }

        .ex-empty { text-align: center; padding: 72px 20px; }

        .ex-empty-title {
          margin: 0 0 8px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: #7b8486;
        }

        .ex-empty-text { margin: 0; font-size: 14px; color: #98a0a2; }

        .ex-coming {
          text-align: center;
          padding: 72px 28px;
          border-radius: 20px;
          border: 1.5px dashed rgba(190, 157, 107, 0.55);
          background: linear-gradient(135deg, rgba(41, 92, 101, 0.05), rgba(190, 157, 107, 0.07));
        }

        .ex-coming-title {
          margin: 0 0 12px;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--ex-teal);
        }

        .ex-coming-text {
          margin: 0 auto;
          max-width: 520px;
          font-size: 14.5px;
          line-height: 1.7;
          color: var(--ex-muted);
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */
        @media (max-width: 900px) {
          .ex-container { padding: 48px 20px 72px; }
          .ex-hero { margin-bottom: 52px; }
          .ex-section--past { margin-top: 72px; padding-top: 48px; }
          .ex-past-head { margin-bottom: 40px; }
          .ex-grid { gap: 22px; }
          .ex-grid--past { gap: 24px; }
        }

        @media (max-width: 600px) {
          .ex-container { padding: 36px 16px 60px; }
          .ex-hero { margin-bottom: 40px; }
          .ex-hero-sub { font-size: 14.5px; line-height: 1.7; }
          .ex-ornament { margin: 18px auto 16px; width: 80px; }
          .ex-section-head { margin-bottom: 24px; }
          .ex-grid--upcoming, .ex-grid--past { grid-template-columns: 1fr; }
          .ex-card { border-radius: 14px; }
          .ex-body { padding: 18px 18px 20px; }
          .ex-body--past { padding: 20px 18px 22px; }
          .ex-card-title, .ex-card-title--past { font-size: 18.5px; }
          .ex-countdown-wrap { padding: 14px; }
          .ex-countdown { gap: 6px; }
          .ex-countdown-num { font-size: 19px; }
          .ex-countdown-label { font-size: 10px; }
          .ex-cta { width: 100%; justify-content: center; }
          .ex-coming { padding: 48px 20px; }
        }

        @media (max-width: 360px) {
          .ex-container { padding-left: 12px; padding-right: 12px; }
          .ex-countdown-num { font-size: 17px; }
          .ex-date-chip { top: 10px; left: 10px; }
          .ex-concluded { top: 10px; right: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ex-card, .ex-media-img, .ex-cta { transition: none !important; }
          .ex-spinner { animation-duration: 2s; }
        }
      `}</style>
    </div>
  );
}
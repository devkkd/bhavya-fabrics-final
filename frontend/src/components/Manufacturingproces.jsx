"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faScissors,
  faPrint,
  faFlask,
  faCircleCheck,
  faShieldHalved,
  faBoxesStacked,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

const STEPS = [
  { label: "Design", desc: "Pattern creation and artwork finalization", icon: faScissors },
  { label: "Printing", desc: "Rotary, flatbed and hand block printing", icon: faPrint },
  { label: "Dyeing", desc: "AZO-free reactive and vat dyeing", icon: faFlask },
  { label: "Finishing", desc: "Calendering, sanforizing and softening", icon: faCircleCheck },
  { label: "Quality Check", desc: "GSM, shrinkage and colorfastness testing", icon: faShieldHalved },
  { label: "Packing", desc: "Export-grade roll and folded packing", icon: faBoxesStacked },
  { label: "Shipping", desc: "Worldwide door-to-door delivery", icon: faGlobe },
];

const GROW_MS = 6000; // line filling up
const HOLD_MS = 900; // pause when fully complete
const RESET_MS = 500; // pause when empty, before restarting
const MOBILE_BREAKPOINT = 768;

// fixed pixel sizes (NOT clamp/em) so the icon is exactly this size the
// instant it paints — no dependency on any external stylesheet finishing
// loading, which is what causes the "large icon flash" on refresh.
const CIRCLE_PX = 64; // circle diameter on desktop, scales down via CSS below
const ICON_PX = 22;

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function ManufacturingProcess() {
  const n = STEPS.length;
  const positions = STEPS.map((_, i) => (i / (n - 1)) * 100);

  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const phaseRef = useRef("reset");
  const phaseStartRef = useRef(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    phaseStartRef.current = performance.now();

    function frame(now) {
      const elapsed = now - phaseStartRef.current;
      const phase = phaseRef.current;
      let pct = 0;

      if (phase === "reset") {
        pct = 0;
        if (elapsed >= RESET_MS) {
          phaseRef.current = "growing";
          phaseStartRef.current = now;
        }
      } else if (phase === "growing") {
        const t = Math.min(elapsed / GROW_MS, 1);
        pct = easeInOutQuad(t) * 100;
        if (t >= 1) {
          phaseRef.current = "hold";
          phaseStartRef.current = now;
        }
      } else if (phase === "hold") {
        pct = 100;
        if (elapsed >= HOLD_MS) {
          phaseRef.current = "reset";
          phaseStartRef.current = now;
        }
      }

      setProgress(pct);

      if (scrollRef.current && window.innerWidth <= MOBILE_BREAKPOINT) {
        const el = scrollRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          el.scrollLeft = (pct / 100) * maxScroll;
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section
      style={{
        "--teal": "#295C65",
        "--gold": "#BE9D6B",
        "--gold-soft": "rgba(190,157,107,0.35)",
        "--white": "#FFFFFF",
        background: "var(--teal)",
        padding: "clamp(48px, 8vw, 96px) clamp(16px, 5vw, 40px)",
        boxSizing: "border-box",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Plain <style> tag — no styled-jsx / css-in-js plugin required.
          Works identically under any Next.js setup and can't fail to load. */}
      <style>{`
        .mp-eyebrow{display:flex;align-items:center;justify-content:center;gap:14px;color:var(--gold);font-family:'Poppins',sans-serif;font-weight:500;letter-spacing:3px;font-size:clamp(11px,1.6vw,13px);margin-bottom:14px;}
        .mp-rule{width:32px;height:1px;background:var(--gold);display:inline-block;}
        .mp-title{text-align:center;font-family:'Cormorant Garamond',serif;font-weight:600;color:var(--white);font-size:clamp(30px,5.4vw,56px);margin:0 0 clamp(40px,6vw,72px) 0;line-height:1.15;}
        .mp-track-outer{position:relative;width:100%;max-width:1400px;margin:0 auto;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
        .mp-track-outer::-webkit-scrollbar{display:none;}
        .mp-steps{display:flex;flex-wrap:nowrap;align-items:flex-start;justify-content:space-between;gap:clamp(8px,1.8vw,24px);position:relative;min-width:640px;padding-top:34px;}
        .mp-line-bg,.mp-line-fg{position:absolute;top:calc(34px + (${CIRCLE_PX}px / 2));left:calc(${CIRCLE_PX}px / 2);height:1px;transform:translateY(-0.5px);}
        .mp-line-bg{right:calc(${CIRCLE_PX}px / 2);background:rgba(255,255,255,0.18);}
        .mp-line-fg{background:var(--gold);width:0%;}
        .mp-step{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;flex:1 1 0;min-width:80px;padding:0 2px;}
        .mp-icon-wrap{position:relative;width:${CIRCLE_PX}px;height:${CIRCLE_PX}px;max-width:18vw;max-height:18vw;}
        .mp-circle{width:100%;height:100%;border-radius:50%;border:1.5px solid var(--gold-soft);background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;z-index:2;transition:border-color .5s ease,background .5s ease,box-shadow .5s ease;}
        .mp-circle.active{border-color:var(--gold);background:rgba(190,157,107,0.16);box-shadow:0 0 0 5px rgba(190,157,107,0.1);}
        .mp-icon-svg{transition:transform .4s ease;}
        .mp-circle.active .mp-icon-svg{transform:scale(1.08);}
        .mp-badge{position:absolute;top:-6px;right:-6px;width:23px;height:23px;border-radius:50%;background:var(--gold);color:var(--teal);font-family:'Poppins',sans-serif;font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center;z-index:3;opacity:0;transform:scale(0.2) translateY(6px);transition:opacity .35s cubic-bezier(.34,1.56,.64,1),transform .45s cubic-bezier(.34,1.56,.64,1);}
        .mp-badge.show{opacity:1;transform:scale(1) translateY(0);}
        .mp-label{font-family:'Poppins',sans-serif;font-weight:600;color:var(--white);font-size:clamp(12px,1.6vw,17px);margin-top:clamp(12px,2vw,18px);white-space:nowrap;}
        .mp-desc{font-family:'Poppins',sans-serif;font-weight:400;color:rgba(255,255,255,0.62);font-size:clamp(9.5px,1.2vw,13px);line-height:1.45;margin-top:6px;max-width:150px;}
        @media (max-width:768px){
          .mp-steps{min-width:820px;}
          .mp-desc{max-width:120px;}
          .mp-icon-wrap{width:52px;height:52px;max-width:52px;max-height:52px;}
        }
      `}</style>

      <div className="mp-eyebrow">
        <span className="mp-rule" /> HOW WE WORK <span className="mp-rule" />
      </div>
      <h2 className="mp-title">Manufacturing Process</h2>

      <div className="mp-track-outer" ref={scrollRef}>
        <div className="mp-steps">
          <div className="mp-line-bg" />
          <div className="mp-line-fg" style={{ width: `${progress}%` }} />

          {STEPS.map((step, i) => {
            const active = progress >= positions[i] - 0.6;
            return (
              <div className="mp-step" key={step.label}>
                <div className="mp-icon-wrap">
                  <div className={`mp-circle${active ? " active" : ""}`}>
                    <FontAwesomeIcon
                      icon={step.icon}
                      className="mp-icon-svg"
                      /* fixed inline size + color: painted this way on the very
                         first frame, so it can never render oversized before
                         a stylesheet finishes loading (the refresh glitch) */
                      style={{
                        width: ICON_PX,
                        height: ICON_PX,
                        color: "#BE9D6B",
                        display: "block",
                      }}
                    />
                  </div>
                  <div className={`mp-badge${active ? " show" : ""}`}>{i + 1}</div>
                </div>
                <div className="mp-label">{step.label}</div>
                <div className="mp-desc">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ── Floating particle component ─────────────────────────────────────────── */
function Particle({ style }) {
  return (
    <span
      className="not-found-particle"
      style={style}
      aria-hidden="true"
    />
  );
}

/* ── Main 404 Page ────────────────────────────────────────────────────────── */
export default function NotFoundPage() {
  const navigate = useNavigate();
  const countRef = useRef(null);

  /* Countdown redirect after 15 s */
  useEffect(() => {
    let seconds = 15;
    const el = countRef.current;
    if (!el) return;

    el.textContent = seconds;

    const interval = setInterval(() => {
      seconds -= 1;
      if (el) el.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(interval);
        navigate('/');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  /* Generate deterministic particle positions */
  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 37 + 5) % 100}%`,
    top: `${(i * 53 + 10) % 100}%`,
    animationDelay: `${(i * 0.4) % 4}s`,
    animationDuration: `${4 + (i % 5)}s`,
    width: `${6 + (i % 4) * 4}px`,
    height: `${6 + (i % 4) * 4}px`,
    opacity: 0.15 + (i % 5) * 0.07,
  }));

  return (
    <>
      <style>{`
        .nf-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #064e3b 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ── Animated mesh orbs ── */
        .nf-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: nfOrb 8s ease-in-out infinite alternate;
        }
        .nf-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%);
          top: -150px; left: -150px;
          animation-delay: 0s;
        }
        .nf-orb-2 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          animation-delay: -3s;
        }
        .nf-orb-3 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
          top: 40%; left: 55%;
          animation-delay: -5s;
        }
        @keyframes nfOrb {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 20px) scale(1.08); }
        }

        /* ── Floating particles ── */
        .not-found-particle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          animation: nfFloat ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes nfFloat {
          0%   { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-24px) rotate(180deg); }
        }

        /* ── Glassmorphism card ── */
        .nf-card {
          position: relative;
          z-index: 10;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 28px;
          padding: 56px 48px 48px;
          text-align: center;
          max-width: 560px;
          width: calc(100% - 40px);
          box-shadow:
            0 32px 64px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.15);
        }

        /* ── 404 number ── */
        .nf-number {
          font-size: clamp(96px, 20vw, 160px);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -4px;
          background: linear-gradient(135deg, #60a5fa 0%, #34d399 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          display: inline-block;
          animation: nfPulse 3s ease-in-out infinite;
        }
        @keyframes nfPulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(96,165,250,0.4)); }
          50%       { filter: drop-shadow(0 0 40px rgba(52,211,153,0.6)); }
        }

        /* ── Medical cross icon ── */
        .nf-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          margin: 0 auto 20px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(59,130,246,0.25), rgba(16,185,129,0.25));
          border: 1px solid rgba(255,255,255,0.15);
          animation: nfIconBob 3s ease-in-out infinite;
        }
        @keyframes nfIconBob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .nf-icon-wrap svg {
          width: 36px; height: 36px;
        }

        /* ── Typography ── */
        .nf-title {
          color: #f1f5f9;
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 700;
          margin: 16px 0 8px;
          letter-spacing: -0.3px;
        }
        .nf-subtitle {
          color: rgba(203, 213, 225, 0.8);
          font-size: 15px;
          line-height: 1.7;
          margin: 0 0 36px;
        }

        /* ── Divider ── */
        .nf-divider {
          width: 60px;
          height: 3px;
          border-radius: 2px;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          margin: 0 auto 32px;
        }

        /* ── Countdown badge ── */
        .nf-countdown {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(148,163,184,0.9);
          margin-bottom: 32px;
        }
        .nf-countdown-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 24px;
          padding: 0 8px;
          border-radius: 12px;
          background: rgba(59,130,246,0.2);
          border: 1px solid rgba(59,130,246,0.3);
          color: #93c5fd;
          font-weight: 700;
          font-size: 13px;
          font-variant-numeric: tabular-nums;
          transition: background 0.3s;
        }

        /* ── Action buttons ── */
        .nf-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 440px) {
          .nf-actions { flex-direction: row; }
        }

        .nf-btn-primary {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          color: #fff;
          background: linear-gradient(135deg, #2563eb, #059669);
          box-shadow: 0 4px 20px rgba(37,99,235,0.35);
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }
        .nf-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,99,235,0.5);
          filter: brightness(1.1);
        }
        .nf-btn-primary:active { transform: translateY(0); }

        .nf-btn-secondary {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          color: #cbd5e1;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
        }
        .nf-btn-secondary:hover {
          background: rgba(255,255,255,0.14);
          color: #f1f5f9;
          transform: translateY(-2px);
        }
        .nf-btn-secondary:active { transform: translateY(0); }

        /* ── Quick links ── */
        .nf-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 28px;
        }
        .nf-link-chip {
          font-size: 12px;
          color: rgba(148,163,184,0.85);
          text-decoration: none;
          padding: 5px 14px;
          border-radius: 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.18s ease;
        }
        .nf-link-chip:hover {
          background: rgba(59,130,246,0.18);
          border-color: rgba(59,130,246,0.3);
          color: #93c5fd;
        }
      `}</style>

      <div className="nf-page">
        {/* Orbs */}
        <div className="nf-orb nf-orb-1" aria-hidden="true" />
        <div className="nf-orb nf-orb-2" aria-hidden="true" />
        <div className="nf-orb nf-orb-3" aria-hidden="true" />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <Particle key={i} style={p} />
        ))}

        {/* Card */}
        <div className="nf-card" role="main">
          {/* Icon */}
          <div className="nf-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H8c-.55 0-1-.45-1-1s.45-1 1-1h3V7c0-.55.45-1 1-1z"
                fill="url(#nfIconGrad)"
              />
              <defs>
                <linearGradient id="nfIconGrad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 404 Number */}
          <div className="nf-number" aria-label="404">404</div>

          {/* Divider */}
          <div className="nf-divider" aria-hidden="true" />

          {/* Title & subtitle */}
          <h1 className="nf-title">Page Not Found</h1>
          <p className="nf-subtitle">
            The page you're looking for doesn't exist or may have been moved.
            Let's get you back to finding the care you need.
          </p>

          {/* Countdown */}
          <div className="nf-countdown" aria-live="polite" aria-atomic="true">
            <span>Redirecting to home in</span>
            <span className="nf-countdown-pill">
              <span ref={countRef}>15</span>
            </span>
            <span>seconds</span>
          </div>

          {/* Actions */}
          <div className="nf-actions">
            <Link to="/" className="nf-btn-primary" id="nf-home-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              Back to Home
            </Link>
            <Link to="/help" className="nf-btn-secondary" id="nf-help-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
              Help Center
            </Link>
          </div>

          {/* Quick links */}
          <nav className="nf-links" aria-label="Quick navigation links">
            <Link to="/services" className="nf-link-chip">Services</Link>
            <Link to="/about" className="nf-link-chip">About</Link>
            <Link to="/contact" className="nf-link-chip">Contact</Link>
            <Link to="/favorites" className="nf-link-chip">Wishlist</Link>
            <Link to="/join-provider" className="nf-link-chip">Become a Provider</Link>
          </nav>
        </div>
      </div>
    </>
  );
}

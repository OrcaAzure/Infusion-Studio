/** SSR-safe welcome waves — inline SVG + CSS (no canvas / JS). */
export function WelcomeHeroBg() {
  return (
    <div className="welcome-hero-bg" aria-hidden>
      <div className="welcome-hero-glow welcome-hero-glow--1" />
      <div className="welcome-hero-glow welcome-hero-glow--2" />
      <div className="welcome-hero-glow welcome-hero-glow--3" />

      <svg
        className="welcome-hero-svg welcome-hero-svg--a"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="welcome-wave-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
            <stop offset="35%" stopColor="#34d399" stopOpacity="1" />
            <stop offset="65%" stopColor="#6ee7b7" stopOpacity="1" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="welcome-wave-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="65%" stopColor="#7dd3fc" stopOpacity="1" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="welcome-wave-violet" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="35%" stopColor="#a78bfa" stopOpacity="1" />
            <stop offset="65%" stopColor="#c4b5fd" stopOpacity="1" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 C120,40 200,160 320,100 S520,40 640,100 S760,160 880,100"
          fill="none"
          stroke="url(#welcome-wave-emerald)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M0,130 C140,70 220,190 340,130 S540,70 660,130 S780,190 900,130"
          fill="none"
          stroke="url(#welcome-wave-cyan)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="welcome-hero-svg welcome-hero-svg--b"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="welcome-wave-emerald-b" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
            <stop offset="35%" stopColor="#34d399" stopOpacity="1" />
            <stop offset="65%" stopColor="#6ee7b7" stopOpacity="1" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="welcome-wave-violet-b" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="35%" stopColor="#a78bfa" stopOpacity="1" />
            <stop offset="65%" stopColor="#c4b5fd" stopOpacity="1" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,90 C100,150 220,30 340,90 S540,150 660,90 S780,30 900,90"
          fill="none"
          stroke="url(#welcome-wave-violet-b)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M0,150 C130,90 210,210 330,150 S530,90 650,150 S770,210 890,150"
          fill="none"
          stroke="url(#welcome-wave-emerald-b)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

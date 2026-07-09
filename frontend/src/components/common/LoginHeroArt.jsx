/**
 * Hand-built line-art illustration for the AuthLayout hero panel:
 * a plated dish, wine glass, and cutlery, softened by an ambient
 * warm glow — suggestive of a dim fine-dining room without being a
 * literal photograph.
 *
 * Built as an SVG (not a hotlinked stock photo) deliberately: it's
 * copyright-safe, has zero network dependency/load time, and its
 * stroke color inherits the brand palette exactly. If you later want
 * to swap this for real photography of your own restaurant, replace
 * the <LoginHeroArt /> usage in AuthLayout.jsx with a plain
 * background-image div — the translucent overlay gradient already
 * sitting on top of it will keep the motto text legible either way.
 */
export function LoginHeroArt({ className }) {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Ambient pendant-light glows */}
      <circle cx="470" cy="120" r="140" fill="url(#glow-warm)" opacity="0.35" />
      <circle cx="90" cy="480" r="110" fill="url(#glow-cool)" opacity="0.25" />

      {/* Plate */}
      <circle cx="330" cy="330" r="150" stroke="#FDBA74" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="330" cy="330" r="112" stroke="#FDBA74" strokeOpacity="0.5" strokeWidth="1.5" />

      {/* Plated garnish — a few soft leaf/food dabs, purely abstract */}
      <path
        d="M300 300c14-18 40-24 58-12s20 40 6 56-42 16-58 2-20-30-6-46Z"
        stroke="#FED7AA"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <circle cx="345" cy="345" r="5" fill="#FB923C" fillOpacity="0.5" />
      <circle cx="310" cy="320" r="3" fill="#FB923C" fillOpacity="0.4" />

      {/* Fork */}
      <g stroke="#E2E8F0" strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round">
        <line x1="150" y1="230" x2="150" y2="440" />
        <line x1="138" y1="230" x2="138" y2="270" />
        <line x1="150" y1="230" x2="150" y2="270" />
        <line x1="162" y1="230" x2="162" y2="270" />
        <path d="M138 270c0 8 5.5 14 12 14s12-6 12-14" />
      </g>

      {/* Knife */}
      <g stroke="#E2E8F0" strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round">
        <line x1="512" y1="230" x2="512" y2="440" />
        <path d="M500 230c0 26 8 48 12 60 4-12 12-34 12-60" />
      </g>

      {/* Wine glass, upper right */}
      <g stroke="#FDBA74" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round">
        <path d="M470 90c0 26-16 40-16 58s10 24 16 24 16-6 16-24-16-32-16-58Z" />
        <line x1="470" y1="172" x2="470" y2="210" />
        <line x1="446" y1="222" x2="494" y2="222" />
      </g>

      {/* Scattered bokeh dots for room ambience */}
      {[
        [80, 90], [140, 60], [520, 340], [560, 420], [40, 260],
        [500, 520], [220, 60], [380, 480],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 2.5 : 1.5} fill="#FDBA74" fillOpacity="0.3" />
      ))}

      <defs>
        <radialGradient id="glow-warm" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(470 120) rotate(90) scale(140)">
          <stop stopColor="#F97316" stopOpacity="0.8" />
          <stop offset="1" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow-cool" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(90 480) rotate(90) scale(110)">
          <stop stopColor="#38BDF8" stopOpacity="0.6" />
          <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
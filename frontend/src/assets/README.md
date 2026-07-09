# assets/

Static assets imported directly into components (illustrations, brand
marks beyond the inline `Logo` component, background textures, etc.)
live here so Vite can hash and bundle them.

Nothing lives here yet in Phase 1 — the app currently only uses the
`Logo` component (inline SVG via `lucide-react`) and `public/favicon.svg`,
which is served as-is rather than imported. This folder starts
populating once module-specific illustrations are needed (e.g. the
"no orders yet" empty-state art, receipt/branding images for POS).

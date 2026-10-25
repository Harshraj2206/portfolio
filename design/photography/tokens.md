# Photography Page Design Tokens & Specification

Derived from Stitch MCP generation and strict alignment with the portfolio's neutral glass design system (`tokens.css`, `glass.css`).

## 1. Generated Stitch Screens
The following screens were generated with the Stitch MCP server (Project `Glass Portfolio` ID: `12507645313979650743`) and exported as PNG references:
- `01_loader_desktop.png`: 1440px desktop loader state with monumental metallic tabular counter, "Loading frames" label, brand wordmark "Harsh.", and faint 3-card arrival arc.
- `02_settled_wall_desktop.png`: 1440px desktop settled state showing header navigation ("Back to portfolio"), middle concave perspective ring of portrait glass cards, and bottom row with metallic gradient typography and live count chips.
- `03_settled_wall_mobile.png`: 390px mobile view adapted for compact touch screen, responsive card clamp sizing, and touch-drag affordance.
- `04_lightbox_desktop.png`: Centered expanded 9:16 portrait glass modal with FLIP target, frosted glass backdrop blur (32px), surrounding close/nav capsules, and metadata panel.
- `05_card_anatomy_desktop.png`: Card anatomy matrix detailing 3 responsive sizes (mobile, desktop default, active/settled), 28px continuous squircle curvature, gradient borders, inner specular highlight, and interactive hover/focus states.

## 2. Core Tokens & Properties

### Geometry & Radii
- `--r-pill: 999px` (All button capsules, navigation chips, close pills)
- `--r-card-lg: 28px` (Portrait glass cards, modal containers)
- `--r-card-md: 20px` (Secondary panels)
- `--card-aspect: 9 / 16` (All placeholder cards and expanded lightboxes)

### Color Palette (Obsidian Neutral Glass)
- `--bg-canvas: #050505` (Deep space canvas substrate)
- `--color-text-primary: #F2F2F4` (Primary typography and active borders)
- `--color-text-secondary: #C9C9CF` (Subtitles, labels, frame numbers)
- `--color-text-badge: #A8A8AF` (Telemetry and tags)
- Metallic heading text: `linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%)` with `-webkit-background-clip: text`

### Glass Surface & Specular Highlights
- Card Fill: `--glass-chip-fill` (`linear-gradient(180deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.045))` over dark translucent backing `rgba(10, 10, 12, 0.94)`)
- Card Border: 1px specular gradient `linear-gradient(180deg, rgba(255, 255, 255, 0.26), rgba(255, 255, 255, 0.06) 60%, rgba(255, 255, 255, 0.10))`
- Inner Highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.16)`
- Subtle Diagonal Light Sweep: `linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, transparent 60%)`
- Backdrop Filter: `blur(20px) saturate(140%)`

### Interactive States
- **Hover**: Card `scale(1.05)`, fill luminance increases by 4%, specular edge glow intensifies without layout shift.
- **Focus**: `outline: 2px solid rgba(255, 255, 255, 0.8)`, `outline-offset: 2px`.
- **Motion Blur**: `filter: blur(N px) skewX(N deg)` proportional to rotational velocity exceeding 40 deg/s.

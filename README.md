# Liquid Glass Portfolio — College Student Portfolio

A production-ready, macOS "Liquid Glass" college student portfolio designed to get shortlisted for competitive software engineering internships and junior roles.

Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**, powered by a single source of truth (`src/data/content.ts`), and pre-designed with **Google Stitch**.

---

## 💎 Design & Aesthetics

The portfolio implements Apple's macOS Liquid Glass design language:
- **Continuous Curvature:** 24px–36px rounded corners on cards and modal dialogs, and pill-shaped navigation.
- **Dynamic Translucency:** `backdrop-filter: blur(24px) saturate(180%)` with specular highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.45)`).
- **Curated macOS Light & Dark Modes:** System-aware theme toggle with instant, smooth transitions.
- **Native macOS Micro-interactions:** Specular cursor light reflection, floating interactive dock with magnification physics, traffic-light window controls, and spring pill segmented controls.
- **Accessibility & Contrast:** Fully passes WCAG AA contrast standards; includes `@media (prefers-reduced-motion)` and `@media (prefers-reduced-transparency)` graceful solid-surface fallbacks.

Design tokens are exported in [`design/tokens.json`](file:///d:/PORTFOLIO/design/tokens.json) and generated via Google Stitch project `projects/12507645313979650743`.

---

## ⚡ Primary Recruiter Goals

1. **10-Second Understanding:** Recruiter Quick View card delivers name, target role, graduation year, core stack, top metrics, and a one-click "Copy 1-line blurb" button.
2. **60-Second Skill Verification:** Deep-dive case studies covering the Problem, Architecture, Engineering Trade-offs, and measurable Outcomes, plus direct links to live demos and GitHub repositories.
3. **Proof of Quality:** Single-page scroll-spy navigation, 0 lint warnings, type safety, SEO metadata, RSS/sitemap feeds, and honeypot spam protection.

---

## 🛠️ Tech Stack

- **Framework:** React 18 with Vite & TypeScript
- **Styling:** Tailwind CSS with custom glassmorphism utilities & CSS variables
- **Motion:** Framer Motion (spring transitions, layout animations)
- **Icons:** Lucide React
- **Celebration & Polish:** Canvas Confetti

---

## 📋 Checklist: What to Edit to Add Your Details

You only need to edit **one single file** for 99% of your changes:  
👉 [`src/data/content.ts`](file:///d:/PORTFOLIO/src/data/content.ts)

### 1. Personal & Hero Information
- [ ] Change `preferredName`, `fullName`, and `pronouns`
- [ ] Update `targetRole` (e.g. *"Summer 2027 Software Engineering Intern"*)
- [ ] Update `location` and `university`
- [ ] Replace `blurb` and `shortBio`
- [ ] Set `availabilityStatus` to `'available'` | `'interviewing'` | `'busy'`

### 2. Social Profiles & Links
- [ ] In `socialLinks`, replace URLs for GitHub, LinkedIn, X, Email, and LeetCode
- [ ] Toggle `enabled: true / false` to hide or show specific links

### 3. Résumé PDF
- [ ] Replace [`public/resume.pdf`](file:///d:/PORTFOLIO/public/resume.pdf) with your actual PDF resume.

### 4. Recruiter 10-Second Quick View
- [ ] Update `oneLineSummary` with your personalized elevator pitch
- [ ] Adjust `keySkills` to highlight your top 3 standout technical abilities

### 5. Stats Bento Row
- [ ] Update `stats` array (e.g. GPA, Projects Shipped, Monthly Active Users, Hackathons)

### 6. Projects & Flagship Case Studies
- [ ] In `projects`, customize your projects
- [ ] Fill in `caseStudy`:
  - `problem`: The pain point or bottleneck
  - `solution`: How you solved it
  - `architecture`: Distributed setup, caching, database, or UI layer
  - `tradeoffs`: Engineering decisions and technical compromises
  - `metrics`: Bullet points with quantitative impact (e.g. latency, throughput)
- [ ] Set `githubUrl` and `liveDemoUrl`

### 7. Education & Experience Timeline
- [ ] In `timeline`, customize your internships, research, university coursework, or leadership roles.

### 8. Skills Linked to Projects
- [ ] In `skills`, update your languages, frameworks, developer tools, and concepts.
- [ ] Each skill has `projectIds: ['aurakv', ...]` linking it directly to the projects where recruiters can inspect its usage!

### 9. Recommendations & Testimonials
- [ ] In `recommendations`, add quotes from managers, professors, mentors, or peer collaborators.

### 10. Contact Form
- [ ] In `contact`, replace `emailAddress`
- [ ] (Optional) Add your Formspree endpoint (`formspreeEndpoint`) for serverless email forwarding. Without an endpoint, the form automatically falls back to a clean `mailto:` link.

---

## 🚀 Getting Started Locally

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Building for Production

```bash
# Type check and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

The production output will be generated inside the `/dist` directory.

---

## 🚢 Deployment Guide

### Deploy to Vercel (Recommended)
1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." -> "Project"**.
3. Import your GitHub repository.
4. Framework Preset will auto-detect as **Vite**.
5. Click **Deploy**.

### Deploy to Netlify
1. Connect your repository in [netlify.com](https://netlify.com).
2. Set Build command: `npm run build`
3. Set Publish directory: `dist`
4. Deploy!

### Deploy to GitHub Pages
1. In `vite.config.ts`, set `base: '/<repository-name>/'`.
2. Build with `npm run build`.
3. Push the `dist` folder to your `gh-pages` branch.

---

## 📂 Project Structure

```
d:/PORTFOLIO
├── design/
│   ├── screens/
│   │   └── stitch_thumbnail.png       # Generated Stitch UI design
│   └── tokens.json                    # Stitch & Apple Liquid Glass tokens
├── public/
│   ├── favicon.svg
│   ├── resume.pdf                     # PDF Résumé download
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── common/                    # Glass UI primitives
│   │   │   ├── AvailabilityBadge.tsx  # Pulsating status badge
│   │   │   ├── BackToTop.tsx          # Floating return to top
│   │   │   ├── Dock.tsx               # macOS interactive dock
│   │   │   ├── GlassButton.tsx        # Pill buttons with gloss
│   │   │   ├── GlassCard.tsx          # Specular light reflection card
│   │   │   ├── MobileNav.tsx          # Mobile bar & glass sheet menu
│   │   │   ├── PillNav.tsx            # Sticky floating glass pill nav
│   │   │   ├── SectionHeading.tsx     # Apple typography scale
│   │   │   ├── SegmentedControl.tsx   # Spring pill category filter
│   │   │   ├── SocialLinks.tsx        # Safe external links
│   │   │   ├── StatCounter.tsx        # InView animated counter
│   │   │   ├── ThemeToggle.tsx        # Light/dark mode toggle
│   │   │   └── WindowFrame.tsx        # macOS traffic lights window
│   │   └── sections/
│   │       ├── AboutSection.tsx       # Bio & engineering principles
│   │       ├── CaseStudyModal.tsx     # Deep-dive architecture modal
│   │       ├── ContactSection.tsx     # Form with honeypot & mailto fallback
│   │       ├── Footer.tsx             # Colophon & quick navigation
│   │       ├── Hero.tsx               # 10-second elevator pitch
│   │       ├── HighlightTiers.tsx     # 3-pillar engineering focus
│   │       ├── ProjectsGrid.tsx       # Work portfolio with category tabs
│   │       ├── Recommendations.tsx    # Peer & mentor testimonials
│   │       ├── RecruiterQuickView.tsx # 10-second candidate synopsis
│   │       ├── SkillsSection.tsx      # Capabilities linked to projects
│   │       ├── StatsRow.tsx           # Bento metrics row
│   │       ├── Timeline.tsx           # Education & experience record
│   │       └── WritingSection.tsx     # Engineering notes & learnings
│   ├── data/
│   │   ├── content.schema.ts          # TypeScript type definitions
│   │   └── content.ts                 # SINGLE SOURCE OF TRUTH (edit here!)
│   ├── hooks/
│   │   ├── useAnalytics.ts            # Privacy-friendly click telemetry
│   │   ├── useReducedMotion.ts        # Accessibility motion detector
│   │   ├── useScrollSpy.ts            # Active section detector
│   │   └── useTheme.ts                # Light / Dark / System theme state
│   ├── styles/
│   │   ├── glass.css                  # Apple Liquid Glass CSS design tokens
│   │   └── index.css                  # Tailwind directives & mesh gradient
│   ├── App.tsx                        # Main application container
│   ├── main.tsx                       # Entry point
│   └── vite-env.d.ts                  # Vite types
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

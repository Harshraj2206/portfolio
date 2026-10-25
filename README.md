# Liquid Glass Portfolio — Harsh Raj

A production-ready, macOS neutral black glass portfolio built for **Harsh Raj**, a 2nd-year CSE (AI & ML) student at Jain University Global Campus.

Features:
- Single source of truth data architecture (`src/data/content.ts`).
- Automatic demo data fallback layer (`src/data/demo.ts` + `src/data/resolve.ts`) with clear "Demo" chips and non-navigating links.
- Real data automatically replaces demo data without touching UI code.
- Interactive macOS dock with magnification physics, spring cross-fading Highlights tabs, responsive sliding bubble navigation, and verified AA contrast.
- Zero placeholder text in production: `npm run content:report` tracks remaining demo data, and `VITE_FAIL_ON_DEMO=true` enforces pure real data on build.

---

## ⚡ How to Replace Demo Data

`src/data/content.ts` is the **only file you need to edit**. When you add real data for any field or array, the corresponding demo data and "Demo" chips disappear automatically.

Run this command at any time to see every field still using demo data:
```bash
npm run content:report
```

### 1. Projects
In `src/data/content.ts`, populate the optional fields for **LandSafe** or **NammaRoute**:
```ts
// Example: Adding your role and tech stack to LandSafe
{
  id: "landsafe",
  title: "LandSafe",
  // ... existing fields ...
  role: "AI & ML Model Developer",
  techStack: ["Python", "GIS", "Scikit-learn", "FastAPI"],
  results: [
    "87% prediction accuracy for landslide-prone zones",
    "Real-time evacuation routing across 8 northeastern states",
  ],
  context: "Smart India Hackathon 2024 Finalist",
  challenges: "Handled sparse geospatial rainfall telemetry during heavy monsoon seasons by interpolating historical weather radar.",
  githubUrl: "https://github.com/your-username/landsafe",
}
```
*Note on 3rd Project*: The 3rd demo project (`demo-ml-project`) is automatically removed as soon as you add a 3rd real project to the `projects` array in `content.ts`.

---

### 2. Highlights — Achievements
Add real hackathons, competitions, or honors:
```ts
achievements: [
  {
    id: "sih-2024",
    title: "Smart India Hackathon",
    eventOrOrg: "Ministry of Education, Govt of India",
    year: "2024",
    result: "Grand Finalist",
  },
],
```
*Rule*: Adding 1 real item replaces the entire demo achievements list.

---

### 3. Highlights — Certifications
Add your courses and certificates:
```ts
certifications: [
  {
    id: "nptel-python",
    title: "Programming, Data Structures and Algorithms Using Python",
    issuer: "NPTEL",
    date: "Sep 2024",
    credentialUrl: "https://nptel.ac.in/noc/Ecertificate/?q=...",
  },
],
```

---

### 4. Highlights — Activities
Harsh's real Turing Club activity is already saved in `content.ts`:
```ts
activities: [
  {
    id: "act-turing-photography",
    title: "Photography team member, Turing Club, Jain University Global Campus",
    dates: "",
  },
],
```
Because this real item exists, demo activities are never shown unless you clear this array.

---

### 5. Highlights — Recommendations
Add quotes from professors, project mentors, or supervisors:
```ts
recommendations: [
  {
    id: "rec-prof-sharma",
    authorName: "Dr. A. Sharma",
    authorRole: "Professor, Department of CSE",
    organization: "Jain University Global Campus",
    avatarInitials: "AS",
    quote: "Harsh demonstrates exceptional initiative in applying machine learning algorithms to practical challenges.",
  },
],
```
When `VITE_SHOW_DEMO=false` is set and this array is empty, the recommendations section is completely hidden.

---

### 6. Social Dock ("Find me online")
Enable and provide URLs for your social profiles:
```ts
social: {
  github: {
    url: "https://github.com/harshraj",
    enabled: true,
  },
  linkedin: {
    url: "https://linkedin.com/in/harshraj-cse",
    enabled: true,
  },
  instagram: {
    url: "https://instagram.com/harshraj_shots",
    enabled: true,
  },
  facebook: {
    url: "https://facebook.com/harshraj",
    enabled: true,
  },
},
```
You can also toggle between centered section dock and fixed side rail in `content.ts`:
```ts
socialBar: {
  placement: "section", // or "side-rail" (fixed vertical dock on right screen edge)
},
```

---

### 7. Contact Details
Update your email and response time:
```ts
contact: {
  headline: "Start a conversation",
  subtext: "Feel free to reach out for internship opportunities, project collaborations, or discussions.",
  emailAddress: "harsh.raj@example.com",
  responseTime: "Typically replies within 1-2 days", // leave empty "" to hide this badge
},
```

---

### 8. Beyond Code (Creative Showcase)
When you are ready to publish photos or art pieces:
```ts
creative: {
  heading: "Beyond code",
  introLine: "When I'm not coding, I'm usually behind a camera or with a paintbrush.",
  photography: {
    title: "Photography & videography",
    description: "I love photography and videography, and I'm part of the Turing Club photography team at my university.",
    buttonText: "See my photo and video work",
    url: "/photography",
    ready: true, // change from false to true to activate button
    iconName: "camera",
  },
  artCraft: {
    title: "Art & craft",
    description: "I love art and craft, from painting to handmade pieces.",
    buttonText: "See my painting and craft",
    url: "/art-craft",
    ready: true, // change from false to true to activate button
    iconName: "palette",
  },
},
```

---

### 9. How to Add Photos and Videos (`/photography`)

The photography showcase at `/photography` features a 3D cylindrical gallery ring with camera motion, inertia-driven drag/wheel controls, velocity blur, and an expanding lightbox.

#### 📁 Dropping Media Files
Simply drop any photos or video clips into:
```
src/assets/photography/
```
- **Supported Formats:** Images (`.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`) and videos (`.mp4`, `.webm`).
- **Discovery:** Files are automatically discovered via `import.meta.glob` and ordered by natural filename sorting (e.g., `frame_01.jpg`, `frame_02.jpg`, `frame_10.jpg`).
- **Demo vs Real Data:** If the directory has no media files, the ring renders 14 elegant glass demo placeholders with a visible "Demo" chip. **Adding real files automatically replaces ALL demo placeholders.**

#### 📝 Adding Captions & Metadata (`captions.json`)
You can optionally provide a `src/assets/photography/captions.json` file to specify rich titles, captions, dates, and locations for each item:
```json
{
  "campus_golden_hour.jpg": {
    "title": "Jain Global Campus at Dusk",
    "caption": "Golden light striking the engineering quadrangle after monsoon showers.",
    "year": "2024",
    "location": "Bengaluru, KA"
  },
  "turing_hackathon_recap.mp4": {
    "title": "Turing Club 24h Hackathon Recap",
    "caption": "Highlights reel capturing team demos, late-night debugging, and prize ceremonies.",
    "year": "2024",
    "location": "Turing Lab"
  }
}
```
*Note: Any file without an entry in `captions.json` automatically generates a clean fallback title and frame counter.*

#### 🔄 How the 3D Ring Automatically Adjusts
- **Zero Card Overlap:** For any count $N$ from 1 to 200+, the ring geometry dynamically computes $M = \max(N, 14)$ and radius $R = (W + G) / (2 \cdot \tan(\pi / M))$. Spacing is guaranteed never to overlap.
- **Repeat Padding for Low $N$:** When $N < 14$, items repeat around the cylinder so the amphitheater curvature remains visually complete.
- **Performance Culling:** Cards outside $\pm 110^\circ$ of view are culled from DOM painting, maintaining 60 FPS even with high card counts. Videos off-screen are paused and unloaded automatically.

#### ⚙️ Customizing Sizing, Speed & Physics
You can tune all visual and physics parameters in `src/config/gallery.ts`:
- `CARD_ASPECT`: Aspect ratio (default `9 / 16`).
- `AUTO_ROTATE`: Idle rotation speed in degrees per second (default `6`).
- `INTRO_SECONDS`: Duration of intro timeline animation (default `4.2`).
- `MIN_RING_CARDS`: Minimum angular divisions for the ring (default `14`).
- `MOTION_BLUR`: Toggle velocity-proportional blur and skew (default `true`).
- `PHYSICS`: Friction damping (`0.92`), touch sensitivity, and drag multipliers.

---

### 10. Replacing the Resume PDF
The repository ships with a clean one-page demo resume with a visible "DEMO" watermark at:
```
public/resume.pdf
```
To use your real resume:
1. Export your official 1-page PDF resume.
2. Save it directly to `public/resume.pdf` (overwriting the demo file).
3. Nothing else needs to change! All Resume buttons on the site (Nav, Hero, Contact, Footer) will instantly download your real PDF with the filename `Harsh_Raj_Resume.pdf`.

---

## 🚀 Local Development & Build Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Audit remaining demo data
npm run content:report

# Production build (automatically checks demo data and prints warning)
npm run build

# Strict build (FAILS if any demo data remains)
VITE_FAIL_ON_DEMO=true npm run build
```

---

## 🌐 Deploying to Vercel with a Custom Domain

### Step 1: Deploy to Vercel
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: portfolio ready for deployment"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite** (detected automatically).
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **"Deploy"**.

### Step 2: Connect a Custom Domain (e.g. `harshraj.dev`)
1. In your Vercel Project Dashboard, navigate to **Settings** > **Domains**.
2. Enter your custom domain (for example, `harshraj.dev` or `www.harshraj.dev`) and click **Add**.
3. Configure your DNS records at your domain registrar (Namecheap, Cloudflare, Google Domains, GoDaddy, etc.):
   - **For apex domain (`harshraj.dev`)**:
     - Type: `A`
     - Name: `@`
     - Value: `76.76.21.21`
   - **For `www` subdomain (`www.harshraj.dev`)**:
     - Type: `CNAME`
     - Name: `www`
     - Value: `cname.vercel-dns.com`
4. Vercel automatically issues and renews an SSL/TLS certificate for your domain within minutes.
5. In `src/data/content.ts`, update `seo.canonicalUrl` to `https://harshraj.dev`.

---

## 🔊 UI Sound-Effects System & Audio Overrides

The portfolio features a zero-asset UI sound-effects system synthesized entirely in code using the Web Audio API (zero audio files, zero network downloads, < 6KB added footprint).

### Sound Groups & Delegation
Sounds are assigned automatically per container group:
- **GROUP "nav"** (`data-sound-group="nav"`): Soft, low, dry mechanical tick (≤ 20ms). Assigned to desktop PillNav, mobile top bar, mobile bottom floating tab bar, and drawer navigation.
- **GROUP "social"** (`data-sound-group="social"`): Bright, light tink with a ringing bell tail (~250ms). Assigned to the Social Dock, side-rail icons, footer social row, and contact social row.
- **GROUP "button"** (Default fallback): Crisp, high, very short click (≤ 15ms). Automatically assigned to all buttons, links styled as buttons, tabs, filters, and action triggers.
- **SPECIAL "state"**: Heavy thunk with a soft swept whoosh (~550ms). Fired on sound toggle turning ON, contact-form submission success, Skip intro, and opening case studies.
- **OPTIONAL "hover"**: 6ms tick at 1200Hz on fine-pointer devices for navigation and social links.

### Controls & Shortcuts
- **Floating Sound Button**: 44x44px glass button fixed at the top-right (`z-index: 60`), with crossfading icons and sound-wave animation.
- **Keyboard Shortcut**: Press `M` to toggle sound on/off from anywhere (automatically ignored while typing in input fields).
- **Persistence**: Saved under `localStorage["portfolio:sound"]`.
- **Dev Sound Lab**: Visit `/sound-lab` in development mode (`npm run dev`) to inspect synthesizers, tune volume/pitch, preview groups, and copy sound parameters.

### 🎵 Optional File Override
By default, all sounds are synthesized mathematically in code. However, you can optionally override any sound with a custom MP3 audio file:
1. Place your audio files inside `public/sounds/`:
   - `public/sounds/nav.mp3`
   - `public/sounds/social.mp3`
   - `public/sounds/button.mp3`
   - `public/sounds/state.mp3`
2. If any of these files exist, the sound engine automatically uses the audio file instead of the synthesized version for that specific sound.
3. If the files do not exist, the sound engine seamlessly defaults to pure Web Audio API code synthesis.


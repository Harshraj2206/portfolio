import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAssets() {
  console.log('[generate-assets] Starting asset generation...');

  // 1. Generate apple-touch-icon.png (180x180)
  const appleTouchSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <rect width="180" height="180" rx="40" fill="#050505" />
      <rect x="2" y="2" width="176" height="176" rx="38" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4" />
      <text x="90" y="126" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="105" font-weight="700" fill="#FFFFFF" text-anchor="middle">H</text>
    </svg>
  `;

  await sharp(Buffer.from(appleTouchSvg))
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));
  console.log('✅ Generated public/apple-touch-icon.png (180x180)');

  // 2. Generate og-image.png (1200x630)
  const portraitPath = path.resolve('public/images/harsh-raj.png');
  let portraitBuffer = null;
  if (fs.existsSync(portraitPath)) {
    // Resize portrait cutout to fit height 540 on right
    portraitBuffer = await sharp(portraitPath)
      .resize({ height: 540, fit: 'inside' })
      .toBuffer();
  }

  const ogSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <radialGradient id="glow" cx="80%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.07" />
          <stop offset="100%" stop-color="#050505" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="#050505" />
      <rect width="1200" height="630" fill="url(#glow)" />
      
      <!-- Subtle Border Frame -->
      <rect x="24" y="24" width="1152" height="582" rx="32" fill="none" stroke="url(#borderGrad)" stroke-width="2" />

      <!-- Left Typography Content -->
      <g transform="translate(80, 110)">
        <!-- Monogram Badge -->
        <g transform="translate(0, 0)">
          <rect width="48" height="48" rx="24" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
          <text x="24" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="22" font-weight="700" fill="#FFFFFF" text-anchor="middle">H</text>
          <text x="64" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="18" font-weight="500" fill="#A1A1A6" letter-spacing="0.05em">PORTFOLIO</text>
        </g>

        <!-- Name -->
        <text x="0" y="140" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="76" font-weight="800" fill="#F5F5F7" letter-spacing="-0.03em">
          Harsh Raj
        </text>

        <!-- Role -->
        <text x="0" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="34" font-weight="600" fill="#D1D1D6" letter-spacing="-0.01em">
          CSE (AI &amp; ML) Student
        </text>

        <!-- Positioning line -->
        <text x="0" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="20" font-weight="400" fill="#9A9AA0">
          Building a strong foundation in Python and AI.
        </text>

        <!-- Projects & Status Chips -->
        <g transform="translate(0, 310)">
          <!-- Projects Chip -->
          <rect x="0" y="0" width="280" height="44" rx="22" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
          <text x="24" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="16" font-weight="500" fill="#F5F5F7">
            LandSafe &amp; NammaRoute
          </text>

          <!-- Open for Internships Chip -->
          <g transform="translate(296, 0)">
            <rect x="0" y="0" width="200" height="44" rx="22" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
            <circle cx="24" cy="22" r="5" fill="#34D399" />
            <text x="40" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="15" font-weight="500" fill="#F5F5F7">
              Open to Internships
            </text>
          </g>
        </g>
      </g>
    </svg>
  `;

  const compositeList = [{ input: Buffer.from(ogSvg), top: 0, left: 0 }];

  if (portraitBuffer) {
    const portraitMeta = await sharp(portraitBuffer).metadata();
    const pWidth = portraitMeta.width || 400;
    const pHeight = portraitMeta.height || 540;
    const top = 630 - pHeight - 24; // align nicely inside bottom border
    const left = 1200 - pWidth - 80;

    compositeList.push({
      input: portraitBuffer,
      top: Math.max(24, top),
      left,
    });
  }

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 5, g: 5, b: 5, alpha: 1 },
    },
  })
    .composite(compositeList)
    .png()
    .toFile(path.resolve('public/og-image.png'));
  console.log('✅ Generated public/og-image.png (1200x630)');

  // 3. Generate clean 1-page public/resume.pdf with visible "DEMO" watermark
  // Valid PDF 1.4 representation with diagonal DEMO watermark and clean typographic layout
  const resumePdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 5 0 R
      /F2 6 0 R
    >>
  >>
>>
endobj
4 0 obj
<< /Length 1750 >>
stream
q
% Watermark Background - DEMO in large grey diagonal letters
0.9 0.9 0.9 rg
BT
/F1 90 Tf
0.7071 0.7071 -0.7071 0.7071 140 280 Tm
(DEMO) Tj
ET
Q

% Header
0 0 0 rg
BT
/F1 22 Tf
54 730 Td
(Harsh Raj) Tj
ET

BT
/F2 10 Tf
54 712 Td
(Patna, Bihar / Bengaluru, Karnataka | Portfolio: harshraj.dev | Email: your.email@example.com) Tj
ET

BT
/F1 9 Tf
0.7 0.2 0.2 rg
54 694 Td
([DEMO RESUME WATERMARK - Replace /public/resume.pdf with your official PDF resume]) Tj
ET

% Horizontal divider line
0.7 0.7 0.7 RG
1 w
54 682 m 558 682 l S

% Section 1: Education
BT
0 0 0 rg
/F1 13 Tf
54 662 Td
(EDUCATION) Tj
ET

BT
/F1 10 Tf
54 645 Td
(Jain University Global Campus) Tj
/F2 10 Tf
0 -14 Td
(Bachelor of Technology - Computer Science & Engineering (AI & ML specialization) | Expected 2028) Tj
ET

% Section 2: Technical Skills
BT
/F1 13 Tf
54 605 Td
(TECHNICAL SKILLS) Tj
ET

BT
/F1 10 Tf
54 588 Td
(Languages:) Tj
/F2 10 Tf
110 588 Td
(Python, Java, HTML, CSS, C) Tj
ET

BT
/F1 10 Tf
54 572 Td
(Focus Areas:) Tj
/F2 10 Tf
110 572 Td
(Artificial Intelligence, Machine Learning Foundations, Prompt Engineering) Tj
ET

% Section 3: Flagship Projects
BT
/F1 13 Tf
54 532 Td
(PROJECTS) Tj
ET

BT
/F1 11 Tf
54 515 Td
(LandSafe - Landslide Early-Warning System) Tj
/F2 10 Tf
0 -14 Td
(Live: https://si-h-2026.vercel.app/) Tj
0 -14 Td
(- Machine learning model predicting landslide risk based on terrain, slope, and rainfall data.) Tj
0 -14 Td
(- Automated safe evacuation route planning avoiding high-risk terrain zones.) Tj
0 -14 Td
(- Community ground-truth verification mechanism to validate alerts.) Tj
ET

BT
/F1 11 Tf
54 425 Td
(NammaRoute - Multimodal Trip Planner for Bengaluru) Tj
/F2 10 Tf
0 -14 Td
(- Unified route planning across metro (Purple, Green, Yellow), BMTC buses, and walking transfers.) Tj
0 -14 Td
(- Local geospatial index of ~77,000 places from OpenStreetMap with fast spatial search.) Tj
0 -14 Td
(- Step-by-step navigation with estimated travel time, distance, and transfer stations.) Tj
ET

% Section 4: Activities & Leadership
BT
/F1 13 Tf
54 335 Td
(ACTIVITIES & LEADERSHIP) Tj
ET

BT
/F1 10 Tf
54 318 Td
(Turing Club, Jain University Global Campus) Tj
/F2 10 Tf
0 -14 Td
(Member, Photography & Videography Team) Tj
0 -14 Td
(- Documented university technical symposiums, hackathons, and creative media productions.) Tj
ET

endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000295 00000 n 
0000002138 00000 n 
0000002220 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
2297
%%EOF
`;

  fs.writeFileSync(path.resolve('public/resume.pdf'), resumePdfContent);
  console.log('✅ Generated public/resume.pdf (1-page with visible DEMO watermark)');
}

generateAssets().catch((err) => {
  console.error('[generate-assets] Error:', err);
  process.exit(1);
});

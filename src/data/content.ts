import { PortfolioContent, SkillItem } from './content.schema';

/**
 * Technical skills definition - Single source of truth for all skills and levels.
 * Working knowledge: Python
 * Intermediate: Java, HTML, CSS
 * Basics: C
 * Learning now: Advanced Python, Prompt engineering
 */
export const technicalSkills: SkillItem[] = [
  // Languages
  { name: "Python", associatedProjectIds: [] },
  { name: "Java", associatedProjectIds: [] },
  { name: "C", associatedProjectIds: [] },
  { name: "HTML", associatedProjectIds: [] },
  { name: "CSS", associatedProjectIds: [] },
  // Web and APIs
  { name: "React", associatedProjectIds: [] },
  { name: "FastAPI", associatedProjectIds: [] },
  { name: "REST APIs", associatedProjectIds: [] },
  { name: "Tailwind CSS", associatedProjectIds: [] },
  { name: "Vite", associatedProjectIds: [] },
  // Machine Learning and GIS
  { name: "scikit-learn", associatedProjectIds: [] },
  { name: "OSMnx", associatedProjectIds: [] },
  { name: "Leaflet", associatedProjectIds: [] },
  // Tools
  { name: "Git", associatedProjectIds: [] },
  { name: "GitHub", associatedProjectIds: [] },
  { name: "Vercel", associatedProjectIds: [] },
  // Learning now
  {
    name: "Advanced Python",
    level: "Learning now",
    isCurrentlyLearning: true,
    associatedProjectIds: [],
  },
  {
    name: "Prompt engineering",
    level: "Learning now",
    isCurrentlyLearning: true,
    associatedProjectIds: [],
  },
];

/**
 * SINGLE SOURCE OF TRUTH (content.ts)
 * 
 * Clean, verified REAL data for Harsh Raj.
 * This is the ONLY file you need to edit to personalize your portfolio.
 * 
 * Rules:
 * 1. New sections start EMPTY here (empty strings or empty arrays),
 *    except facts you already provided (e.g. your Turing Club activity).
 * 2. Whenever an array or scalar is left empty, the site automatically
 *    displays demo placeholder data (with a small "Demo" chip).
 * 3. Adding your real data here automatically replaces the demo data!
 */
export const portfolioContent: PortfolioContent = {
  personal: {
    fullName: "Harsh Raj",
    preferredName: "Harsh",
    avatarInitial: "H",
    photoUrl: "/images/harsh-raj.png",
    roleLine: "2nd-year CSE (AI & ML) student at Jain University Global Campus",
    oneLinePositioning: "Building a strong foundation in Python and AI, looking for internships and hands-on projects.",
    shortIntro: "I'm a second-year B.Tech student from Patna, Bihar, studying Computer Science with a specialization in AI & ML. I'm learning advanced Python and I'm looking for opportunities to build real projects and grow as a developer.",
    primarySkills: technicalSkills.filter((s) => !s.isCurrentlyLearning).map((s) => s.name),
    
    // Single compact editable field for education
    education: "Jain University Global Campus, B.Tech CSE (AI & ML), 2nd year",
    currentlyLearning: technicalSkills.filter((s) => s.isCurrentlyLearning).map((s) => s.name),
    
    hometown: "Patna, Bihar",
    location: "Bengaluru, Karnataka / Patna, Bihar",
    college: "Jain University Global Campus",
    degreeMajor: "B.Tech CSE (AI & ML)",
    graduationYear: "2029",
    headline: "2nd-year CSE (AI & ML) student at Jain University Global Campus",
    subheadline: "Building a strong foundation in Python and AI, looking for internships and hands-on projects.",
    bioShort: "I'm a second-year B.Tech student from Patna, Bihar, studying Computer Science with a specialization in AI & ML.",
  },

  seo: {
    siteTitle: "Harsh Raj - CSE (AI & ML) Student Portfolio",
    siteDescription: "Portfolio of Harsh Raj, a 2nd-year CSE (AI & ML) student at Jain University Global Campus. Projects: LandSafe and NammaRoute.",
    canonicalUrl: "https://portfolio-five-smoky-5uetdazjey.vercel.app",
    keywords: [
      "Harsh Raj",
      "LandSafe",
      "NammaRoute",
      "CSE Student",
      "AI & ML",
      "Jain University Global Campus",
      "Python",
      "Java",
      "HTML",
      "CSS",
      "C",
    ],
  },

  availability: {
    isOpen: true,
    statusText: "Open to Internships",
    subtext: "Looking for internships and hands-on projects",
    targetRole: "Software Engineering / AI Intern",
    season: "2025 - 2026",
  },

  // Skills: category groups
  skills: [
    {
      categoryName: "Languages",
      description: "Core programming and markup languages.",
      skills: [
        { name: "Python" },
        { name: "Java" },
        { name: "C" },
        { name: "HTML" },
        { name: "CSS" },
      ],
    },
    {
      categoryName: "Web and APIs",
      description: "Frontend libraries, web frameworks, and API architecture.",
      skills: [
        { name: "React" },
        { name: "FastAPI" },
        { name: "REST APIs" },
        { name: "Tailwind CSS" },
        { name: "Vite" },
      ],
    },
    {
      categoryName: "Machine Learning and GIS",
      description: "ML toolkits and spatial network analysis.",
      skills: [
        { name: "scikit-learn" },
        { name: "OSMnx" },
        { name: "Leaflet" },
      ],
    },
    {
      categoryName: "Tools",
      description: "Version control and deployment platforms.",
      skills: [
        { name: "Git" },
        { name: "GitHub" },
        { name: "Vercel" },
      ],
    },
    {
      categoryName: "Learning now",
      description: "Topics currently exploring and expanding upon.",
      skills: [
        { name: "Advanced Python", isCurrentlyLearning: true },
        { name: "Prompt engineering", isCurrentlyLearning: true },
      ],
    },
  ],

  // Real Projects: LandSafe and NammaRoute (text preserved exactly)
  projects: [
    {
      id: "landsafe",
      title: "LandSafe",
      status: "Live",
      oneLiner: "LandSafe predicts where landslides are likely, alerts people early, and guides them to safety.",
      featureChips: [
        "AI risk prediction",
        "Safe evacuation routes",
        "Community verification",
      ],
      image: "/images/projects/landsafe.webp",
      imageAlt: "LandSafe real-time landslide risk prediction dashboard showing GIS hazard map, ML model assessment, and active threat advisories",
      liveSiteUrl: "https://si-h-2026.vercel.app/",
      role: "",
      team: "",
      techStack: [
        "Python",
        "FastAPI",
        "scikit-learn",
        "OSMnx",
        "React",
        "Leaflet",
      ],
      githubUrl: "https://github.com/Harshraj2206/SiH-2026",
      liveDemoUrl: "https://si-h-2026.vercel.app/",
      results: [
        "Random Forest model with 91% accuracy",
        "6 FastAPI REST endpoints powering a live GIS hazard map",
        "Team shortlisted for Smart India Hackathon 2026 Round 2",
      ],
      context: "",
      challenges: "",
      screenshots: [],
      caseStudy: {
        slug: "landsafe",
        overview: "LandSafe is an AI-based early warning and landslide risk monitoring system built for India, with a special focus on the North Eastern Region (Arunachal Pradesh, Assam, Meghalaya, Manipur, Mizoram, Nagaland, Sikkim and Tripura).",
        howItWorks: [
          {
            step: 1,
            title: "Predict",
            description: "A machine learning model uses terrain data (slope, elevation, drainage), land cover and rainfall to estimate landslide risk for each zone and rates it Low, Moderate, High or Critical.",
          },
          {
            step: 2,
            title: "Route",
            description: "When a zone becomes high risk, the system generates a safe evacuation route that avoids the dangerous areas.",
          },
          {
            step: 3,
            title: "Verify",
            description: "People on the ground can confirm whether an alert is real, so the system stays accurate and trusted.",
          },
        ],
        whyHelpful: "The North Eastern region gets very heavy monsoon rainfall and has steep, fragile hills, so landslides there are frequent and often deadly. They block roads, cut off villages and take lives, and warnings usually reach people too late or not at all. LandSafe turns scattered data into a simple map with clear alerts, so authorities and local communities can act before a landslide happens instead of reacting afterwards. It also tells people where to go, not just that danger exists, and it can scale beyond the North East to other landslide-prone parts of India.",
        liveDemoUrl: "https://si-h-2026.vercel.app/",
      },
      featured: true,
      category: "ai",
      outcome: "LandSafe predicts where landslides are likely, alerts people early, and guides them to safety.",
      tagline: "AI-based early warning and landslide risk monitoring system.",
      tags: ["AI risk prediction", "Safe evacuation routes", "Community verification"],
    },
    {
      id: "nammaroute",
      title: "NammaRoute",
      status: "In development",
      oneLiner: "A multimodal trip planner for Bengaluru (metro, bus, walk, auto, cab) with step-by-step guidance and a searchable index of 77,000 places.",
      statChips: [
        "83 metro stations",
        "3 metro lines",
        "~77,000 places",
      ],
      extraChip: "Made for students and newcomers",
      image: null, // null triggers dashed macOS placeholder
      imageAlt: "NammaRoute screenshot placeholder",
      liveSiteUrl: "",
      role: "",
      team: "",
      techStack: [
        "React",
        "Tailwind CSS",
        "FastAPI",
        "OpenStreetMap",
      ],
      githubUrl: "https://github.com/Harshraj2206/NammaRoute",
      liveDemoUrl: "",
      results: [
        "Working prototype that plans routes between any two places in Bengaluru",
        "Search across Bengaluru streets, campuses and landmarks from an OpenStreetMap place index",
      ],
      context: "",
      challenges: "",
      screenshots: [],
      caseStudy: {
        slug: "nammaroute",
        overview: "NammaRoute is a travel app for Bengaluru that plans a whole trip across metro, BMTC bus, walking, auto and cab in one place. You search for a destination, and it shows the options side by side with time, distance and estimated fare. Then it walks you through the chosen route step by step, including where to change metro lines.",
        whyHelpful: "Getting around Bengaluru usually means juggling several apps and guessing how to connect them, which is hardest for newcomers and first-time metro or bus users. NammaRoute puts it in one flow, with clear transfers, honest labels where a fare or route line is only an estimate, and a search that can find streets, colleges, hospitals and small localities, not just famous landmarks.",
        builtSoFar: [
          "Routing for the Purple, Green and Yellow metro lines (83 stations, with transfers at Majestic and RV Road)",
          "A local search of about 77,000 places from OpenStreetMap",
          "A map with route guidance",
          "A simulated GPS mode",
        ],
        inProgress: [
          "Verified official fares",
          "Real-time bus data",
          "Offline map",
        ],
      },
      featured: true,
      category: "mobile",
      outcome: "A multimodal trip planner for Bengaluru (metro, bus, walk, auto, cab) with step-by-step guidance and a searchable index of 77,000 places.",
      tagline: "Multimodal trip planner for Bengaluru with 77,000 places.",
      tags: ["83 metro stations", "3 metro lines", "~77,000 places", "Made for students and newcomers"],
    },
  ],

  // Highlights Section Data:
  // - achievements: Real SIH 2026 entry
  achievements: [
    {
      id: "ach-sih-2026",
      title: "Smart India Hackathon 2026",
      eventOrOrg: "",
      year: "2026",
      result: "Round 2 · In progress",
      detail: "Cleared Round 1, the university internal hackathon (Sep 2026), with LandSafe. Team shortlisted for Round 2.",
    },
  ],

  // - certifications: Real LinkedIn Learning credentials
  certifications: [
    {
      id: "cert-discrete-math",
      title: "Programming Foundations: Discrete Mathematics",
      issuer: "LinkedIn Learning",
      date: "Sep 2026",
    },
    {
      id: "cert-graph-neural-networks",
      title: "Learning Graph Neural Networks",
      issuer: "LinkedIn Learning",
      date: "Sep 2026",
    },
  ],

  // - activities: REAL item from Harsh Raj (replaces demo array completely)
  activities: [
    {
      id: "act-turing-photography",
      title: "Photography team member, Turing Club, Jain University Global Campus",
      dates: "",
    },
  ],

  // - recommendations: empty array (shows demo items in demo mode)
  recommendations: [],

  // About: exact user wording, 3 paragraphs
  about: {
    headline: "About me",
    storyParagraphs: [
      "I'm a second-year B.Tech student at Jain University Global Campus, studying Computer Science with a specialization in AI & ML. I'm from Patna, Bihar.",
      "I build full-stack and machine learning projects with Python, FastAPI and React. LandSafe, my landslide early-warning system for Smart India Hackathon 2026, predicts risk and guides people to safety. NammaRoute, which I'm still building, plans a whole trip across Bengaluru's metro, buses and autos in one place.",
      "Away from the screen, I'm part of the Turing Club photography team and I enjoy art and craft. I'm looking for internships where I can contribute, learn from experienced engineers and keep growing.",
    ],
  },

  now: {
    building: [
      { name: "NammaRoute", status: "In development" },
    ],
    learning: ["Advanced Python", "Prompt engineering"],
  },

  // Beyond Code: creative pursuits with ready flags
  // ready: false renders button as a disabled "Coming soon" state with no link
  creative: {
    heading: "Beyond code",
    introLine: "When I'm not coding, I'm usually behind a camera or with a paintbrush.",
    photography: {
      title: "Photography & videography",
      description: "I love photography and videography, and I'm part of the Turing Club photography team at my university.",
      buttonText: "See my photo and video work",
      url: "/photography",
      ready: false,
      iconName: "camera",
    },
    artCraft: {
      title: "Art & craft",
      description: "I love art and craft, from painting to handmade pieces.",
      buttonText: "See my painting and craft",
      url: "/art-craft",
      ready: false,
      iconName: "palette",
      items: [],
    },
  },

  // Social Dock & Online Presence
  // Set URLs and enabled: true to link your real profiles
  social: {
    github: {
      url: "https://github.com/Harshraj2206",
      enabled: true,
    },
    instagram: {
      url: "https://www.instagram.com/_harssshraj",
      enabled: true,
    },
    linkedin: {
      url: "https://www.linkedin.com/in/harshraj2206",
      enabled: true,
    },
    facebook: {
      url: "https://www.facebook.com/share/1Lr2f27Uyz/",
      enabled: true,
    },
    x: {
      url: "",
      enabled: false,
    },
    youtube: {
      url: "",
      enabled: false,
    },
    email: {
      url: "",
      enabled: false,
    },
  },

  // Social Dock placement configuration: 'section' (band on page) | 'side-rail' (fixed right rail)
  socialBar: {
    placement: "section",
  },

  // Contact
  contact: {
    headline: "Start a conversation",
    subtext: "Feel free to reach out for internship opportunities, project collaborations, or discussions.",
    emailAddress: "hraj224488@gmail.com",
    // Expected reply time shown only if set (hidden when empty)
    responseTime: "",
    officeHoursNote: "",
  },

  // Compatibility socialLinks
  socialLinks: [],

  // Auto-hidden sections
  stats: [],
  timeline: [],
  dockTools: [],
  highlights: [],
  writingConfig: {
    enabled: false,
    sectionTitle: "Articles",
    posts: [],
  },

  meta: {
    copyrightYear: 2026,
    defaultTheme: "dark",
  },
};

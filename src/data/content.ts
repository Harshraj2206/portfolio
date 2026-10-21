import { PortfolioContent } from './content.schema';

/**
 * SINGLE SOURCE OF TRUTH (content.ts)
 * 
 * Edit this file to customize your entire portfolio.
 * Every card, project, skill, timeline event, and contact detail
 * is driven from this single object.
 */
export const portfolioContent: PortfolioContent = {
  personal: {
    fullName: "[Your Name]",
    preferredName: "Alex",
    headline: "Junior CS & Design student building human-centered AI tools, open to Summer 2027 Software Engineering internships",
    subheadline: "Obsessed with high-performance distributed systems, craft-driven developer tooling, and Apple-grade interface polish.",
    bioShort: "I study Computer Science and Human-Computer Interaction at [University Name]. By day I research distributed consensus algorithms; by night I craft fluid, tactile software experiences.",
    location: "San Francisco, CA / Seattle, WA (Open to Relocation & Remote)",
    college: "[University Name]",
    graduationYear: "May 2027",
    degreeMajor: "B.S. in Computer Science & Minor in Human-Computer Interaction",
    gpa: "3.92 / 4.00",
    githubUsername: "torvalds", // Replace with your GitHub username (e.g. "octocat") to display recent public repos
  },

  seo: {
    siteTitle: "[Your Name] — Software Engineer & Designer Portfolio",
    siteDescription: "College student and software engineer building high-performance systems and human-centric software. Open to Summer 2027 SWE internships.",
    canonicalUrl: "https://portfolio.example.com",
    keywords: [
      "Software Engineer Intern",
      "Frontend Engineer",
      "Distributed Systems",
      "React TypeScript",
      "Product Designer",
      "Apple Liquid Glass UI",
    ],
  },

  availability: {
    isOpen: true,
    statusText: "Open to Summer 2027 SWE Internships",
    subtext: "Actively interviewing for Systems, Full-Stack & Frontend roles",
    targetRole: "Software Engineering Intern",
    season: "Summer 2027",
  },

  recruiterQuickView: {
    name: "[Your Name]",
    roleSought: "Software Engineering Intern (Summer 2027)",
    location: "San Francisco, CA (Open to SF, NYC, Seattle & Remote)",
    topSkills: ["TypeScript / React", "Go / Distributed Systems", "Rust / Performance"],
    flagshipProjectId: "aurakv",
    workAuthorization: "Authorized to work in the US (No sponsorship required / F-1 CPT eligible)",
  },

  stats: [
    {
      id: "projects",
      label: "Projects Shipped",
      value: 12,
      suffix: "+",
      description: "Production web applications, systems tools, and open-source libraries",
    },
    {
      id: "users",
      label: "Active Users Reached",
      value: 45,
      suffix: "k+",
      description: "Across developer tools, CLI utilities, and student community portals",
    },
    {
      id: "hackathons",
      label: "Hackathons Won",
      value: 4,
      suffix: "x",
      description: "First-place awards at collegiate hackathons (CalHacks, PennApps, HackMIT)",
    },
    {
      id: "gpa",
      label: "Cumulative GPA",
      value: 3.92,
      suffix: "",
      description: "Dean's Honor List, Computer Systems & Algorithms honors coursework",
    },
  ],

  projects: [
    {
      id: "aurakv",
      title: "AuraKV — Distributed In-Memory Cache with Vector Similarity",
      tagline: "High-throughput, Raft-replicated in-memory key-value store with built-in HNSW vector similarity search for low-latency agent memory.",
      category: "systems",
      featured: true,
      thumbnailGradient: "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
      tags: ["Go", "Raft Consensus", "SIMD Vector Search", "gRPC", "Docker"],
      outcome: "Achieved sub-1.2ms p99 read latency under 100k QPS across 5-node cluster",
      liveDemoUrl: "https://demo.aurakv.example.com",
      githubUrl: "https://github.com/example/aurakv",
      caseStudy: {
        slug: "aurakv",
        problem: "Modern AI agent systems need millisecond-level memory retrieval that combines exact key-value state with semantic vector searches, but existing solutions either required managing two disjoint databases (Redis + Pinecone) or incurred severe latency penalties under clustered concurrency.",
        targetAudience: "Autonomous AI agent developers and high-throughput real-time backend teams.",
        myRole: "Lead Systems Architect & Core Developer",
        team: "Solo personal systems project with code reviews from university systems lab mentor",
        duration: "10 weeks (Fall 2025)",
        techStack: ["Go", "Raft Protocol", "gRPC / Protobuf", "AVX2 SIMD", "Prometheus", "Grafana"],
        keyDecisions: [
          {
            title: "Zero-Allocation Custom Serialization over JSON",
            context: "Initial benchmarks showed 38% of CPU cycles spent on JSON unmarshalling during high QPS loads.",
            decision: "Implemented a binary buffer protocol with direct memory mapping and AVX2-accelerated cosine distance calculation.",
            rationale: "Cut memory footprint by 58% and boosted single-node throughput from 28k to 110k operations per second."
          },
          {
            title: "Pipelined Raft Replication with Read Index leases",
            context: "Standard Raft consensus required round-trip heartbeats on every read request to avoid stale reads.",
            decision: "Adopted lease-based linearizable read indexing, letting the leader serve reads immediately within the valid lease window.",
            rationale: "Reduced read latency from 4.8ms to 0.9ms while maintaining strict consistency guarantees."
          }
        ],
        screenshots: [
          {
            caption: "Prometheus & Grafana live metrics dashboard showing 100k QPS stress test with sub-2ms tail latency.",
            alt: "AuraKV Latency and Throughput Dashboard",
            type: "window"
          },
          {
            caption: "Cluster topology visualizer displaying leader election and partition tolerance under simulated split-brain.",
            alt: "Raft Cluster Topology Visualizer",
            type: "diagram"
          }
        ],
        measurableResults: [
          {
            metric: "-74%",
            label: "p99 Tail Latency",
            context: "From 4.8ms baseline down to 1.2ms under 100,000 QPS load"
          },
          {
            metric: "110k",
            label: "Sustained QPS",
            context: "Per single node with zero-allocation binary protocol"
          },
          {
            metric: "100%",
            label: "Jepsen Consistency",
            context: "Passed full linearizability fault-injection test suite"
          }
        ],
        whatIWouldImprove: [
          "Implement adaptive partition rebalancing when nodes join or leave dynamically.",
          "Add GPU-accelerated batch vector index builds for billion-scale datasets using CUDA / Metal.",
          "Provide native WebAssembly client bindings for browser-side local-first cache synchronization."
        ],
        liveDemoUrl: "https://demo.aurakv.example.com",
        githubUrl: "https://github.com/example/aurakv"
      }
    },
    {
      id: "pulseflow",
      title: "Pulseflow — Real-Time Collaborative Canvas Engine",
      tagline: "Ultra-fluid, infinite multiplayer canvas powered by WebGL, CRDT conflict-free synchronization, and Apple Liquid Glass design.",
      category: "web",
      featured: true,
      thumbnailGradient: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
      tags: ["TypeScript", "WebGL / PixiJS", "Yjs (CRDTs)", "WebSockets", "Tailwind CSS"],
      outcome: "60 FPS rendering with 100,000 interactive shapes and zero-conflict multiplayer",
      liveDemoUrl: "https://pulseflow.example.com",
      githubUrl: "https://github.com/example/pulseflow",
      caseStudy: {
        slug: "pulseflow",
        problem: "Existing browser-based whiteboard canvases choke when rendering over 5,000 DOM elements and suffer from desynchronization during network drops or concurrent edits.",
        targetAudience: "Distributed engineering teams and UI/UX designers collaborating live.",
        myRole: "Frontend & Synchronization Engineer",
        team: "Team of 2 (Me: WebGL engine & CRDTs; Partner: User authentication & persistence)",
        duration: "8 weeks (Spring 2025)",
        techStack: ["TypeScript", "PixiJS (WebGL)", "Yjs", "WebSockets", "Framer Motion", "Tailwind CSS"],
        keyDecisions: [
          {
            title: "Quadtree Spatial Partitioning for Viewport Culling",
            context: "Iterating through all canvas shapes every animation frame caused frame drops below 20 FPS.",
            decision: "Built a dynamic 2D Quadtree that culls non-visible items before sending draw calls to the GPU.",
            rationale: "Kept draw call count below 60 even with 100,000 canvas elements, locking frame rate to a silky 60 FPS."
          },
          {
            title: "State-Based CRDTs over Operational Transformation",
            context: "Operational Transformation required a centralized authoritative server, failing offline reconnection tests.",
            decision: "Integrated Yjs binary delta CRDTs over WebSocket channels with local IndexedDB persistence.",
            rationale: "Users can collaborate offline, edit concurrently, and merge cleanly upon reconnection without conflicts."
          }
        ],
        screenshots: [
          {
            caption: "Multi-cursor live collaboration canvas with Liquid Glass toolbar and real-time presence indicators.",
            alt: "Pulseflow Collaborative Canvas Interface",
            type: "window"
          }
        ],
        measurableResults: [
          {
            metric: "60 FPS",
            label: "Locked Frame Rate",
            context: "Maintained consistently on 120Hz ProMotion displays with 100k items"
          },
          {
            metric: "0",
            label: "Merge Conflicts",
            context: "Guaranteed convergence across 50 simultaneous peer sessions"
          },
          {
            metric: "< 16ms",
            label: "Input-to-Screen Latency",
            context: "Immediate optimistic local rendering with background CRDT propagation"
          }
        ],
        whatIWouldImprove: [
          "Add WebRTC peer-to-peer data channels to offload WebSocket server traffic for local teams.",
          "Implement Apple Pencil pressure sensitivity and tilt dynamics for tablet users.",
          "Export canvas nodes to clean production-ready React code components automatically."
        ],
        liveDemoUrl: "https://pulseflow.example.com",
        githubUrl: "https://github.com/example/pulseflow"
      }
    },
    {
      id: "synapse-studio",
      title: "Synapse Studio — Local-First Neural Audio Workstation",
      tagline: "AI-powered audio stem separation, speech enhancement, and spectral editing running completely in-browser via WebGPU and ONNX Runtime.",
      category: "ai",
      featured: true,
      thumbnailGradient: "from-teal-500/20 via-cyan-500/20 to-blue-500/20",
      tags: ["WebGPU", "ONNX Runtime", "Web Audio API", "React", "Rust / Wasm"],
      outcome: "Separates 4-stem audio in under 4.5 seconds with zero server dependencies or data transmission",
      liveDemoUrl: "https://synapse.example.com",
      githubUrl: "https://github.com/example/synapse-studio",
      caseStudy: {
        slug: "synapse-studio",
        problem: "Musicians and podcasters need fast vocal isolation and noise removal, but cloud tools charge high monthly subscriptions, upload sensitive audio files, and introduce upload/download bottlenecks.",
        targetAudience: "Creators, musicians, sound engineers, and privacy-conscious podcasters.",
        myRole: "Full-Stack AI & Web Audio Engineer",
        team: "Hackathon project expanded into an open-source tool",
        duration: "6 weeks (Summer 2025)",
        techStack: ["React", "TypeScript", "WebGPU", "ONNX Runtime Web", "Rust (Wasm)", "Tailwind CSS"],
        keyDecisions: [
          {
            title: "WebGPU Compute Shaders for Float32 Spectrogram Generation",
            context: "JavaScript STFT (Short-Time Fourier Transform) blocked the main thread for over 2 seconds on a 3-minute track.",
            decision: "Wrote custom WebGPU compute shaders and a Rust Wasm fallback for FFT windowing and spectral magnitude calculation.",
            rationale: "Computed complete spectrograms in 120ms without any UI hitching or dropped frames."
          }
        ],
        screenshots: [
          {
            caption: "Interactive spectral waveform viewer with glass controls and real-time stem attenuation sliders.",
            alt: "Synapse Studio Audio Interface",
            type: "window"
          }
        ],
        measurableResults: [
          {
            metric: "4.2s",
            label: "Inference Time",
            context: "Full 4-track stem separation for a 3-minute song on Apple M-series chips"
          },
          {
            metric: "0 MB",
            label: "Cloud Data Transferred",
            context: "100% private, client-side offline execution"
          },
          {
            metric: "9.4k",
            label: "GitHub Stars",
            context: "Trending #1 on Hacker News and open-source audio communities"
          }
        ],
        whatIWouldImprove: [
          "Fine-tune quantized 4-bit Demucs models to run smoothly on lower-spec mobile devices.",
          "Add native VST3 / AU plugin export for integration with Logic Pro and Ableton Live."
        ],
        liveDemoUrl: "https://synapse.example.com",
        githubUrl: "https://github.com/example/synapse-studio"
      }
    },
    {
      id: "orbit-wm",
      title: "Orbit — Lightweight macOS Window Management Assistant",
      tagline: "Native, keyboard-driven window management companion written in Swift with ultra-fast layout calculations and zero battery drain.",
      category: "mobile",
      featured: false,
      thumbnailGradient: "from-amber-500/20 via-orange-500/20 to-red-500/20",
      tags: ["Swift", "AppKit", "macOS Accessibility API", "SPM"],
      outcome: "Over 8,000 active macOS power users, 0.1% CPU background usage",
      liveDemoUrl: "https://orbit.example.com",
      githubUrl: "https://github.com/example/orbit-wm",
      caseStudy: {
        slug: "orbit-wm",
        problem: "Existing macOS window managers were bloated, required extensive background permissions, or drained laptop battery by polling display states.",
        targetAudience: "Software engineers and multitasking professionals on macOS.",
        myRole: "macOS Native Developer",
        team: "Solo open-source developer",
        duration: "4 weeks (Winter 2024)",
        techStack: ["Swift", "AppKit", "CoreGraphics", "macOS Accessibility APIs"],
        keyDecisions: [
          {
            title: "Event-Driven CGEventTap over Polling Loops",
            context: "Continuous polling of window states drained 3-5% CPU battery per hour on MacBooks.",
            decision: "Switched to passive event taps with debounced notification observers.",
            rationale: "Reduced idle CPU utilization to 0.01% with instantaneous layout response."
          }
        ],
        screenshots: [
          {
            caption: "Orbit quick switcher overlay floating with macOS Liquid Glass blur and snap shortcuts.",
            alt: "Orbit Window Manager Preview",
            type: "window"
          }
        ],
        measurableResults: [
          {
            metric: "< 12 MB",
            label: "RAM Footprint",
            context: "Ultralight native footprint compared to 350MB+ Electron tools"
          },
          {
            metric: "8,200+",
            label: "Active Users",
            context: "Community-driven Homebrew and direct download installs"
          }
        ],
        whatIWouldImprove: [
          "Add support for multi-monitor setups with mismatched scaling and vertical orientation.",
          "Introduce customizable touch-bar and trackpad gesture triggers."
        ],
        liveDemoUrl: "https://orbit.example.com",
        githubUrl: "https://github.com/example/orbit-wm"
      }
    }
  ],

  timeline: [
    {
      id: "exp-1",
      period: "June 2026 — August 2026",
      title: "Software Engineering Intern",
      organization: "CloudScale Systems (San Francisco, CA)",
      location: "San Francisco, CA",
      type: "internship",
      description: "Incoming Summer 2026 Software Engineer Intern on the Distributed Storage & Core Infrastructure team.",
      achievements: [
        "Selected for core distributed systems infrastructure track following competitive engineering assessments.",
        "Will architect low-latency metadata caching layers and contribute to multi-region replication protocols."
      ],
      skillsUsed: ["Go", "Distributed Systems", "Kubernetes", "gRPC", "Observability"]
    },
    {
      id: "exp-2",
      period: "January 2025 — Present",
      title: "Undergraduate Research Assistant",
      organization: "Systems & Networking Laboratory, [University Name]",
      location: "On-Campus",
      type: "research",
      description: "Conducting empirical research on speculative consensus in Byzantine fault-tolerant distributed networks under Prof. [Advisor Name].",
      achievements: [
        "Implemented a benchmark harness simulating 1,000 heterogeneous validator nodes across 5 geographical cloud regions.",
        "Co-authoring a workshop submission on adaptive leader timeouts under adversarial network partitioning.",
        "Awarded University Undergraduate Research Fellowship grant ($4,000)."
      ],
      skillsUsed: ["Go", "Rust", "Python", "Simulations", "Distributed Consensus"]
    },
    {
      id: "exp-3",
      period: "August 2024 — Present",
      title: "Head Teaching Assistant — CS 210: Data Structures & Algorithms",
      organization: "Department of Computer Science, [University Name]",
      location: "On-Campus",
      type: "leadership",
      description: "Leading weekly discussion sections and conceptual office hours for over 450 undergraduate computer science students.",
      achievements: [
        "Mentored 60+ students directly; designed automated grading harnesses for graph algorithms and dynamic programming projects.",
        "Awarded Outstanding Undergraduate Teaching Award (awarded to top 2% of departmental TAs)."
      ],
      skillsUsed: ["Algorithms", "Data Structures", "Technical Communication", "Mentorship", "Python"]
    },
    {
      id: "exp-4",
      period: "October 2024",
      title: "1st Place Grand Prize Winner — CalHacks 11.0",
      organization: "UC Berkeley / CalHacks",
      location: "San Francisco, CA",
      type: "award",
      description: "Built 'SpatialTouch' — a real-time assistive gesture navigation overlay using computer vision and WebAssembly, competing among 2,800+ global participants.",
      achievements: [
        "Won 1st Place Overall ($10,000 prize) and Best Accessibility Hack.",
        "Engineered on-device hand-pose estimation running at 45 FPS in WebAssembly with zero cloud round-trips."
      ],
      skillsUsed: ["TypeScript", "WebAssembly", "TensorFlow.js", "Human-Computer Interaction"]
    },
    {
      id: "exp-5",
      period: "September 2023 — Expected May 2027",
      title: "B.S. in Computer Science & Human-Computer Interaction",
      organization: "[University Name]",
      location: "Campus",
      type: "education",
      description: "Honors Program, GPA: 3.92/4.00. Focus on Systems Architecture, Operating Systems, Algorithms, and UI Engineering.",
      achievements: [
        "Coursework: Operating Systems, Distributed Systems, Compilers, Computer Architecture, Computer Networks, HCI Design Studio, Probability & Statistics.",
        "President, ACM Student Chapter: Organized 14 technical workshops and 4 industry alumni panels."
      ],
      skillsUsed: ["C/C++", "Go", "Java", "Computer Architecture", "Leadership"]
    }
  ],

  skills: [
    {
      categoryName: "Languages",
      description: "Production and systems languages used in high-concurrency and web applications",
      skills: [
        {
          name: "TypeScript",
          iconName: "FileCode2",
          levelDescription: "Advanced (Type-level programming, ASTs, high-performance engines)",
          associatedProjectIds: ["pulseflow", "synapse-studio"]
        },
        {
          name: "Go",
          iconName: "Terminal",
          levelDescription: "Advanced (Goroutines, channels, Raft consensus, gRPC systems)",
          associatedProjectIds: ["aurakv"]
        },
        {
          name: "Python",
          iconName: "Code",
          levelDescription: "Proficient (Distributed evaluation, PyTorch, data engineering)",
          associatedProjectIds: ["aurakv"]
        },
        {
          name: "C / C++",
          iconName: "Cpu",
          levelDescription: "Proficient (Memory management, POSIX systems programming, SIMD)",
          associatedProjectIds: ["aurakv"]
        },
        {
          name: "Swift",
          iconName: "Smartphone",
          levelDescription: "Intermediate (Native macOS AppKit, Accessibility APIs)",
          associatedProjectIds: ["orbit-wm"]
        }
      ]
    },
    {
      categoryName: "Frameworks & Frontend",
      description: "Modern component architectures, real-time graphics, and state synchronization",
      skills: [
        {
          name: "React & Next.js",
          iconName: "Atom",
          levelDescription: "Expert (Server components, streaming SSR, performance tuning)",
          associatedProjectIds: ["pulseflow", "synapse-studio"]
        },
        {
          name: "Tailwind CSS",
          iconName: "Palette",
          levelDescription: "Expert (Design tokens, custom utilities, dark mode, Apple HIG)",
          associatedProjectIds: ["pulseflow", "synapse-studio"]
        },
        {
          name: "Framer Motion",
          iconName: "Sparkles",
          levelDescription: "Advanced (Physics springs, layout projections, gesture physics)",
          associatedProjectIds: ["pulseflow"]
        },
        {
          name: "WebGL / PixiJS",
          iconName: "Layers",
          levelDescription: "Intermediate (2D canvas rendering, quadtrees, shaders)",
          associatedProjectIds: ["pulseflow"]
        },
        {
          name: "Web Audio / WebGPU",
          iconName: "Volume2",
          levelDescription: "Intermediate (Compute shaders, buffer streaming, ONNX models)",
          associatedProjectIds: ["synapse-studio"]
        }
      ]
    },
    {
      categoryName: "Backend & Systems",
      description: "Scalable infrastructure, consensus protocols, and real-time networking",
      skills: [
        {
          name: "Distributed Consensus",
          iconName: "Network",
          levelDescription: "Raft protocol implementation, lease read indexing, fault injection",
          associatedProjectIds: ["aurakv"]
        },
        {
          name: "WebSockets & CRDTs",
          iconName: "Radio",
          levelDescription: "Multiplayer state synchronization, Yjs, conflict resolution",
          associatedProjectIds: ["pulseflow"]
        },
        {
          name: "Docker & Linux",
          iconName: "Container",
          levelDescription: "Multi-stage builds, container networking, kernel cgroups",
          associatedProjectIds: ["aurakv"]
        },
        {
          name: "PostgreSQL & Redis",
          iconName: "Database",
          levelDescription: "Query optimization, indexing strategies, cache eviction",
          associatedProjectIds: ["aurakv", "pulseflow"]
        }
      ]
    },
    {
      categoryName: "Design & Craft",
      description: "Human-centered product design principles and technical craftsmanship",
      skills: [
        {
          name: "Apple HIG & Glassmorphism",
          iconName: "Apple",
          levelDescription: "Spatial hierarchy, continuous curvature, specular lighting, accessibility",
          associatedProjectIds: ["pulseflow", "orbit-wm"]
        },
        {
          name: "Figma Prototyping",
          iconName: "Figma",
          levelDescription: "Design systems, auto-layout, interactive components, token handoff",
          associatedProjectIds: ["pulseflow", "synapse-studio"]
        },
        {
          name: "WCAG AA Accessibility",
          iconName: "Eye",
          levelDescription: "Keyboard navigation, screen reader landmarks, high contrast ratios",
          associatedProjectIds: ["pulseflow", "synapse-studio"]
        }
      ]
    }
  ],

  dockTools: [
    { name: "TypeScript", iconName: "FileCode2", category: "Language" },
    { name: "React", iconName: "Atom", category: "Frontend" },
    { name: "Go", iconName: "Terminal", category: "Systems" },
    { name: "Python", iconName: "Code", category: "Language" },
    { name: "Docker", iconName: "Container", category: "DevOps" },
    { name: "Tailwind CSS", iconName: "Palette", category: "Styling" },
    { name: "PostgreSQL", iconName: "Database", category: "Database" },
    { name: "Figma", iconName: "Figma", category: "Design" },
    { name: "Git", iconName: "GitBranch", category: "Tool" },
  ],

  highlights: [
    {
      id: "flagship",
      badge: "Flagship Innovation",
      title: "Systems Engineering",
      headline: "Distributed Systems from Scratch",
      description: "I don't just consume abstractions — I build them. AuraKV implements a complete Raft consensus protocol in Go with SIMD vector indexing, demonstrating deep understanding of memory, concurrency, and networking.",
      primaryActionLabel: "Explore AuraKV Case Study",
      primaryActionHref: "#projects",
      points: [
        "100,000 QPS with sub-1.2ms p99 latency",
        "Passed full Jepsen fault-injection consistency tests",
        "Zero-allocation binary buffer serialization"
      ],
      accentColor: "#0A84FF"
    },
    {
      id: "internship",
      badge: "Immediate Impact",
      title: "Open to Opportunities",
      headline: "Ready for Summer 2027 Roles",
      description: "Equipped with strong foundational algorithms, production systems experience, and a relentless standard for visual polish. Looking to contribute high-impact code to ambitious teams.",
      primaryActionLabel: "Download Résumé",
      primaryActionHref: "/resume.pdf",
      points: [
        "Available June — September 2027 (12+ weeks)",
        "Open to SF, NYC, Seattle, or Remote positions",
        "Fast ramp-up on large codebases & modern tech stacks"
      ],
      accentColor: "#AF52DE"
    },
    {
      id: "collaborate",
      badge: "Community & Craft",
      title: "Collaborate With Me",
      headline: "Open Source & Research",
      description: "Active contributor to open-source developer tools and enthusiastic hackathon teammate. Always eager to discuss novel UI architectures, distributed databases, or research collaborations.",
      primaryActionLabel: "Get In Touch",
      primaryActionHref: "#contact",
      points: [
        "Hackathon teammate (4x Grand Prize Winner)",
        "Undergraduate systems research assistant",
        "Proven technical mentorship as Head Teaching Assistant"
      ],
      accentColor: "#30B0C7"
    }
  ],

  recommendations: [
    {
      id: "rec-1",
      authorName: "Dr. [Professor Name]",
      authorRole: "Associate Professor of Computer Science",
      organization: "[University Name] Systems Laboratory",
      avatarInitials: "Prof",
      quote: "[Your Name] is among the top 1% of undergraduate researchers I have advised in a decade. Their ability to independently diagnose subtle concurrency bottlenecks in our distributed consensus cluster and implement working Raft optimizations is remarkable.",
      relationship: "Research Advisor & Systems Professor",
      linkedInUrl: "https://linkedin.com/in/example"
    },
    {
      id: "rec-2",
      authorName: "[Mentor Name]",
      authorRole: "Senior Staff Software Engineer",
      organization: "Cloud Infrastructure Tech Corp",
      avatarInitials: "Eng",
      quote: "Working with [Your Name] felt like collaborating with a seasoned L5 engineer. They have that rare combination of deep systems rigor and Apple-like taste for frontend user experience that makes everything they ship feel genuinely delightful.",
      relationship: "Industry Mentor & Code Reviewer",
      linkedInUrl: "https://linkedin.com/in/example"
    },
    {
      id: "rec-3",
      authorName: "[Teammate Name]",
      authorRole: "Software Engineer & Co-Winner",
      organization: "CalHacks 11.0 Grand Prize Team",
      avatarInitials: "TM",
      quote: "During a 36-hour hackathon, [Your Name] was the rock of our team. When our WebAssembly pipeline hit severe frame drops at 3 AM, they calmly rewrote the buffer handling in 45 minutes, taking us straight to 1st place overall.",
      relationship: "Hackathon Teammate & Peer Collaborator",
      linkedInUrl: "https://linkedin.com/in/example"
    }
  ],

  about: {
    headline: "Engineered with Rigor. Designed with Taste.",
    storyParagraphs: [
      "I fell in love with software the first time I saw code turn logic into an interactive experience on screen. But early on, I noticed a frustrating divide in our industry: systems software was powerful yet clunky, while beautifully designed apps were often slow and fragile underneath.",
      "My mission is to bridge that gap. I build software that treats performance as a foundational feature and interaction design as a human respect. Whether I am writing Go goroutines to synchronize a distributed cluster or calibrating cubic-bezier spring curves for a glass button, I hold every detail to the highest standard.",
      "When I am not coding or debugging distributed consensus edge cases, you will find me mentoring first-year CS students, exploring vintage Apple industrial design, playing chess, or hiking around Northern California."
    ],
    principles: [
      {
        title: "Speed is Respect",
        description: "Latency is not just a metric; it is the boundary between the user thinking and the machine answering. Software must respond before attention breaks."
      },
      {
        title: "Tactile Clarity",
        description: "The best interfaces feel tangible. Using light, continuous curvature, and subtle physics makes complex tools instantly intuitive."
      },
      {
        title: "First-Principles Architecture",
        description: "Never settle for cargo-culted libraries. Understanding data structures from byte layouts to cache lines produces elegant, bulletproof code."
      }
    ],
    collaborationStyle: "Transparent communicator, eager to receive constructive code reviews, proactive with documentation, and thrives in high-ownership environments.",
    interestsAndFunFacts: [
      "Can solve a Rubik's cube in under 22 seconds",
      "Mechanical keyboard enthusiast (custom soldered 65% with tactile switches)",
      "Avid road cyclist (completed a century 100-mile ride across the Pacific Coast)",
      "Co-host of the university ACM Hack Nights"
    ]
  },

  writingConfig: {
    enabled: true,
    sectionTitle: "Writing & What I'm Learning",
    posts: [
      {
        id: "post-1",
        title: "Why We Need Zero-Allocation Buffers in Real-Time Agent Memory",
        publishedDate: "October 2025",
        readingTime: "6 min read",
        summary: "A breakdown of garbage collection pauses in Go when handling 100k+ vector queries, and how direct memory mapping eliminated tail latency.",
        tags: ["Go", "Distributed Systems", "Performance", "Memory"],
        link: "#"
      },
      {
        id: "post-2",
        title: "Reverse-Engineering Apple's Liquid Glass: Physics Behind the Blur",
        publishedDate: "September 2025",
        readingTime: "8 min read",
        summary: "An exploration into backdrop-filter saturation, specular highlight angles, and how continuous curvature squircles evoke emotional warmth in software.",
        tags: ["Design Engineering", "CSS", "Apple HIG", "WebGL"],
        link: "#"
      },
      {
        id: "post-3",
        title: "Understanding Raft Linearizable Reads: Leases vs ReadIndex",
        publishedDate: "July 2025",
        readingTime: "10 min read",
        summary: "How to avoid network round-trips to every follower node during read queries while guaranteeing you never return stale data.",
        tags: ["Distributed Systems", "Consensus", "Raft", "Algorithms"],
        link: "#"
      }
    ]
  },

  socialLinks: [
    {
      platform: "github",
      label: "GitHub",
      url: "https://github.com/example",
      enabled: true,
      handleOrNote: "@yourhandle"
    },
    {
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://linkedin.com/in/example",
      enabled: true,
      handleOrNote: "in/yourname"
    },
    {
      platform: "email",
      label: "Email",
      url: "mailto:student@university.edu",
      enabled: true,
      handleOrNote: "student@university.edu"
    },
    {
      platform: "resume",
      label: "Résumé PDF",
      url: "/resume.pdf",
      enabled: true,
      handleOrNote: "Download (PDF)"
    },
    {
      platform: "calendly",
      label: "Schedule Chat",
      url: "https://calendly.com/example/chat",
      enabled: true,
      handleOrNote: "15-min Coffee Chat"
    },
    {
      platform: "x",
      label: "X (Twitter)",
      url: "https://x.com/example",
      enabled: true,
      handleOrNote: "@yourhandle"
    }
  ],

  contact: {
    headline: "Let's Build Something Exceptional Together",
    subtext: "I am actively seeking Summer 2027 Software Engineering internships. Whether you have an open position, an ambitious project, or just want to discuss distributed systems, I would love to connect.",
    emailAddress: "student@university.edu",
    calendlyUrl: "https://calendly.com/example/chat",
    officeHoursNote: "I typically reply within 24 hours on weekdays.",
  },

  meta: {
    copyrightYear: 2026,
    defaultTheme: "light",
    analyticsId: "", // Optional: set your Plausible or Umami data-domain here
  }
};

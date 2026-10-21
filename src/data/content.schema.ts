/**
 * TypeScript Schema Definitions for Portfolio Single Source of Truth (content.ts)
 * 
 * Every personal detail, project, case study, skill, and configuration flag
 * is defined here. Modifying `content.ts` updates the entire website.
 */

export interface AvailabilityConfig {
  isOpen: boolean;
  statusText: string;
  subtext: string;
  targetRole: string;
  season: string; // e.g. "Summer 2027"
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
}

export interface ProjectLink {
  label: string;
  url: string;
  isExternal: boolean;
}

export interface CaseStudyDecision {
  title: string;
  context: string;
  decision: string;
  rationale: string;
}

export interface CaseStudy {
  slug: string;
  problem: string;
  targetAudience: string;
  myRole: string;
  team: string;
  duration: string;
  techStack: string[];
  keyDecisions: CaseStudyDecision[];
  screenshots: {
    caption: string;
    alt: string;
    type: 'window' | 'mobile' | 'diagram';
  }[];
  measurableResults: {
    metric: string;
    label: string;
    context: string;
  }[];
  whatIWouldImprove: string[];
  liveDemoUrl?: string;
  githubUrl?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  category: 'web' | 'systems' | 'ai' | 'mobile';
  featured: boolean;
  thumbnailGradient: string;
  tags: string[];
  outcome: string; // High-impact one-liner e.g. "Reduced query latency by 42%"
  liveDemoUrl?: string;
  githubUrl?: string;
  caseStudy: CaseStudy;
}

export interface TimelineMilestone {
  id: string;
  period: string;
  title: string;
  organization: string;
  location: string;
  type: 'internship' | 'education' | 'research' | 'leadership' | 'award';
  description: string;
  achievements: string[];
  skillsUsed: string[];
  link?: string;
}

export interface SkillItem {
  name: string;
  iconName: string;
  levelDescription: string;
  associatedProjectIds: string[]; // IDs of projects in content.projects where this was used
}

export interface SkillCategory {
  categoryName: string;
  description: string;
  skills: SkillItem[];
}

export interface DockTool {
  name: string;
  iconName: string;
  category: string;
}

export interface HighlightTier {
  id: string;
  badge: string;
  title: string;
  headline: string;
  description: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  points: string[];
  accentColor: string;
}

export interface RecommendationItem {
  id: string;
  authorName: string;
  authorRole: string;
  organization: string;
  avatarInitials: string;
  quote: string;
  relationship: string;
  linkedInUrl?: string;
}

export interface AboutSectionData {
  headline: string;
  storyParagraphs: string[];
  principles: {
    title: string;
    description: string;
  }[];
  collaborationStyle: string;
  interestsAndFunFacts: string[];
}

export interface WritingPost {
  id: string;
  title: string;
  publishedDate: string;
  readingTime: string;
  summary: string;
  tags: string[];
  link: string;
}

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'email' | 'x' | 'resume' | 'calendly' | 'youtube' | 'medium';
  label: string;
  url: string;
  enabled: boolean;
  handleOrNote?: string;
}

export interface ContactConfig {
  headline: string;
  subtext: string;
  formspreeEndpoint?: string; // Optional: set if using Formspree form submission
  emailAddress: string;
  calendlyUrl?: string;
  officeHoursNote: string;
}

export interface PortfolioContent {
  personal: {
    fullName: string;
    preferredName: string;
    headline: string;
    subheadline: string;
    bioShort: string;
    location: string;
    college: string;
    graduationYear: string;
    degreeMajor: string;
    gpa?: string;
    githubUsername?: string;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    canonicalUrl: string;
    keywords: string[];
  };
  availability: AvailabilityConfig;
  recruiterQuickView: {
    name: string;
    roleSought: string;
    location: string;
    topSkills: string[];
    flagshipProjectId: string;
    workAuthorization: string;
  };
  stats: StatItem[];
  projects: ProjectItem[];
  timeline: TimelineMilestone[];
  skills: SkillCategory[];
  dockTools: DockTool[];
  highlights: HighlightTier[];
  recommendations: RecommendationItem[];
  about: AboutSectionData;
  writingConfig: {
    enabled: boolean;
    sectionTitle: string;
    posts: WritingPost[];
  };
  socialLinks: SocialLink[];
  contact: ContactConfig;
  meta: {
    copyrightYear: number;
    defaultTheme: 'light' | 'dark' | 'system';
    analyticsId?: string; // Plausible / Umami ID
  };
}

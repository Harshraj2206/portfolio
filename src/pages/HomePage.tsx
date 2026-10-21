import React, { useState, useEffect } from 'react';
import { portfolioContent } from '../data/content';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useAnalytics } from '../hooks/useAnalytics';
import { useDocumentHead } from '../hooks/useDocumentHead';

// Navigation & Common
import { PillNav } from '../components/common/PillNav';
import { MobileNav } from '../components/common/MobileNav';
import { BackToTop } from '../components/common/BackToTop';

// Sections
import { Hero } from '../components/sections/Hero';
import { RecruiterQuickView } from '../components/sections/RecruiterQuickView';
import { StatsRow } from '../components/sections/StatsRow';
import { ProjectsGrid } from '../components/sections/ProjectsGrid';
import { GitHubReposWidget } from '../components/sections/GitHubReposWidget';
import { Timeline } from '../components/sections/Timeline';
import { SkillsSection } from '../components/sections/SkillsSection';
import { HighlightTiers } from '../components/sections/HighlightTiers';
import { Recommendations } from '../components/sections/Recommendations';
import { AboutSection } from '../components/sections/AboutSection';
import { WritingSection } from '../components/sections/WritingSection';
import { ContactSection } from '../components/sections/ContactSection';
import { Footer } from '../components/sections/Footer';

// Case Study Quick-Preview Modal
import { CaseStudyModal } from '../components/case-study/CaseStudyModal';
import { ProjectItem } from '../data/content.schema';

const sectionIds = [
  'hero',
  'projects',
  'github-activity',
  'timeline',
  'skills',
  'highlights',
  'recommendations',
  'about',
  'writing',
  'contact',
];

interface HomePageProps {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  theme,
  resolvedTheme,
  onToggleTheme,
}) => {
  const {
    personal,
    availability,
    recruiterQuickView,
    stats,
    projects,
    timeline,
    skills,
    dockTools,
    highlights,
    recommendations,
    about,
    writingConfig,
    socialLinks,
    contact,
    meta,
  } = portfolioContent;

  const activeSection = useScrollSpy(sectionIds, 150);
  const { trackResumeDownload, trackProjectClick } = useAnalytics(meta.analyticsId);

  // Active Project for Case Study Quick-Preview Modal
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Hash change detection (for #project-{id})
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#project-')) {
        const id = hash.replace('#project-', '');
        if (projects.some((p) => p.id === id)) {
          setSelectedProjectId(id);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [projects]);

  const selectedProject: ProjectItem | null =
    projects.find((p) => p.id === selectedProjectId) || null;

  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    trackProjectClick(id, 'casestudy');
    window.history.pushState(null, '', `#project-${id}`);
  };

  const handleCloseProject = () => {
    setSelectedProjectId(null);
    if (window.location.hash.startsWith('#project-')) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const handleNextProject = () => {
    if (!selectedProjectId) return;
    const currentIndex = projects.findIndex((p) => p.id === selectedProjectId);
    const nextIndex = (currentIndex + 1) % projects.length;
    handleOpenProject(projects[nextIndex].id);
  };

  const handlePrevProject = () => {
    if (!selectedProjectId) return;
    const currentIndex = projects.findIndex((p) => p.id === selectedProjectId);
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    handleOpenProject(projects[prevIndex].id);
  };

  const resumeUrl = '/resume.pdf';
  const isWritingActive = writingConfig.enabled && writingConfig.posts.length > 0;

  // SEO tags
  useDocumentHead({
    title: `${personal.fullName} — Software Engineer & Designer Portfolio`,
    description: `${personal.headline}. ${personal.subheadline}`,
    canonicalUrl: 'https://portfolio.example.com/',
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: personal.fullName,
      jobTitle: 'Software Engineer & Designer',
      description: personal.headline,
      url: 'https://portfolio.example.com',
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: personal.college,
      },
      knowsAbout: skills.flatMap((c) => c.skills.map((s) => s.name)),
    },
  });

  return (
    <div className="relative min-h-screen text-apple-gray-900 dark:text-apple-gray-100 transition-colors duration-300">
      {/* Ambient Moving Mesh Gradient Background */}
      <div className="mesh-background" aria-hidden="true">
        <div
          className="mesh-blob w-[500px] h-[500px] -top-24 -left-24 animate-mesh-slow"
          style={{ background: 'radial-gradient(circle, var(--bg-mesh-1) 0%, transparent 70%)' }}
        />
        <div
          className="mesh-blob w-[600px] h-[600px] -top-32 -right-32 animate-mesh-slow"
          style={{
            background: 'radial-gradient(circle, var(--bg-mesh-2) 0%, transparent 70%)',
            animationDelay: '-5s',
          }}
        />
        <div
          className="mesh-blob w-[550px] h-[550px] top-[40%] left-[25%] animate-mesh-slow"
          style={{
            background: 'radial-gradient(circle, var(--bg-mesh-3) 0%, transparent 70%)',
            animationDelay: '-10s',
          }}
        />
        <div
          className="mesh-blob w-[650px] h-[650px] bottom-0 right-[15%] animate-mesh-slow"
          style={{
            background: 'radial-gradient(circle, var(--bg-mesh-4) 0%, transparent 70%)',
            animationDelay: '-15s',
          }}
        />
      </div>

      {/* Floating Centered Glass Pill Nav (Desktop) */}
      <PillNav
        activeSection={activeSection}
        theme={theme}
        resolvedTheme={resolvedTheme}
        onToggleTheme={onToggleTheme}
        preferredName={personal.preferredName}
        resumeUrl={resumeUrl}
        onDownloadResume={trackResumeDownload}
        writingEnabled={isWritingActive}
      />

      {/* Mobile Nav: Top Bar & Bottom Glass Dock */}
      <MobileNav
        activeSection={activeSection}
        theme={theme}
        resolvedTheme={resolvedTheme}
        onToggleTheme={onToggleTheme}
        preferredName={personal.preferredName}
        resumeUrl={resumeUrl}
        onDownloadResume={trackResumeDownload}
        writingEnabled={isWritingActive}
      />

      {/* Main Semantic Landmark */}
      <main id="main-content" className="relative z-10">
        {/* Hero Section */}
        <Hero
          personal={personal}
          availability={availability}
          resumeUrl={resumeUrl}
          onDownloadResume={trackResumeDownload}
        />

        {/* 10-Second Recruiter Fast-Track Quick View */}
        <RecruiterQuickView
          recruiterData={recruiterQuickView}
          personal={personal}
          resumeUrl={resumeUrl}
          onDownloadResume={trackResumeDownload}
          onSelectProject={handleOpenProject}
        />

        {/* Animated Impact Stats Row */}
        <StatsRow stats={stats} />

        {/* Featured Projects Grid & Filterable Showcase */}
        <ProjectsGrid
          projects={projects}
          onSelectProject={handleOpenProject}
        />

        {/* GitHub Live Telemetry Widget */}
        <GitHubReposWidget
          username={personal.githubUsername}
        />

        {/* The Record: Chronological Timeline */}
        <Timeline milestones={timeline} />

        {/* Skills with Context & macOS Dock */}
        <SkillsSection
          categories={skills}
          dockTools={dockTools}
          onSelectProject={handleOpenProject}
        />

        {/* Highlight Tiers (Flagship / Opportunities / Collaborate) */}
        <HighlightTiers
          highlights={highlights}
          onActionClick={(href) => {
            if (href.startsWith('#')) {
              const el = document.querySelector(href);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* Social Proof & Recommendations */}
        <Recommendations recommendations={recommendations} />

        {/* About & Engineering Philosophy */}
        <AboutSection about={about} />

        {/* Technical Writing & Learning Log (Config-driven & hidden when empty) */}
        <WritingSection
          enabled={writingConfig.enabled}
          sectionTitle={writingConfig.sectionTitle}
          posts={writingConfig.posts}
        />

        {/* Interactive Working Contact Suite */}
        <ContactSection
          contact={contact}
          socialLinks={socialLinks}
          resumeUrl={resumeUrl}
          onDownloadResume={trackResumeDownload}
        />
      </main>

      {/* Apple Legal & Sitemap Footer */}
      <Footer
        personal={personal}
        meta={meta}
        resumeUrl={resumeUrl}
      />

      {/* Back to Top Quick Action */}
      <BackToTop />

      {/* Spring Case Study Quick-Preview Modal */}
      <CaseStudyModal
        project={selectedProject}
        onClose={handleCloseProject}
        onNextProject={handleNextProject}
        onPrevProject={handlePrevProject}
      />
    </div>
  );
};

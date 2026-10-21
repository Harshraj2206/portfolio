import React, { useState, useEffect } from 'react';
import { portfolioContent } from '../data/content';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useAnalytics } from '../hooks/useAnalytics';
import { useDocumentHead } from '../hooks/useDocumentHead';

// Navigation & Common
import { PillNav } from '../components/common/PillNav';
import { MobileNav } from '../components/common/MobileNav';
import { BackToTop } from '../components/common/BackToTop';

// Curated Sections
import { Hero } from '../components/sections/Hero';
import { ProjectsGrid } from '../components/sections/ProjectsGrid';
import { Timeline } from '../components/sections/Timeline';
import { SkillsSection } from '../components/sections/SkillsSection';
import { AboutSection } from '../components/sections/AboutSection';
import { ContactSection } from '../components/sections/ContactSection';
import { Footer } from '../components/sections/Footer';

// Case Study Quick-Preview Modal
import { CaseStudyModal } from '../components/case-study/CaseStudyModal';
import { ProjectItem } from '../data/content.schema';

const sectionIds = ['hero', 'projects', 'experience', 'skills', 'about', 'contact'];

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
    projects,
    timeline,
    skills,
    dockTools,
    about,
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

  // Dynamic Document Head Management
  useDocumentHead({
    title: `${personal.fullName} — Senior Software Engineer Portfolio`,
    description: `${personal.headline}. ${personal.subheadline}`,
    canonicalUrl: 'https://portfolio.example.com/',
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: personal.fullName,
      jobTitle: 'Senior Software Engineer',
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
    <div className="relative min-h-screen text-[#1D1D1F] dark:text-[#F5F5F7] bg-[#F5F5F7] dark:bg-[#0B0C10] transition-colors duration-300">
      {/* ONE soft blue glow near the top + optional fainter lower glow (no multi-color blobs) */}
      <div className="ambient-lighting" aria-hidden="true">
        <div className="top-blue-glow" />
        <div className="lower-blue-glow" />
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
      />

      {/* Mobile Navigation */}
      <MobileNav
        activeSection={activeSection}
        theme={theme}
        resolvedTheme={resolvedTheme}
        onToggleTheme={onToggleTheme}
        preferredName={personal.preferredName}
        resumeUrl={resumeUrl}
        onDownloadResume={trackResumeDownload}
      />

      {/* Main Semantic Landmark: Senior Engineer Curated Stream */}
      <main id="main-content" className="relative z-10">
        {/* 1. Hero */}
        <Hero
          personal={personal}
          resumeUrl={resumeUrl}
          onDownloadResume={trackResumeDownload}
        />

        {/* 2. Projects (Alternating Left/Right Layout) */}
        <ProjectsGrid
          projects={projects}
          onSelectProject={handleOpenProject}
        />

        {/* 3. Experience (Clean Full-Width List) */}
        <Timeline milestones={timeline} />

        {/* 4. Skills (One Row of Neutral Chips & macOS Dock) */}
        <SkillsSection
          categories={skills}
          dockTools={dockTools}
          onSelectProject={handleOpenProject}
        />

        {/* 5. About (Engineering Philosophy & Principles) */}
        <AboutSection about={about} />

        {/* 6. Contact */}
        <ContactSection
          contact={contact}
          socialLinks={socialLinks}
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

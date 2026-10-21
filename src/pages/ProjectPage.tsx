import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { portfolioContent } from '../data/content';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { useAnalytics } from '../hooks/useAnalytics';
import { GlassButton } from '../components/common/GlassButton';
import { WindowFrame } from '../components/common/WindowFrame';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { NotFoundPage } from '../components/pages/NotFoundPage';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  Target,
  Users,
  Clock,
  Layers,
  Cpu,
  Lightbulb,
} from 'lucide-react';

interface ProjectPageProps {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const ProjectPage: React.FC<ProjectPageProps> = ({
  theme,
  resolvedTheme,
  onToggleTheme,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const { projects, personal, meta } = portfolioContent;
  const { trackProjectClick } = useAnalytics(meta.analyticsId);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  const currentIndex = projects.findIndex((p) => p.id === slug);
  const project = currentIndex !== -1 ? projects[currentIndex] : null;

  const prevProject =
    currentIndex !== -1
      ? projects[(currentIndex - 1 + projects.length) % projects.length]
      : null;
  const nextProject =
    currentIndex !== -1
      ? projects[(currentIndex + 1) % projects.length]
      : null;

  // SEO tags
  useDocumentHead({
    title: project
      ? `${project.title} — Case Study | ${personal.preferredName}`
      : 'Project Not Found',
    description: project
      ? `${project.outcome}. ${project.tagline}`
      : 'The requested engineering case study does not exist.',
    canonicalUrl: project
      ? `https://portfolio.example.com/projects/${project.id}`
      : 'https://portfolio.example.com/404',
    ogType: 'article',
    jsonLd: project
      ? {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: project.title,
          description: project.outcome,
          author: {
            '@type': 'Person',
            name: personal.fullName,
          },
          dependencies: project.tags.join(', '),
        }
      : undefined,
  });

  if (!project || !prevProject || !nextProject) {
    return <NotFoundPage />;
  }

  const { caseStudy } = project;

  return (
    <div className="relative min-h-screen bg-[#F5F5F7] dark:bg-[#0B0C10] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-300 pb-24">
      {/* Ambient Single Blue Lighting */}
      <div className="ambient-lighting" aria-hidden="true">
        <div className="top-blue-glow" />
      </div>

      {/* Top Floating Glass Navigation */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4 sm:px-6">
        <nav
          aria-label="Case Study Navigation"
          className="flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-pill glass-nav shadow-md"
        >
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0A84FF] dark:hover:text-[#409CFF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue rounded-pill"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All projects</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0A84FF] inline-block animate-pulse" />
            <span className="text-[13px] font-mono text-apple-gray-600 dark:text-[#A1A1A6]">
              {project.id}.app
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle
              theme={theme}
              resolvedTheme={resolvedTheme}
              onToggle={onToggleTheme}
            />

            {project.liveDemoUrl && (
              <GlassButton
                variant="primary"
                size="sm"
                href={project.liveDemoUrl}
                isExternal
                onClick={() => trackProjectClick(project.id, 'demo')}
                icon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Live demo
              </GlassButton>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-pill neutral-glass-chip text-[13px] font-medium">
              {project.category}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-[#0A84FF]/10 text-[#0A84FF] dark:text-[#409CFF] text-[13px] font-medium">
              <span>{project.outcome}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-[-0.03em] leading-tight">
            {project.title}
          </h1>

          <p className="text-[17px] text-apple-gray-600 dark:text-[#A1A1A6] leading-relaxed font-normal">
            {project.tagline}
          </p>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-card glass-surface">
              <div className="flex items-center gap-1.5 text-[12px] text-apple-gray-500 dark:text-[#A1A1A6] mb-1">
                <Target className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>My Role</span>
              </div>
              <p className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {caseStudy.myRole}
              </p>
            </div>

            <div className="p-3.5 rounded-card glass-surface">
              <div className="flex items-center gap-1.5 text-[12px] text-apple-gray-500 dark:text-[#A1A1A6] mb-1">
                <Clock className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>Duration</span>
              </div>
              <p className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {caseStudy.duration}
              </p>
            </div>

            <div className="p-3.5 rounded-card glass-surface">
              <div className="flex items-center gap-1.5 text-[12px] text-apple-gray-500 dark:text-[#A1A1A6] mb-1">
                <Users className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>Team Context</span>
              </div>
              <p className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-1">
                {caseStudy.team}
              </p>
            </div>

            <div className="p-3.5 rounded-card glass-surface">
              <div className="flex items-center gap-1.5 text-[12px] text-apple-gray-500 dark:text-[#A1A1A6] mb-1">
                <Layers className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>Target Users</span>
              </div>
              <p className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] line-clamp-1">
                {caseStudy.targetAudience}
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.liveDemoUrl && (
              <GlassButton
                variant="primary"
                size="md"
                href={project.liveDemoUrl}
                isExternal
                onClick={() => trackProjectClick(project.id, 'demo')}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                Launch live demo
              </GlassButton>
            )}

            {project.githubUrl && (
              <GlassButton
                variant="secondary"
                size="md"
                href={project.githubUrl}
                isExternal
                onClick={() => trackProjectClick(project.id, 'github')}
                icon={<Github className="w-4 h-4" />}
              >
                View source on GitHub
              </GlassButton>
            )}
          </div>
        </div>

        {/* 1. Problem & Context */}
        <section aria-labelledby="problem-heading" className="space-y-4">
          <h2 id="problem-heading" className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
            The problem & context
          </h2>
          <div className="p-6 sm:p-8 rounded-[28px] glass-surface">
            <p className="text-[16px] text-apple-gray-700 dark:text-[#D1D1D6] leading-relaxed">
              {caseStudy.problem}
            </p>
          </div>
        </section>

        {/* 2. Key Architectural Decisions & Engineering Trade-offs */}
        <section aria-labelledby="decisions-heading" className="space-y-5">
          <h2 id="decisions-heading" className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
            Key architectural decisions & trade-offs
          </h2>

          <div className="space-y-4">
            {caseStudy.keyDecisions.map((decision, idx) => (
              <WindowFrame key={idx} title={`decision-0${idx + 1}-${decision.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}.md`}>
                <div className="p-6 sm:p-8 space-y-4">
                  <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#0A84FF]" />
                    <span>{decision.title}</span>
                  </h3>

                  <div className="space-y-3 text-[14px] text-apple-gray-700 dark:text-[#A1A1A6]">
                    <p>
                      <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Context: </strong>
                      {decision.context}
                    </p>
                    <p>
                      <strong className="text-[#0A84FF] dark:text-[#409CFF] font-semibold">Decision: </strong>
                      {decision.decision}
                    </p>
                    <div className="p-3 rounded-chip bg-black/5 dark:bg-white/5 border border-white/5">
                      <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">Rationale: </strong>
                      <span>{decision.rationale}</span>
                    </div>
                  </div>
                </div>
              </WindowFrame>
            ))}
          </div>
        </section>

        {/* 3. Measurable Quantitative Results */}
        <section aria-labelledby="metrics-heading" className="space-y-4">
          <h2 id="metrics-heading" className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
            Quantified outcomes & benchmarks
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {caseStudy.measurableResults.map((result, idx) => (
              <div
                key={idx}
                className="p-6 rounded-card glass-surface flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl font-semibold text-[#0A84FF] dark:text-[#409CFF] font-mono tracking-tight">
                    {result.metric}
                  </div>
                  <div className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">
                    {result.label}
                  </div>
                </div>
                <p className="text-[13px] text-apple-gray-600 dark:text-[#A1A1A6] mt-3 pt-3 border-t border-black/5 dark:border-white/10 leading-relaxed">
                  {result.context}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Retrospective */}
        {caseStudy.whatIWouldImprove && caseStudy.whatIWouldImprove.length > 0 && (
          <section aria-labelledby="retro-heading" className="space-y-3">
            <div className="p-6 rounded-card glass-surface space-y-3">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                <Lightbulb className="w-4 h-4 text-[#0A84FF]" />
                <h3 id="retro-heading">Retrospective: What I would improve next</h3>
              </div>
              <ul className="space-y-2">
                {caseStudy.whatIWouldImprove.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[14px] text-apple-gray-600 dark:text-[#A1A1A6]"
                  >
                    <span className="text-[#0A84FF] select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 5. Technologies Used */}
        <section aria-labelledby="tech-heading" className="space-y-3">
          <h2 id="tech-heading" className="text-lg font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
            Technologies & tools applied
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1 rounded-pill neutral-glass-chip text-[13px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Next / Previous Footer Navigation */}
        <nav
          aria-label="Next or Previous Case Study"
          className="pt-8 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <Link
            to={`/projects/${prevProject.id}`}
            className="w-full sm:w-auto p-4 rounded-card glass-surface hover:border-[#0A84FF]/40 flex items-center gap-3 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
          >
            <ArrowLeft className="w-5 h-5 text-[#0A84FF] group-hover:-translate-x-1 transition-transform" />
            <div className="text-left">
              <span className="text-[12px] text-apple-gray-500 dark:text-[#A1A1A6] block uppercase tracking-wider">
                Previous
              </span>
              <span className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {prevProject.title}
              </span>
            </div>
          </Link>

          <Link
            to={`/projects/${nextProject.id}`}
            className="w-full sm:w-auto p-4 rounded-card glass-surface hover:border-[#0A84FF]/40 flex items-center justify-between sm:justify-end gap-3 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
          >
            <div className="text-right">
              <span className="text-[12px] text-apple-gray-500 dark:text-[#A1A1A6] block uppercase tracking-wider">
                Next
              </span>
              <span className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {nextProject.title}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-[#0A84FF] group-hover:translate-x-1 transition-transform" />
          </Link>
        </nav>
      </main>
    </div>
  );
};

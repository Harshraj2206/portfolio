import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { portfolioContent } from '../data/content';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { useAnalytics } from '../hooks/useAnalytics';
import { GlassCard } from '../components/common/GlassCard';
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
  TrendingUp,
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
      : 'Case Study Not Found',
    description: project
      ? `${project.tagline}. Key metric: ${project.outcome}`
      : 'Engineering case study not found.',
    canonicalUrl: project ? `https://portfolio.example.com/projects/${project.id}` : undefined,
    ogType: 'article',
    jsonLd: project
      ? {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: `${project.title}: ${project.tagline}`,
          description: project.caseStudy.problem,
          author: {
            '@type': 'Person',
            name: personal.fullName,
          },
          keywords: project.tags.join(', '),
          publisher: {
            '@type': 'Person',
            name: personal.fullName,
          },
        }
      : undefined,
  });

  if (!project || !prevProject || !nextProject) {
    return <NotFoundPage />;
  }

  const { caseStudy } = project;

  return (
    <div className="min-h-screen bg-apple-gray-100 dark:bg-[#0B0D12] text-apple-gray-900 dark:text-apple-gray-100 transition-colors duration-300 pb-24">
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4 sm:px-6">
        <nav
          aria-label="Case Study Navigation"
          className="flex items-center justify-between px-4 sm:px-6 py-3 rounded-pill glass-nav shadow-lg"
        >
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-apple-gray-700 dark:text-apple-gray-300 hover:text-apple-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue rounded-pill"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Projects</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-blue inline-block animate-pulse" />
            <span className="text-xs font-mono font-medium text-apple-gray-600 dark:text-apple-gray-400">
              Case Study / {project.title}
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
                Live Demo
              </GlassButton>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-pill bg-apple-blue/15 text-apple-blue text-xs font-semibold uppercase tracking-wider">
              {project.category}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-pill bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{project.outcome}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-apple-gray-900 dark:text-white tracking-tight leading-tight">
            {project.title}
          </h1>

          <p className="text-lg sm:text-xl text-apple-gray-600 dark:text-apple-gray-300 leading-relaxed font-normal">
            {project.tagline}
          </p>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-chip glass-surface bg-white/40 dark:bg-white/5 border border-white/20">
              <div className="flex items-center gap-1.5 text-xs text-apple-gray-500 dark:text-apple-gray-400 mb-1">
                <Target className="w-3.5 h-3.5 text-apple-blue" />
                <span>My Role</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-apple-gray-900 dark:text-white">
                {caseStudy.myRole}
              </p>
            </div>

            <div className="p-3.5 rounded-chip glass-surface bg-white/40 dark:bg-white/5 border border-white/20">
              <div className="flex items-center gap-1.5 text-xs text-apple-gray-500 dark:text-apple-gray-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-apple-purple" />
                <span>Duration</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-apple-gray-900 dark:text-white">
                {caseStudy.duration}
              </p>
            </div>

            <div className="p-3.5 rounded-chip glass-surface bg-white/40 dark:bg-white/5 border border-white/20">
              <div className="flex items-center gap-1.5 text-xs text-apple-gray-500 dark:text-apple-gray-400 mb-1">
                <Users className="w-3.5 h-3.5 text-apple-mint" />
                <span>Team Context</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-apple-gray-900 dark:text-white line-clamp-1">
                {caseStudy.team}
              </p>
            </div>

            <div className="p-3.5 rounded-chip glass-surface bg-white/40 dark:bg-white/5 border border-white/20">
              <div className="flex items-center gap-1.5 text-xs text-apple-gray-500 dark:text-apple-gray-400 mb-1">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Target Users</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-apple-gray-900 dark:text-white line-clamp-1">
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
                Launch Live Demo
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
                View Source on GitHub
              </GlassButton>
            )}
          </div>
        </div>

        {/* 1. Problem & Context */}
        <section aria-labelledby="problem-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <h2 id="problem-heading" className="text-xl sm:text-2xl font-bold text-apple-gray-900 dark:text-white">
              The Problem & Opportunity
            </h2>
          </div>
          <GlassCard variant="card" className="p-6 sm:p-8">
            <p className="text-base sm:text-lg text-apple-gray-700 dark:text-apple-gray-200 leading-relaxed">
              {caseStudy.problem}
            </p>
          </GlassCard>
        </section>

        {/* 2. Key Architectural Decisions & Engineering Trade-offs */}
        <section aria-labelledby="decisions-heading" className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-apple-blue" />
            <h2 id="decisions-heading" className="text-xl sm:text-2xl font-bold text-apple-gray-900 dark:text-white">
              Key Engineering Decisions & Trade-offs
            </h2>
          </div>

          <div className="space-y-4">
            {caseStudy.keyDecisions.map((decision, idx) => (
              <WindowFrame key={idx} title={`decision-0${idx + 1}-${decision.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}.md`}>
                <div className="p-6 sm:p-8 space-y-4">
                  <h3 className="text-lg font-bold text-apple-gray-900 dark:text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-apple-blue" />
                    <span>{decision.title}</span>
                  </h3>

                  <div className="space-y-3 text-xs sm:text-sm text-apple-gray-700 dark:text-apple-gray-300">
                    <p>
                      <strong className="text-apple-gray-900 dark:text-white">Context: </strong>
                      {decision.context}
                    </p>
                    <p>
                      <strong className="text-apple-blue font-semibold">Decision: </strong>
                      {decision.decision}
                    </p>
                    <div className="p-3 rounded-chip bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Engineering Rationale: </strong>
                      <span>{decision.rationale}</span>
                    </div>
                  </div>
                </div>
              </WindowFrame>
            ))}
          </div>
        </section>

        {/* 3. System Blueprint & Visual Telemetry */}
        {caseStudy.screenshots && caseStudy.screenshots.length > 0 && (
          <section aria-labelledby="blueprint-heading" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-apple-purple" />
              <h2 id="blueprint-heading" className="text-xl sm:text-2xl font-bold text-apple-gray-900 dark:text-white">
                System Blueprints & Telemetry
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {caseStudy.screenshots.map((s, index) => (
                <div key={index} className="space-y-2">
                  <WindowFrame
                    urlBar={`https://${project.id}.internal/telemetry-stream`}
                    className="p-8 flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white min-h-[14rem]"
                  >
                    <div className="text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-apple-blue/20 text-apple-blue flex items-center justify-center mx-auto shadow-inner">
                        <Layers className="w-7 h-7" />
                      </div>
                      <div className="text-sm font-mono text-apple-blue font-medium">
                        {s.alt}
                      </div>
                      <div className="text-xs text-slate-400 max-w-md mx-auto">
                        High-throughput architectural diagram & runtime telemetry stream
                      </div>
                    </div>
                  </WindowFrame>
                  <p className="text-xs text-center text-apple-gray-500 dark:text-apple-gray-400 italic">
                    {s.caption}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Measurable Quantitative Results */}
        <section aria-labelledby="metrics-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 id="metrics-heading" className="text-xl sm:text-2xl font-bold text-apple-gray-900 dark:text-white">
              Quantified Outcomes & Verified Impact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {caseStudy.measurableResults.map((result, idx) => (
              <GlassCard
                key={idx}
                variant="card"
                className="p-5 flex flex-col justify-between border-emerald-500/20"
              >
                <div>
                  <div className="text-3xl font-extrabold text-emerald-500 font-mono tracking-tight">
                    {result.metric}
                  </div>
                  <div className="text-sm font-semibold text-apple-gray-900 dark:text-white mt-1">
                    {result.label}
                  </div>
                </div>
                <p className="text-xs text-apple-gray-600 dark:text-apple-gray-400 mt-3 pt-3 border-t border-black/5 dark:border-white/10 leading-relaxed">
                  {result.context}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* 5. What I Would Improve Next */}
        {caseStudy.whatIWouldImprove && caseStudy.whatIWouldImprove.length > 0 && (
          <section aria-labelledby="retro-heading" className="space-y-3">
            <div className="p-6 rounded-card bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm font-semibold">
                <Lightbulb className="w-4 h-4" />
                <h3 id="retro-heading">Retrospective: What I Would Improve Next</h3>
              </div>
              <ul className="space-y-2">
                {caseStudy.whatIWouldImprove.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs sm:text-sm text-apple-gray-700 dark:text-apple-gray-300"
                  >
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 6. Technologies Used */}
        <section aria-labelledby="tech-heading" className="space-y-4">
          <h2 id="tech-heading" className="text-lg font-bold text-apple-gray-900 dark:text-white">
            Technologies & Tools Applied
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 rounded-pill glass-surface bg-white/40 dark:bg-white/5 border border-white/20 text-xs font-medium text-apple-gray-800 dark:text-apple-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Next / Previous Sticky Bottom Bar */}
        <nav
          aria-label="Next or Previous Case Study"
          className="pt-8 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <Link
            to={`/projects/${prevProject.id}`}
            className="w-full sm:w-auto p-4 rounded-panel glass-surface hover:border-apple-blue/40 flex items-center gap-3 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
          >
            <ArrowLeft className="w-5 h-5 text-apple-blue group-hover:-translate-x-1 transition-transform" />
            <div className="text-left">
              <span className="text-[11px] font-mono text-apple-gray-500 dark:text-apple-gray-400 block uppercase">
                Previous Case Study
              </span>
              <span className="text-sm font-bold text-apple-gray-900 dark:text-white">
                {prevProject.title}
              </span>
            </div>
          </Link>

          <Link
            to={`/projects/${nextProject.id}`}
            className="w-full sm:w-auto p-4 rounded-panel glass-surface hover:border-apple-blue/40 flex items-center justify-between sm:justify-end gap-3 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
          >
            <div className="text-right">
              <span className="text-[11px] font-mono text-apple-gray-500 dark:text-apple-gray-400 block uppercase">
                Next Case Study
              </span>
              <span className="text-sm font-bold text-apple-gray-900 dark:text-white">
                {nextProject.title}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-apple-blue group-hover:translate-x-1 transition-transform" />
          </Link>
        </nav>
      </main>
    </div>
  );
};

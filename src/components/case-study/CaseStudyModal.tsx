import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectItem } from '../../data/content.schema';
import { GlassButton } from '../common/GlassButton';
import {
  X,
  ExternalLink,
  Github,
  ChevronLeft,
  ChevronRight,
  Target,
  Users,
  Clock,
  Layers,
  Lightbulb
} from 'lucide-react';

interface CaseStudyModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onNextProject: () => void;
  onPrevProject: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  project,
  onClose,
  onNextProject,
  onPrevProject,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNextProject();
      if (e.key === 'ArrowLeft') onPrevProject();
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose, onNextProject, onPrevProject]);

  if (!project) return null;

  const { caseStudy } = project;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xl transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-5xl rounded-[28px] bg-white/95 dark:bg-[#16171D]/95 backdrop-blur-2xl border border-black/10 dark:border-white/12 shadow-panel-dark overflow-hidden z-10 max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sticky Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#16171D]/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-pill neutral-glass-chip uppercase tracking-wider">
                Case Study
              </span>
              <span className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate max-w-xs sm:max-w-md">
                {project.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onPrevProject}
                aria-label="Previous project"
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-apple-gray-600 dark:text-[#A1A1A6] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={onNextProject}
                aria-label="Next project"
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-apple-gray-600 dark:text-[#A1A1A6] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="h-4 w-px bg-black/10 dark:bg-white/15 mx-1" />
              <button
                onClick={onClose}
                aria-label="Close case study modal"
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/15 text-apple-gray-700 dark:text-[#F5F5F7] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto px-6 py-8 md:px-12 md:py-10 space-y-10">
            {/* Case Study Hero */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
                {project.title}
              </h2>
              <p className="mt-4 text-[17px] text-apple-gray-600 dark:text-[#A1A1A6] leading-relaxed max-w-3xl">
                {project.tagline}
              </p>

              {/* Action Links */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {project.liveDemoUrl && (
                  <GlassButton
                    variant="primary"
                    size="md"
                    href={project.liveDemoUrl}
                    isExternal
                    icon={<ExternalLink className="w-4 h-4" />}
                  >
                    Live demo
                  </GlassButton>
                )}
                {project.githubUrl && (
                  <GlassButton
                    variant="secondary"
                    size="md"
                    href={project.githubUrl}
                    isExternal
                    icon={<Github className="w-4 h-4" />}
                  >
                    View source
                  </GlassButton>
                )}
                <a
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-pill text-[14px] font-semibold bg-[#0A84FF]/15 text-[#0A84FF] dark:text-[#409CFF] hover:bg-[#0A84FF]/25 border border-[#0A84FF]/30 transition-all shadow-sm"
                >
                  <span>Open full case study page</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Meta Cards Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-card bg-black/5 dark:bg-white/5 border border-white/10">
              <div>
                <div className="text-[12px] text-apple-gray-500 dark:text-[#A1A1A6] flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-[#0A84FF]" /> Role
                </div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {caseStudy.myRole}
                </div>
              </div>

              <div>
                <div className="text-[12px] text-apple-gray-500 dark:text-[#A1A1A6] flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#0A84FF]" /> Duration
                </div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {caseStudy.duration}
                </div>
              </div>

              <div>
                <div className="text-[12px] text-apple-gray-500 dark:text-[#A1A1A6] flex items-center gap-1.5 mb-1">
                  <Target className="w-3.5 h-3.5 text-[#0A84FF]" /> Target
                </div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                  {caseStudy.targetAudience}
                </div>
              </div>

              <div>
                <div className="text-[12px] text-apple-gray-500 dark:text-[#A1A1A6] flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#0A84FF]" /> Tech Stack
                </div>
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                  {caseStudy.techStack.slice(0, 3).join(', ')}...
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
                The problem & opportunity
              </h3>
              <p className="text-[16px] text-apple-gray-700 dark:text-[#D1D1D6] leading-relaxed">
                {caseStudy.problem}
              </p>
            </div>

            {/* Measurable Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
                Quantified outcomes & benchmarks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {caseStudy.measurableResults.map((res) => (
                  <div
                    key={res.label}
                    className="p-5 rounded-card glass-surface"
                  >
                    <div className="text-3xl font-semibold text-[#0A84FF] dark:text-[#409CFF] font-mono tracking-tight">
                      {res.metric}
                    </div>
                    <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-1">
                      {res.label}
                    </div>
                    <div className="text-[13px] text-apple-gray-500 dark:text-[#A1A1A6] mt-2 leading-relaxed">
                      {res.context}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Architectural Decisions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
                Key architectural decisions & trade-offs
              </h3>
              <div className="space-y-4">
                {caseStudy.keyDecisions.map((dec, i) => (
                  <div
                    key={dec.title}
                    className="p-5 rounded-card glass-surface space-y-2"
                  >
                    <div className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {i + 1}. {dec.title}
                    </div>
                    <p className="text-[14px] text-apple-gray-600 dark:text-[#A1A1A6] leading-relaxed">
                      <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Context:</strong> {dec.context}
                    </p>
                    <p className="text-[14px] text-[#0A84FF] dark:text-[#409CFF] leading-relaxed">
                      <strong>Decision:</strong> {dec.decision}
                    </p>
                    <p className="text-[13px] text-apple-gray-500 dark:text-[#A1A1A6] leading-relaxed">
                      <strong>Rationale:</strong> {dec.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Retrospective */}
            {caseStudy.whatIWouldImprove && caseStudy.whatIWouldImprove.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  <Lightbulb className="w-4 h-4 text-[#0A84FF]" />
                  <span>Retrospective: What I would improve next</span>
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
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

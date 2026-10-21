import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectItem } from '../../data/content.schema';
import { WindowFrame } from '../common/WindowFrame';
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
  Award,
  TrendingUp,
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
  // Handle Escape key to close
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
        {/* Backdrop with Heavy Liquid Glass Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-2xl transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-5xl rounded-panel bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sticky Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-pill bg-apple-blue/15 text-apple-blue uppercase tracking-wider">
                Case Study
              </span>
              <span className="text-sm font-semibold text-apple-gray-800 dark:text-apple-gray-200 truncate max-w-xs sm:max-w-md">
                {project.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onPrevProject}
                aria-label="Previous project"
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-apple-gray-600 dark:text-apple-gray-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={onNextProject}
                aria-label="Next project"
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-apple-gray-600 dark:text-apple-gray-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="h-4 w-px bg-black/10 dark:bg-white/15 mx-1" />
              <button
                onClick={onClose}
                aria-label="Close case study"
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/15 text-apple-gray-700 dark:text-apple-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto px-6 py-8 md:px-12 md:py-10 space-y-12">
            {/* Case Study Hero */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-apple-gray-900 dark:text-white leading-[1.12]">
                {project.title}
              </h2>
              <p className="mt-4 text-lg text-apple-gray-600 dark:text-apple-gray-300 leading-relaxed max-w-3xl">
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
                    Launch Live Demo
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
                    View Source Code
                  </GlassButton>
                )}
              </div>
            </div>

            {/* Quick Meta Stats Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-card bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/5">
              <div>
                <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-apple-blue" /> Role
                </div>
                <div className="text-sm font-semibold text-apple-gray-800 dark:text-apple-gray-200">
                  {caseStudy.myRole}
                </div>
              </div>

              <div>
                <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-apple-blue" /> Duration
                </div>
                <div className="text-sm font-semibold text-apple-gray-800 dark:text-apple-gray-200">
                  {caseStudy.duration}
                </div>
              </div>

              <div>
                <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1.5 mb-1">
                  <Target className="w-3.5 h-3.5 text-apple-blue" /> Target
                </div>
                <div className="text-sm font-semibold text-apple-gray-800 dark:text-apple-gray-200 truncate">
                  {caseStudy.targetAudience}
                </div>
              </div>

              <div>
                <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-apple-blue" /> Tech Stack
                </div>
                <div className="text-sm font-semibold text-apple-gray-800 dark:text-apple-gray-200 truncate">
                  {caseStudy.techStack.slice(0, 3).join(', ')}...
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-apple-blue text-sm font-semibold">
                <Target className="w-4 h-4" />
                <span>The Problem & Engineering Challenge</span>
              </div>
              <p className="text-base text-apple-gray-700 dark:text-apple-gray-300 leading-relaxed">
                {caseStudy.problem}
              </p>
            </div>

            {/* Measurable Results High-Impact Numbers */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-apple-blue text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>Measurable Results & Concrete Numbers</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {caseStudy.measurableResults.map((res) => (
                  <div
                    key={res.label}
                    className="p-5 rounded-card bg-gradient-to-tr from-apple-blue/10 via-white/40 to-transparent dark:from-apple-blue/15 dark:via-white/5 dark:to-transparent border border-apple-blue/20"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-apple-blue font-apple">
                      {res.metric}
                    </div>
                    <div className="text-sm font-semibold text-apple-gray-900 dark:text-white mt-1">
                      {res.label}
                    </div>
                    <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-2 leading-relaxed">
                      {res.context}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Process & Key Architectural Decisions */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-apple-blue text-sm font-semibold">
                <Layers className="w-4 h-4" />
                <span>Process & Key Architectural Decisions</span>
              </div>
              <div className="space-y-4">
                {caseStudy.keyDecisions.map((dec, i) => (
                  <div
                    key={dec.title}
                    className="p-5 rounded-card bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/5 space-y-2"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-apple-blue">
                        Decision #{i + 1}
                      </span>
                      <h4 className="text-base font-bold text-apple-gray-900 dark:text-white">
                        {dec.title}
                      </h4>
                    </div>
                    <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                      <strong>Context:</strong> {dec.context}
                    </p>
                    <p className="text-xs text-apple-gray-700 dark:text-apple-gray-300">
                      <strong>Decision:</strong> {dec.decision}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-500/10 p-2.5 rounded-chip">
                      <strong>Outcome:</strong> {dec.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Screenshots in macOS Window Frame */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-apple-blue text-sm font-semibold">
                <Award className="w-4 h-4" />
                <span>System Architecture & Screenshots</span>
              </div>
              {caseStudy.screenshots.map((s, index) => (
                <div key={index} className="space-y-2">
                  <WindowFrame
                    urlBar={`https://${project.id}.systems.internal/metrics`}
                    className="aspect-[16/9] flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white p-6"
                  >
                    <div className="text-center p-6 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-apple-blue/20 text-apple-blue flex items-center justify-center mx-auto">
                        <Layers className="w-8 h-8" />
                      </div>
                      <div className="text-sm font-mono text-apple-blue">
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

            {/* What I Would Improve Next */}
            <div className="space-y-3 p-6 rounded-card bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm font-semibold">
                <Lightbulb className="w-4 h-4" />
                <span>Retrospective: What I Would Improve Next</span>
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

            {/* Bottom Footer Navigation */}
            <div className="pt-8 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
              <GlassButton
                variant="secondary"
                size="md"
                onClick={onPrevProject}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous Project
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="md"
                onClick={onNextProject}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next Project
              </GlassButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

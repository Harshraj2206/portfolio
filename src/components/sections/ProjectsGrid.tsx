import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectItem } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { SegmentedControl, SegmentOption } from '../common/SegmentedControl';
import { WindowFrame } from '../common/WindowFrame';
import { GlassCard } from '../common/GlassCard';
import { ExternalLink, Github, ArrowRight, Sparkles } from 'lucide-react';

interface ProjectsGridProps {
  projects: ProjectItem[];
  onSelectProject: (projectId: string) => void;
  className?: string;
}

type FilterCategory = 'all' | 'systems' | 'web' | 'ai' | 'mobile';

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  onSelectProject,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  const categories: SegmentOption<FilterCategory>[] = [
    { id: 'all', label: 'All Projects', count: projects.length },
    {
      id: 'systems',
      label: 'Systems',
      count: projects.filter((p) => p.category === 'systems').length,
    },
    {
      id: 'web',
      label: 'Web & Canvas',
      count: projects.filter((p) => p.category === 'web').length,
    },
    {
      id: 'ai',
      label: 'AI & Audio',
      count: projects.filter((p) => p.category === 'ai').length,
    },
    {
      id: 'mobile',
      label: 'macOS / Native',
      count: projects.filter((p) => p.category === 'mobile').length,
    },
  ];

  const filteredProjects = projects.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <section
      id="projects"
      aria-label="Featured Projects and Case Studies"
      className={`max-w-6xl mx-auto px-4 sm:px-6 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        eyebrow="Proof of Work"
        title="Featured Projects & Deep-Dive Case Studies"
        subtitle="Real engineering solving hard latency, consensus, and rendering challenges. Every project includes verified outcomes and measurable metrics."
      />

      {/* Segmented Filter Control */}
      <div className="flex justify-center mb-12">
        <SegmentedControl
          options={categories}
          selected={activeCategory}
          onChange={(cat) => setActiveCategory(cat)}
        />
      </div>

      {/* Projects Grid with Animated Layout Transitions */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard
                variant="card"
                className="h-full flex flex-col p-6 group border-white/50 dark:border-white/10"
              >
                {/* macOS Window Frame Thumbnail */}
                <WindowFrame
                  title={`${project.id}.systems`}
                  className="mb-6 aspect-[16/10] bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 overflow-hidden relative cursor-pointer"
                  onClick={() => onSelectProject(project.id)}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr ${project.thumbnailGradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* Window Content Mockup */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-pill bg-black/40 text-white backdrop-blur-md border border-white/10">
                        {project.category}
                      </span>
                      {project.featured && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-pill bg-apple-blue text-white shadow-sm">
                          <Sparkles className="w-3 h-3" /> Flagship
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                        {project.title.split('—')[0]}
                      </div>
                      <div className="text-xs font-medium text-emerald-300 flex items-center gap-1.5 drop-shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        {project.outcome}
                      </div>
                    </div>
                  </div>
                </WindowFrame>

                {/* Card Information */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => onSelectProject(project.id)}
                      className="text-xl font-bold text-apple-gray-900 dark:text-white cursor-pointer group-hover:text-apple-blue transition-colors"
                    >
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed line-clamp-2">
                      {project.tagline}
                    </p>

                    {/* Tech Pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-pill bg-black/5 dark:bg-white/10 text-xs font-medium text-apple-gray-700 dark:text-apple-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="mt-6 pt-5 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <a
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-apple-blue hover:text-blue-700 dark:hover:text-blue-400 group/btn transition-colors"
                      >
                        <span>Read Case Study</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                      <button
                        onClick={() => onSelectProject(project.id)}
                        className="text-xs text-apple-gray-500 hover:text-apple-gray-800 dark:hover:text-apple-gray-200 underline underline-offset-4 decoration-dotted transition-colors"
                      >
                        Quick Preview
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {project.liveDemoUrl && (
                        <a
                          href={project.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Live demo for ${project.title}`}
                          className="p-2 rounded-full glass-surface text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-blue hover:scale-105 active:scale-95 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`GitHub source for ${project.title}`}
                          className="p-2 rounded-full glass-surface text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-blue hover:scale-105 active:scale-95 transition-all"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

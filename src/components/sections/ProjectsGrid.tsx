import React from 'react';
import { ProjectItem } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { WindowFrame } from '../common/WindowFrame';
import { ProjectMockup } from './ProjectMockup';
import { ArrowRight, ExternalLink, Github } from 'lucide-react';

interface ProjectsGridProps {
  projects: ProjectItem[];
  onSelectProject: (projectId: string) => void;
  className?: string;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  onSelectProject,
  className = '',
}) => {
  return (
    <section
      id="projects"
      aria-label="Featured Projects and Case Studies"
      className={`max-w-6xl mx-auto px-4 sm:px-6 mb-24 md:mb-32 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        title="Featured projects & case studies"
        subtitle="Production systems solving hard latency, consensus, and rendering challenges with measurable outcomes."
      />

      {/* Full-Width Alternating Project Showcase */}
      <div className="space-y-12 md:space-y-16">
        {projects.map((project, index) => {
          const isEven = index % 2 === 0;
          const tags = (project.caseStudy?.techStack || project.tags).slice(0, 3);

          return (
            <div
              key={project.id}
              className={`p-6 sm:p-8 md:p-10 rounded-[28px] transition-all duration-300 ${
                project.featured
                  ? 'glass-featured ring-1 ring-white/15'
                  : 'glass-surface'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Large Screenshot or App Mockup in macOS Window Frame */}
                <div
                  className={`w-full ${
                    isEven ? 'lg:col-span-7' : 'lg:col-span-7 lg:order-2'
                  }`}
                >
                  <WindowFrame
                    title={`${project.id}.app`}
                    className="w-full cursor-pointer group"
                    onClick={() => onSelectProject(project.id)}
                  >
                    <ProjectMockup project={project} />
                  </WindowFrame>
                </div>

                {/* Project Metadata: Title, One-line Outcome, 3 Neutral Tags Below */}
                <div
                  className={`flex flex-col justify-center ${
                    isEven ? 'lg:col-span-5' : 'lg:col-span-5 lg:order-1'
                  }`}
                >
                  <div className="space-y-3">
                    <h3
                      onClick={() => onSelectProject(project.id)}
                      className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight cursor-pointer hover:text-[#0A84FF] dark:hover:text-[#409CFF] transition-colors"
                    >
                      {project.title}
                    </h3>

                    {/* One-line outcome (Sentence case) */}
                    <p className="text-[16px] text-apple-gray-600 dark:text-[#A1A1A6] font-normal leading-relaxed">
                      {project.outcome}
                    </p>

                    {/* Exactly 3 neutral tags below (No colors) */}
                    <div className="pt-2 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-pill neutral-glass-chip text-[13px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Blue only for primary link */}
                  <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <a
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#0A84FF] dark:text-[#409CFF] hover:underline underline-offset-4 transition-colors group/link"
                      >
                        <span>Read full case study</span>
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </a>

                      <button
                        type="button"
                        onClick={() => onSelectProject(project.id)}
                        className="text-[14px] text-apple-gray-500 hover:text-[#1D1D1F] dark:text-[#A1A1A6] dark:hover:text-[#F5F5F7] transition-colors"
                      >
                        Quick preview
                      </button>
                    </div>

                    {/* Secondary External Code / Live Links */}
                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${project.title} GitHub repository`}
                          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#515154] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveDemoUrl && (
                        <a
                          href={project.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${project.title} live demo`}
                          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#515154] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

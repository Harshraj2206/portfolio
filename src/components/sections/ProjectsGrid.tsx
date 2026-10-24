import React from 'react';
import { ProjectItem } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { ProjectCard } from './projects/ProjectCard';

interface ProjectsGridProps {
  projects: ProjectItem[];
  onSelectProject?: (projectId: string) => void;
  className?: string;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  onSelectProject,
  className = '',
}) => {
  const activeProjects = projects.filter((p) => !p.comingSoon);

  if (!activeProjects || activeProjects.length === 0) return null;

  return (
    <section
      id="projects"
      aria-label="Selected work"
      className={`w-full max-w-[1200px] [@media(min-width:1600px)]:max-w-[min(1360px,88vw)] mx-auto px-6 sm:px-8 py-[64px] lg:py-[96px] scroll-mt-20 ${className}`}
    >
      {/* 02 "Selected *work*" */}
      <SectionHeading
        index="02"
        label="Projects"
        title="Selected *work*"
        align="left"
      />

      {/* Stacked Project Showcase */}
      <div className="relative">
        {activeProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            totalProjects={activeProjects.length}
            onSelectProject={onSelectProject}
          />
        ))}
      </div>
    </section>
  );
};

import React from 'react';
import { SkillCategory, DockTool } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { Dock } from '../common/Dock';

interface SkillsSectionProps {
  categories: SkillCategory[];
  dockTools: DockTool[];
  onSelectProject?: (projectId: string) => void;
  className?: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  categories: _categories,
  dockTools,
  className = '',
}) => {
  // Extract primary skills into one clean, curated neutral row
  const primarySkills = [
    'Go (Golang)',
    'TypeScript',
    'Distributed Systems',
    'Raft Consensus',
    'React',
    'Node.js',
    'PostgreSQL',
    'Docker',
    'AVX2 SIMD',
    'WebGL / Canvas',
    'WebAssembly',
    'gRPC & Protobuf',
    'Swift / macOS',
    'System Architecture',
  ];

  return (
    <section
      id="skills"
      aria-label="Technical Skills and Tools"
      className={`max-w-5xl mx-auto px-4 sm:px-6 mb-24 md:mb-32 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        title="Skills & everyday toolchain"
        subtitle="Core engineering proficiencies, distributed architectures, and tools used in production."
      />

      {/* One Row of Neutral Glass Chips (No colors) */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto mb-12">
        {primarySkills.map((skill) => (
          <span
            key={skill}
            className="px-3.5 py-1.5 rounded-pill neutral-glass-chip text-[14px] font-medium transition-colors hover:border-white/20"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* macOS Dock-Style Everyday Tools Row with Magnification & Hover Tooltips */}
      <div className="space-y-4 text-center">
        <p className="text-[13px] font-medium text-apple-gray-500 dark:text-[#A1A1A6]">
          Everyday developer environment (hover to magnify)
        </p>
        <Dock tools={dockTools} />
      </div>
    </section>
  );
};

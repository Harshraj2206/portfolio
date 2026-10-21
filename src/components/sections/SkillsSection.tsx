import React from 'react';
import { SkillCategory, DockTool } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { Dock } from '../common/Dock';
import * as Icons from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

interface SkillsSectionProps {
  categories: SkillCategory[];
  dockTools: DockTool[];
  onSelectProject: (projectId: string) => void;
  className?: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  categories,
  dockTools,
  onSelectProject,
  className = '',
}) => {
  return (
    <section
      id="skills"
      aria-label="Technical Skills and Tools"
      className={`max-w-6xl mx-auto px-6 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        eyebrow="Capabilities & Tooling"
        title="Skills in Context & Everyday Tools"
        subtitle="No arbitrary percentage bars. Every skill is grounded in concrete production systems, open-source libraries, and measurable projects."
      />

      {/* Grouped Skills Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {categories.map((cat) => (
          <GlassCard key={cat.categoryName} variant="card" className="p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-apple-gray-900 dark:text-white">
                {cat.categoryName}
              </h3>
              <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-1">
                {cat.description}
              </p>
            </div>

            <div className="space-y-4">
              {cat.skills.map((skill) => {
                // @ts-expect-error dynamic Lucide icon index
                const IconComponent = Icons[skill.iconName] || Icons.Code;

                return (
                  <div
                    key={skill.name}
                    className="p-3.5 rounded-card bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-apple-blue/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-chip bg-white/60 dark:bg-white/10 text-apple-blue shadow-xs">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-apple-gray-900 dark:text-white">
                          {skill.name}
                        </div>
                        <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                          {skill.levelDescription}
                        </div>
                      </div>
                    </div>

                    {/* Associated Project Links */}
                    {skill.associatedProjectIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                        <span className="text-[10px] uppercase font-semibold text-apple-gray-400 mr-1">
                          Used in:
                        </span>
                        {skill.associatedProjectIds.map((pid) => (
                          <button
                            key={pid}
                            onClick={() => onSelectProject(pid)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue text-[11px] font-medium transition-colors"
                          >
                            <span>{pid}</span>
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* macOS Dock-Style Everyday Tools Row with Magnification */}
      <div className="space-y-4 text-center">
        <div className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wider">
          Primary Toolchain (Hover to magnify)
        </div>
        <Dock tools={dockTools} />
      </div>
    </section>
  );
};

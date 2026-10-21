import React from 'react';
import { TimelineMilestone } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import {
  Briefcase,
  GraduationCap,
  Award,
  Users,
  FlaskConical,
  MapPin,
  Calendar
} from 'lucide-react';

interface TimelineProps {
  milestones: TimelineMilestone[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  milestones,
  className = '',
}) => {
  const getTypeBadge = (type: TimelineMilestone['type']) => {
    switch (type) {
      case 'internship':
        return { label: 'Internship', icon: Briefcase, color: 'text-apple-blue bg-apple-blue/15' };
      case 'research':
        return { label: 'Research', icon: FlaskConical, color: 'text-apple-purple bg-apple-purple/15' };
      case 'leadership':
        return { label: 'Leadership', icon: Users, color: 'text-apple-teal bg-apple-teal/15' };
      case 'award':
        return { label: 'Award', icon: Award, color: 'text-amber-500 bg-amber-500/15' };
      case 'education':
        return { label: 'Education', icon: GraduationCap, color: 'text-emerald-500 bg-emerald-500/15' };
      default:
        return { label: 'Milestone', icon: Briefcase, color: 'text-apple-blue bg-apple-blue/15' };
    }
  };

  return (
    <section
      id="timeline"
      aria-label="Experience and Education Timeline"
      className={`max-w-4xl mx-auto px-6 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        eyebrow="The Record"
        title="Experience, Research & Leadership"
        subtitle="A chronological record of engineering internships, lab research, hackathon breakthroughs, and academic milestones."
      />

      <div className="relative border-l border-apple-gray-300 dark:border-apple-gray-700 ml-4 md:ml-8 space-y-10">
        {milestones.map((item, index) => {
          const badge = getTypeBadge(item.type);
          const Icon = badge.icon;
          const numberLabel = String(index + 1).padStart(2, '0');

          return (
            <div key={item.id} className="relative pl-6 md:pl-10">
              {/* Numbered Chronological Milestone Marker */}
              <div className="absolute -left-[18px] top-1.5 w-9 h-9 rounded-full glass-surface border border-apple-blue/40 flex items-center justify-center text-xs font-mono font-bold text-apple-blue shadow-md z-10">
                {numberLabel}
              </div>

              <GlassCard variant="card" className="p-6 md:p-8 space-y-4">
                {/* Header with Role and Period */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-xs font-semibold ${badge.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </span>
                    <span className="text-xs text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.period}
                    </span>
                  </div>

                  <span className="text-xs text-apple-gray-500 dark:text-apple-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </span>
                </div>

                {/* Title & Organization */}
                <div>
                  <h3 className="text-xl font-bold text-apple-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <div className="text-sm font-semibold text-apple-blue mt-0.5">
                    {item.organization}
                  </div>
                  <p className="mt-2 text-sm text-apple-gray-600 dark:text-apple-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Key Achievements */}
                <ul className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/10">
                  {item.achievements.map((ach, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs md:text-sm text-apple-gray-700 dark:text-apple-gray-300 leading-relaxed"
                    >
                      <span className="text-apple-blue font-bold shrink-0 mt-0.5">•</span>
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>

                {/* Skills Used Chips */}
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {item.skillsUsed.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-pill bg-black/5 dark:bg-white/10 text-[11px] font-medium text-apple-gray-600 dark:text-apple-gray-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </section>
  );
};

import React from 'react';
import { TimelineMilestone } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { Calendar, MapPin } from 'lucide-react';

interface TimelineProps {
  milestones: TimelineMilestone[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  milestones,
  className = '',
}) => {
  return (
    <section
      id="experience"
      aria-label="Experience & Track Record"
      className={`max-w-4xl mx-auto px-4 sm:px-6 mb-24 md:mb-32 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        title="Experience & engineering track record"
        subtitle="Full-time software engineering roles, distributed systems contributions, and verified impact."
      />

      {/* Clean Full-Width List (No numbered circles) */}
      <div className="space-y-6">
        {milestones.map((item) => (
          <div
            key={item.id}
            className="p-6 sm:p-8 rounded-[28px] glass-surface transition-all duration-300"
          >
            {/* Top Row: Role, Organization, Period, Location */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-black/5 dark:border-white/10">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {item.title}
                </h3>
                <div className="text-[15px] font-medium text-[#409CFF] mt-0.5">
                  {item.organization}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[13px] text-apple-gray-500 dark:text-[#A1A1A6]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.period}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.location}
                </span>
              </div>
            </div>

            {/* Role Context */}
            <p className="mt-4 text-[16px] text-apple-gray-600 dark:text-[#A1A1A6] font-normal leading-relaxed">
              {item.description}
            </p>

            {/* Achievements Bullet Points */}
            <ul className="mt-4 space-y-2">
              {item.achievements.map((ach, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-[15px] text-[#515154] dark:text-[#D1D1D6] leading-relaxed"
                >
                  <span className="text-[#0A84FF] font-bold select-none mt-0.5">―</span>
                  <span>{ach}</span>
                </li>
              ))}
            </ul>

            {/* Neutral Glass Chips for Technologies (No colors) */}
            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-black/5 dark:border-white/10">
              {item.skillsUsed.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-pill neutral-glass-chip text-[13px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

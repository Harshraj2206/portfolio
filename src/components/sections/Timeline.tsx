import React, { useRef, useState, useEffect } from 'react';
import { TimelineMilestone } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { Calendar, MapPin } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface TimelineProps {
  milestones: TimelineMilestone[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  milestones,
  className = '',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <section
      id="experience"
      ref={containerRef}
      aria-label="Experience & Track Record"
      className={`max-w-[1120px] mx-auto px-6 sm:px-8 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        title="Experience & track record"
        subtitle="Software engineering activities, practical contributions, and verified impact."
        align="left"
      />

      <div className="space-y-6">
        {milestones.map((item, index) => (
          <div
            key={item.id}
            className="p-8 sm:p-10 rounded-[28px] glass-surface transition-all duration-700 ease-out"
            style={{
              opacity: prefersReducedMotion || inView ? 1 : 0,
              transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: prefersReducedMotion ? '0ms' : `${80 + index * 80}ms`,
            }}
          >
            {/* Top Row: Role, Organization, Period, Location */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-5 border-b border-white/10">
              <div>
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                  {item.title}
                </h3>
                <div className="text-[17px] font-medium text-[#D1D1D6] mt-0.5">
                  {item.organization}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#9A9AA0]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-white/70" />
                  {item.period}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-white/70" />
                  {item.location}
                </span>
              </div>
            </div>

            {/* Role Context */}
            <p className="mt-5 text-[18px] text-[#9A9AA0] font-normal leading-[1.6] max-w-[62ch]">
              {item.description}
            </p>

            {/* Achievements */}
            {item.achievements && item.achievements.length > 0 && (
              <ul className="mt-4 space-y-2">
                {item.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] text-[#9A9AA0]">
                    <span className="text-white/60 font-semibold select-none mt-0.5">―</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

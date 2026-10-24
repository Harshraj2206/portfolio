import React, { useRef, useState, useEffect } from 'react';
import { SectionHeading } from '../common/SectionHeading';
import { GraduationCap, MapPin, Calendar, BookOpen } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface EducationSectionProps {
  educationText: string;
  college: string;
  degreeMajor: string;
  graduationYear: string;
  location?: string;
  className?: string;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  educationText,
  college,
  degreeMajor,
  graduationYear,
  location = 'Bengaluru, Karnataka',
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
      id="education"
      ref={containerRef}
      aria-label="Education"
      className={`max-w-[1120px] mx-auto px-6 sm:px-8 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        title="Education"
        subtitle="Academic background and foundational studies in computer science and artificial intelligence."
        align="left"
      />

      {/* Full-Width Card (1120px, 32-40px padding, neutral monochrome) */}
      <div
        className="p-8 sm:p-10 rounded-[28px] glass-surface transition-all duration-700 ease-out space-y-6"
        style={{
          opacity: prefersReducedMotion || inView ? 1 : 0,
          transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
          transitionDelay: prefersReducedMotion ? '0ms' : '80ms',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-[16px] bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/15">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                  {college}
                </h3>
                <p className="text-[18px] font-medium text-[#D1D1D6] mt-0.5">
                  {degreeMajor}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#9A9AA0]">
            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-white/5 border border-white/10 font-medium">
              <Calendar className="w-4 h-4 text-white/70" />
              Expected Graduation {graduationYear}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5">
              <MapPin className="w-4 h-4 text-white/70" />
              {location}
            </span>
          </div>
        </div>

        {/* Descriptive context */}
        <div className="flex items-start gap-3 pt-2">
          <BookOpen className="w-5 h-5 text-white/70 mt-1 shrink-0" />
          <p className="text-[18px] text-[#9A9AA0] font-normal leading-[1.6] max-w-[62ch]">
            {educationText}
          </p>
        </div>
      </div>
    </section>
  );
};

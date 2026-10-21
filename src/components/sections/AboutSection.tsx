import React from 'react';
import { AboutSectionData } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';

interface AboutSectionProps {
  about: AboutSectionData;
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about, className = '' }) => {
  return (
    <section
      id="about"
      aria-label="About and Engineering Philosophy"
      className={`max-w-5xl mx-auto px-4 sm:px-6 mb-24 md:mb-32 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        title="About & engineering principles"
        subtitle="Designing durable distributed architectures and human-centric developer experiences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personal Narrative & Collaboration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-[28px] glass-surface space-y-5">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7]">
              Background & approach
            </h3>

            {about.storyParagraphs.map((para, i) => (
              <p
                key={i}
                className="text-[16px] text-apple-gray-600 dark:text-[#A1A1A6] leading-relaxed font-normal"
              >
                {para}
              </p>
            ))}

            {/* Team Collaboration */}
            <div className="pt-4 border-t border-black/5 dark:border-white/10">
              <h4 className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                How I collaborate on engineering teams
              </h4>
              <p className="text-[15px] text-apple-gray-600 dark:text-[#A1A1A6] leading-relaxed">
                {about.collaborationStyle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Three Core Engineering Principles & Technical Interests (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7] px-1">
            Core principles
          </h3>

          <div className="space-y-3">
            {about.principles.map((pr) => (
              <div key={pr.title} className="p-5 rounded-card glass-surface space-y-1.5">
                <div className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {pr.title}
                </div>
                <p className="text-[14px] text-apple-gray-500 dark:text-[#A1A1A6] leading-relaxed">
                  {pr.description}
                </p>
              </div>
            ))}
          </div>

          {/* Technical Interests */}
          <div className="p-5 rounded-card glass-surface mt-4 space-y-2.5">
            <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Areas of active exploration
            </div>
            <ul className="space-y-1.5">
              {about.interestsAndFunFacts.map((fact, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-[13px] text-apple-gray-600 dark:text-[#A1A1A6] leading-relaxed"
                >
                  <span className="text-[#0A84FF] select-none">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { AboutSectionData } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { Sparkles, Heart, Compass, UserCheck } from 'lucide-react';

interface AboutSectionProps {
  about: AboutSectionData;
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about, className = '' }) => {
  return (
    <section
      id="about"
      aria-label="About and How I Work"
      className={`max-w-6xl mx-auto px-6 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        eyebrow="Background & Philosophy"
        title={about.headline}
        subtitle="Bridging the gap between robust distributed systems and delightful, human-centered interaction."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personal Narrative & Collaboration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard variant="card" className="p-8 space-y-5">
            <h3 className="text-xl font-bold text-apple-gray-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-apple-blue" />
              <span>The Story So Far</span>
            </h3>

            {about.storyParagraphs.map((para, i) => (
              <p
                key={i}
                className="text-base text-apple-gray-700 dark:text-apple-gray-300 leading-relaxed font-normal"
              >
                {para}
              </p>
            ))}

            {/* Collaboration Style */}
            <div className="pt-4 border-t border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-apple-blue mb-2">
                <UserCheck className="w-4 h-4" />
                <span>How I Collaborate on Teams</span>
              </div>
              <p className="text-sm text-apple-gray-600 dark:text-apple-gray-300 leading-relaxed">
                {about.collaborationStyle}
              </p>
            </div>
          </GlassCard>

          {/* Three Core Engineering Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {about.principles.map((pr) => (
              <GlassCard key={pr.title} variant="card" className="p-5 space-y-2">
                <div className="text-apple-blue">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-apple-gray-900 dark:text-white">
                  {pr.title}
                </h4>
                <p className="text-xs text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed">
                  {pr.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right Column: Visual Portrait & Curiosity / Fun Facts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard variant="card" className="p-6 overflow-hidden">
            <div className="relative aspect-square rounded-[22px] overflow-hidden bg-gradient-to-tr from-slate-200 via-sky-100 to-indigo-100 dark:from-slate-800 dark:via-indigo-950 dark:to-slate-900 mb-6">
              {/* Friendly Casual Artwork Placeholder */}
              <svg viewBox="0 0 300 300" className="w-full h-full object-cover">
                <defs>
                  <linearGradient id="aboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#AF52DE" />
                    <stop offset="100%" stopColor="#0A84FF" />
                  </linearGradient>
                </defs>
                <rect width="300" height="300" fill="url(#aboutGrad)" opacity="0.15" />
                <circle cx="150" cy="120" r="55" fill="#0A84FF" opacity="0.85" />
                <path d="M50,280 C50,200 95,190 150,190 C205,190 250,200 250,280 Z" fill="#AF52DE" opacity="0.7" />
                <text x="150" y="160" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">
                  Design & Systems
                </text>
              </svg>

              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-card glass-nav text-xs font-semibold text-apple-gray-800 dark:text-white flex items-center justify-between shadow-md">
                <span>Working from the West Coast</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            {/* Fun Facts & Outside the Terminal */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-apple-purple">
                <Heart className="w-4 h-4" />
                <span>Outside the Terminal</span>
              </div>
              <ul className="space-y-2">
                {about.interestsAndFunFacts.map((fact, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-xs text-apple-gray-700 dark:text-apple-gray-300 leading-relaxed"
                  >
                    <span className="text-apple-purple font-bold">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { GlassButton } from '../common/GlassButton';
import { AvailabilityBadge } from '../common/AvailabilityBadge';
import { PortfolioContent } from '../../data/content.schema';
import { ArrowDown, FileDown, Sparkles } from 'lucide-react';

interface HeroProps {
  personal: PortfolioContent['personal'];
  availability: PortfolioContent['availability'];
  resumeUrl: string;
  onDownloadResume: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  personal,
  availability,
  resumeUrl,
  onDownloadResume,
}) => {
  return (
    <section
      id="hero"
      aria-label="Hero Section"
      className="relative min-h-[90vh] flex flex-col justify-center pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Positioning Headline & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Live Availability Badge */}
            <div className="mb-6">
              <AvailabilityBadge config={availability} />
            </div>

            {/* Sentence-case Apple Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-apple-gray-900 dark:text-white leading-[1.08] font-apple">
              {personal.headline}
            </h1>

            {/* Two-sentence Clear Intro */}
            <p className="mt-6 text-lg sm:text-xl text-apple-gray-600 dark:text-apple-gray-300 font-normal leading-relaxed max-w-xl">
              {personal.subheadline}
            </p>

            {/* Action Buttons: View My Work & Download Résumé */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <GlassButton
                variant="primary"
                size="lg"
                href="#projects"
                icon={<ArrowDown className="w-4 h-4" />}
              >
                View my work
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="lg"
                href={resumeUrl}
                isExternal
                onClick={onDownloadResume}
                icon={<FileDown className="w-4 h-4" />}
              >
                Download résumé
              </GlassButton>
            </div>

            {/* Sub-note on Availability & Relocation */}
            <div className="mt-6 flex items-center gap-2 text-xs text-apple-gray-500 dark:text-apple-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-apple-blue shrink-0" />
              <span>
                Based in {personal.location}. Ready for {availability.season} roles.
              </span>
            </div>
          </div>

          {/* Right Column: Modern Portrait Frame with Glass Depth */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group w-full max-w-sm sm:max-w-md">
              {/* Ambient Glow Behind Frame */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-apple-blue/20 via-apple-purple/20 to-apple-teal/20 rounded-panel blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Portrait Container with continuous curvature */}
              <div className="relative overflow-hidden rounded-panel glass-surface p-3 shadow-2xl">
                <div className="relative aspect-[4/5] rounded-[28px] overflow-hidden bg-gradient-to-tr from-slate-200 via-sky-100 to-indigo-100 dark:from-slate-800 dark:via-indigo-950 dark:to-slate-900 flex items-center justify-center">
                  {/* Modern SVG Portrait Artwork Placeholder */}
                  <svg
                    viewBox="0 0 400 500"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  >
                    <defs>
                      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0A84FF" />
                        <stop offset="50%" stopColor="#AF52DE" />
                        <stop offset="100%" stopColor="#30B0C7" />
                      </linearGradient>
                      <filter id="glassBlur">
                        <feGaussianBlur stdDeviation="20" />
                      </filter>
                    </defs>

                    {/* Ambient organic background shapes */}
                    <circle cx="200" cy="180" r="140" fill="url(#avatarGrad)" opacity="0.3" filter="url(#glassBlur)" />
                    <circle cx="300" cy="350" r="120" fill="#30B0C7" opacity="0.25" filter="url(#glassBlur)" />

                    {/* Stylized Minimalist Technologist Portrait */}
                    <g transform="translate(100, 100)">
                      {/* Head */}
                      <circle cx="100" cy="90" r="60" fill="#E5E5EA" className="dark:fill-[#2C2C2E]" />
                      {/* Hair / Headband */}
                      <path
                        d="M45,85 C45,45 75,30 100,30 C125,30 155,45 155,85 C145,55 120,45 100,45 C80,45 55,55 45,85 Z"
                        fill="#0A84FF"
                        opacity="0.9"
                      />
                      {/* Glasses */}
                      <rect x="65" y="75" width="28" height="18" rx="6" fill="none" stroke="#0A84FF" strokeWidth="4" />
                      <rect x="107" y="75" width="28" height="18" rx="6" fill="none" stroke="#0A84FF" strokeWidth="4" />
                      <path d="M93,84 L107,84" stroke="#0A84FF" strokeWidth="3" />
                      {/* Shoulders / Torso */}
                      <path
                        d="M20,240 C20,165 60,160 100,160 C140,160 180,165 180,240 Z"
                        fill="#D1D1D6"
                        className="dark:fill-[#3A3A3C]"
                      />
                      {/* Collar */}
                      <path d="M85,160 L100,185 L115,160 Z" fill="#0A84FF" />
                    </g>
                  </svg>

                  {/* Floating Glass Status Overlay on Portrait */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-card glass-nav flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-apple-blue/20 flex items-center justify-center text-apple-blue font-bold text-xs">
                        {personal.preferredName[0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-apple-gray-900 dark:text-white">
                          {personal.fullName}
                        </div>
                        <div className="text-[11px] text-apple-gray-500 dark:text-apple-gray-400">
                          {personal.college}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-apple-blue/15 text-apple-blue">
                      Class of {personal.graduationYear.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { GlassButton } from '../common/GlassButton';
import { PortfolioContent } from '../../data/content.schema';
import { ArrowDown, FileDown } from 'lucide-react';

interface HeroProps {
  personal: PortfolioContent['personal'];
  resumeUrl: string;
  onDownloadResume: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  personal,
  resumeUrl,
  onDownloadResume,
}) => {
  return (
    <section
      id="hero"
      aria-label="Hero Introduction"
      className="relative min-h-[82vh] flex flex-col justify-center pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Name, One-line Role, Two CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Senior Name (Large, weight 600, tracking -0.03em, max 2 lines) */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08] font-apple">
              {personal.fullName}
            </h1>

            {/* One-line Senior Role / Positioning */}
            <p className="mt-5 text-[17px] sm:text-[19px] text-[#515154] dark:text-[#A1A1A6] font-normal leading-relaxed max-w-xl">
              Senior software engineer specializing in distributed systems, low-latency storage engines, and high-performance client architectures.
            </p>

            {/* Exactly Two Buttons: View My Work & Résumé */}
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
                Résumé
              </GlassButton>
            </div>
          </div>

          {/* Right Column: Real Photo Slot (rounded 28px, subtle specular rim) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-[360px]">
              {/* Outer Glass Card Frame with continuous curvature */}
              <div className="relative overflow-hidden rounded-[28px] glass-surface p-2 shadow-panel-dark">
                <div className="relative aspect-[4/5] rounded-[22px] overflow-hidden bg-[#16171D] border border-white/10">
                  <img
                    src="/images/portrait.jpg"
                    alt={`Portrait photo of ${personal.fullName}`}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                    loading="eager"
                    fetchPriority="high"
                    width={400}
                    height={500}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

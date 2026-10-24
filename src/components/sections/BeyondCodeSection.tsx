import React, { useRef, useState, useEffect } from 'react';
import { CreativeSectionData } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { Chip } from '../common/Chip';
import { Camera, Palette, ArrowUpRight } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface BeyondCodeSectionProps {
  creative?: CreativeSectionData;
  className?: string;
}

export const BeyondCodeSection: React.FC<BeyondCodeSectionProps> = ({
  creative,
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

  if (!creative) return null;

  const { introLine, photography, artCraft } = creative;

  const cards = [
    {
      ...photography,
      icon: Camera,
    },
    {
      ...artCraft,
      icon: Palette,
    },
  ];

  return (
    <section
      id="beyond-code"
      ref={containerRef}
      aria-label="Beyond Code"
      className={`w-full max-w-[1200px] [@media(min-width:1600px)]:max-w-[min(1360px,88vw)] mx-auto px-6 sm:px-8 py-[64px] lg:py-[96px] scroll-mt-20 ${className}`}
    >
      {/* 05 "Beyond *code*" */}
      <SectionHeading
        index="05"
        label="Creative"
        title="Beyond *code*"
        subtitle={introLine || "When I'm not coding, I'm usually behind a camera or with a paintbrush."}
        align="left"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const isReady = Boolean(card.ready);

          return (
            <div
              key={card.title}
              className="flex flex-col transition-all duration-700 ease-out"
              style={{
                opacity: prefersReducedMotion || inView ? 1 : 0,
                transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: prefersReducedMotion ? '0ms' : `${80 + idx * 80}ms`,
              }}
            >
              <GlassCard
                variant="default"
                radius="large"
                hoverEffect={false}
                className="flex-1 flex flex-col justify-between space-y-8 p-8 sm:p-10 relative overflow-hidden"
              >
                {/* Soft blurred monochrome texture inside tile */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)] blur-2xl"
                />

                <div className="space-y-5 relative z-10">
                  {/* Neutral Line Icon */}
                  <div className="w-12 h-12 rounded-[16px] bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-[26px] font-semibold tracking-[-0.03em] text-[#F5F5F7] leading-tight">
                    {card.title}
                  </h3>

                  {/* Short description in AA contrast */}
                  <p className="text-[17px] text-[#B4B4BA] font-normal leading-[1.6]">
                    {card.description}
                  </p>
                </div>

                {/* Action Button: Disabled "Coming soon" state if ready is false */}
                <div className="pt-2 relative z-10">
                  {isReady ? (
                    <Chip
                      variant="button"
                      as="a"
                      href={card.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${card.buttonText} (opens in new tab)`}
                    >
                      <span>{card.buttonText}</span>
                      <ArrowUpRight className="w-4 h-4 text-white/70 shrink-0" />
                    </Chip>
                  ) : (
                    <Chip variant="badge">
                      Coming soon
                    </Chip>
                  )}
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </section>
  );
};

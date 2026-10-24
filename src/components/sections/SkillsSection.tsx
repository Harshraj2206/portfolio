import React, { useRef, useState, useEffect } from 'react';
import { SkillCategory } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { Chip } from '../common/Chip';
import { TECH_MARQUEE } from '../../config/design';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Code2, Layers, Cpu, Sparkles, Terminal } from 'lucide-react';

interface SkillsSectionProps {
  categories: SkillCategory[];
  className?: string;
}

// Inline SVGs (monochrome #B4B4BA, scaled for 40x40 box with equal optical size and padding)
const TECH_ICONS: Record<string, React.ReactNode> = {
  python: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-[26px] h-[26px]">
      <title>Python</title>
      <path d="M14.25 0v2.625h2.625V4.5H12c-3.314 0-6 2.686-6 6v1.875H3.375V9.75H1.5V15h2.625v-2.625H6V14.25c0 3.314 2.686 6 6 6h4.875v1.875H19.5V19.5h-2.625v-1.875H22.5V12h-2.625v2.25H12c-2.071 0-3.75-1.679-3.75-3.75V9h9c1.657 0 3-1.343 3-3V1.5h-3V3h-2.625V0h-4.5zM8.25 4.125a1.125 1.125 0 110 2.25 1.125 1.125 0 010-2.25zm7.5 13.5a1.125 1.125 0 110 2.25 1.125 1.125 0 010-2.25z" />
    </svg>
  ),
  java: (
    <svg role="img" viewBox="5 0 15 18" fill="currentColor" className="w-[22px] h-[26px]">
      <title>Java</title>
      <path d="M9.06 14.39s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .5-.322-.504-.54-1.745-.378-3.324-.378-5.118.037zm-1.042-2.392s-1.08.798 1.056.983c2.72.235 4.996.113 7.828-.484 0 0 .614-.428-.506-.677-2.31-.513-5.32-.486-8.378.178zm10.741-3.791c.203.498.11 1.036-.34 1.488-1.08 1.087-2.81 1.626-4.992 1.944.382-.44.604-.962.604-1.528 0-.416-.123-.812-.348-1.168 1.922-.16 3.794-.74 5.076-.736zm-4.832 2.766c-.394.048-.802.083-1.223.106-2.67.147-5.467-.282-7.397-1.157 0 0-.616.48 1.05.814 2.153.432 4.908.412 7.57-.14 0 0 .53-.29-.0-.623zm-1.127-10.973c-.707 1.36-1.517 2.72-2.428 4.167-.64.99-1.187 2.015-1.187 3.12 0 1.614 1.189 2.68 2.842 2.68 1.478 0 2.494-.93 2.494-2.237 0-1.36-1.045-2.348-1.72-3.5-.707-1.204-.53-2.68-.53-4.23h.529zm2.384 5.306c-.497.835-1.009 1.664-1.009 2.592 0 1.123.832 1.902 1.993 1.902 1.058 0 1.785-.622 1.785-1.491 0-.908-.742-1.566-1.222-2.335-.503-.804-.375-1.788-.375-2.762h.375c-.24.728-.413 1.438-.047 2.094z" />
    </svg>
  ),
  html: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-[26px] h-[26px]">
      <title>HTML</title>
      <path d="M1.5 0h21l-1.91 21.563L12.01 24l-8.58-2.437L1.5 0zm15.776 5.547H6.724l.235 2.656h10.082l-.275 3.094H9.69l.275 3.093h7.034l-.47 5.156-4.529 1.25-4.53-1.25-.314-3.532H5.04l.588 6.562L12 21.844l6.372-1.781.932-10.438-.035-.375H7.954l-.275-3.093h9.378l.275-3.094z" />
    </svg>
  ),
  css: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-[26px] h-[26px]">
      <title>CSS</title>
      <path d="M1.5 0h21l-1.91 21.563L12.01 24l-8.58-2.437L1.5 0zm17.276 5.547H5.224l.235 2.656h13.082l-.275 3.094H7.94l.275 3.093h10.061l-.548 6.156-3.728 1.031-3.728-1.031-.255-2.844H6.38l.47 5.156L12 21.844l5.15-1.406.826-9.375H8.225l.275-3.093h10.552l.224-2.433z" />
    </svg>
  ),
  c: (
    <svg role="img" viewBox="0 0 24 24" fill="none" className="w-[26px] h-[26px]">
      <title>C</title>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M15.2 8.2c-.85-.6-1.9-.95-3.05-.95-2.9 0-5.2 2.1-5.2 4.75s2.3 4.75 5.2 4.75c1.15 0 2.2-.35 3.05-.95l-.65-1.25c-.65.45-1.45.7-2.4.7-2.05 0-3.65-1.5-3.65-3.25s1.6-3.25 3.65-3.25c.95 0 1.75.25 2.4.7l.65-1.25z"
        fill="currentColor"
      />
    </svg>
  ),
};

// Mini chip icons (14x14)
const MINI_ICONS: Record<string, React.ReactNode> = {
  python: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M14.25 0v2.625h2.625V4.5H12c-3.314 0-6 2.686-6 6v1.875H3.375V9.75H1.5V15h2.625v-2.625H6V14.25c0 3.314 2.686 6 6 6h4.875v1.875H19.5V19.5h-2.625v-1.875H22.5V12h-2.625v2.25H12c-2.071 0-3.75-1.679-3.75-3.75V9h9c1.657 0 3-1.343 3-3V1.5h-3V3h-2.625V0h-4.5zM8.25 4.125a1.125 1.125 0 110 2.25 1.125 1.125 0 010-2.25zm7.5 13.5a1.125 1.125 0 110 2.25 1.125 1.125 0 010-2.25z" />
    </svg>
  ),
  java: (
    <svg role="img" viewBox="5 0 15 18" fill="currentColor" className="w-3 h-3.5">
      <path d="M9.06 14.39s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .5-.322-.504-.54-1.745-.378-3.324-.378-5.118.037zm-1.042-2.392s-1.08.798 1.056.983c2.72.235 4.996.113 7.828-.484 0 0 .614-.428-.506-.677-2.31-.513-5.32-.486-8.378.178zm10.741-3.791c.203.498.11 1.036-.34 1.488-1.08 1.087-2.81 1.626-4.992 1.944.382-.44.604-.962.604-1.528 0-.416-.123-.812-.348-1.168 1.922-.16 3.794-.74 5.076-.736zm-4.832 2.766c-.394.048-.802.083-1.223.106-2.67.147-5.467-.282-7.397-1.157 0 0-.616.48 1.05.814 2.153.432 4.908.412 7.57-.14 0 0 .53-.29-.0-.623zm-1.127-10.973c-.707 1.36-1.517 2.72-2.428 4.167-.64.99-1.187 2.015-1.187 3.12 0 1.614 1.189 2.68 2.842 2.68 1.478 0 2.494-.93 2.494-2.237 0-1.36-1.045-2.348-1.72-3.5-.707-1.204-.53-2.68-.53-4.23h.529zm2.384 5.306c-.497.835-1.009 1.664-1.009 2.592 0 1.123.832 1.902 1.993 1.902 1.058 0 1.785-.622 1.785-1.491 0-.908-.742-1.566-1.222-2.335-.503-.804-.375-1.788-.375-2.762h.375c-.24.728-.413 1.438-.047 2.094z" />
    </svg>
  ),
  html: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M1.5 0h21l-1.91 21.563L12.01 24l-8.58-2.437L1.5 0zm15.776 5.547H6.724l.235 2.656h10.082l-.275 3.094H9.69l.275 3.093h7.034l-.47 5.156-4.529 1.25-4.53-1.25-.314-3.532H5.04l.588 6.562L12 21.844l6.372-1.781.932-10.438-.035-.375H7.954l-.275-3.093h9.378l.275-3.094z" />
    </svg>
  ),
  css: (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M1.5 0h21l-1.91 21.563L12.01 24l-8.58-2.437L1.5 0zm17.276 5.547H5.224l.235 2.656h13.082l-.275 3.094H7.94l.275 3.093h10.061l-.548 6.156-3.728 1.031-3.728-1.031-.255-2.844H6.38l.47 5.156L12 21.844l5.15-1.406.826-9.375H8.225l.275-3.093h10.552l.224-2.433z" />
    </svg>
  ),
  c: (
    <svg role="img" viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M15.2 8.2c-.85-.6-1.9-.95-3.05-.95-2.9 0-5.2 2.1-5.2 4.75s2.3 4.75 5.2 4.75c1.15 0 2.2-.35 3.05-.95l-.65-1.25c-.65.45-1.45.7-2.4.7-2.05 0-3.65-1.5-3.65-3.25s1.6-3.25 3.65-3.25c.95 0 1.75.25 2.4.7l.65-1.25z"
        fill="currentColor"
      />
    </svg>
  ),
};

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  categories,
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

  // Aggregate all skills
  const allSkills = categories.flatMap((cat) => cat.skills);

  // Group by level strictly according to source of truth
  const workingKnowledge = allSkills.filter(
    (s) => !s.isCurrentlyLearning && s.level?.toLowerCase().includes('working')
  );
  const intermediate = allSkills.filter(
    (s) => !s.isCurrentlyLearning && s.level?.toLowerCase().includes('intermediate')
  );
  const basics = allSkills.filter(
    (s) => !s.isCurrentlyLearning && s.level?.toLowerCase().includes('basic')
  );
  const learningNow = allSkills.filter(
    (s) => s.isCurrentlyLearning || s.level?.toLowerCase().includes('learning')
  );

  // Marquee items: matching tiles exactly (HTML and CSS, not HTML5 or CSS3)
  const marqueeItems = [
    { name: 'Python', key: 'python' },
    { name: 'Java', key: 'java' },
    { name: 'HTML', key: 'html' },
    { name: 'CSS', key: 'css' },
    { name: 'C', key: 'c' },
  ];

  const renderSkillChip = (name: string) => {
    const key = name.toLowerCase();
    const icon =
      key === 'python' || key.includes('python')
        ? MINI_ICONS.python
        : key === 'java' || key.includes('java')
        ? MINI_ICONS.java
        : key === 'html' || key.includes('html')
        ? MINI_ICONS.html
        : key === 'css' || key.includes('css')
        ? MINI_ICONS.css
        : key === 'c'
        ? MINI_ICONS.c
        : key.includes('prompt')
        ? <Terminal className="w-3.5 h-3.5 text-white/80 shrink-0" />
        : null;

    return (
      <Chip key={name} variant="default" icon={icon}>
        {name}
      </Chip>
    );
  };

  return (
    <section
      id="skills"
      ref={containerRef}
      aria-label="Skills"
      className={`w-full max-w-[1200px] [@media(min-width:1600px)]:max-w-[min(1360px,88vw)] mx-auto px-6 sm:px-8 py-[64px] lg:py-[96px] scroll-mt-20 ${className}`}
    >
      {/* 03 "Core *skills*" */}
      <SectionHeading
        index="03"
        label="Skills"
        title="Core *skills*"
        align="left"
      />

      <div className="space-y-8">
        {/* TECH_MARQUEE: 60s loop scrolling row of monochrome logos in 40px box, color #B4B4BA, opacity 0.9 (1 on hover), 15px label */}
        {TECH_MARQUEE && (
          <div
            className="group group-marquee relative w-full overflow-hidden py-6 rounded-[28px] glass-card border border-white/10"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
            }}
          >
            <div className="flex w-max items-center animate-marquee gap-16 select-none">
              {/* Track 1 */}
              <div className="flex items-center gap-16">
                {marqueeItems.concat(marqueeItems).map((item, idx) => (
                  <div
                    key={`track1-${idx}`}
                    className="flex items-center gap-3.5 text-[#B4B4BA] opacity-90 hover:opacity-100 transition-opacity duration-180"
                  >
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                      {TECH_ICONS[item.key] || (
                        <span className="font-sans text-sm tracking-wide text-[#B4B4BA]">{item.name}</span>
                      )}
                    </div>
                    <span className="text-[15px] font-sans font-medium text-[#B4B4BA]">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Track 2 (duplicated, aria-hidden for seamless loop) */}
              <div className="flex items-center gap-16" aria-hidden="true">
                {marqueeItems.concat(marqueeItems).map((item, idx) => (
                  <div
                    key={`track2-${idx}`}
                    className="flex items-center gap-3.5 text-[#B4B4BA] opacity-90 hover:opacity-100 transition-opacity duration-180"
                  >
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                      {TECH_ICONS[item.key] || (
                        <span className="font-sans text-sm tracking-wide text-[#B4B4BA]">{item.name}</span>
                      )}
                    </div>
                    <span className="text-[15px] font-sans font-medium text-[#B4B4BA]">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bento Row: auto-height tiles fitting content (24px padding), columns sized to content (1fr 1.35fr 0.9fr 1.75fr) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1.35fr_0.9fr_1.75fr] gap-4 items-start">
          {/* 1. Working Knowledge */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: prefersReducedMotion || inView ? 1 : 0,
              transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: prefersReducedMotion ? '0ms' : '80ms',
            }}
          >
            <GlassCard
              variant="default"
              radius="small"
              className="flex flex-col !p-6 space-y-3.5"
            >
              <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                <Code2 className="w-3.5 h-3.5 text-[#C9C9CF] shrink-0" />
                <span>Working knowledge</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {workingKnowledge.map((s) => renderSkillChip(s.name))}
              </div>
            </GlassCard>
          </div>

          {/* 2. Intermediate */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: prefersReducedMotion || inView ? 1 : 0,
              transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: prefersReducedMotion ? '0ms' : '160ms',
            }}
          >
            <GlassCard
              variant="default"
              radius="small"
              className="flex flex-col !p-6 space-y-3.5"
            >
              <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                <Layers className="w-3.5 h-3.5 text-[#C9C9CF] shrink-0" />
                <span>Intermediate</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {intermediate.map((s) => renderSkillChip(s.name))}
              </div>
            </GlassCard>
          </div>

          {/* 3. Basics */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: prefersReducedMotion || inView ? 1 : 0,
              transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: prefersReducedMotion ? '0ms' : '240ms',
            }}
          >
            <GlassCard
              variant="default"
              radius="small"
              className="flex flex-col !p-6 space-y-3.5"
            >
              <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                <Cpu className="w-3.5 h-3.5 text-[#C9C9CF] shrink-0" />
                <span>Basics</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {basics.map((s) => renderSkillChip(s.name))}
              </div>
            </GlassCard>
          </div>

          {/* 4. Learning Now (highlighted tile without heavier font weight) */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: prefersReducedMotion || inView ? 1 : 0,
              transform: prefersReducedMotion || inView ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: prefersReducedMotion ? '0ms' : '320ms',
            }}
          >
            <GlassCard
              variant="default"
              radius="small"
              className="flex flex-col !p-6 space-y-3.5 glass-card-dashed"
            >
              <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                <Sparkles className="w-3.5 h-3.5 text-[#C9C9CF] shrink-0" />
                <span>Learning now</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {learningNow.map((s) => renderSkillChip(s.name))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
};

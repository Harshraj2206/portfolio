import React from 'react';
import { WritingPost } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { Chip } from '../common/Chip';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

interface WritingSectionProps {
  enabled: boolean;
  sectionTitle: string;
  posts: WritingPost[];
  className?: string;
}

export const WritingSection: React.FC<WritingSectionProps> = ({
  enabled,
  sectionTitle,
  posts,
  className = '',
}) => {
  if (!enabled || posts.length === 0) return null;

  return (
    <section
      id="writing"
      aria-label="Writing and Learning Notes"
      className={`max-w-6xl mx-auto px-4 sm:px-6 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        eyebrow="Notes & Insights"
        title={sectionTitle}
        subtitle="Reflections on low-level systems, engineering decisions, and interaction architecture as I learn."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <GlassCard
            key={post.id}
            variant="card"
            className="p-6 md:p-8 flex flex-col justify-between group hover:border-white/30"
          >
            <div>
              <div className="flex items-center justify-between text-[13px] text-[#C9C9CF] mb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {post.publishedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {post.readingTime}
                </span>
              </div>

              <h3 className="text-lg font-semibold tracking-[-0.03em] text-white leading-snug">
                {post.title}
              </h3>

              <p className="mt-3 text-[13px] md:text-sm text-[#A8A8AF] leading-relaxed">
                {post.summary}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 2).map((tag) => (
                  <Chip key={tag} variant="badge">
                    #{tag}
                  </Chip>
                ))}
              </div>

              <a
                href={post.link}
                className="inline-flex items-center gap-1.5 text-[14px] font-medium tracking-[-0.01em] text-[#F2F2F4] hover:text-white transition-colors"
              >
                <span>Read note</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

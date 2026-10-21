import React from 'react';
import { WritingPost } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
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
      className={`max-w-6xl mx-auto px-6 mb-28 md:mb-36 scroll-mt-24 ${className}`}
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
            className="p-6 md:p-8 flex flex-col justify-between group hover:border-apple-blue/30"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-apple-gray-500 dark:text-apple-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {post.publishedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readingTime}
                </span>
              </div>

              <h3 className="text-lg font-bold text-apple-gray-900 dark:text-white group-hover:text-apple-blue transition-colors leading-snug">
                {post.title}
              </h3>

              <p className="mt-3 text-xs md:text-sm text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed">
                {post.summary}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-pill bg-black/5 dark:bg-white/10 text-[11px] text-apple-gray-600 dark:text-apple-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <a
                href={post.link}
                className="inline-flex items-center gap-1 text-xs font-semibold text-apple-blue group-hover:translate-x-0.5 transition-transform"
              >
                <span>Read note</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

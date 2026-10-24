import React from 'react';
import { RecommendationItem } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { Quote, Linkedin, CheckCircle2 } from 'lucide-react';

interface RecommendationsProps {
  recommendations: RecommendationItem[];
  className?: string;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  recommendations,
  className = '',
}) => {
  return (
    <section
      id="recommendations"
      aria-label="Recommendations and Testimonials"
      className={`max-w-6xl mx-auto px-4 sm:px-6 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        eyebrow="Social Proof"
        title="Recommendations & Endorsements"
        subtitle="Unfiltered feedback from professors, research advisors, industry mentors, and hackathon collaborators."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <GlassCard
            key={rec.id}
            variant="card"
            className="p-8 flex flex-col justify-between relative group hover:border-apple-blue/30"
          >
            <div>
              {/* Quote Icon */}
              <div className="text-apple-blue/30 dark:text-apple-blue/20 mb-4">
                <Quote className="w-8 h-8" />
              </div>

              {/* Quote Text */}
              <blockquote className="text-sm md:text-base text-apple-gray-800 dark:text-apple-gray-200 leading-relaxed italic">
                "{rec.quote}"
              </blockquote>
            </div>

            {/* Author Attribution */}
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-apple-blue/20 to-apple-purple/20 flex items-center justify-center font-semibold text-xs text-apple-blue shadow-xs">
                  {rec.avatarInitials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-apple-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>{rec.authorName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-apple-blue shrink-0" />
                  </div>
                  <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                    {rec.authorRole}
                  </div>
                  <div className="text-[11px] text-apple-gray-400">
                    {rec.organization}
                  </div>
                </div>
              </div>

              {rec.linkedInUrl && (
                <a
                  href={rec.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`LinkedIn for ${rec.authorName}`}
                  className="p-2 rounded-full glass-surface text-apple-gray-500 hover:text-apple-blue transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

import React from 'react';
import { HighlightTier } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface HighlightTiersProps {
  highlights: HighlightTier[];
  onActionClick: (href: string) => void;
  className?: string;
}

export const HighlightTiers: React.FC<HighlightTiersProps> = ({
  highlights,
  onActionClick,
  className = '',
}) => {
  return (
    <section
      id="highlights"
      aria-label="Highlights and Key Opportunities"
      className={`max-w-6xl mx-auto px-4 sm:px-6 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        eyebrow="At a Glance"
        title="Three Ways I Bring Value"
        subtitle="Whether you need deep systems architecture, an energetic Summer 2027 intern, or a hackathon collaborator."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {highlights.map((tier, index) => {
          const isFeatured = index === 1; // Middle card elevated slightly
          return (
            <GlassCard
              key={tier.id}
              variant="card"
              hoverEffect={false}
              className={`p-8 flex flex-col justify-between relative ${
                isFeatured ? 'border-apple-purple/40 shadow-xl md:-translate-y-2' : ''
              }`}
            >
              <div>
                {/* Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[11px] font-semibold px-3 py-1 rounded-pill"
                    style={{
                      backgroundColor: `${tier.accentColor}18`,
                      color: tier.accentColor,
                    }}
                  >
                    {tier.badge}
                  </span>
                  {isFeatured && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-apple-purple">
                      <Sparkles className="w-3 h-3" /> Priority
                    </span>
                  )}
                </div>

                <div className="text-xs text-apple-gray-500 dark:text-apple-gray-400 font-medium">
                  {tier.title}
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-apple-gray-900 dark:text-white mt-1">
                  {tier.headline}
                </h3>
                <p className="mt-4 text-xs md:text-sm text-apple-gray-600 dark:text-apple-gray-300 leading-relaxed">
                  {tier.description}
                </p>

                {/* Points List */}
                <ul className="mt-6 space-y-2.5 pt-6 border-t border-black/5 dark:border-white/10">
                  {tier.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-apple-gray-700 dark:text-apple-gray-300">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${tier.accentColor}25`,
                          color: tier.accentColor,
                        }}
                      >
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <GlassButton
                  variant={isFeatured ? 'primary' : 'secondary'}
                  size="md"
                  href={tier.primaryActionHref}
                  onClick={() => onActionClick(tier.primaryActionHref)}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="w-full justify-center"
                >
                  {tier.primaryActionLabel}
                </GlassButton>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
};

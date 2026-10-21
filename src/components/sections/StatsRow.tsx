import React from 'react';
import { StatCounter } from '../common/StatCounter';
import { StatItem } from '../../data/content.schema';

interface StatsRowProps {
  stats: StatItem[];
  className?: string;
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats, className = '' }) => {
  // Hide any stat item where value is empty, 0, or undefined
  const activeStats = stats.filter((s) => s.value !== undefined && s.value !== null && s.value > 0);

  if (activeStats.length === 0) return null;

  return (
    <section
      aria-label="Impact and Achievements Stats"
      className={`max-w-6xl mx-auto px-6 mb-24 md:mb-32 ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {activeStats.map((stat) => (
          <StatCounter
            key={stat.id}
            label={stat.label}
            value={stat.value}
            prefix={stat.prefix}
            suffix={stat.suffix}
            description={stat.description}
          />
        ))}
      </div>
    </section>
  );
};

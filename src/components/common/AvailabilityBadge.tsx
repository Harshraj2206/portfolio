import React from 'react';
import { AvailabilityConfig } from '../../data/content.schema';

interface AvailabilityBadgeProps {
  config: AvailabilityConfig;
  className?: string;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  config,
  className,
}) => {
  const { isOpen, statusText } = config;

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-pill glass-surface text-xs font-medium border shadow-xs ${
        isOpen
          ? 'border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
          : 'border-apple-gray-400/20 text-apple-gray-600 dark:text-apple-gray-400'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {isOpen && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOpen ? 'bg-emerald-500' : 'bg-apple-gray-400'
          }`}
        />
      </span>
      <span className="tracking-tight font-medium">{statusText}</span>
    </div>
  );
};

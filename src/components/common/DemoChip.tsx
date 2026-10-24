import React from 'react';
import { Chip } from './Chip';

interface DemoChipProps {
  className?: string;
}

/**
 * Small neutral glass chip (11px) indicating demo placeholder content.
 * Disappears automatically when real data replaces it.
 */
export const DemoChip: React.FC<DemoChipProps> = ({ className = '' }) => {
  return (
    <Chip
      variant="badge"
      className={className}
      title="Demo placeholder — replace with your real data in src/data/content.ts"
    >
      DEMO
    </Chip>
  );
};

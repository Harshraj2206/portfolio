import React from 'react';
import { AvailabilityConfig } from '../../data/content.schema';
import { Chip } from './Chip';

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
    <Chip
      variant="status"
      status={isOpen ? 'live' : 'in-development'}
      className={className}
    >
      {statusText}
    </Chip>
  );
};

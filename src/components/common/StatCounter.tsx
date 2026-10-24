import React, { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';
import { GlassCard } from './GlassCard';

interface StatCounterProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description?: string;
  className?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  description,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 1.6,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          // If decimal, keep 2 decimal places
          if (value % 1 !== 0) {
            setDisplayValue(Number(latest.toFixed(2)));
          } else {
            setDisplayValue(Math.floor(latest));
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <GlassCard
      ref={ref}
      variant="card"
      className={`p-6 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-apple-gray-900 dark:text-white flex items-baseline gap-1 font-apple">
          {prefix && <span className="text-2xl md:text-3xl font-medium text-apple-blue">{prefix}</span>}
          <span>{value % 1 !== 0 ? displayValue.toFixed(2) : displayValue}</span>
          {suffix && <span className="text-2xl md:text-3xl font-medium text-apple-blue">{suffix}</span>}
        </div>
        <div className="mt-2 text-sm font-semibold text-apple-gray-800 dark:text-apple-gray-200">
          {label}
        </div>
      </div>
      {description && (
        <div className="mt-3 text-xs text-apple-gray-500 dark:text-apple-gray-400 leading-relaxed">
          {description}
        </div>
      )}
    </GlassCard>
  );
};

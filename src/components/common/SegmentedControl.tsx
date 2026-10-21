import { motion } from 'framer-motion';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  selected: T;
  onChange: (id: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="Category Filter"
      className={`inline-flex items-center p-1 rounded-pill glass-surface bg-black/5 dark:bg-white/5 shadow-inner max-w-full overflow-x-auto scrollbar-none ${className}`}
    >
      {options.map((option) => {
        const isSelected = selected === option.id;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.id)}
            className={`relative px-4 py-2 text-xs md:text-sm font-medium rounded-pill transition-colors duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue ${
              isSelected
                ? 'text-apple-gray-900 dark:text-white font-semibold'
                : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="segmentedControlIndicator"
                className="absolute inset-0 bg-white dark:bg-[#2C2C2E] rounded-pill shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {option.label}
              {typeof option.count === 'number' && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-apple-blue/15 text-apple-blue font-semibold'
                      : 'bg-black/5 dark:bg-white/10 text-apple-gray-500'
                  }`}
                >
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string; // Kept in interface for backward compatibility, but intentionally not rendered per design specs
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  align = 'center',
  className = '',
}) => {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-3xl mb-12 md:mb-16 ${alignClass} ${className}`}>
      {/* No small uppercase pill labels per Apple Liquid Glass design specifications */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.12]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-[16px] sm:text-[17px] text-apple-gray-600 dark:text-[#A1A1A6] font-normal leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import clsx from 'clsx';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'card' | 'panel' | 'chip';
  hoverEffect?: boolean;
  specular?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  className,
  variant = 'card',
  hoverEffect = true,
  specular = true,
  ...props
}, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!specular || !innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const roundedClasses = {
    card: 'rounded-card', // 28px
    panel: 'rounded-panel', // 36px
    chip: 'rounded-chip', // 14px
  }[variant];

  return (
    <div
      ref={innerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        'relative overflow-hidden glass-surface transition-all duration-300',
        roundedClasses,
        hoverEffect && 'glass-surface-hover',
        className
      )}
      {...props}
    >
      {/* Specular Radial Light Reflection on Hover */}
      {specular && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-60 dark:opacity-30"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.45), transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

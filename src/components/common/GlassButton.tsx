import React from 'react';
import clsx from 'clsx';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  isExternal?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  isExternal = false,
  className,
  icon,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-[13px] font-medium gap-1.5',
    md: 'px-5 py-2.5 text-[14px] font-medium gap-2',
    lg: 'px-7 py-3 text-[16px] font-semibold gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'apple-button-primary',
    secondary: 'apple-button-secondary',
    ghost: 'bg-transparent text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95',
  }[variant];

  const baseClasses = clsx(
    'inline-flex items-center justify-center rounded-pill cursor-pointer transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2',
    sizeClasses,
    variantClasses,
    className
  );

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

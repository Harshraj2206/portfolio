import React from 'react';
import clsx from 'clsx';

interface WindowFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  urlBar?: string;
  onClick?: () => void;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  children,
  title,
  className,
  urlBar,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'overflow-hidden rounded-card border border-white/40 dark:border-white/10 bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-xl shadow-lg transition-all duration-300',
        className
      )}
    >
      {/* macOS Title Bar & Traffic Lights */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/20 select-none">
        <div className="flex items-center gap-2">
          {/* Traffic lights: Close, Minimize, Expand */}
          <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 inline-block shadow-sm" />
        </div>

        {/* Optional Title or URL Bar */}
        {urlBar ? (
          <div className="flex-1 max-w-xs mx-auto px-3 py-1 rounded-pill bg-black/5 dark:bg-white/5 text-[11px] font-mono text-apple-gray-500 dark:text-apple-gray-400 text-center truncate">
            {urlBar}
          </div>
        ) : title ? (
          <span className="text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400 truncate">
            {title}
          </span>
        ) : (
          <div className="w-12" />
        )}

        <div className="w-12" />
      </div>

      {/* Window Body */}
      <div className="relative overflow-hidden">{children}</div>
    </div>
  );
};

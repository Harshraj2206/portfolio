import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { DockTool } from '../../data/content.schema';
import { getSkillOrToolIconComponent } from './IconResolver';

interface DockProps {
  tools: DockTool[];
  className?: string;
}

interface DockItemProps {
  tool: DockTool;
  mouseX: ReturnType<typeof useMotionValue<number>>;
}

const DockItem: React.FC<DockItemProps> = ({ tool, mouseX }) => {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [44, 68, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 15 });

  const IconComponent = getSkillOrToolIconComponent(tool.iconName);

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      className="relative group rounded-card p-2 flex items-center justify-center glass-surface cursor-pointer shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-full h-full rounded-chip bg-gradient-to-tr from-white/30 to-white/5 dark:from-white/10 dark:to-transparent flex items-center justify-center text-apple-gray-800 dark:text-apple-gray-200 group-hover:text-apple-blue transition-colors">
        <IconComponent className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
      </div>

      {/* macOS Tooltip */}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-2.5 py-1 rounded-pill bg-black/80 dark:bg-white/90 text-white dark:text-black text-[11px] font-medium shadow-md whitespace-nowrap z-30">
        {tool.name}
      </span>
    </motion.div>
  );
};

export const Dock: React.FC<DockProps> = ({ tools, className }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`flex items-end justify-start sm:justify-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-panel glass-nav max-w-full overflow-x-auto mx-auto scrollbar-none ${className}`}
    >
      {tools.map((tool) => (
        <DockItem key={tool.name} tool={tool} mouseX={mouseX} />
      ))}
    </div>
  );
};

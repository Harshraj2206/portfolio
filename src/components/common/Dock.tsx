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

  const widthSync = useTransform(distance, [-120, 0, 120], [48, 72, 48]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 15 });

  const IconComponent = getSkillOrToolIconComponent(tool.iconName);

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      role="button"
      tabIndex={0}
      aria-label={`${tool.name} tool`}
      className="relative group rounded-card p-2.5 flex items-center justify-center glass-surface cursor-pointer shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
    >
      <div className="w-full h-full rounded-chip bg-white/5 flex items-center justify-center text-apple-gray-800 dark:text-[#F5F5F7] group-hover:text-[#409CFF] transition-colors">
        <IconComponent className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
      </div>

      {/* Accessible macOS Tooltip on Hover & Focus (Labels at least 13px) */}
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 px-3 py-1 rounded-pill bg-[#16171D] text-[#F5F5F7] text-[13px] font-medium shadow-md border border-white/10 whitespace-nowrap z-30"
      >
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
      aria-label="Everyday Toolchain Dock"
      className={`flex items-end justify-start sm:justify-center gap-2 sm:gap-3 p-3 rounded-panel glass-nav max-w-full overflow-x-auto mx-auto scrollbar-none ${className}`}
    >
      {tools.map((tool) => (
        <DockItem key={tool.name} tool={tool} mouseX={mouseX} />
      ))}
    </div>
  );
};

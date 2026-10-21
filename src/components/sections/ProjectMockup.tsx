import React from 'react';
import { ProjectItem } from '../../data/content.schema';

interface ProjectMockupProps {
  project: ProjectItem;
}

export const ProjectMockup: React.FC<ProjectMockupProps> = ({ project }) => {
  if (project.id === 'aurakv') {
    return (
      <div className="relative w-full aspect-[16/10] bg-[#12131A] overflow-hidden group">
        <img
          src="/images/projects/aurakv.jpg"
          alt="AuraKV Distributed Storage Metrics & Topology Dashboard"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          width={800}
          height={500}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/60 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  if (project.id === 'pulseflow') {
    return (
      <div className="relative w-full aspect-[16/10] bg-[#0E1015] p-5 flex flex-col justify-between overflow-hidden select-none font-mono">
        {/* Subtle Canvas Dot Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #A1A1A6 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Top Mini Toolbar */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-[#A1A1A6]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-pill bg-white/10 text-white text-[10px]">
              CANVAS 120 FPS
            </span>
            <span>Zoom: 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="text-emerald-400 font-sans text-xs">WebGL Active</span>
          </div>
        </div>

        {/* Node Graph Mockup */}
        <div className="relative z-10 my-auto grid grid-cols-3 gap-4 items-center">
          {/* Node 1 */}
          <div className="rounded-card bg-white/5 border border-white/10 p-3 shadow-md backdrop-blur-md">
            <div className="text-[10px] text-[#A1A1A6] uppercase tracking-wider mb-1">Source</div>
            <div className="text-xs font-semibold text-white font-sans">Stream Ingest</div>
            <div className="mt-2 text-[10px] text-emerald-400">48 kHz • 24-bit</div>
          </div>

          {/* Node 2 (Connected) */}
          <div className="rounded-card bg-white/10 border border-[#0A84FF]/40 p-3.5 shadow-lg backdrop-blur-md ring-1 ring-[#0A84FF]/30">
            <div className="text-[10px] text-[#409CFF] uppercase tracking-wider mb-1">Transform</div>
            <div className="text-xs font-semibold text-white font-sans">FFT Web Worker</div>
            <div className="mt-2 text-[10px] text-[#A1A1A6]">0.4ms compute</div>
          </div>

          {/* Node 3 */}
          <div className="rounded-card bg-white/5 border border-white/10 p-3 shadow-md backdrop-blur-md">
            <div className="text-[10px] text-[#A1A1A6] uppercase tracking-wider mb-1">Renderer</div>
            <div className="text-xs font-semibold text-white font-sans">Shader Output</div>
            <div className="mt-2 text-[10px] text-white">60k vertices</div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-[#A1A1A6] pt-2 border-t border-white/5 font-sans">
          <span>Latency: 8.3ms per frame</span>
          <span className="text-[#409CFF]">OffscreenCanvas thread</span>
        </div>
      </div>
    );
  }

  if (project.id === 'synapse-studio' || project.id === 'synapse') {
    return (
      <div className="relative w-full aspect-[16/10] bg-[#0E1015] p-5 flex flex-col justify-between overflow-hidden select-none">
        {/* Audio Waveform / Spectrogram Graphic */}
        <div className="flex items-center justify-between text-xs text-[#A1A1A6] font-mono">
          <span>Wasm Audio Worklet</span>
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Inferencing (4.2ms)
          </span>
        </div>

        {/* Spectral Analyzer Bars */}
        <div className="my-auto space-y-2">
          <div className="flex items-end justify-between h-20 gap-1 px-2">
            {[45, 62, 28, 80, 95, 60, 42, 88, 70, 52, 98, 84, 65, 40, 72, 90, 55, 30, 68, 85].map(
              (h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${h}%`,
                    background:
                      i >= 8 && i <= 14
                        ? 'linear-gradient(to top, rgba(10, 132, 255, 0.4), #0A84FF)'
                        : 'rgba(255, 255, 255, 0.15)',
                  }}
                />
              )
            )}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#A1A1A6] px-2">
            <span>20 Hz</span>
            <span>1 kHz</span>
            <span>5 kHz</span>
            <span>20 kHz</span>
          </div>
        </div>

        {/* Prediction Pill */}
        <div className="flex items-center justify-between p-2.5 rounded-card bg-white/5 border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-pill bg-[#0A84FF]/20 text-[#409CFF] font-medium text-[11px]">
              Detected
            </span>
            <span className="text-[#F5F5F7] font-semibold">Transient Acoustic Pattern</span>
          </div>
          <span className="text-[#A1A1A6] font-mono text-[11px]">99.4% confidence</span>
        </div>
      </div>
    );
  }

  // Default fallback for Orbit / macOS utility
  return (
    <div className="relative w-full aspect-[16/10] bg-[#0E1015] p-5 flex flex-col justify-between overflow-hidden select-none">
      {/* Menu Bar Header */}
      <div className="flex items-center justify-between text-xs text-[#A1A1A6] pb-2 border-b border-white/5">
        <span className="font-semibold text-white">Orbit Menu Bar Utility</span>
        <span className="font-mono text-[11px]">v1.4.2 • Native Swift</span>
      </div>

      {/* Gauges & Processes */}
      <div className="my-auto grid grid-cols-2 gap-3">
        <div className="p-3 rounded-card bg-white/5 border border-white/10">
          <div className="text-[11px] text-[#A1A1A6]">CPU Usage</div>
          <div className="text-xl font-bold text-white mt-1">1.8%</div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#0A84FF] h-full w-[18%]" />
          </div>
        </div>
        <div className="p-3 rounded-card bg-white/5 border border-white/10">
          <div className="text-[11px] text-[#A1A1A6]">RAM Footprint</div>
          <div className="text-xl font-bold text-white mt-1">18 MB</div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full w-[12%]" />
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="flex items-center justify-between text-[11px] text-[#A1A1A6]">
        <span>Docker: 4 containers running</span>
        <span className="text-[#409CFF] font-mono">⌘⌥O Hotkey</span>
      </div>
    </div>
  );
};

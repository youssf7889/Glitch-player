
"use client";

import { useMemo } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  onSeek: (val: number) => void;
}

export function ProgressBar({ current, total, onSeek }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  // Generate deterministic but random-looking waveform bars
  const bars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      height: 20 + Math.sin(i * 0.5) * 15 + Math.abs(Math.cos(i * 0.8)) * 10 + 10,
    }));
  }, []);

  return (
    <div className="flex items-center gap-4 w-full group">
      <span className="text-3xl font-body w-20 text-right tabular-nums text-white/90">
        {formatTime(current)}
      </span>
      <div 
        className="relative h-10 flex-1 flex items-center gap-1 cursor-pointer overflow-hidden px-1"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const clickedTime = (x / rect.width) * total;
          onSeek(clickedTime);
        }}
      >
        {bars.map((bar, i) => {
          const barPercentage = (i / (bars.length - 1)) * 100;
          const isActive = barPercentage <= percentage;
          return (
            <div 
              key={i}
              className="flex-1 transition-all"
              style={{ 
                height: `${bar.height}%`, 
                backgroundColor: isActive ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.1)',
                imageRendering: 'pixelated'
              }}
            />
          );
        })}
        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 transition-all duration-100"
          style={{ left: `${percentage}%` }}
        />
      </div>
      <span className="text-3xl font-body w-20 tabular-nums text-white/90">
        {formatTime(total)}
      </span>
    </div>
  );
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

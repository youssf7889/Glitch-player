
"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  onSeek: (val: number) => void;
}

export function ProgressBar({ current, total, onSeek }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex items-center gap-4 w-full group">
      <span className="text-3xl font-body w-20 text-right tabular-nums text-white/90">
        {formatTime(current)}
      </span>
      <div 
        className="relative h-4 flex-1 cursor-pointer border-2 border-primary bg-accent/40 overflow-hidden"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const clickedTime = (x / rect.width) * total;
          onSeek(clickedTime);
        }}
      >
        <div 
          className="h-full bg-primary transition-all duration-100 ease-linear"
          style={{ width: `${percentage}%` }}
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

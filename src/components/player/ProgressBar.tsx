
"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  onSeek: (val: number) => void;
}

export function ProgressBar({ current, total, onSeek }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex items-center gap-4 w-full">
      <span className="text-xs font-mono w-12 text-right">
        {formatTime(current)}
      </span>
      <div 
        className="relative h-4 flex-1 bg-secondary pixel-border-sm cursor-pointer overflow-hidden"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const clickedTime = (x / rect.width) * total;
          onSeek(clickedTime);
        }}
      >
        <div 
          className="absolute top-0 left-0 h-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-mono w-12">
        {formatTime(total)}
      </span>
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

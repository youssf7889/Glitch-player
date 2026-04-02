import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlIconProps {
  icon: LucideIcon;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  size?: number;
}

export function ControlIcon({ icon: Icon, onClick, active, className, size = 20 }: ControlIconProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 transition-all hover:bg-secondary/20 active:translate-y-0.5",
        active 
          ? "bg-primary text-white pixel-border-sm shadow-none opacity-100" 
          : "text-white/70 hover:text-white opacity-80 hover:opacity-100",
        className
      )}
    >
      <Icon size={size} strokeWidth={3} />
    </button>
  );
}

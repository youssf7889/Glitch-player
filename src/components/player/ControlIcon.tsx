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
        "p-2 hover:bg-secondary/20 pixel-border-sm",
        active 
          ? "bg-primary text-white opacity-100" 
          : "bg-background/20 text-white/70 hover:text-white opacity-80 hover:opacity-100",
        className
      )}
    >
      <Icon size={size} strokeWidth={3} />
    </button>
  );
}
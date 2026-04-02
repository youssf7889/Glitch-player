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
        "p-1.5 transition-all active:translate-y-0.5 border-2",
        active 
          ? "bg-primary text-white border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] opacity-100" 
          : "border-transparent text-inherit opacity-60 hover:opacity-100",
        className
      )}
    >
      <Icon size={size} strokeWidth={3} />
    </button>
  );
}

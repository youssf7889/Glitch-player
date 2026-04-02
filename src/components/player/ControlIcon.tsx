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
        "p-2 transition-all active:translate-y-0.5",
        active ? "text-primary bg-accent/10" : "text-foreground hover:text-primary",
        className
      )}
    >
      <Icon size={size} strokeWidth={3} />
    </button>
  );
}

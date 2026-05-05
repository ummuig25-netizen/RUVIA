import { cn } from "../lib/utils";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-6",
  md: "h-8",
  lg: "h-12",
  xl: "h-16",
};

const TEXT_SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

export function BrandLogo({ className, size = "md" }: Props) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <img 
        src="/logo.png" 
        alt="RUVIA Logo" 
        className={cn("object-contain rounded-xl shadow-[0_4px_14px_rgba(255,215,0,0.2)] border border-primary/20", SIZE[size])} 
      />
      <div className={cn("font-bold tracking-tight inline-flex items-baseline gap-0.5", TEXT_SIZE[size])}>
        <span className="text-foreground">RUV</span>
        <span className="text-primary">I</span>
        <span className="text-foreground">A</span>
      </div>
    </div>
  );
}

import { cn } from "../lib/utils";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

export function BrandLogo({ className, size = "md" }: Props) {
  return (
    <div className={cn("font-bold tracking-tight inline-flex items-baseline gap-0.5", SIZE[size], className)}>
      <span className="text-foreground">RUV</span>
      <span className="text-primary">I</span>
      <span className="text-foreground">A</span>
    </div>
  );
}

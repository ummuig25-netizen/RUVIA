import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface Props {
  online: boolean;
  onToggle: () => void;
}

export function AvailabilityToggle({ online, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-colors",
        online
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-card border-card-border text-muted-foreground",
      )}
      data-testid="availability-toggle"
    >
      <span className="relative flex h-2.5 w-2.5">
        {online && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2.5 w-2.5",
            online ? "bg-primary" : "bg-muted-foreground/40",
          )}
        />
      </span>
      <span className="text-sm font-medium">{online ? "Online" : "Offline"}</span>
      <motion.div
        layout
        className={cn(
          "ml-1 h-5 w-9 rounded-full p-0.5 flex",
          online ? "bg-primary justify-end" : "bg-muted/40 justify-start",
        )}
      >
        <motion.div layout className="h-4 w-4 rounded-full bg-background" />
      </motion.div>
    </button>
  );
}

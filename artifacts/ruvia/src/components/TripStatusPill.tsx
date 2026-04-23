import type { TripStatus } from "../types";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

const LABEL: Record<TripStatus, string> = {
  scheduled: "Scheduled",
  searching: "Searching for driver",
  accepted: "Driver on the way",
  in_progress: "Trip in progress",
  completed: "Trip completed",
  cancelled: "Cancelled",
};

const TONE: Record<TripStatus, string> = {
  scheduled: "bg-foreground/10 text-foreground border-card-border",
  searching: "bg-primary/15 text-primary border-primary/30",
  accepted: "bg-primary/15 text-primary border-primary/30",
  in_progress: "bg-primary text-primary-foreground border-transparent",
  completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export function TripStatusPill({ status }: { status: TripStatus }) {
  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
        TONE[status],
      )}
    >
      {(status === "searching" || status === "accepted" || status === "in_progress") && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      <span>{LABEL[status]}</span>
    </motion.div>
  );
}

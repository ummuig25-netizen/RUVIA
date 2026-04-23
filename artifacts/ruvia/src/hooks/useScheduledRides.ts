import { useEffect } from "react";
import { tripsService } from "../services/trips";
import { useAppStore } from "../store/useAppStore";
import { toast } from "sonner";

export function useScheduledRides() {
  const currentUser = useAppStore((s) => s.currentUser);
  const activeTrip = useAppStore((s) => s.activeTrip);
  const setActiveTrip = useAppStore((s) => s.setActiveTrip);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "passenger") return;

    const tick = () => {
      const now = Date.now();
      const all = Object.values(tripsService.getTrips());
      const due = all.filter(
        (t) =>
          t.passengerId === currentUser.id &&
          t.status === "scheduled" &&
          (t.scheduledFor ?? 0) <= now,
      );
      for (const trip of due) {
        tripsService.activateScheduled(trip.id);
        if (!activeTrip) {
          const refreshed = tripsService.getTrip(trip.id);
          if (refreshed) setActiveTrip(refreshed);
          toast.success("Your scheduled ride is being requested now");
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, [currentUser, activeTrip, setActiveTrip]);
}

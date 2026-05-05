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

    const tick = async () => {
      const now = Date.now();
      try {
        const all = await tripsService.getTrips();
        const due = all.filter(
          (t) =>
            t.passengerId === currentUser.id &&
            t.status === "scheduled" &&
            (t.scheduledFor ?? 0) <= now,
        );
        for (const trip of due) {
          await tripsService.updateTripStatus(trip.id, 'searching');
          if (!activeTrip) {
            const refreshed = await tripsService.getTrip(trip.id);
            if (refreshed) setActiveTrip(refreshed);
            toast.success("Your scheduled ride is being requested now");
          }
        }
      } catch (err) {
        console.error("Scheduled check failed:", err);
      }
    };


    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, [currentUser, activeTrip, setActiveTrip]);
}

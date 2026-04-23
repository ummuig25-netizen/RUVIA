import { useEffect } from "react";
import { realtime } from "../services/realtime";
import { tripsService } from "../services/trips";
import { useAppStore } from "../store/useAppStore";

export function useRealtimeBroadcast() {
  const setDriversMap = useAppStore((s) => s.setDriversMap);
  const updateDriverLocation = useAppStore((s) => s.updateDriverLocation);
  const setActiveTrip = useAppStore((s) => s.setActiveTrip);
  const activeTrip = useAppStore((s) => s.activeTrip);
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    void setDriversMap;
    const unsub = realtime.subscribe((msg) => {
      if (msg.type === "driver:location") {
        updateDriverLocation(msg.payload);
      } else if (msg.type === "trip:request") {
        // Drivers need to know about new requests; passenger already created the trip locally.
        // We don't auto-set activeTrip for drivers here; the IncomingRequestSheet listens separately.
      } else if (msg.type === "trip:accept") {
        const trip = tripsService.getTrip(msg.payload.tripId);
        if (!trip) return;
        // If this is the passenger's trip, update their activeTrip
        if (currentUser && trip.passengerId === currentUser.id) {
          setActiveTrip(trip);
        }
        // If this is the driver's trip, update their activeTrip
        if (currentUser && msg.payload.driverId === currentUser.id) {
          setActiveTrip(trip);
        }
      } else if (msg.type === "trip:status") {
        const trip = tripsService.getTrip(msg.payload.tripId);
        if (!trip) return;
        if (
          activeTrip &&
          activeTrip.id === msg.payload.tripId &&
          (currentUser?.id === trip.passengerId || currentUser?.id === trip.driverId)
        ) {
          setActiveTrip(trip);
        }
      } else if (msg.type === "trip:cancel") {
        if (activeTrip && activeTrip.id === msg.payload.tripId) {
          setActiveTrip(null);
        }
      }
    });
    return unsub;
  }, [setDriversMap, updateDriverLocation, setActiveTrip, activeTrip, currentUser]);
}

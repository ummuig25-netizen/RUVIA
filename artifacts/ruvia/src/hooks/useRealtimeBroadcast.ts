import { useEffect } from "react";
import { realtime } from "../services/realtime";
import { tripsService } from "../services/trips";
import { useAppStore } from "../store/useAppStore";

export function useRealtimeBroadcast() {
  useEffect(() => {
    const unsub = realtime.subscribe(async (msg) => {
      const state = useAppStore.getState();
      const { currentUser, activeTrip, setActiveTrip, updateDriverLocation } = state;

      if (msg.type === "driver:location") {
        updateDriverLocation(msg.payload);
      } else if (msg.type === "trip:accept") {
        const trip = await tripsService.getTrip(msg.payload.tripId);
        if (!trip) return;
        if (currentUser && (trip.passengerId === currentUser.id || msg.payload.driverId === currentUser.id)) {
          setActiveTrip(trip);
        }
      } else if (msg.type === "trip:status") {
        const trip = await tripsService.getTrip(msg.payload.tripId);
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
  }, []);

}

import type { Taxi, Trip } from "../types";
import { realtime } from "./realtime";
import { tripsService } from "./trips";
import { getItem, setItem } from "./storage";
import { SF_CENTER } from "../hooks/useGeolocation";

const SIMULATED_DRIVERS_KEY = "ruvia_simulated_drivers";
const SIM_DRIVER_PREFIX = "sim-";

interface SimulatedDriverSeed {
  id: string;
  name: string;
  plate: string;
  model: string;
  offsetLat: number;
  offsetLng: number;
}

const SEEDS: SimulatedDriverSeed[] = [
  { id: "sim-1", name: "Marcus Rivera", plate: "RV-1245", model: "Tesla Model 3", offsetLat: 0.008, offsetLng: -0.005 },
  { id: "sim-2", name: "Aisha Chen", plate: "RV-7782", model: "Toyota Camry", offsetLat: -0.006, offsetLng: 0.009 },
  { id: "sim-3", name: "Diego Santos", plate: "RV-3391", model: "Honda Civic", offsetLat: 0.012, offsetLng: 0.011 },
  { id: "sim-4", name: "Naomi Park", plate: "RV-5560", model: "Hyundai Sonata", offsetLat: -0.011, offsetLng: -0.013 },
];

export function getSimulatedDrivers(): Taxi[] {
  const stored = getItem<Taxi[]>(SIMULATED_DRIVERS_KEY);
  if (stored && stored.length === SEEDS.length) return stored;

  const initial: Taxi[] = SEEDS.map((seed) => ({
    id: seed.id,
    driverId: seed.id,
    status: "active",
    location: {
      lat: SF_CENTER.lat + seed.offsetLat,
      lng: SF_CENTER.lng + seed.offsetLng,
      heading: Math.floor(Math.random() * 360),
    },
    plate: seed.plate,
    model: seed.model,
  }));
  setItem(SIMULATED_DRIVERS_KEY, initial);
  return initial;
}

export function getSimulatedDriverName(driverId: string): string {
  const seed = SEEDS.find((s) => s.id === driverId);
  return seed?.name ?? "RUVIA Driver";
}

export function isSimulatedDriver(driverId?: string): boolean {
  return !!driverId && driverId.startsWith(SIM_DRIVER_PREFIX);
}

let started = false;

export function startDriverSimulator(centerHint: { lat: number; lng: number } | null) {
  if (started) return;
  started = true;

  const drivers = getSimulatedDrivers();
  // Broadcast initial positions
  drivers.forEach((d) => realtime.broadcast({ type: "driver:location", payload: d }));

  // Drift every 5 seconds
  setInterval(() => {
    const current = getItem<Taxi[]>(SIMULATED_DRIVERS_KEY) ?? drivers;
    const updated = current.map((d) => {
      if (d.status === "on_trip") return d;
      const driftLat = (Math.random() - 0.5) * 0.0015;
      const driftLng = (Math.random() - 0.5) * 0.0015;
      const next: Taxi = {
        ...d,
        location: {
          lat: d.location.lat + driftLat,
          lng: d.location.lng + driftLng,
          heading: (d.location.heading + (Math.random() - 0.5) * 30 + 360) % 360,
        },
      };
      realtime.broadcast({ type: "driver:location", payload: next });
      return next;
    });
    setItem(SIMULATED_DRIVERS_KEY, updated);
  }, 5000);

  // Listen for trip requests; auto-accept after delay if no real driver picks up
  realtime.subscribe((msg) => {
    if (msg.type === "trip:request") {
      const trip = msg.payload;
      const delay = 2000 + Math.random() * 2000;
      setTimeout(() => {
        const fresh = tripsService.getTrip(trip.id);
        if (!fresh || fresh.status !== "searching") return;
        // Pick the simulated driver closest to pickup
        const sims = getItem<Taxi[]>(SIMULATED_DRIVERS_KEY) ?? [];
        const available = sims.filter((s) => s.status === "active");
        if (available.length === 0) return;
        const closest = available.reduce((best, d) => {
          const dist = Math.hypot(d.location.lat - trip.pickup.lat, d.location.lng - trip.pickup.lng);
          const bestDist = Math.hypot(best.location.lat - trip.pickup.lat, best.location.lng - trip.pickup.lng);
          return dist < bestDist ? d : best;
        });
        tripsService.updateTripStatus(trip.id, "accepted", closest.driverId);
        // mark simulated driver as on_trip
        const updated = sims.map((s) => (s.id === closest.id ? { ...s, status: "on_trip" as const } : s));
        setItem(SIMULATED_DRIVERS_KEY, updated);
        realtime.broadcast({ type: "driver:location", payload: { ...closest, status: "on_trip" } });

        // Simulate ride: in 4s in_progress, 12s completed
        setTimeout(() => {
          const t = tripsService.getTrip(trip.id);
          if (!t || t.status !== "accepted") return;
          tripsService.updateTripStatus(trip.id, "in_progress", closest.driverId);
        }, 4000);
        setTimeout(() => {
          const t = tripsService.getTrip(trip.id);
          if (!t || t.status !== "in_progress") return;
          tripsService.updateTripStatus(trip.id, "completed", closest.driverId);
          // free the driver
          const free = (getItem<Taxi[]>(SIMULATED_DRIVERS_KEY) ?? []).map((s) =>
            s.id === closest.id ? { ...s, status: "active" as const, location: { ...s.location, lat: trip.destination.lat, lng: trip.destination.lng } } : s,
          );
          setItem(SIMULATED_DRIVERS_KEY, free);
          const me = free.find((s) => s.id === closest.id);
          if (me) realtime.broadcast({ type: "driver:location", payload: me });
        }, 16000);
      }, delay);
    }
  });

  void centerHint;
}

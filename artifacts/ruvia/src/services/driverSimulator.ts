import type { Taxi } from "../types";
import { realtime } from "./realtime";
import { tripsService } from "./trips";
import { getItem, setItem } from "./storage";
import { MADRID_CENTER } from "../hooks/useGeolocation";

const SIMULATED_DRIVERS_KEY = "ruvia_simulated_drivers";
const SIM_DRIVER_PREFIX = "sim-";

import { VehicleCategory } from "../types";

interface SimulatedDriverSeed {
  id: string;
  name: string;
  plate: string;
  model: string;
  category: VehicleCategory;
  offsetLat: number;
  offsetLng: number;
}

const SEEDS: SimulatedDriverSeed[] = [
  { id: "sim-1", name: "Marcus Rivera", plate: "RV-1245", model: "Tesla Model 3", category: "premium", offsetLat: 0.008, offsetLng: -0.005 },
  { id: "sim-2", name: "Aisha Chen", plate: "RV-7782", model: "Toyota Camry", category: "standard", offsetLat: -0.006, offsetLng: 0.009 },
  { id: "sim-3", name: "Diego Santos", plate: "RV-3391", model: "Honda Civic", category: "eco", offsetLat: 0.012, offsetLng: 0.011 },
  { id: "sim-4", name: "Naomi Park", plate: "RV-5560", model: "Hyundai Sonata", category: "xl", offsetLat: -0.011, offsetLng: -0.013 },
];

export function getSimulatedDrivers(): Taxi[] {
  const stored = getItem<Taxi[]>(SIMULATED_DRIVERS_KEY);
  if (stored && stored.length === SEEDS.length) return stored;

  const initial: Taxi[] = SEEDS.map((seed) => ({
    id: seed.id,
    driverId: seed.id,
    status: "active",
    location: {
      lat: MADRID_CENTER.lat + seed.offsetLat,
      lng: MADRID_CENTER.lng + seed.offsetLng,
      heading: Math.floor(Math.random() * 360),
    },
    plate: seed.plate,
    model: seed.model,
    category: seed.category,
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
  drivers.forEach((d) => void realtime.broadcast({ type: "driver:location", payload: d }));

  // Drift every 5 seconds
  setInterval(async () => {
    const current = getItem<Taxi[]>(SIMULATED_DRIVERS_KEY) ?? drivers;
    const updated = await Promise.all(
      current.map(async (d) => {
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
        await realtime.broadcast({ type: "driver:location", payload: next });
        return next;
      }),
    );
    setItem(SIMULATED_DRIVERS_KEY, updated);
  }, 5000);

  // Listen for trip requests; auto-accept after delay if no real driver picks up
  realtime.subscribe(async (msg) => {
    if (msg.type === "trip:request") {
      const trip = msg.payload;
      const delay = 2000 + Math.random() * 2000;
      setTimeout(async () => {
        const fresh = await tripsService.getTrip(trip.id);
        if (!fresh || fresh.status !== "searching") return;
        // Pick the simulated driver closest to pickup that matches category
        const sims = getItem<Taxi[]>(SIMULATED_DRIVERS_KEY) ?? [];
        const available = sims.filter((s) => s.status === "active" && s.category === trip.category);
        if (available.length === 0) return;
        const closest = available.reduce((best, d) => {
          const dist = Math.hypot(d.location.lat - trip.pickup.lat, d.location.lng - trip.pickup.lng);
          const bestDist = Math.hypot(best.location.lat - trip.pickup.lat, best.location.lng - trip.pickup.lng);
          return dist < bestDist ? d : best;
        });
        await tripsService.updateTripStatus(trip.id, "accepted", closest.driverId);
        // mark simulated driver as on_trip
        const updated = sims.map((s) => (s.id === closest.id ? { ...s, status: "on_trip" as const } : s));
        setItem(SIMULATED_DRIVERS_KEY, updated);
        await realtime.broadcast({ type: "driver:location", payload: { ...closest, status: "on_trip" } });

        // Simulate ride: in 4s in_progress, 12s completed
        setTimeout(async () => {
          const t = await tripsService.getTrip(trip.id);
          if (!t || t.status !== "accepted") return;
          await tripsService.updateTripStatus(trip.id, "in_progress", closest.driverId);
        }, 4000);
        setTimeout(async () => {
          const t = await tripsService.getTrip(trip.id);
          if (!t || t.status !== "in_progress") return;
          await tripsService.updateTripStatus(trip.id, "completed", closest.driverId);
          // free the driver
          const free = (getItem<Taxi[]>(SIMULATED_DRIVERS_KEY) ?? []).map((s) =>
            s.id === closest.id ? { ...s, status: "active" as const, location: { ...s.location, lat: trip.destination.lat, lng: trip.destination.lng } } : s,
          );
          setItem(SIMULATED_DRIVERS_KEY, free);
          const me = free.find((s) => s.id === closest.id);
          if (me) await realtime.broadcast({ type: "driver:location", payload: me });
        }, 16000);
      }, delay);
    }
  });

  void centerHint;
}


import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, LogOut, MapPin, Navigation, Search, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "../store/useAppStore";
import { useGeolocation, MADRID_CENTER } from "../hooks/useGeolocation";
import { MapView } from "../components/map/MapView";
import { BottomSheet } from "../components/BottomSheet";
import { TripStatusPill } from "../components/TripStatusPill";
import { CategorySelector } from "../components/CategorySelector";
import { PaymentMethods } from "../components/PaymentMethods";
import { LocationSearch } from "../components/LocationSearch";
import { BrandLogo } from "../components/BrandLogo";
import { calculateDistance } from "../services/distance";
import { calculateFare } from "../services/pricing";
import { tripsService } from "../services/trips";
import { authService } from "../services/auth";
import type { Coords, Trip, VehicleCategory } from "../types";
import { getSimulatedDriverName } from "../services/driverSimulator";

export default function PassengerHome() {
  const [, navigate] = useLocation();
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const driversMap = useAppStore((s) => s.driversMap);
  const activeTrip = useAppStore((s) => s.activeTrip);
  const setActiveTrip = useAppStore((s) => s.setActiveTrip);

  const { coords: geo } = useGeolocation();
  const [pickup, setPickup] = useState<Coords | null>(null);
  const [destination, setDestination] = useState<Coords | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduledTick, setScheduledTick] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>("standard");

  useEffect(() => {
    const id = window.setInterval(() => setScheduledTick((n) => n + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const fetchScheduled = async () => {
      if (!currentUser) return;
      try {
        const all = await tripsService.getTrips();
        const filtered = all
          .filter((t) => t.passengerId === currentUser.id && t.status === "scheduled")
          .sort((a, b) => (a.scheduledFor ?? 0) - (b.scheduledFor ?? 0));
        setUpcomingTrips(filtered);
      } catch (err) {
        console.error("Failed to fetch scheduled trips:", err);
      }
    };
    fetchScheduled();
  }, [currentUser, scheduledTick, activeTrip]);


  const minScheduleValue = useMemo(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    d.setSeconds(0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, [scheduledTick]);

  useEffect(() => {
    if (geo && !pickup) setPickup(geo);
  }, [geo, pickup]);

  const center = pickup ?? MADRID_CENTER;

  const driverPins = useMemo(() => {
    return Object.values(driversMap)
      .filter((d) => d.status === "active" || d.status === "on_trip")
      .map((d) => ({ id: d.id, coords: { lat: d.location.lat, lng: d.location.lng }, active: d.status === "on_trip" }));
  }, [driversMap]);

  const distance = pickup && destination ? calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng) : 0;
  const fare = distance ? calculateFare(distance, selectedCategory) : 0;

  const handleMapClick = (c: Coords) => {
    if (activeTrip) return;
    setDestination(c);
  };

  const buildTrip = (): Trip | null => {
    if (!currentUser || !pickup || !destination) return null;
    return {
      id: crypto.randomUUID(),
      passengerId: currentUser.id,
      passengerName: currentUser.name,
      status: "searching",
      pickup,
      destination,
      distanceKm: distance,
      fare,
      category: selectedCategory,
      path: [pickup, destination],
      createdAt: Date.now(),
    };
  };

  const requestRide = async () => {
    const trip = buildTrip();
    if (!trip) return;
    try {
      await tripsService.createTrip(trip);
      setActiveTrip(trip);
      toast.success("Searching for a driver…");
    } catch (err) {
      toast.error("Failed to request ride. Please try again.");
    }
  };

  const scheduleRide = async () => {
    const trip = buildTrip();
    if (!trip) return;
    if (!scheduleAt) {
      toast.error("Pick a date and time first");
      return;
    }
    const ts = new Date(scheduleAt).getTime();
    if (Number.isNaN(ts) || ts < Date.now() + 60 * 1000) {
      toast.error("Schedule at least a minute in the future");
      return;
    }
    try {
      await tripsService.scheduleTrip({ ...trip, status: 'scheduled', scheduledFor: ts });
      setScheduleOpen(false);
      setScheduleAt("");
      setDestination(null);
      setScheduledTick((n) => n + 1);
      toast.success(
        `Ride scheduled for ${new Date(ts).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}`,
      );
    } catch (err) {
      toast.error("Failed to schedule ride.");
    }
  };

  const cancelScheduled = async (id: string) => {
    try {
      await tripsService.removeTrip(id);
      setScheduledTick((n) => n + 1);
      toast("Scheduled ride cancelled");
    } catch (err) {
      toast.error("Failed to cancel ride.");
    }
  };

  const cancelTrip = async () => {
    if (!activeTrip) return;
    try {
      await tripsService.updateTripStatus(activeTrip.id, "cancelled");
      setActiveTrip(null);
      setDestination(null);
      toast("Trip cancelled.");
    } catch (err) {
      toast.error("Failed to cancel trip.");
    }
  };

  const closeCompleted = () => {
    setActiveTrip(null);
    setDestination(null);
  };

  const signOut = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveTrip(null);
    navigate("/");
  };

  const driverProfile = activeTrip?.driverId ? driversMap[activeTrip.driverId] : undefined;
  const driverName = activeTrip?.driverId ? getSimulatedDriverName(activeTrip.driverId) : "Your driver";

  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapView
          center={center}
          passenger={pickup}
          drivers={driverPins}
          destination={destination}
          routeFrom={pickup}
          routeTo={destination}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-4 flex items-center justify-between pointer-events-none">
        <div className="glass px-5 py-2.5 rounded-full pointer-events-auto shadow-lg flex items-center gap-2">
          <BrandLogo size="sm" />
          <span className="h-4 w-px bg-white/10 mx-1" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Rider</span>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => navigate("/profile")}
            className="w-11 h-11 rounded-full glass text-primary font-bold flex items-center justify-center shadow-lg hover:scale-105 transition-all"
            data-testid="button-profile"
          >
            {currentUser?.name.charAt(0).toUpperCase()}
          </button>
          <button
            onClick={signOut}
            className="w-11 h-11 rounded-full glass text-muted-foreground flex items-center justify-center shadow-lg hover:text-destructive transition-colors"
            data-testid="button-signout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active trip status pill (floating top-center) */}
      <AnimatePresence>
        {activeTrip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[500]"
          >
            <TripStatusPill status={activeTrip.status} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recenter FAB */}
      {!activeTrip && (
        <button
          onClick={() => geo && setPickup({ ...geo })}
          className="absolute right-4 bottom-[42vh] z-[500] w-12 h-12 rounded-full bg-card/90 backdrop-blur-md border border-card-border text-foreground flex items-center justify-center shadow-lg"
          data-testid="button-recenter"
        >
          <Navigation className="w-5 h-5" />
        </button>
      )}

      {/* Main Sheet — Search & Selection */}
      <BottomSheet open={!activeTrip}>
        <div className="px-5 py-2 space-y-4 pb-8">
          {!destination ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-black">RUVIA PREMIUM</p>
                <h2 className="text-2xl font-bold text-foreground">¿A dónde vamos hoy?</h2>
              </div>
              <LocationSearch 
                onSelect={(c) => setDestination(c)} 
                placeholder="Busca una calle, tienda o lugar..."
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-primary font-black">RESUMEN DEL VIAJE</p>
                <button 
                  onClick={() => setDestination(null)}
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground"
                >
                  Cambiar destino
                </button>
              </div>
              <div className="rounded-2xl bg-secondary/50 border border-border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 glow-primary" />
                  <div className="flex-1 text-sm">
                    <p className="text-foreground font-semibold truncate">Mi ubicación actual</p>
                  </div>
                </div>
                <div className="ml-1.25 h-4 border-l border-dashed border-border" />
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-foreground shrink-0" />
                  <div className="flex-1 text-sm">
                    <p className="text-foreground font-semibold truncate">Destino seleccionado</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!destination && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 py-2">
              <MapPin className="w-3 h-3 text-primary/40" />
              <span>También puedes pulsar cualquier punto en el mapa</span>
            </div>
          )}

          {destination && pickup && (
            <CategorySelector
              distanceKm={distance}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          )}

          {destination && pickup && (
            <PaymentMethods />
          )}

          <AnimatePresence initial={false}>
            {scheduleOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl bg-background/40 border border-card-border p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Pickup time</p>
                  <input
                    type="datetime-local"
                    value={scheduleAt}
                    min={minScheduleValue}
                    onChange={(e) => setScheduleAt(e.target.value)}
                    className="w-full bg-background/60 border border-card-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 [color-scheme:dark]"
                    data-testid="input-schedule-at"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {scheduleOpen ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setScheduleOpen(false);
                  setScheduleAt("");
                }}
                className="py-3.5 rounded-full border border-card-border text-muted-foreground hover:text-foreground text-sm font-medium"
                data-testid="button-schedule-cancel"
              >
                Back
              </button>
              <button
                disabled={!pickup || !destination || !scheduleAt}
                onClick={scheduleRide}
                className="py-3.5 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(255,215,0,0.2)]"
                data-testid="button-schedule-confirm"
              >
                <CalendarClock className="w-4 h-4" />
                Schedule
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                disabled={!pickup || !destination}
                onClick={requestRide}
                className="w-full py-4 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(255,215,0,0.2)]"
                data-testid="button-request-ride"
              >
                <Search className="w-4 h-4" />
                Request RUVIA
              </button>
              <button
                disabled={!pickup || !destination}
                onClick={() => setScheduleOpen(true)}
                className="w-full py-3 rounded-full border border-card-border text-foreground hover:bg-card/40 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="button-schedule-open"
              >
                <CalendarClock className="w-4 h-4 text-primary" />
                Schedule for later
              </button>
            </div>
          )}

          {upcomingTrips.length > 0 && !scheduleOpen && (
            <div className="pt-2 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Upcoming
              </p>
              {upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="rounded-2xl bg-background/40 border border-card-border p-3 flex items-center gap-3"
                  data-testid={`scheduled-${trip.id}`}
                >
                  <span className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 text-primary flex items-center justify-center">
                    <CalendarClock className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {new Date(trip.scheduledFor ?? 0).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {trip.distanceKm.toFixed(1)} km · ${trip.fare.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => cancelScheduled(trip.id)}
                    className="text-muted-foreground hover:text-destructive p-2"
                    aria-label="Cancel scheduled ride"
                    data-testid={`button-scheduled-cancel-${trip.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Legal / RGPD Notice */}
          <div className="pt-4 border-t border-border mt-4">
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60">
              <ShieldCheck className="w-3 h-3" />
              <span>Protección de datos RGPD activada · Pagos seguros 256-bit</span>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Active trip sheet */}
      <BottomSheet open={!!activeTrip && activeTrip.status !== "completed"}>
        {activeTrip && (
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <TripStatusPill status={activeTrip.status} />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Fare</p>
                <p className="text-lg font-semibold text-primary">${activeTrip.fare.toFixed(2)}</p>
              </div>
            </div>

            {activeTrip.status === "searching" && (
              <div className="rounded-2xl bg-background/40 border border-card-border p-5 text-center">
                <motion.div
                  className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-4 text-sm text-muted-foreground">Pinging nearby drivers…</p>
              </div>
            )}

            {(activeTrip.status === "accepted" || activeTrip.status === "in_progress") && (
              <div className="rounded-2xl bg-background/40 border border-card-border p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center text-lg">
                  {driverName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{driverName}</p>
                  <p className="text-xs text-muted-foreground">
                    {driverProfile?.model ?? "RUVIA Vehicle"} · {driverProfile?.plate ?? "—"}
                  </p>
                </div>
                <span className="text-xs text-primary font-medium">★ 4.9</span>
              </div>
            )}

            {activeTrip.status !== "in_progress" && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toast.info("Sharing route link with trusted circles...")}
                  className="py-3 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Safe-Link
                </button>
                <button
                  onClick={cancelTrip}
                  className="py-3 rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
                  data-testid="button-cancel"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {activeTrip.status === "in_progress" && (
              <button
                onClick={() => toast.info("Sharing real-time route...")}
                className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-lg"
              >
                <ShieldCheck className="w-4 h-4" />
                Share Real-time Route
              </button>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Completed modal */}
      <BottomSheet open={!!activeTrip && activeTrip.status === "completed"}>
        {activeTrip && (
          <div className="px-5 py-6 space-y-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">You've arrived</h3>
              <p className="text-sm text-muted-foreground mt-1">Hope the ride was smooth.</p>
            </div>
            <div className="rounded-2xl bg-background/40 border border-card-border p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance</span>
                <span>{activeTrip.distanceKm.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Total paid</span>
                <span className="text-primary font-semibold">${activeTrip.fare.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={closeCompleted}
              className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-semibold"
              data-testid="button-done"
            >
              Done
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

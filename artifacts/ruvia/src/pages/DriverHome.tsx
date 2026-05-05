import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Navigation, DollarSign, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "../store/useAppStore";
import { useGeolocation, MADRID_CENTER } from "../hooks/useGeolocation";
import { MapView } from "../components/map/MapView";
import { BottomSheet } from "../components/BottomSheet";
import { TripStatusPill } from "../components/TripStatusPill";
import { BrandLogo } from "../components/BrandLogo";
import { AvailabilityToggle } from "../components/AvailabilityToggle";
import { authService } from "../services/auth";
import { realtime } from "../services/realtime";
import { tripsService } from "../services/trips";
import type { Coords, Taxi, Trip } from "../types";

export default function DriverHome() {
  const [, navigate] = useLocation();
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const driversMap = useAppStore((s) => s.driversMap);
  const updateDriverLocation = useAppStore((s) => s.updateDriverLocation);
  const activeTrip = useAppStore((s) => s.activeTrip);
  const setActiveTrip = useAppStore((s) => s.setActiveTrip);

  const { coords: geo } = useGeolocation();
  const [position, setPosition] = useState<Coords | null>(null);
  const [online, setOnline] = useState(false);
  const [incoming, setIncoming] = useState<Trip | null>(null);
  const [countdown, setCountdown] = useState(15);
  const [completedSummary, setCompletedSummary] = useState<Trip | null>(null);
  const heartbeatRef = useRef<number | null>(null);

  useEffect(() => {
    if (geo && !position) setPosition(geo);
  }, [geo, position]);

  const center = position ?? MADRID_CENTER;

  const myTaxi: Taxi | null = useMemo(() => {
    if (!currentUser || !position) return null;
    return {
      id: currentUser.id,
      driverId: currentUser.id,
      status: activeTrip ? "on_trip" : online ? "active" : "offline",
      location: { lat: position.lat, lng: position.lng, heading: 0 },
      plate: "RV-" + currentUser.id.slice(0, 4).toUpperCase(),
      model: "RUVIA Vehicle",
      category: "standard",
    };
  }, [currentUser, position, online, activeTrip]);

  // Heartbeat: broadcast driver location every 5s when online
  useEffect(() => {
    if (heartbeatRef.current) {
      window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (online && myTaxi) {
      // Immediate broadcast
      void realtime.broadcast({ type: "driver:location", payload: myTaxi });
      updateDriverLocation(myTaxi);
      heartbeatRef.current = window.setInterval(async () => {
        if (myTaxi) {
          try {
            await realtime.broadcast({ type: "driver:location", payload: myTaxi });
          } catch (err) {
            console.error("Failed to broadcast location:", err);
          }
        }
      }, 5000);
    }
    return () => {
      if (heartbeatRef.current) {
        window.clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [online, myTaxi, updateDriverLocation]);

  // Listen for trip requests when online & not on a trip
  useEffect(() => {
    if (!online || activeTrip || !currentUser) return;
    const unsub = realtime.subscribe((msg) => {
      if (msg.type === "trip:request" && !incoming) {
        setIncoming(msg.payload);
        setCountdown(15);
      } else if (msg.type === "trip:accept" && incoming && msg.payload.tripId === incoming.id) {
        // Another driver accepted first
        setIncoming(null);
      } else if (msg.type === "trip:cancel" && incoming && msg.payload.tripId === incoming.id) {
        setIncoming(null);
      }
    });
    return unsub;
  }, [online, activeTrip, currentUser, incoming]);

  // Countdown for incoming
  useEffect(() => {
    if (!incoming) return;
    if (countdown <= 0) {
      setIncoming(null);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [incoming, countdown]);

  // Detect trip completion broadcast (status updated by self)
  useEffect(() => {
    if (activeTrip?.status === "completed" && !completedSummary) {
      setCompletedSummary(activeTrip);
      setActiveTrip(null);
    }
  }, [activeTrip, completedSummary, setActiveTrip]);

  const acceptTrip = async () => {
    if (!incoming || !currentUser) return;
    try {
      const fresh = await tripsService.getTrip(incoming.id);
      if (!fresh || fresh.status !== "searching") {
        toast("Too late — that trip was already taken.");
        setIncoming(null);
        return;
      }
      await tripsService.updateTripStatus(incoming.id, "accepted", currentUser.id);
      const updated = await tripsService.getTrip(incoming.id);
      if (updated) setActiveTrip(updated);
      setIncoming(null);
      toast.success("Trip accepted.");
    } catch (err) {
      toast.error("Failed to accept trip.");
    }
  };

  const declineTrip = () => setIncoming(null);

  const startTrip = async () => {
    if (!activeTrip) return;
    try {
      await tripsService.updateTripStatus(activeTrip.id, "in_progress", activeTrip.driverId);
      const updated = await tripsService.getTrip(activeTrip.id);
      if (updated) setActiveTrip(updated);
    } catch (err) {
      toast.error("Failed to start trip.");
    }
  };

  const completeTrip = async () => {
    if (!activeTrip) return;
    try {
      await tripsService.updateTripStatus(activeTrip.id, "completed", activeTrip.driverId);
      const updated = await tripsService.getTrip(activeTrip.id);
      if (updated) setCompletedSummary(updated);
      setActiveTrip(null);
    } catch (err) {
      toast.error("Failed to complete trip.");
    }
  };

  const signOut = async () => {
    await authService.logout();
    setCurrentUser(null);
    setActiveTrip(null);
    navigate("/");
  };

  const driverPins = useMemo(() => {
    return Object.values(driversMap)
      .filter((d) => d.driverId !== currentUser?.id)
      .filter((d) => d.status === "active" || d.status === "on_trip")
      .map((d) => ({ id: d.id, coords: { lat: d.location.lat, lng: d.location.lng }, active: d.status === "on_trip" }));
  }, [driversMap, currentUser?.id]);

  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapView
          center={center}
          passenger={position}
          drivers={driverPins}
          destination={activeTrip?.destination ?? null}
          routeFrom={activeTrip?.pickup ?? null}
          routeTo={activeTrip?.destination ?? null}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="glass px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
            <BrandLogo size="sm" />
            <span className="h-4 w-px bg-white/10 mx-1" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Driver</span>
          </div>
          <AvailabilityToggle online={online} onToggle={() => setOnline((v) => !v)} />
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


      {/* Active trip pill */}
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
      <button
        onClick={() => geo && setPosition({ ...geo })}
        className="absolute right-4 bottom-[36vh] z-[500] w-12 h-12 rounded-full bg-card/90 backdrop-blur-md border border-card-border text-foreground flex items-center justify-center shadow-lg"
        data-testid="button-recenter"
      >
        <Navigation className="w-5 h-5" />
      </button>

      {/* Default offline/idle sheet */}
      <BottomSheet open={!activeTrip && !incoming && !completedSummary}>
        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Driver · {currentUser?.name.split(" ")[0]}
            </p>
            <h2 className="text-2xl font-semibold">
              {online ? "You're online" : "You're offline"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {online ? "Waiting for trip requests near you." : "Go online to start receiving trip requests."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Earnings" value="100% Yours" />
            <Stat label="Model" value="No Comm." />
          </div>

          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-primary uppercase tracking-tight">Suscripción Mensual Activa</p>
                <p className="text-[10px] text-muted-foreground">Disfruta de ingresos íntegros sin comisiones por viaje.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOnline((v) => !v)}
            className={`w-full py-3.5 rounded-full font-semibold transition-all ${
              online
                ? "bg-card border border-card-border text-foreground"
                : "bg-primary text-primary-foreground shadow-[0_8px_30px_rgba(255,215,0,0.2)]"
            }`}
            data-testid="button-toggle-online"
          >
            {online ? "Go offline" : "Go online"}
          </button>
        </div>
      </BottomSheet>

      {/* Incoming request */}
      <BottomSheet open={!!incoming}>
        {incoming && (
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-primary">New Request</p>
                <h3 className="text-xl font-semibold mt-1">{incoming.passengerName}</h3>
              </div>
              <CountdownRing seconds={countdown} total={15} />
            </div>

            <div className="rounded-2xl bg-background/40 border border-card-border p-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Pickup</span>
                <span className="ml-auto">{incoming.pickup.lat.toFixed(4)}, {incoming.pickup.lng.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-foreground" />
                <span className="text-muted-foreground">Drop</span>
                <span className="ml-auto">{incoming.destination.lat.toFixed(4)}, {incoming.destination.lng.toFixed(4)}</span>
              </div>
              <div className="border-t border-card-border pt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span>{incoming.distanceKm.toFixed(2)} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fare</span>
                <span className="text-primary font-semibold text-lg">${incoming.fare.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={declineTrip}
                className="py-3.5 rounded-full border border-card-border text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-decline"
              >
                Decline
              </button>
              <button
                onClick={acceptTrip}
                className="py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all"
                data-testid="button-accept"
              >
                Accept
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Active trip */}
      <BottomSheet open={!!activeTrip && activeTrip.status !== "completed"}>
        {activeTrip && (
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <TripStatusPill status={activeTrip.status} />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Earning</p>
                <p className="text-lg font-semibold text-primary">${activeTrip.fare.toFixed(2)}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-background/40 border border-card-border p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center text-lg">
                {activeTrip.passengerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium">{activeTrip.passengerName}</p>
                <p className="text-xs text-muted-foreground">{activeTrip.distanceKm.toFixed(2)} km trip</p>
              </div>
            </div>

            {activeTrip.status === "accepted" ? (
              <button
                onClick={startTrip}
                className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-semibold"
                data-testid="button-start"
              >
                Start trip
              </button>
            ) : (
              <button
                onClick={completeTrip}
                className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-semibold"
                data-testid="button-complete"
              >
                Complete trip
              </button>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Completed summary */}
      <BottomSheet open={!!completedSummary}>
        {completedSummary && (
          <div className="px-5 py-6 space-y-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Trip complete</h3>
              <p className="text-sm text-muted-foreground mt-1">Nicely done.</p>
            </div>
            <div className="rounded-2xl bg-background/40 border border-card-border p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance</span>
                <span>{completedSummary.distanceKm.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Earnings</span>
                <span className="text-primary font-semibold">${completedSummary.fare.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setCompletedSummary(null)}
              className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-semibold"
              data-testid="button-done"
            >
              Continue
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/40 border border-card-border p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const pct = (seconds / total) * 100;
  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
        <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--card-border))" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeDasharray={`${pct} ${100 - pct}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{seconds}</div>
    </div>
  );
}

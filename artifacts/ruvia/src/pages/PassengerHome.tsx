import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, MapPin, Navigation, Search, X } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "../store/useAppStore";
import { useGeolocation, SF_CENTER } from "../hooks/useGeolocation";
import { MapView } from "../components/map/MapView";
import { BottomSheet } from "../components/BottomSheet";
import { TripStatusPill } from "../components/TripStatusPill";
import { FareBreakdown } from "../components/FareBreakdown";
import { BrandLogo } from "../components/BrandLogo";
import { calculateDistance } from "../services/distance";
import { calculateFare } from "../services/pricing";
import { tripsService } from "../services/trips";
import { authService } from "../services/auth";
import type { Coords, Trip } from "../types";
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

  useEffect(() => {
    if (geo && !pickup) setPickup(geo);
  }, [geo, pickup]);

  const center = pickup ?? SF_CENTER;

  const driverPins = useMemo(() => {
    return Object.values(driversMap)
      .filter((d) => d.status === "active" || d.status === "on_trip")
      .map((d) => ({ id: d.id, coords: { lat: d.location.lat, lng: d.location.lng }, active: d.status === "on_trip" }));
  }, [driversMap]);

  const distance = pickup && destination ? calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng) : 0;
  const fare = distance ? calculateFare(distance) : 0;

  const handleMapClick = (c: Coords) => {
    if (activeTrip) return;
    setDestination(c);
  };

  const requestRide = () => {
    if (!currentUser || !pickup || !destination) return;
    const trip: Trip = {
      id: crypto.randomUUID(),
      passengerId: currentUser.id,
      passengerName: currentUser.name,
      status: "searching",
      pickup,
      destination,
      distanceKm: distance,
      fare,
      path: [pickup, destination],
      createdAt: Date.now(),
    };
    tripsService.createTrip(trip);
    setActiveTrip(trip);
    toast.success("Searching for a driver…");
  };

  const cancelTrip = () => {
    if (!activeTrip) return;
    tripsService.updateTripStatus(activeTrip.id, "cancelled");
    setActiveTrip(null);
    setDestination(null);
    toast("Trip cancelled.");
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
        <div className="bg-card/90 backdrop-blur-md border border-card-border rounded-full px-4 py-2 pointer-events-auto">
          <BrandLogo size="sm" />
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold flex items-center justify-center backdrop-blur-md"
            data-testid="button-profile"
          >
            {currentUser?.name.charAt(0).toUpperCase()}
          </button>
          <button
            onClick={signOut}
            className="w-10 h-10 rounded-full bg-card/90 border border-card-border text-muted-foreground flex items-center justify-center backdrop-blur-md"
            data-testid="button-signout"
          >
            <LogOut className="w-4 h-4" />
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

      {/* Default sheet — searching for ride */}
      <BottomSheet open={!activeTrip}>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Hey {currentUser?.name.split(" ")[0]}</p>
            <h2 className="text-2xl font-semibold">Where are you headed?</h2>
          </div>

          <div className="rounded-2xl bg-background/40 border border-card-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <div className="flex-1 text-sm">
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-foreground">
                  {pickup ? `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}` : "Locating…"}
                </p>
              </div>
            </div>
            <div className="ml-1 h-4 border-l border-dashed border-card-border" />
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-foreground shrink-0" />
              <div className="flex-1 text-sm">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className={destination ? "text-foreground" : "text-muted-foreground"}>
                  {destination ? `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}` : "Tap on the map to set"}
                </p>
              </div>
              {destination && (
                <button
                  onClick={() => setDestination(null)}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-clear-destination"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {!destination && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              Tap anywhere on the map to drop a destination pin.
            </div>
          )}

          {destination && pickup && (
            <FareBreakdown distanceKm={distance} fare={fare} />
          )}

          <button
            disabled={!pickup || !destination}
            onClick={requestRide}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(255,215,0,0.2)]"
            data-testid="button-request-ride"
          >
            <Search className="w-4 h-4" />
            Request RUVIA
          </button>
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
              <button
                onClick={cancelTrip}
                className="w-full py-3 rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
                data-testid="button-cancel"
              >
                Cancel trip
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

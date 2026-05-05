import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Navigation, Clock, DollarSign } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { tripsService } from "../services/trips";
import { BrandLogo } from "../components/BrandLogo";
import { TripStatusPill } from "../components/TripStatusPill";
import type { Trip } from "../types";

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function durationLabel(trip: Trip): string {
  if (!trip.completedAt || !trip.acceptedAt) return "—";
  const mins = Math.max(1, Math.round((trip.completedAt - trip.acceptedAt) / 60000));
  return `${mins} min`;
}

export default function TripHistory() {
  const [, navigate] = useLocation();
  const currentUser = useAppStore((s) => s.currentUser);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!currentUser) return;
      try {
        const all = await tripsService.getTrips();
        const mine = all.filter((t) =>
          currentUser.role === "driver"
            ? t.driverId === currentUser.id
            : t.passengerId === currentUser.id,
        );
        setTrips(mine.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      } catch (err) {
        console.error("Failed to fetch trips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [currentUser]);

  const totals = useMemo(() => {
    const completed = trips.filter((t) => t.status === "completed");
    const earnings = completed.reduce((sum, t) => sum + t.fare, 0);
    const distance = completed.reduce((sum, t) => sum + t.distanceKm, 0);
    return { count: completed.length, earnings, distance };
  }, [trips]);

  if (!currentUser) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDriver = currentUser.role === "driver";


  return (
    <div className="min-h-screen w-full bg-background text-foreground pb-12">
      <header className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => navigate(isDriver ? "/driver" : "/passenger")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <BrandLogo size="sm" />
      </header>

      <main className="max-w-md mx-auto px-6">
        <h1 className="text-2xl font-semibold">Trip history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isDriver ? "Rides you've completed." : "Where RUVIA has taken you."}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <SummaryCard
            label={isDriver ? "Trips" : "Rides"}
            value={String(totals.count)}
          />
          <SummaryCard
            label={isDriver ? "Earned" : "Spent"}
            value={`$${totals.earnings.toFixed(2)}`}
            highlight
          />
          <SummaryCard
            label="Distance"
            value={`${totals.distance.toFixed(1)} km`}
          />
        </div>

        <div className="mt-6 space-y-3">
          {trips.length === 0 ? (
            <EmptyState isDriver={isDriver} />
          ) : (
            trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} isDriver={isDriver} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card border border-card-border p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-semibold ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TripCard({ trip, isDriver }: { trip: Trip; isDriver: boolean }) {
  return (
    <div
      className="rounded-2xl bg-card border border-card-border p-4"
      data-testid={`trip-card-${trip.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {formatDate(trip.createdAt)} · {formatTime(trip.createdAt)}
          </p>
          {!isDriver && trip.driverId ? (
            <p className="mt-0.5 text-sm font-medium truncate">
              Driver · {trip.driverId.slice(0, 6)}
            </p>
          ) : null}
          {isDriver ? (
            <p className="mt-0.5 text-sm font-medium truncate">
              {trip.passengerName}
            </p>
          ) : null}
        </div>
        <TripStatusPill status={trip.status} />
      </div>

      <div className="mt-3 space-y-2">
        <Row
          icon={<MapPin className="w-3.5 h-3.5 text-primary" />}
          text={`${trip.pickup.lat.toFixed(4)}, ${trip.pickup.lng.toFixed(4)}`}
        />
        <Row
          icon={<Navigation className="w-3.5 h-3.5 text-foreground" />}
          text={`${trip.destination.lat.toFixed(4)}, ${trip.destination.lng.toFixed(4)}`}
        />
      </div>

      <div className="mt-3 pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {durationLabel(trip)}
        </span>
        <span>{trip.distanceKm.toFixed(1)} km</span>
        <span className="inline-flex items-center gap-1 text-primary font-semibold text-sm">
          <DollarSign className="w-3.5 h-3.5" />
          {trip.fare.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="w-5 h-5 rounded-full bg-background border border-card-border flex items-center justify-center">
        {icon}
      </span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function EmptyState({ isDriver }: { isDriver: boolean }) {
  return (
    <div className="rounded-2xl bg-card border border-card-border p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
        <Clock className="w-5 h-5" />
      </div>
      <p className="mt-3 text-sm font-medium">No trips yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {isDriver
          ? "Go online and your completed rides will appear here."
          : "Book your first ride and it will show up here."}
      </p>
    </div>
  );
}

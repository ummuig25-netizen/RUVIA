import { BASE_FARE, RATE_PER_KM } from "../services/pricing";

interface Props {
  distanceKm: number;
  fare: number;
}

export function FareBreakdown({ distanceKm, fare }: Props) {
  return (
    <div className="rounded-2xl border border-card-border bg-background/40 p-4 space-y-2 text-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>Base fare</span>
        <span>${BASE_FARE.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between text-muted-foreground">
        <span>Distance · {distanceKm.toFixed(2)} km</span>
        <span>${(distanceKm * RATE_PER_KM).toFixed(2)}</span>
      </div>
      <div className="border-t border-card-border pt-2 flex items-center justify-between">
        <span className="font-medium text-foreground">Total</span>
        <span className="text-lg font-semibold text-primary">${fare.toFixed(2)}</span>
      </div>
    </div>
  );
}

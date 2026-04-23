import { useEffect, useState } from "react";
import type { Coords } from "../types";

export const SF_CENTER: Coords = { lat: 37.7749, lng: -122.4194 };

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setCoords(SF_CENTER);
      setLoading(false);
      setError("Geolocation unavailable. Using default location.");
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      setCoords(SF_CENTER);
      setLoading(false);
    }, 4000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        clearTimeout(timeout);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        if (cancelled) return;
        clearTimeout(timeout);
        setCoords(SF_CENTER);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 },
    );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return { coords, loading, error };
}

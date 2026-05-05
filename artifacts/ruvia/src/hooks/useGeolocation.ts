import { useEffect, useState } from "react";
import type { Coords } from "../types";

export const MADRID_CENTER: Coords = { lat: 40.4168, lng: -3.7038 };

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setCoords(MADRID_CENTER);
      setLoading(false);
      setError("Geolocation unavailable. Using default location.");
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      // Default to Madrid only if we haven't received a position yet
      setCoords((prev) => prev || MADRID_CENTER);
      setLoading(false);
    }, 10000); // 10 seconds wait for real GPS

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        clearTimeout(timeout);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        clearTimeout(timeout);
        console.warn("Geolocation error:", err.message);
        setCoords(MADRID_CENTER);
        setLoading(false);
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return { coords, loading, error };
}

import { VehicleCategory } from "../types";

export const BASE_FARE = 2.50;
export const RATE_PER_KM = 1.20;
export const MIN_FARE = 4.00;

const MULTIPLIERS: Record<VehicleCategory, number> = {
  standard: 1,
  eco: 1,
  xl: 1.5,
  premium: 2.2
};

export function calculateFare(distanceKm: number, category: VehicleCategory = 'standard'): number {
  const multiplier = MULTIPLIERS[category] || 1;
  const calculated = (BASE_FARE + (distanceKm * RATE_PER_KM)) * multiplier;
  return Math.max(MIN_FARE * multiplier, calculated);
}

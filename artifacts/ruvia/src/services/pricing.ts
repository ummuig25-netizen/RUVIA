export const BASE_FARE = 2.50;
export const RATE_PER_KM = 1.20;
export const MIN_FARE = 4.00;

export function calculateFare(distanceKm: number): number {
  const calculated = BASE_FARE + (distanceKm * RATE_PER_KM);
  return Math.max(MIN_FARE, calculated);
}

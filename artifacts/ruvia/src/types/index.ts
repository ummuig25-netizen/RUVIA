export type Role = 'passenger' | 'driver';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: number;
}

export interface Coords {
  lat: number;
  lng: number;
}

export interface Taxi {
  id: string;
  driverId: string;
  status: 'offline' | 'active' | 'on_trip';
  location: Coords & { heading: number };
  plate: string;
  model: string;
}

export type TripStatus = 'searching' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  passengerId: string;
  passengerName: string;
  driverId?: string;
  status: TripStatus;
  pickup: Coords;
  destination: Coords;
  distanceKm: number;
  fare: number;
  path: Coords[];
  createdAt: number;
  acceptedAt?: number;
  completedAt?: number;
}

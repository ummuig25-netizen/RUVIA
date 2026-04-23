import { create } from 'zustand';
import { Profile, Taxi, Trip } from '../types';

interface AppState {
  currentUser: Profile | null;
  activeTrip: Trip | null;
  driversMap: Record<string, Taxi>;
  setCurrentUser: (user: Profile | null) => void;
  setActiveTrip: (trip: Trip | null) => void;
  setDriversMap: (drivers: Record<string, Taxi>) => void;
  updateDriverLocation: (driver: Taxi) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  activeTrip: null,
  driversMap: {},
  setCurrentUser: (user) => set({ currentUser: user }),
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  setDriversMap: (drivers) => set({ driversMap: drivers }),
  updateDriverLocation: (driver) => set((state) => ({
    driversMap: {
      ...state.driversMap,
      [driver.driverId]: driver,
    }
  })),
}));

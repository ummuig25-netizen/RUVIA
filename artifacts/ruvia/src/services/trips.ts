import { Trip, TripStatus } from '../types';
import { getItem, setItem } from './storage';
import { realtime } from './realtime';

const TRIPS_KEY = 'ruvia_trips';

export const tripsService = {
  getTrips(): Record<string, Trip> {
    return getItem(TRIPS_KEY) || {};
  },
  
  saveTrips(trips: Record<string, Trip>) {
    setItem(TRIPS_KEY, trips);
  },
  
  getTrip(id: string): Trip | null {
    return this.getTrips()[id] || null;
  },
  
  createTrip(trip: Trip) {
    const trips = this.getTrips();
    trips[trip.id] = trip;
    this.saveTrips(trips);
    realtime.broadcast({ type: 'trip:request', payload: trip });
  },

  scheduleTrip(trip: Trip) {
    const trips = this.getTrips();
    trips[trip.id] = { ...trip, status: 'scheduled' };
    this.saveTrips(trips);
  },

  activateScheduled(tripId: string) {
    const trips = this.getTrips();
    const trip = trips[tripId];
    if (!trip || trip.status !== 'scheduled') return;
    trip.status = 'searching';
    trip.scheduledFor = undefined;
    trip.createdAt = Date.now();
    this.saveTrips(trips);
    realtime.broadcast({ type: 'trip:request', payload: trip });
  },

  removeTrip(tripId: string) {
    const trips = this.getTrips();
    delete trips[tripId];
    this.saveTrips(trips);
  },
  
  updateTripStatus(tripId: string, status: TripStatus, driverId?: string) {
    const trips = this.getTrips();
    const trip = trips[tripId];
    
    if (!trip) return;
    
    trip.status = status;
    if (driverId) trip.driverId = driverId;
    if (status === 'accepted') trip.acceptedAt = Date.now();
    if (status === 'completed') trip.completedAt = Date.now();
    
    this.saveTrips(trips);
    
    if (status === 'accepted' && driverId) {
      realtime.broadcast({ type: 'trip:accept', payload: { tripId, driverId } });
    } else if (status === 'cancelled') {
      realtime.broadcast({ type: 'trip:cancel', payload: { tripId } });
    } else {
      realtime.broadcast({ type: 'trip:status', payload: { tripId, status } });
    }
  }
};

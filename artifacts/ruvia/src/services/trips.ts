import { Trip, TripStatus } from '../types';
import { supabase } from '../lib/supabase';

export const tripsService = {
  async getTrips(): Promise<Trip[]> {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      passengerId: row.passenger_id,
      passengerName: row.passenger_name || 'Passenger', // Added fallback
      driverId: row.driver_id,
      status: row.status,
      pickup: { lat: row.pickup_lat, lng: row.pickup_lng },
      destination: { lat: row.dest_lat, lng: row.dest_lng },
      distanceKm: row.distance_km,
      fare: row.fare,
      category: row.category || 'standard',
      path: row.path || [],
      createdAt: row.created_at,
      acceptedAt: row.accepted_at,
      completedAt: row.completed_at,
      scheduledFor: row.scheduled_for
    }));
  },
  
  async getTrip(id: string): Promise<Trip | null> {
    const { data: row, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !row) return null;
    return {
      id: row.id,
      passengerId: row.passenger_id,
      passengerName: row.passenger_name || 'Passenger',
      driverId: row.driver_id,
      status: row.status,
      pickup: { lat: row.pickup_lat, lng: row.pickup_lng },
      destination: { lat: row.dest_lat, lng: row.dest_lng },
      distanceKm: row.distance_km,
      fare: row.fare,
      category: row.category || 'standard',
      path: row.path || [],
      createdAt: row.created_at,
      acceptedAt: row.accepted_at,
      completedAt: row.completed_at,
      scheduledFor: row.scheduled_for
    };
  },
  
  async createTrip(trip: Trip) {
    const { error } = await supabase
      .from('trips')
      .insert([{
        id: trip.id,
        passenger_id: trip.passengerId,
        passenger_name: trip.passengerName,
        status: trip.status,
        fare: trip.fare,
        distance_km: trip.distanceKm,
        pickup_lat: trip.pickup.lat,
        pickup_lng: trip.pickup.lng,
        dest_lat: trip.destination.lat,
        dest_lng: trip.destination.lng,
        category: trip.category,
        path: trip.path,
        created_at: trip.createdAt
      }]);
    
    if (error) throw error;

    await supabase.channel('ruvia-realtime').send({
      type: 'broadcast',
      event: 'trip:request',
      payload: trip
    });
  },

  async scheduleTrip(trip: Trip) {
    const { error } = await supabase
      .from('trips')
      .insert([{
        id: trip.id,
        passenger_id: trip.passengerId,
        passenger_name: trip.passengerName,
        status: 'scheduled',
        fare: trip.fare,
        distance_km: trip.distanceKm,
        pickup_lat: trip.pickup.lat,
        pickup_lng: trip.pickup.lng,
        dest_lat: trip.destination.lat,
        dest_lng: trip.destination.lng,
        category: trip.category,
        path: trip.path,
        created_at: trip.createdAt,
        scheduled_for: trip.scheduledFor
      }]);
    
    if (error) throw error;
  },

  async updateTripStatus(tripId: string, status: TripStatus, driverId?: string) {
    const updates: Record<string, any> = { status };
    if (driverId) updates.driver_id = driverId;
    if (status === 'accepted') updates.accepted_at = Date.now();
    if (status === 'completed') updates.completed_at = Date.now();
    
    const { error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', tripId);
    
    if (error) throw error;
    
    // Broadcast status change
    await supabase.channel('ruvia-realtime').send({
      type: 'broadcast',
      event: status === 'accepted' ? 'trip:accept' : 'trip:status',
      payload: { tripId, status, driverId }
    });
  },


  async removeTrip(tripId: string) {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);
    
    if (error) throw error;
  }
};


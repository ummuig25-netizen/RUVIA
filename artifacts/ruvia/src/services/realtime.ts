import { Taxi, Trip } from '../types';
import { supabase } from '../lib/supabase';

export type RealtimeMessage = 
  | { type: "driver:location", payload: Taxi }
  | { type: "trip:request", payload: Trip }
  | { type: "trip:accept", payload: { tripId: string, driverId: string } }
  | { type: "trip:status", payload: { tripId: string, status: Trip['status'] } }
  | { type: "trip:cancel", payload: { tripId: string } };

class RealtimeEngine {
  private channel = supabase.channel('ruvia-realtime');
  private listeners: Set<(msg: RealtimeMessage) => void> = new Set();

  constructor() {
    this.channel
      .on('broadcast', { event: '*' }, (payload) => {
        const message = { type: payload.event, payload: payload.payload } as RealtimeMessage;
        this.listeners.forEach(listener => listener(message));
      })
      .subscribe();
  }

  async broadcast(message: RealtimeMessage) {
    await this.channel.send({
      type: 'broadcast',
      event: message.type,
      payload: message.payload
    });
  }

  subscribe(listener: (msg: RealtimeMessage) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const realtime = new RealtimeEngine();


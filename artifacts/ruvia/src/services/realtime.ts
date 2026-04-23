import { Profile, Taxi, Trip } from '../types';

export type RealtimeMessage = 
  | { type: "driver:location", payload: Taxi }
  | { type: "trip:request", payload: Trip }
  | { type: "trip:accept", payload: { tripId: string, driverId: string } }
  | { type: "trip:status", payload: { tripId: string, status: Trip['status'] } }
  | { type: "trip:cancel", payload: { tripId: string } };

class RealtimeEngine {
  private channel: BroadcastChannel;
  private listeners: Set<(msg: RealtimeMessage) => void> = new Set();

  constructor() {
    this.channel = new BroadcastChannel("ruvia-realtime");
    this.channel.onmessage = (event) => {
      this.listeners.forEach(listener => listener(event.data));
    };
  }

  broadcast(message: RealtimeMessage) {
    this.channel.postMessage(message);
  }

  subscribe(listener: (msg: RealtimeMessage) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const realtime = new RealtimeEngine();

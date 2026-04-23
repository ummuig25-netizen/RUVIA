import { Profile, Role } from '../types';
import { getItem, setItem, removeItem } from './storage';

const PROFILES_KEY = 'ruvia_profiles';
const CURRENT_USER_KEY = 'ruvia_current_user';

export const authService = {
  getProfiles(): Record<string, Profile> {
    return getItem(PROFILES_KEY) || {};
  },
  
  saveProfiles(profiles: Record<string, Profile>) {
    setItem(PROFILES_KEY, profiles);
  },
  
  getCurrentUser(): Profile | null {
    return getItem(CURRENT_USER_KEY);
  },
  
  setCurrentUser(profile: Profile | null) {
    if (profile) {
      setItem(CURRENT_USER_KEY, profile);
    } else {
      removeItem(CURRENT_USER_KEY);
    }
  },

  register(name: string, email: string, role: Role): Profile {
    const profiles = this.getProfiles();
    
    // Check if email exists
    const existing = Object.values(profiles).find(p => p.email === email);
    if (existing) {
      throw new Error('Email already registered');
    }
    
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      createdAt: Date.now()
    };
    
    profiles[newProfile.id] = newProfile;
    this.saveProfiles(profiles);
    this.setCurrentUser(newProfile);
    
    return newProfile;
  },
  
  login(email: string): Profile {
    const profiles = this.getProfiles();
    const profile = Object.values(profiles).find(p => p.email === email);
    
    if (!profile) {
      throw new Error('User not found');
    }
    
    this.setCurrentUser(profile);
    return profile;
  },
  
  logout() {
    this.setCurrentUser(null);
  }
};

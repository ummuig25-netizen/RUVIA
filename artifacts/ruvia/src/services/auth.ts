import { Profile, Role } from '../types';
import { supabase } from '../lib/supabase';

const MOCK_USER_KEY = 'ruvia_mock_user';

export const authService = {
  async getCurrentUser(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    let userId = user?.id;
    let mockProfile = null;

    if (!userId) {
      // Fallback to mock user
      const mockStr = localStorage.getItem(MOCK_USER_KEY);
      if (mockStr) {
        mockProfile = JSON.parse(mockStr);
        userId = mockProfile.id;
      } else {
        return null;
      }
    }

    // If it's a mock user, we don't need to query Supabase profiles
    // because it was never saved there due to RLS limits.
    if (userId && userId.startsWith('mock-') && mockProfile) {
      return mockProfile;
    }

    const { data: row, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !row) return null;
    
    const profile = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as Role,
      avatar: row.avatar,
      createdAt: row.created_at
    };
    
    // Ensure mock user is synced
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(profile));
    
    return profile;
  },

  async register(name: string, email: string, role: Role): Promise<Profile> {
    let userId = '';
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'temporary-password-for-demo',
      options: {
        data: { name, role }
      }
    });

    if (error) {
      console.warn('Supabase Auth error, using mock local auth:', error.message);
      // Generate a fake ID for the mock user since Supabase blocked it
      userId = 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    } else if (!data.user) {
      throw new Error('Registration failed: No user data returned');
    } else {
      userId = data.user.id;
    }

    const newProfile: Profile = {
      id: userId,
      name,
      email,
      role,
      createdAt: Date.now()
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: newProfile.id,
        name: newProfile.name,
        email: newProfile.email,
        role: newProfile.role,
        created_at: newProfile.createdAt
      }]);

    if (profileError) {
      // If it already exists, maybe they tried to register again
      if (profileError.code !== '23505') {
        if (userId.startsWith('mock-')) {
          console.warn('Ignored Supabase RLS error for mock user:', profileError.message);
        } else {
          throw new Error(profileError.message || 'Failed to save profile');
        }
      }
    }

    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(newProfile));
    return newProfile;
  },

  async login(email: string): Promise<Profile> {
    const mockStr = localStorage.getItem(MOCK_USER_KEY);
    if (mockStr) {
      const mockUser = JSON.parse(mockStr);
      if (mockUser.email === email) {
        return mockUser;
      }
    }

    const { data: row, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !row) {
      throw new Error('User not found or login failed');
    }

    const profile = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as Role,
      avatar: row.avatar,
      createdAt: row.created_at
    };

    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(profile));
    return profile;
  },

  async logout() {
    localStorage.removeItem(MOCK_USER_KEY);
    await supabase.auth.signOut();
  }
};


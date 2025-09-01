import { supabase } from './supabase';
import type { User, Profile } from '../types';

export interface AuthUser extends User {
  profile?: Profile;
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, userData: { fullName: string; role: 'vendor' | 'admin' }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          role: userData.role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user with profile
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      role: profile?.role || 'user',
      created_at: user.created_at,
      updated_at: user.updated_at!,
      profile,
    };
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  },

  // Update password
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  },
};
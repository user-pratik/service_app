import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
}

interface AuthState {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  
  signIn: async (email, password) => {
    console.log("Signing in with email:", email); // Debug log
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        console.error("Error during sign-in: Email not found or incorrect password"); // Specific error message
      } else if (error.message.includes("Email not confirmed")) {
        console.error("Error during sign-in: Email not confirmed"); // Specific error message
      } else {
        console.error("Error during sign-in:", error.message); // General error message
      }
    } else {
      set({ user: data.user });
      await get().getProfile();
    }

    return { error };
  },
  
  signUp: async (email, password, username, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (!error && data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          full_name: fullName,
          avatar_url: null,
          bio: null,
          is_admin: false,
        });
      
      if (profileError) {
        return { error: profileError };
      }
      
      set({ user: data.user });
      await get().getProfile();
    }
    
    return { error };
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, isAdmin: false });
  },
  
  getProfile: async () => {
    const { user } = get();
    
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }
    
    set({ 
      profile: data as Profile,
      isAdmin: data.is_admin
    });
  },
}));

// Initialize auth state
export const initAuth = async () => {
  const { data } = await supabase.auth.getSession();
  
  if (data.session?.user) {
    useAuthStore.setState({ user: data.session.user });
    await useAuthStore.getState().getProfile();
  }
  
  useAuthStore.setState({ isLoading: false });
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    useAuthStore.setState({ user: session?.user || null });
    
    if (session?.user) {
      await useAuthStore.getState().getProfile();
    } else {
      useAuthStore.setState({ profile: null, isAdmin: false });
    }
  });
};
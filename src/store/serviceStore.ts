import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type ServiceType = 'offer' | 'request';
export type ServiceStatus = 'active' | 'completed' | 'cancelled';

export interface Service {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  user_id: string;
  type: ServiceType;
  status: ServiceStatus;
  image_url: string | null;
  // Join data
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

interface ServiceState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  fetchServices: (type?: ServiceType) => Promise<void>;
  createService: (service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<{ error: any | null, data: any | null }>;
  updateService: (id: string, updates: Partial<Service>) => Promise<{ error: any | null }>;
  deleteService: (id: string) => Promise<{ error: any | null }>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,
  
  fetchServices: async (type) => {
    set({ isLoading: true, error: null });
    
    let query = supabase
      .from('services')
      .select(`
        *,
        profile:profiles(username, avatar_url)
      `)
      .order('created_at', { ascending: false });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    console.log('Fetching services with query:', query); // Debug log
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching services:', error); // Debug log
      set({ error: error.message, isLoading: false });
      return;
    }
    
    set({ services: data as Service[], isLoading: false });
  },
  
  createService: async (service) => {
    const { data, error } = await supabase
      .from('services')
      .insert({
        ...service,
        status: 'active',
      })
      .select();
    
    if (!error) {
      await get().fetchServices();
    }
    
    return { error, data };
  },
  
  updateService: async (id, updates) => {
    const { error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id);
    
    if (!error) {
      await get().fetchServices();
    }
    
    return { error };
  },
  
  deleteService: async (id) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (!error) {
      await get().fetchServices();
    }
    
    return { error };
  },
}));
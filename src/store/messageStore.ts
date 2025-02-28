import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  service_id: string;
  content: string;
  read: boolean;
  // Join data
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

interface MessageState {
  messages: Message[];
  conversations: { [key: string]: Message[] };
  isLoading: boolean;
  error: string | null;
  fetchMessages: (userId: string) => Promise<void>;
  fetchConversation: (serviceId: string, otherUserId: string) => Promise<void>;
  sendMessage: (message: Omit<Message, 'id' | 'created_at' | 'read'>) => Promise<{ error: any | null }>;
  markAsRead: (messageId: string) => Promise<{ error: any | null }>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  conversations: {},
  isLoading: false,
  error: null,
  
  fetchMessages: async (userId) => {
    set({ isLoading: true, error: null });
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(username, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }
    
    set({ messages: data as Message[], isLoading: false });
  },
  
  fetchConversation: async (serviceId, otherUserId) => {
    set({ isLoading: true, error: null });
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(username, avatar_url)
      `)
      .eq('service_id', serviceId)
      .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });
    
    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }
    
    const key = `${serviceId}-${otherUserId}`;
    set({ 
      conversations: { ...get().conversations, [key]: data as Message[] },
      isLoading: false 
    });
  },
  
  sendMessage: async (message) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        ...message,
        read: false,
      });
    
    if (!error) {
      // Refresh the conversation
      await get().fetchConversation(message.service_id, message.receiver_id);
    }
    
    return { error };
  },
  
  markAsRead: async (messageId) => {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);
    
    return { error };
  },
}));
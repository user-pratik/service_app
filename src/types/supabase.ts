export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          is_admin: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username: string
          full_name: string
          avatar_url?: string | null
          bio?: string | null
          is_admin?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          is_admin?: boolean
        }
      }
      services: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          price: number
          category: string
          location: string
          user_id: string
          type: 'offer' | 'request'
          status: 'active' | 'completed' | 'cancelled'
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          price: number
          category: string
          location: string
          user_id: string
          type: 'offer' | 'request'
          status?: 'active' | 'completed' | 'cancelled'
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          price?: number
          category?: string
          location?: string
          user_id?: string
          type?: 'offer' | 'request'
          status?: 'active' | 'completed' | 'cancelled'
          image_url?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          receiver_id: string
          service_id: string
          content: string
          read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          sender_id: string
          receiver_id: string
          service_id: string
          content: string
          read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          sender_id?: string
          receiver_id?: string
          service_id?: string
          content?: string
          read?: boolean
        }
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          service_id: string
          buyer_id: string
          seller_id: string
          amount: number
          status: 'pending' | 'completed' | 'cancelled'
        }
        Insert: {
          id?: string
          created_at?: string
          service_id: string
          buyer_id: string
          seller_id: string
          amount: number
          status?: 'pending' | 'completed' | 'cancelled'
        }
        Update: {
          id?: string
          created_at?: string
          service_id?: string
          buyer_id?: string
          seller_id?: string
          amount?: number
          status?: 'pending' | 'completed' | 'cancelled'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
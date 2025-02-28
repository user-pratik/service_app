import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface Transaction {
  id: string;
  created_at: string;
  service_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: TransactionStatus;
  // Join data
  service?: {
    title: string;
  };
  buyer?: {
    username: string;
  };
  seller?: {
    username: string;
  };
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (userId: string) => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<{ error: any | null, data: any | null }>;
  updateTransactionStatus: (id: string, status: TransactionStatus) => Promise<{ error: any | null }>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  
  fetchTransactions: async (userId) => {
    set({ isLoading: true, error: null });
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        service:services(title),
        buyer:profiles!buyer_id(username),
        seller:profiles!seller_id(username)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }
    
    set({ transactions: data as Transaction[], isLoading: false });
  },
  
  createTransaction: async (transaction) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select();
    
    if (!error) {
      set((state) => ({
        transactions: [...state.transactions, ...data],
      }));
    }
    
    return { error, data };
  },
  
  updateTransactionStatus: async (id, status) => {
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id);
    
    if (!error) {
      const transactions = get().transactions;
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        await get().fetchTransactions(transaction.buyer_id);
      }
    }
    
    return { error };
  },
}));
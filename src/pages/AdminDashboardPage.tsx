import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Service } from '../store/serviceStore';
import { Transaction } from '../store/transactionStore';
import { supabase } from '../lib/supabase';
import { Users, Package, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  created_at: string;
  is_admin: boolean;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<Profile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (usersError) throw usersError;
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select(`
            *,
            profile:profiles(username)
          `)
          .order('created_at', { ascending: false });
        
        if (servicesError) throw servicesError;
        
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select(`
            *,
            service:services(title),
            buyer:profiles!buyer_id(username),
            seller:profiles!seller_id(username)
          `)
          .order('created_at', { ascending: false });
        
        if (transactionsError) throw transactionsError;
        
        setUsers(usersData as Profile[]);
        setServices(servicesData as Service[]);
        setTransactions(transactionsData as Transaction[]);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isAdmin, navigate]);
  
  const handleDeleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setServices(services.filter(service => service.id !== id));
      toast.success('Service deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete service');
    }
  };
  
  const handleToggleAdmin = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, is_admin: !currentStatus } : user
      ));
      
      toast.success(`User ${!currentStatus ? 'promoted to admin' : 'demoted from admin'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, services, and transactions</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-5 h-5 mx-auto mb-1" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'services'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-5 h-5 mx-auto mb-1" />
              Services
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-5 h-5 mx-auto mb-1" />
              Transactions
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(profile => (
                        <tr key={profile.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-800 font-medium">
                                  {profile.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {profile.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {profile.full_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{profile.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(profile.created_at)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              profile.is_admin
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {profile.is_admin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {profile.id !== user?.id && (
                              <button
                                onClick={() => handleToggleAdmin(profile.id, profile.is_admin)}
                                className={`text-${profile.is_admin ? 'red' : 'indigo'}-600 hover:text-${profile.is_admin ? 'red' : 'indigo'}-900`}
                              >
                                {profile.is_admin ? 'Remove Admin' : 'Make Admin'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeTab === 'services' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {services.map(service => (
                        <tr key={service.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {service.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              by {service.profile?.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              service.type === 'offer'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {service.type === 'offer' ? 'Offer' : 'Request'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${service.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(service.created_at)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              service.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : service.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeTab === 'transactions' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.service?.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.buyer?.username} → {transaction.seller?.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${transaction.amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(transaction.created_at)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {transaction.status === 'pending' && (
                                <>
                                  <button
                                    onClick={async () => {
                                      const { error } = await supabase
                                        .from('transactions')
                                        .update({ status: 'completed' })
                                        .eq('id', transaction.id);
                                      
                                      if (!error) {
                                        setTransactions(transactions.map(t => 
                                          t.id === transaction.id ? { ...t, status: 'completed' } : t
                                        ));
                                        toast.success('Transaction approved');
                                      }
                                    }}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const { error } = await supabase
                                        .from('transactions')
                                        .update({ status: 'cancelled' })
                                        .eq('id', transaction.id);
                                      
                                      if (!error) {
                                        setTransactions(transactions.map(t => 
                                          t.id === transaction.id ? { ...t, status: 'cancelled' } : t
                                        ));
                                        toast.success('Transaction cancelled');
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
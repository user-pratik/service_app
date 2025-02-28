import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useServiceStore, Service } from '../store/serviceStore';
import { useTransactionStore } from '../store/transactionStore';
import MessageThread from '../components/MessageThread';
import { supabase } from '../lib/supabase';
import { MapPin, Clock, DollarSign, Edit, Trash2, MessageSquare, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createTransaction } = useTransactionStore();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMessageThread, setShowMessageThread] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isOwner = user && service && user.id === service.user_id;
  
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            profile:profiles(id, username, avatar_url, full_name)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setService(data as Service);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [id]);
  
  const handleDelete = async () => {
    if (!id || !service) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Service deleted successfully');
      navigate(service.type === 'offer' ? '/services/offers' : '/services/requests');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleInitiateTransaction = async () => {
    if (!user || !service || !service.profile) {
      toast.error('You must be logged in to make a transaction');
      return;
    }
    
    try {
      const { error } = await createTransaction({
        service_id: service.id,
        buyer_id: user.id,
        seller_id: service.user_id,
        amount: service.price,
        status: 'pending',
      });
      
      if (error) throw error;
      
      toast.success('Transaction initiated successfully');
      setShowMessageThread(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate transaction');
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The service you are looking for does not exist or has been removed.'}</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Return to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {service.image_url && (
            <div className="h-64 w-full overflow-hidden">
              <img
                src={service.image_url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                service.type === 'offer' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {service.type === 'offer' ? 'Offering' : 'Requesting'}
              </span>
            </div>
            
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <Clock className="w-4 h-4 mr-1" />
              <span>Posted on {formatDate(service.created_at)}</span>
            </div>
            
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{service.location}</span>
            </div>
            
            <div className="flex items-center text-gray-900 font-medium text-lg mb-6">
              <DollarSign className="w-5 h-5 mr-1" />
              <span>{service.price.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-b py-4 my-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{service.description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  {service.profile?.avatar_url ? (
                    <img
                      src={service.profile.avatar_url}
                      alt={service.profile.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-indigo-800 font-medium">
                      {service.profile?.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{service.profile?.username}</p>
                  <p className="text-sm text-gray-500">{service.profile?.username}</p>
                </div>
              </div>
              
              {isOwner ? (
                <div className="flex space-x-2">
                  <Link
                    to={`/services/edit/${service.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowMessageThread(!showMessageThread)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </button>
                  {service.type === 'offer' && (
                    <button
                      onClick={handleInitiateTransaction}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this service? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="lg:col-span-1">
        {showMessageThread && service.profile ? (
          <MessageThread
            serviceId={service.id}
            otherUserId={service.user_id}
            otherUsername={service.profile.username}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Similar Services</h2>
            <p className="text-gray-500 text-sm">
              Coming soon! We'll show similar services here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Service } from '../store/serviceStore';
import ServiceForm from '../components/ServiceForm';
import { supabase } from '../lib/supabase';
import { AlertTriangle } from 'lucide-react';

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // Check if the user is the owner
        if (user?.id !== data.user_id) {
          throw new Error('You do not have permission to edit this service');
        }
        
        setService(data as Service);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [id, user]);
  
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error || 'Service not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Edit {service.type === 'offer' ? 'Service Offer' : 'Service Request'}
      </h1>
      
      <ServiceForm
        type={service.type}
        initialData={{
          title: service.title,
          description: service.description,
          price: service.price,
          category: service.category,
          location: service.location,
          image_url: service.image_url,
        }}
        isEditing={true}
        serviceId={service.id}
      />
    </div>
  );
}
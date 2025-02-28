import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useServiceStore, ServiceType } from '../store/serviceStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ServiceFormProps {
  type: ServiceType;
  initialData?: {
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
    image_url: string | null;
  };
  isEditing?: boolean;
  serviceId?: string;
}

const categories = [
  'Food Delivery',
  'Cleaning',
  'Tutoring',
  'Handyman',
  'Beauty & Wellness',
  'Tech Support',
  'Transportation',
  'Event Planning',
  'Other',
];

export default function ServiceForm({ 
  type, 
  initialData, 
  isEditing = false,
  serviceId
}: ServiceFormProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createService, updateService } = useServiceStore();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || categories[0],
    location: initialData?.location || '',
    image_url: initialData?.image_url || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a service');
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && serviceId) {
        const { error } = await updateService(serviceId, {
          ...formData,
          image_url: formData.image_url || null,
        });
        
        if (error) throw error;
        
        toast.success('Service updated successfully');
        navigate(`/services/${serviceId}`);
      } else {
        const { error } = await createService({
          ...formData,
          user_id: user.id,
          type,
          image_url: formData.image_url || null,
        });
        
        if (error) throw error;
        
        toast.success('Service created successfully');
        navigate(type === 'offer' ? '/services/offers' : '/services/requests');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit' : 'Create'} {type === 'offer' ? 'Service Offer' : 'Service Request'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Food Delivery from Campus Cafeteria"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe your service in detail..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (in $)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., North Campus, Building 3"
          />
        </div>
        
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL (optional)
          </label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://example.com/image.jpg"
          />
          <p className="mt-1 text-sm text-gray-500">
            Provide a URL to an image that represents your service
          </p>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : isEditing ? 'Update Service' : 'Create Service'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../store/serviceStore';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { user } = useAuthStore();
  const isOwner = user?.id === service.user_id;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {service.image_url && (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={service.image_url}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{service.title}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            service.type === 'offer' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {service.type === 'offer' ? 'Offering' : 'Requesting'}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
        
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{service.location}</span>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <Clock className="w-4 h-4 mr-1" />
          <span>Posted {formatDate(service.created_at)}</span>
        </div>
        
        <div className="flex items-center text-gray-900 font-medium mb-4">
          <DollarSign className="w-4 h-4 mr-1" />
          <span>{service.price.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
              {service.profile?.avatar_url ? (
                <img
                  src={service.profile.avatar_url}
                  alt={service.profile.username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-indigo-800 font-medium">
                  {service.profile?.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">{service.profile?.username}</span>
          </div>
          
          <Link
            to={`/services/${service.id}`}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            {isOwner ? 'Manage' : 'View Details'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
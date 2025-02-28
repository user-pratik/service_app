import React from 'react';
import { useParams } from 'react-router-dom';
import { ServiceType } from '../store/serviceStore';
import ServiceForm from '../components/ServiceForm';

export default function CreateServicePage() {
  const { type } = useParams<{ type: string }>();
  const serviceType = (type as ServiceType) || 'offer';
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Create a New {serviceType === 'offer' ? 'Service Offer' : 'Service Request'}
      </h1>
      
      <ServiceForm type={serviceType} />
    </div>
  );
}
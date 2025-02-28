import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useServiceStore, ServiceType } from '../store/serviceStore';
import ServiceCard from '../components/ServiceCard';
import { PlusCircle, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ServicesListPage() {
  const { type } = useParams<{ type: string }>();
  const serviceType = (type as ServiceType) || 'offer';
  const { services, fetchServices, isLoading } = useServiceStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchServices(serviceType);
  }, [serviceType]);
  
  const categories = Array.from(new Set(services.map(service => service.category)));
  
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? service.category === selectedCategory : true;
    
    const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange([0, 1000]);
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {serviceType === 'offer' ? 'Service Offers' : 'Service Requests'}
          </h1>
          <p className="text-gray-600 mt-2">
            {serviceType === 'offer' 
              ? 'Browse services offered by our community members' 
              : 'Browse service requests from our community members'}
          </p>
        </div>
        
        <Link
          to={`/services/new/${serviceType}`}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {serviceType === 'offer' ? 'Create Offer' : 'Create Request'}
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full p-2.5 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search services..."
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>
        
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-4 mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    min={priceRange[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Max"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000
              ? 'Try adjusting your filters or search terms'
              : `No ${serviceType === 'offer' ? 'service offers' : 'service requests'} available yet`}
          </p>
          <Link
            to={`/services/new/${serviceType}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {serviceType === 'offer' ? 'Create an Offer' : 'Create a Request'}
          </Link>
        </div>
      )}
    </div>
  );
}
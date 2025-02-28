import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useServiceStore, Service } from '../store/serviceStore';
import ServiceCard from '../components/ServiceCard';
import { Search, ArrowRight, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { services, fetchServices, isLoading } = useServiceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  
  useEffect(() => {
    fetchServices();
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = services.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [searchTerm, services]);
  
  const recentOffers = filteredServices
    .filter(service => service.type === 'offer')
    .slice(0, 3);
  
  const recentRequests = filteredServices
    .filter(service => service.type === 'request')
    .slice(0, 3);
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl"></div>
        <div className="relative px-6 py-24 sm:px-12 sm:py-32 rounded-2xl overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Connect, Serve, Thrive
            </h1>
            <p className="mt-6 text-xl text-indigo-100">
              Find services you need or offer your skills to others. 
              From food delivery to tutoring, our platform connects people who can help each other.
            </p>
            <div className="mt-10 flex justify-center gap-x-6">
              <Link
                to="/services/offers"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Find Services
              </Link>
              <Link
                to="/services/requests"
                className="rounded-md bg-indigo-500 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Request Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Search Section */}
      <section>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full p-4 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search for services, categories, or locations..."
            />
          </div>
        </div>
      </section>
      
      {/* Recent Service Offers */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Service Offers</h2>
          <Link to="/services/offers" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : recentOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentOffers.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 mb-4">No service offers available yet.</p>
            <Link
              to="/services/new/offer"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create a service offer
            </Link>
          </div>
        )}
      </section>
      
      {/* Recent Service Requests */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Service Requests</h2>
          <Link to="/services/requests" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : recentRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentRequests.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 mb-4">No service requests available yet.</p>
            <Link
              to="/services/new/request"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create a service request
            </Link>
          </div>
        )}
      </section>
      
      {/* How It Works */}
      <section className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Create an Account</h3>
            <p className="text-gray-600">Sign up and create your profile to start using our platform.</p>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Post or Find Services</h3>
            <p className="text-gray-600">Offer your skills or search for services you need.</p>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -5 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Connect & Transact</h3>
            <p className="text-gray-600">Message, agree on terms, and complete secure payments.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
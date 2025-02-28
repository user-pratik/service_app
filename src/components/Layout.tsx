import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Bell, Home, LogOut, Menu, MessageSquare, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const { user, profile, signOut, isAdmin } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const navLinks = [
    { to: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { to: '/services/offers', label: 'Services Offered', icon: null },
    { to: '/services/requests', label: 'Service Requests', icon: null },
  ];
  
  const authLinks = user ? [
    { to: '/messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
    { to: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { to: '/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  ] : [];
  
  const adminLinks = isAdmin ? [
    { to: '/admin', label: 'Admin Dashboard', icon: null },
  ] : [];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold text-indigo-600">ServiceHub</Link>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === link.to
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {adminLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === link.to
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {user ? (
                <>
                  {authLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {link.icon}
                    </Link>
                  ))}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      {profile?.username}
                    </span>
                    <button
                      onClick={() => signOut()}
                      className="p-1 rounded-full text-gray-500 hover:text-gray-700"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden"
            >
              <div className="pt-2 pb-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      location.pathname === link.to
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      {link.icon && <span className="mr-2">{link.icon}</span>}
                      {link.label}
                    </div>
                  </Link>
                ))}
                {adminLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      location.pathname === link.to
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              {user ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      {profile?.avatar_url ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={profile.avatar_url}
                          alt={profile.username}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">
                            {profile?.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{profile?.username}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {authLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          {link.icon && <span className="mr-2">{link.icon}</span>}
                          {link.label}
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="mr-2 w-5 h-5" />
                        Sign out
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center justify-around">
                    <Link
                      to="/login"
                      className="flex-1 mx-4 text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="flex-1 mx-4 text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">© 2025 ServiceHub. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
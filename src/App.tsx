import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ServicesListPage from './pages/ServicesListPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CreateServicePage from './pages/CreateServicePage';
import EditServicePage from './pages/EditServicePage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import { useAuthStore, initAuth } from './store/authStore';


function App() {
  const { user, isLoading, isAdmin } = useAuthStore();
  
  useEffect(() => {
    initAuth();
  }, []);
  
  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return <>{children}</>;
  };
  
  // Admin route component
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
    
    if (!user || !isAdmin) {
      return <Navigate to="/" />;
    }
    
    return <>{children}</>;
  };
  
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          
          {/* Service Routes */}
          <Route path="services">
            <Route path="offers" element={<ServicesListPage />} />
            <Route path="requests" element={<ServicesListPage />} />
            <Route path=":id" element={<ServiceDetailPage />} />
            <Route 
              path="new/:type" 
              element={
                <ProtectedRoute>
                  <CreateServicePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="edit/:id" 
              element={
                <ProtectedRoute>
                  <EditServicePage />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Auth Routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="messages" 
            element={
              <ProtectedRoute>
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h1 className="text-2xl font-bold mb-4">Messages</h1>
                  <p>Your messages will appear here.</p>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="notifications" 
            element={
              <ProtectedRoute>
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h1 className="text-2xl font-bold mb-4">Notifications</h1>
                  <p>Your notifications will appear here.</p>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="admin" 
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            } 
          />
          
          {/* 404 Route */}
          <Route 
            path="*" 
            element={
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <a
                  href="/"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Go back home
                </a>
              </div>
            } 
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
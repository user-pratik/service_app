import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  // Redirect to login if the user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Prevent rendering until redirect occurs
  if (!user) {
    return null;
  }

  // Show loading message if profile data is not yet available
  if (!profile) {
    return <div>Loading profile...</div>;
  }

  // Display profile data once it's available
  return (
    <div className="profile-page">
      <h2>Profile</h2>
      {profile.avatar_url && (
        <img src={profile.avatar_url} alt="Avatar" className="avatar" />
      )}
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Full Name:</strong> {profile.full_name}</p>
      <p><strong>Bio:</strong> {profile.bio || 'No bio available'}</p>
    </div>
  );
}
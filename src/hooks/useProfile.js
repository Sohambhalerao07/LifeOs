import { useState, useEffect } from 'react';

export function useProfile() {
  const [profile, setProfileState] = useState({
    name: 'Soham',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3WQYrL0OBvTT4Fo3BEaCpmF5Tt1Pt7K4OCGo2plIQR9qFsCXAi147bLovUbowOl-LLUxPfO0FHax6pQizInmSK5qSNJwC9YiddweDrZJaNIr2TWRsoQHZjxNCp6cBRu5AZf38_d-jN9uBDPLjlnERAFw2Wplx7bvEreShKgalY_4fBPDhE1vnVV9iIfXu-KgvJJh1PCT_hypK94WzfJk8AL2RdA0me3W0lcciwINKxiXwBnLrZ5bCOU_gMaNfO0oN9Fb-pbybBw'
  });

  useEffect(() => {
    const stored = localStorage.getItem('lifeos_profile');
    if (stored) {
      try {
        setProfileState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  const setProfile = (newProfile) => {
    setProfileState(newProfile);
    localStorage.setItem('lifeos_profile', JSON.stringify(newProfile));
    window.dispatchEvent(new Event('profile_updated'));
  };

  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem('lifeos_profile');
      if (stored) {
        setProfileState(JSON.parse(stored));
      }
    };
    window.addEventListener('profile_updated', handleUpdate);
    return () => window.removeEventListener('profile_updated', handleUpdate);
  }, []);

  return { profile, setProfile };
}

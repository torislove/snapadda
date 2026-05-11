import { useEffect, useState } from 'react';

// Tracks user behavior locally to build a recommendation profile
export const useBehaviorTracker = () => {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('snapadda_behavior_profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse behavior profile', e);
    }
    return {
      viewedTypes: {},
      viewedLocations: {},
      totalViews: 0
    };
  });

  const [showModal, setShowModal] = useState(false);

  // Call this when a user views a property
  const logPropertyView = (propertyType, location) => {
    if (!propertyType || !location) return;

    setProfile(prev => {
      const newProfile = { ...prev };
      
      // Increment type views
      newProfile.viewedTypes[propertyType] = (newProfile.viewedTypes[propertyType] || 0) + 1;
      
      // Increment location views
      const city = location.split(',')[0].trim(); // Extract main city
      newProfile.viewedLocations[city] = (newProfile.viewedLocations[city] || 0) + 1;
      
      newProfile.totalViews += 1;

      // TRIGGER: If 3+ views and not captured yet
      if (newProfile.totalViews >= 3 && !sessionStorage.getItem('snapadda_lead_captured')) {
        setShowModal(true);
      }

      // Persist to local storage
      localStorage.setItem('snapadda_behavior_profile', JSON.stringify(newProfile));
      return newProfile;
    });
  };

  // Analyze profile to get the top preferred property type and location
  const getTopPreferences = () => {
    if (profile.totalViews < 1) return null;

    // Get top type
    const topType = Object.entries(profile.viewedTypes)
      .sort((a, b) => b[1] - a[1])[0];

    // Get top location
    const topLocation = Object.entries(profile.viewedLocations)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      preferredType: topType ? topType[0] : null,
      preferredLocation: topLocation ? topLocation[0] : null,
      confidence: topType ? (topType[1] / profile.totalViews) : 0
    };
  };

  return { profile, logPropertyView, getTopPreferences, showModal, setShowModal };
};

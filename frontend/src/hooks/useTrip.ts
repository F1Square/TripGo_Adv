import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from './useGeolocation';

interface TripPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
}

interface Trip {
  id: string;
  purpose: string;
  startDate: string;
  endDate?: string;
  startOdometer: number;
  endOdometer?: number;
  startLocation?: string;
  endLocation?: string;
  distance: number;
  duration: number; // in seconds
  route: TripPoint[];
  status: 'active' | 'completed';
  averageSpeed: number;
}

interface TripState {
  currentTrip: Trip | null;
  tripHistory: Trip[];
  isActive: boolean;
}

export const useTrip = () => {
  const [state, setState] = useState<TripState>({
    currentTrip: null,
    tripHistory: [],
    isActive: false,
  });

  const { position, startTracking, stopTracking, getCurrentPosition } = useGeolocation();

  // Load trip data from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem('trip_tracker_trips');
    const currentTrip = localStorage.getItem('trip_tracker_current_trip');
    
    if (savedTrips) {
      try {
        const trips = JSON.parse(savedTrips);
        setState(prev => ({ ...prev, tripHistory: trips }));
      } catch (error) {
        console.error('Failed to load trip history:', error);
      }
    }

    if (currentTrip) {
      try {
        const trip = JSON.parse(currentTrip);
        setState(prev => ({ ...prev, currentTrip: trip, isActive: true }));
        startTracking(); // Resume tracking if there's an active trip
      } catch (error) {
        console.error('Failed to load current trip:', error);
        localStorage.removeItem('trip_tracker_current_trip');
      }
    }
  }, [startTracking]);

  // Update current trip with new position data
  useEffect(() => {
    if (state.isActive && state.currentTrip && position) {
      const newPoint: TripPoint = {
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: position.timestamp,
        accuracy: position.accuracy,
      };

      setState(prev => {
        if (!prev.currentTrip) return prev;

        const updatedRoute = [...prev.currentTrip.route, newPoint];
        const distance = calculateDistance(updatedRoute);
        const duration = Math.floor((Date.now() - new Date(prev.currentTrip.startDate).getTime()) / 1000);
        const averageSpeed = duration > 0 ? (distance / duration) * 3.6 : 0; // km/h

        const updatedTrip = {
          ...prev.currentTrip,
          route: updatedRoute,
          distance,
          duration,
          averageSpeed,
        };

        // Save to localStorage
        localStorage.setItem('trip_tracker_current_trip', JSON.stringify(updatedTrip));

        return {
          ...prev,
          currentTrip: updatedTrip,
        };
      });
    }
  }, [position, state.isActive, state.currentTrip]);

  const startTrip = useCallback(async (purpose: string, startOdometer: number) => {
    try {
      const startPosition = await getCurrentPosition();
      
      const newTrip: Trip = {
        id: Date.now().toString(),
        purpose,
        startDate: new Date().toISOString(),
        startOdometer,
        distance: 0,
        duration: 0,
        route: [{
          latitude: startPosition.latitude,
          longitude: startPosition.longitude,
          timestamp: startPosition.timestamp,
          accuracy: startPosition.accuracy,
        }],
        status: 'active',
        averageSpeed: 0,
      };

      setState(prev => ({
        ...prev,
        currentTrip: newTrip,
        isActive: true,
      }));

      localStorage.setItem('trip_tracker_current_trip', JSON.stringify(newTrip));
      startTracking();

      return { success: true };
    } catch (error) {
      console.error('Failed to start trip:', error);
      return { success: false, error: 'Failed to get location' };
    }
  }, [getCurrentPosition, startTracking]);

  const endTrip = useCallback(async (endOdometer: number) => {
    if (!state.currentTrip) return { success: false, error: 'No active trip' };

    try {
      const endPosition = await getCurrentPosition();
      
      const completedTrip: Trip = {
        ...state.currentTrip,
        endDate: new Date().toISOString(),
        endOdometer,
        status: 'completed',
        route: [...state.currentTrip.route, {
          latitude: endPosition.latitude,
          longitude: endPosition.longitude,
          timestamp: endPosition.timestamp,
          accuracy: endPosition.accuracy,
        }],
      };

      // Calculate final distance
      completedTrip.distance = calculateDistance(completedTrip.route);
      completedTrip.duration = Math.floor((new Date(completedTrip.endDate!).getTime() - new Date(completedTrip.startDate).getTime()) / 1000);
      completedTrip.averageSpeed = completedTrip.duration > 0 ? (completedTrip.distance / completedTrip.duration) * 3.6 : 0;

      setState(prev => ({
        ...prev,
        currentTrip: null,
        isActive: false,
        tripHistory: [completedTrip, ...prev.tripHistory],
      }));

      // Save to localStorage
      const updatedHistory = [completedTrip, ...state.tripHistory];
      localStorage.setItem('trip_tracker_trips', JSON.stringify(updatedHistory));
      localStorage.removeItem('trip_tracker_current_trip');

      stopTracking();

      return { success: true, trip: completedTrip };
    } catch (error) {
      console.error('Failed to end trip:', error);
      return { success: false, error: 'Failed to get location' };
    }
  }, [state.currentTrip, state.tripHistory, getCurrentPosition, stopTracking]);

  const deleteTrip = useCallback((tripId: string) => {
    setState(prev => {
      const updatedHistory = prev.tripHistory.filter(trip => trip.id !== tripId);
      localStorage.setItem('trip_tracker_trips', JSON.stringify(updatedHistory));
      return {
        ...prev,
        tripHistory: updatedHistory,
      };
    });
  }, []);

  const exportTripsToCSV = useCallback(() => {
    const csvHeader = 'Date,Purpose,Start Odometer,End Odometer,Distance (km),Duration (hours),Average Speed (km/h),Start Location,End Location\n';
    
    const csvRows = state.tripHistory.map(trip => {
      const date = new Date(trip.startDate).toLocaleDateString();
      const durationHours = (trip.duration / 3600).toFixed(2);
      const distance = trip.distance.toFixed(2);
      const avgSpeed = trip.averageSpeed.toFixed(1);
      
      return `${date},"${trip.purpose}",${trip.startOdometer},${trip.endOdometer || ''},${distance},${durationHours},${avgSpeed},"${trip.startLocation || ''}","${trip.endLocation || ''}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `business_trips_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [state.tripHistory]);

  return {
    ...state,
    startTrip,
    endTrip,
    deleteTrip,
    exportTripsToCSV,
  };
};

// Helper function to calculate distance between points using Haversine formula
function calculateDistance(route: TripPoint[]): number {
  if (route.length < 2) return 0;

  let totalDistance = 0;
  
  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1];
    const curr = route[i];
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(curr.latitude - prev.latitude);
    const dLon = toRad(curr.longitude - prev.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(prev.latitude)) * Math.cos(toRad(curr.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    totalDistance += distance;
  }
  
  return totalDistance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
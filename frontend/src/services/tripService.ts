import { apiService } from './api';

// Trip interfaces
export interface Trip {
  id: string;
  title: string;
  description?: string;
  startLocation?: string;
  endLocation?: string;
  startOdometer: number;
  endOdometer?: number;
  distance?: number;
  status: 'active' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  route: RoutePoint[];
  totalExpenses?: number;
  businessPurpose: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  accuracy?: number;
}

// Trip request interfaces
export interface CreateTripRequest {
  title: string;
  description?: string;
  startLocation?: string;
  startOdometer: number;
  businessPurpose: string;
}

export interface UpdateTripRequest {
  title?: string;
  description?: string;
  endLocation?: string;
  endOdometer?: number;
  businessPurpose?: string;
}

export interface AddRoutePointRequest {
  latitude: number;
  longitude: number;
  speed?: number;
  accuracy?: number;
}

class TripService {
  // Get all trips for the current user
  async getAllTrips() {
    return await apiService.get<Trip[]>('/trips');
  }

  // Get a specific trip by ID
  async getTripById(tripId: string) {
    return await apiService.get<Trip>(`/trips/${tripId}`);
  }

  // Create a new trip
  async createTrip(tripData: CreateTripRequest) {
    return await apiService.post<Trip>('/trips', tripData);
  }

  // Update an existing trip
  async updateTrip(tripId: string, updateData: UpdateTripRequest) {
    return await apiService.put<Trip>(`/trips/${tripId}`, updateData);
  }

  // Add a route point to an active trip
  async addRoutePoint(tripId: string, routePoint: AddRoutePointRequest) {
    return await apiService.post<Trip>(`/trips/${tripId}/route`, routePoint);
  }

  // Complete a trip
  async completeTrip(tripId: string, endLocation?: string, endOdometer?: number) {
    return await apiService.post<Trip>(`/trips/${tripId}/complete`, {
      endLocation,
      endOdometer
    });
  }

  // Cancel a trip
  async cancelTrip(tripId: string) {
    return await apiService.post<Trip>(`/trips/${tripId}/cancel`);
  }

  // Delete a trip
  async deleteTrip(tripId: string) {
    return await apiService.delete(`/trips/${tripId}`);
  }

  // Get active trip (if any)
  async getActiveTrip() {
    const result = await apiService.get<Trip[]>('/trips?status=active');
    if (result.success && result.data && result.data.length > 0) {
      return {
        success: true,
        data: result.data[0]
      };
    }
    return {
      success: true,
      data: null
    };
  }
}

// Create and export a default instance
export const tripService = new TripService();
export default tripService;
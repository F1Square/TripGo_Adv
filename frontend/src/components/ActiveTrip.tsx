import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Clock, 
  TrendingUp, 
  Gauge, 
  Square, 
  Map,
  Navigation,
  Signal
} from 'lucide-react';
import { useTrip } from '@/hooks/useTrip';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import TripMap from './TripMap';

const ActiveTrip = () => {
  const { currentTrip, endTrip } = useTrip();
  const { position, error: gpsError } = useGeolocation();
  const { toast } = useToast();
  
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [endOdometer, setEndOdometer] = useState('');

  if (!currentTrip) return null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getGPSAccuracy = () => {
    if (!position) return 'No signal';
    if (position.accuracy <= 10) return 'Excellent';
    if (position.accuracy <= 50) return 'Good';
    if (position.accuracy <= 100) return 'Fair';
    return 'Poor';
  };

  const getGPSColor = () => {
    if (!position) return 'text-destructive';
    if (position.accuracy <= 10) return 'text-success';
    if (position.accuracy <= 50) return 'text-primary';
    if (position.accuracy <= 100) return 'text-yellow-500';
    return 'text-destructive';
  };

  const handleEndTrip = async () => {
    const odometerValue = Number(endOdometer);
    if (isNaN(odometerValue) || odometerValue < currentTrip.startOdometer) {
      toast({
        title: "Invalid odometer reading",
        description: "End odometer must be greater than start odometer",
        variant: "destructive",
      });
      return;
    }

    const result = await endTrip(odometerValue);
    
    if (result.success) {
      toast({
        title: "Trip completed!",
        description: `Trip ended successfully. Distance: ${result.trip?.distance.toFixed(2)} km`,
      });
      setIsEndDialogOpen(false);
      setEndOdometer('');
    } else {
      toast({
        title: "Failed to end trip",
        description: result.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <Card className="glass-card border-success/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span>Trip in Progress</span>
            </CardTitle>
            <Badge variant="default" className="bg-success text-success-foreground">
              LIVE
            </Badge>
          </div>
          <p className="text-muted-foreground">{currentTrip.purpose}</p>
        </CardHeader>
      </Card>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-lg font-bold text-foreground">
                  {currentTrip.distance.toFixed(1)} km
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-bold text-foreground">
                  {formatDuration(currentTrip.duration)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Speed</p>
                <p className="text-lg font-bold text-foreground">
                  {currentTrip.averageSpeed.toFixed(0)} km/h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Signal className={`w-5 h-5 ${getGPSColor()}`} />
              <div>
                <p className="text-sm text-muted-foreground">GPS</p>
                <p className={`text-lg font-bold ${getGPSColor()}`}>
                  {getGPSAccuracy()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GPS Error Alert */}
      {gpsError && (
        <Card className="glass-card border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Signal className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">GPS Issue</p>
                <p className="text-sm text-muted-foreground">{gpsError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Map className="w-5 h-5 text-primary" />
            <span>Live Route</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMapFullscreen(true)}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64 w-full rounded-b-lg overflow-hidden">
            <TripMap 
              trip={currentTrip}
              currentPosition={position}
              height="256px"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col space-y-3">
        <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="gradient-danger"
              size="xl"
              className="w-full"
            >
              <Square className="w-5 h-5 mr-2" />
              End Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>End Trip</DialogTitle>
              <DialogDescription>
                Enter your ending odometer reading to complete this trip.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Starting Odometer</Label>
                <p className="text-sm text-muted-foreground">
                  {currentTrip.startOdometer.toLocaleString()} km
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-odometer">Ending Odometer</Label>
                <Input
                  id="end-odometer"
                  type="number"
                  placeholder="Enter ending reading"
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(e.target.value)}
                  min={currentTrip.startOdometer}
                />
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Trip Summary:</strong><br />
                  Distance: {currentTrip.distance.toFixed(2)} km<br />
                  Duration: {formatDuration(currentTrip.duration)}<br />
                  Purpose: {currentTrip.purpose}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEndDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="gradient-danger"
                onClick={handleEndTrip}
                disabled={!endOdometer}
              >
                End Trip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fullscreen Map Modal */}
      <Dialog open={isMapFullscreen} onOpenChange={setIsMapFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <div className="h-full w-full">
            <TripMap 
              trip={currentTrip}
              currentPosition={position}
              height="100%"
              fullscreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveTrip;
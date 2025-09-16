import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Settings, LogOut, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const UserProfile: React.FC = React.memo(() => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!profileData.email.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // For now, we'll just show a success message since profile update endpoint may not exist
      // In a real implementation, you'd call an API to update the profile
      toast({
        title: "Profile updated!",
        description: "Your profile information has been updated successfully",
      });
      
      // Reset form with current user data
      setProfileData({
        name: user?.name || '',
        email: user?.email || '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <div className="space-y-6">
        {/* Current User Info Display */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center">
            <Settings className="w-4 h-4 mr-2 text-primary" />
            Current Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Update Form - Currently Display Only */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>Full Name</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Enter your full name"
                className="bg-background/80"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Profile updates are currently view-only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="Enter your email address"
                className="bg-background/80"
                disabled
              />
            </div>
          </div>

          {/* Commented out until backend profile update is implemented */}
          {/* <div className="flex justify-between items-center pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Updating...' : 'Update Profile'}</span>
            </Button>
          </div> */}
        </form>

        {/* Account Actions */}
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-foreground mb-4">Account Actions</h3>
          <div className="space-y-3">
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile;
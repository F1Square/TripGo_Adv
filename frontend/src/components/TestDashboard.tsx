import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const TestDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl">Welcome, {user?.name}!</h2>
            <p>Email: {user?.email}</p>
            <p className="text-green-600">✅ Authentication successful!</p>
            <p className="text-blue-600">✅ Dashboard route working!</p>
            
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Trip management functionality</li>
                <li>• GPS tracking integration</li>
                <li>• Expense reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;

import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NotebookGrid from '@/components/dashboard/NotebookGrid';
import EmptyDashboard from '@/components/dashboard/EmptyDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { notebooks, isLoading, error, isError } = useNotebooks();
  const { isAdmin, isLoading: profileLoading } = useProfile();
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);
  const hasNotebooks = notebooks && notebooks.length > 0;

  // Show loading while auth is initializing
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">Welcome to InsightsLM</h1>
          </div>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show auth error if present
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">Welcome to InsightsLM</h1>
          </div>
          <div className="text-center py-16">
            <p className="text-red-600">Authentication error: {authError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show notebooks loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">Welcome to InsightsLM</h1>
          </div>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your notebooks...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show notebooks error if present
  if (isError && error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">Welcome to InsightsLM</h1>
          </div>
          <div className="text-center py-16">
            <p className="text-red-600">Error loading notebooks: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (showAdminPanel && isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <DashboardHeader userEmail={user?.email} />
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button 
            variant="outline" 
            onClick={() => setShowAdminPanel(false)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader userEmail={user?.email} />
      
      <main className="max-w-7xl mx-auto px-6 py-[60px]">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="font-medium text-gray-900 mb-2 text-5xl">Welcome to InsightsLM</h1>
          {isAdmin && (
            <Button 
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Button>
          )}
        </div>

        {hasNotebooks ? <NotebookGrid /> : <EmptyDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;

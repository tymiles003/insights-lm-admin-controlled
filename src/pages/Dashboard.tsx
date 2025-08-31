
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
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-slate-800 mb-2 tracking-tight">Welcome to Legal Insights</h1>
          </div>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Initializing platform...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show auth error if present
  if (authError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-slate-800 mb-2 tracking-tight">Welcome to Legal Insights</h1>
          </div>
          <div className="text-center py-16">
            <p className="text-red-600">Authentication error: {authError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors"
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
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-slate-800 mb-2 tracking-tight">Welcome to Legal Insights</h1>
          </div>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading your research workspace...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show notebooks error if present
  if (isError && error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-slate-800 mb-2 tracking-tight">Welcome to Legal Insights</h1>
          </div>
          <div className="text-center py-16">
            <p className="text-red-600">Error loading notebooks: {typeof error === 'string' ? error : 'Unknown error'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors"
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
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader userEmail={user?.email} />
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button 
            variant="outline" 
            onClick={() => setShowAdminPanel(false)}
            className="mb-4 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader userEmail={user?.email} />
      
      <main className="max-w-7xl mx-auto px-6 py-[60px]">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-semibold text-slate-800 mb-3 text-5xl tracking-tight">Welcome to Legal Insights</h1>
            <p className="text-xl text-slate-600 font-medium">Your intelligent legal research companion</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 legal-shadow"
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

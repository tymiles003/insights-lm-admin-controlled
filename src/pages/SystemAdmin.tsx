import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Database, Users, Activity, Settings, BarChart3 } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { SystemUserManagement } from '@/components/system-admin/SystemUserManagement';
import { DatabaseStats } from '@/components/system-admin/DatabaseStats';
import { SystemHealth } from '@/components/system-admin/SystemHealth';
import { SystemSettings } from '@/components/system-admin/SystemSettings';
import { SystemAnalytics } from '@/components/system-admin/SystemAnalytics';

const SystemAdmin = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading system admin...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600 mr-2" />
              <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            </div>
            <p className="text-gray-600">You need administrator privileges to access the system admin panel.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      <DashboardHeader userEmail={user?.email} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2 text-slate-900 tracking-tight font-crimson">
            <Shield className="h-10 w-10 text-slate-700" />
            System Administration
          </h1>
          <p className="text-xl text-slate-700 font-semibold">
            Advanced system management and monitoring tools
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-slate-200 rounded-xl p-1 legal-shadow">
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-100 rounded-lg font-semibold"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger 
              value="database" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-100 rounded-lg font-semibold"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Database</span>
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-100 rounded-lg font-semibold"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-100 rounded-lg font-semibold"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-100 rounded-lg font-semibold"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="legal-shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage all users, roles, and system-wide permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemUserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card className="legal-shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Database className="h-5 w-5" />
                  Database Statistics
                </CardTitle>
                <CardDescription>
                  Monitor database usage, performance, and storage metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatabaseStats />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card className="legal-shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
                <CardDescription>
                  Monitor system performance, edge functions, and service status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemHealth />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="legal-shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <BarChart3 className="h-5 w-5" />
                  System Analytics
                </CardTitle>
                <CardDescription>
                  Usage analytics, performance metrics, and user behavior insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="legal-shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings, maintenance mode, and feature flags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SystemAdmin;
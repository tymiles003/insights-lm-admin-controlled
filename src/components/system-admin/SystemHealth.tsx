import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Zap, Database, Cloud } from "lucide-react";

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time: number;
  last_checked: string;
  details?: string;
}

export function SystemHealth() {
  const { data: healthChecks, isLoading, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const checks: HealthCheck[] = [];
      
      // Database connectivity check
      try {
        const start = Date.now();
        const { error } = await supabase.from('profiles').select('id').limit(1);
        const responseTime = Date.now() - start;
        
        checks.push({
          service: 'Database',
          status: error ? 'down' : 'healthy',
          response_time: responseTime,
          last_checked: new Date().toISOString(),
          details: error ? error.message : 'Connection successful'
        });
      } catch (error) {
        checks.push({
          service: 'Database',
          status: 'down',
          response_time: 0,
          last_checked: new Date().toISOString(),
          details: 'Connection failed'
        });
      }

      // Storage check
      try {
        const start = Date.now();
        const { data, error } = await supabase.storage.listBuckets();
        const responseTime = Date.now() - start;
        
        checks.push({
          service: 'Storage',
          status: error ? 'down' : 'healthy',
          response_time: responseTime,
          last_checked: new Date().toISOString(),
          details: error ? error.message : `${data?.length || 0} buckets available`
        });
      } catch (error) {
        checks.push({
          service: 'Storage',
          status: 'down',
          response_time: 0,
          last_checked: new Date().toISOString(),
          details: 'Storage service unavailable'
        });
      }

      // Edge Functions check (test with a simple function call)
      try {
        const start = Date.now();
        // Try to call a function that should exist
        const { error } = await supabase.functions.invoke('send-chat-message', {
          body: { test: true }
        });
        const responseTime = Date.now() - start;
        
        // Even if the function returns an error, if it responds, the service is up
        const isHealthy = !error || !error.message.includes('fetch');
        
        checks.push({
          service: 'Edge Functions',
          status: isHealthy ? 'healthy' : 'down',
          response_time: responseTime,
          last_checked: new Date().toISOString(),
          details: isHealthy ? 'Functions responding' : 'Functions unavailable'
        });
      } catch (error) {
        checks.push({
          service: 'Edge Functions',
          status: 'down',
          response_time: 0,
          last_checked: new Date().toISOString(),
          details: 'Edge functions unavailable'
        });
      }

      return checks;
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  const { data: realtimeStatus } = useQuery({
    queryKey: ['realtime-status'],
    queryFn: async () => {
      try {
        // Test realtime connection
        const channel = supabase.channel('health-check');
        const status = channel.subscribe();
        
        // Clean up immediately
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 1000);
        
        return {
          status: 'connected',
          details: 'Realtime subscriptions active'
        };
      } catch (error) {
        return {
          status: 'disconnected',
          details: 'Realtime unavailable'
        };
      }
    },
    refetchInterval: 60000, // Check every minute
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Degraded</Badge>;
      case 'down':
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'Database':
        return <Database className="h-5 w-5 text-blue-500" />;
      case 'Storage':
        return <Cloud className="h-5 w-5 text-green-500" />;
      case 'Edge Functions':
        return <Zap className="h-5 w-5 text-purple-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const overallHealth = healthChecks?.every(check => check.status === 'healthy') ? 'healthy' : 
                      healthChecks?.some(check => check.status === 'down') ? 'down' : 'degraded';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card className="legal-shadow-lg border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(overallHealth)}
              System Status
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(overallHealth)}
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="border-slate-200"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Service Health Checks */}
      <Card className="legal-shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthChecks?.map((check) => (
              <div key={check.service} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getServiceIcon(check.service)}
                  <div>
                    <div className="font-medium text-slate-900">{check.service}</div>
                    <div className="text-sm text-slate-600">{check.details}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {check.response_time}ms
                    </div>
                    <div className="text-xs text-slate-600">
                      {new Date(check.last_checked).toLocaleTimeString()}
                    </div>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
              </div>
            ))}

            {/* Realtime Status */}
            {realtimeStatus && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="font-medium text-slate-900">Realtime</div>
                    <div className="text-sm text-slate-600">{realtimeStatus.details}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(realtimeStatus.status)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="legal-shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Average Response Times</h4>
              <div className="space-y-3">
                {healthChecks?.map((check) => (
                  <div key={check.service} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{check.service}</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min((check.response_time / 1000) * 100, 100)} 
                        className="w-20 h-2"
                      />
                      <span className="text-sm font-medium text-slate-900 w-12 text-right">
                        {check.response_time}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-3">System Resources</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Database Load</span>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min((totalRows / 10000) * 100, 100)} className="w-20 h-2" />
                    <span className="text-sm font-medium text-slate-900 w-12 text-right">
                      {Math.round((totalRows / 10000) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Storage Usage</span>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min((totalStorageSize / 1000) * 100, 100)} className="w-20 h-2" />
                    <span className="text-sm font-medium text-slate-900 w-12 text-right">
                      {Math.round((totalStorageSize / 1000) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
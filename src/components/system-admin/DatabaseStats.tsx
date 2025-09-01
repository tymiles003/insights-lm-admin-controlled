import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Database, FileText, MessageSquare, Users, HardDrive, Zap } from "lucide-react";

interface DatabaseStat {
  table_name: string;
  row_count: number;
  size_mb: number;
}

export function DatabaseStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['database-stats'],
    queryFn: async () => {
      // Get row counts for each table
      const tables = ['profiles', 'notebooks', 'sources', 'notes', 'n8n_chat_histories', 'documents'];
      const stats = await Promise.all(
        tables.map(async (table) => {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.error(`Error counting ${table}:`, error);
            return { table_name: table, row_count: 0, size_mb: 0 };
          }
          
          return {
            table_name: table,
            row_count: count || 0,
            size_mb: Math.round((count || 0) * 0.001 * 100) / 100 // Rough estimate
          };
        })
      );
      
      return stats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: storageStats } = useQuery({
    queryKey: ['storage-stats'],
    queryFn: async () => {
      try {
        // Get storage usage for each bucket
        const buckets = ['sources', 'audio'];
        const storageStats = await Promise.all(
          buckets.map(async (bucket) => {
            const { data: files, error } = await supabase.storage
              .from(bucket)
              .list('', { limit: 1000 });
            
            if (error) {
              console.error(`Error listing ${bucket} files:`, error);
              return { bucket, file_count: 0, total_size_mb: 0 };
            }
            
            const totalSize = files?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0;
            
            return {
              bucket,
              file_count: files?.length || 0,
              total_size_mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
            };
          })
        );
        
        return storageStats;
      } catch (error) {
        console.error('Error fetching storage stats:', error);
        return [];
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'profiles':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'notebooks':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'sources':
        return <Database className="h-4 w-4 text-purple-500" />;
      case 'notes':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      case 'n8n_chat_histories':
        return <MessageSquare className="h-4 w-4 text-pink-500" />;
      case 'documents':
        return <Zap className="h-4 w-4 text-indigo-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTableName = (tableName: string) => {
    return tableName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalRows = stats?.reduce((sum, stat) => sum + stat.row_count, 0) || 0;
  const totalStorageSize = storageStats?.reduce((sum, stat) => sum + stat.total_size_mb, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="legal-shadow border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalRows.toLocaleString()}</div>
            <p className="text-xs text-slate-600 mt-1">Across all tables</p>
          </CardContent>
        </Card>
        
        <Card className="legal-shadow border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalStorageSize.toFixed(1)} MB</div>
            <p className="text-xs text-slate-600 mt-1">File storage</p>
          </CardContent>
        </Card>
        
        <Card className="legal-shadow border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {storageStats?.reduce((sum, stat) => sum + stat.file_count, 0) || 0}
            </div>
            <p className="text-xs text-slate-600 mt-1">Uploaded files</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Statistics */}
      <Card className="legal-shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.map((stat) => (
              <div key={stat.table_name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTableIcon(stat.table_name)}
                  <div>
                    <div className="font-medium text-slate-900">
                      {formatTableName(stat.table_name)}
                    </div>
                    <div className="text-sm text-slate-600">
                      {stat.row_count.toLocaleString()} records
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">
                    ~{stat.size_mb} MB
                  </div>
                  <Progress 
                    value={(stat.row_count / Math.max(totalRows, 1)) * 100} 
                    className="w-20 h-2 mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Storage Statistics */}
      {storageStats && storageStats.length > 0 && (
        <Card className="legal-shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>Storage Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storageStats.map((stat) => (
                <div key={stat.bucket} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-4 w-4 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900 capitalize">
                        {stat.bucket}
                      </div>
                      <div className="text-sm text-slate-600">
                        {stat.file_count} files
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {stat.total_size_mb.toFixed(1)} MB
                    </div>
                    <Progress 
                      value={(stat.total_size_mb / Math.max(totalStorageSize, 1)) * 100} 
                      className="w-20 h-2 mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
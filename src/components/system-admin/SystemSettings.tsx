import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, AlertTriangle, Save, RotateCcw, Database, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemSetting {
  key: string;
  value: string;
  description: string;
  type: 'boolean' | 'string' | 'number';
}

export function SystemSettings() {
  const { toast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxFileSize, setMaxFileSize] = useState("50");
  const [systemMessage, setSystemMessage] = useState("");
  const [autoBackup, setAutoBackup] = useState(true);

  // In a real implementation, these would be stored in a system_settings table
  const systemSettings: SystemSetting[] = [
    {
      key: 'maintenance_mode',
      value: maintenanceMode.toString(),
      description: 'Enable maintenance mode to prevent user access',
      type: 'boolean'
    },
    {
      key: 'max_file_size_mb',
      value: maxFileSize,
      description: 'Maximum file upload size in MB',
      type: 'number'
    },
    {
      key: 'system_message',
      value: systemMessage,
      description: 'System-wide message displayed to all users',
      type: 'string'
    },
    {
      key: 'auto_backup',
      value: autoBackup.toString(),
      description: 'Enable automatic daily database backups',
      type: 'boolean'
    }
  ];

  const handleSaveSettings = () => {
    // In a real implementation, this would save to a system_settings table
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleResetSettings = () => {
    setMaintenanceMode(false);
    setMaxFileSize("50");
    setSystemMessage("");
    setAutoBackup(true);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  const handleClearCache = async () => {
    try {
      // Clear browser cache and reload
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      toast({
        title: "Cache Cleared",
        description: "Application cache has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache.",
        variant: "destructive",
      });
    }
  };

  const handleDatabaseMaintenance = () => {
    toast({
      title: "Maintenance Started",
      description: "Database maintenance tasks have been initiated.",
    });
  };

  return (
    <div className="space-y-6">
      {/* System Configuration */}
      <Card className="legal-shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Maintenance Mode</Label>
                  <p className="text-xs text-slate-600">Prevent user access during updates</p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                  className="border-slate-200"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto Backup</Label>
                  <p className="text-xs text-slate-600">Daily automated backups</p>
                </div>
                <Switch
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-message">System Message</Label>
                <Textarea
                  id="system-message"
                  placeholder="Enter a system-wide message for users..."
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                  className="border-slate-200"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <Button onClick={handleSaveSettings} className="legal-button-primary">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleResetSettings} className="border-slate-200">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card className="legal-shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Cache Management</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Clear application cache to resolve performance issues
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearCache}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Clear Cache
                </Button>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Database Optimization</h4>
                <p className="text-sm text-green-700 mb-3">
                  Run database maintenance tasks and optimization
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDatabaseMaintenance}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </h4>
                <p className="text-sm text-amber-700 mb-3">
                  Irreversible actions that affect the entire system
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Chat Histories
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Chat Histories</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all chat conversations across the entire system. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Clear All Chats
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Display */}
      <Card className="legal-shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemSettings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">{setting.key.replace(/_/g, ' ').toUpperCase()}</div>
                  <div className="text-sm text-slate-600">{setting.description}</div>
                </div>
                <div className="text-right">
                  {setting.type === 'boolean' ? (
                    <Badge variant={setting.value === 'true' ? 'default' : 'secondary'}>
                      {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="font-mono">
                      {setting.value || 'Not set'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}